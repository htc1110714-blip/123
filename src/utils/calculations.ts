import { TrialRecord, AnomalyRecord, EquipmentSettings } from '../types';

export interface CompletenessResult {
  score: number; // 0 to 100%
  isValidForSubmission: boolean;
  missingFields: string[];
  warnings: string[];
}

export interface TrialMetrics {
  totalAnomaliesCount: number;
  totalDowntimeMinutes: number;
  dpto: number | null; // Defects per thousand bottles (‰)
  defectRatePct: number | null; // %
  speedAchievementPct: number | null; // %
  isPass: boolean;
  verdictSummary: string;
}

/**
 * F05: 資料完整性檢查
 * 規則：以固定規則檢查必填欄位、單位及數值合理性；列出待補項目。
 * 缺少測試數量時，不計算每千瓶異常次數；不得以零代替缺值。
 */
export function checkTrialCompleteness(trial: TrialRecord): CompletenessResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Required basic trial fields
  if (!trial.trialCode?.trim()) missingFields.push('試線代碼 (Trial Code)');
  if (!trial.date?.trim()) missingFields.push('試線日期 (Date)');
  if (!trial.testedStations || trial.testedStations.length === 0) missingFields.push('測試工站清單 (Stations)');
  if (!trial.bottleState) missingFields.push('瓶裝狀態 (空瓶/滿水等)');

  // Critical numeric measurements
  if (trial.targetSpeedBpm === null || trial.targetSpeedBpm === undefined) {
    missingFields.push('目標產速 (Target Speed bpm)');
  } else if (trial.targetSpeedBpm <= 0) {
    warnings.push('目標產速需大於 0 bpm');
  }

  if (trial.actualSpeedBpm === null || trial.actualSpeedBpm === undefined) {
    missingFields.push('實際產速 (Actual Speed bpm)');
  } else if (trial.actualSpeedBpm <= 0) {
    warnings.push('實際產速需大於 0 bpm');
  }

  if (trial.testQuantity === null || trial.testQuantity === undefined) {
    missingFields.push('測試數量 (Test Quantity 瓶)');
  } else if (trial.testQuantity <= 0) {
    warnings.push('測試數量需大於 0 瓶');
  }

  if (trial.testDurationMinutes === null || trial.testDurationMinutes === undefined) {
    missingFields.push('測試時間 (Duration 分鐘)');
  } else if (trial.testDurationMinutes <= 0) {
    warnings.push('測試時間需大於 0 分鐘');
  }

  // Equipment settings - must not be null/undefined, and if marked as N/M (Not measured) or N/A, distinguish from 0
  const eq = trial.equipmentSettings;
  if (eq.railWidthMm === null || eq.railWidthMm === undefined) {
    missingFields.push('導軌夾持寬度 (mm)');
  }
  if (eq.starwheelTorqueNm === null || eq.starwheelTorqueNm === undefined) {
    missingFields.push('星輪扭力 (Nm)');
  }
  if (eq.cappingPressureMpa === null || eq.cappingPressureMpa === undefined) {
    missingFields.push('旋蓋氣壓 (MPa)');
  }
  if (eq.labelingPressureMpa === null || eq.labelingPressureMpa === undefined) {
    missingFields.push('貼標壓力 (MPa)');
  }
  if (eq.conveyorSpeedMPerMin === null || eq.conveyorSpeedMPerMin === undefined) {
    missingFields.push('輸送帶線速 (m/min)');
  }

  // Calculate score based on 10 critical checks
  const totalChecks = 10;
  const passedChecks = Math.max(0, totalChecks - missingFields.length);
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    score,
    isValidForSubmission: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

/**
 * F06: 指標計算
 * 依固定公式計算異常率、停機時間及設定差異。
 */
export function calculateTrialMetrics(trial: TrialRecord, anomalies: AnomalyRecord[]): TrialMetrics {
  const trialAnomalies = anomalies.filter((a) => a.trialId === trial.id);

  const totalAnomaliesCount = trialAnomalies.reduce((sum, a) => sum + (Number(a.count) || 0), 0);
  const totalDowntimeMinutes = trialAnomalies.reduce((sum, a) => sum + (Number(a.downtimeMinutes) || 0), 0);

  // F05 constraint: 缺少測試數量時，不計算每千瓶異常次數；不得以零代替缺值
  let dpto: number | null = null;
  let defectRatePct: number | null = null;
  if (trial.testQuantity && trial.testQuantity > 0) {
    dpto = Number(((totalAnomaliesCount / trial.testQuantity) * 1000).toFixed(2));
    defectRatePct = Number(((totalAnomaliesCount / trial.testQuantity) * 100).toFixed(3));
  }

  let speedAchievementPct: number | null = null;
  if (trial.targetSpeedBpm && trial.targetSpeedBpm > 0 && trial.actualSpeedBpm !== null) {
    speedAchievementPct = Number(((trial.actualSpeedBpm / trial.targetSpeedBpm) * 100).toFixed(1));
  }

  // Acceptance verdict against criteria
  const crit = trial.criteria;
  const isDowntimePass = totalDowntimeMinutes <= crit.maxDowntimeMin;
  const isDptoPass = dpto !== null ? dpto <= crit.maxDpto : false;

  const isPass = isDowntimePass && isDptoPass && (speedAchievementPct !== null && speedAchievementPct >= 95);

  let verdictSummary = '未達標 (待改善)';
  if (isPass) {
    verdictSummary = '合格 (符合驗收標準)';
  } else if (isDptoPass && !isDowntimePass) {
    verdictSummary = '停機時間超標';
  } else if (!isDptoPass && isDowntimePass) {
    verdictSummary = '每千瓶異常數 (DPTO) 超標';
  }

  return {
    totalAnomaliesCount,
    totalDowntimeMinutes: Number(totalDowntimeMinutes.toFixed(1)),
    dpto,
    defectRatePct,
    speedAchievementPct,
    isPass,
    verdictSummary,
  };
}

/**
 * F06 條件差異提示 (Condition Variance Alert)
 * 比較兩次或多次試線條件，若測試條件差異過大，跳出提示。
 */
export function detectConditionVariance(trials: TrialRecord[]): {
  hasVariance: boolean;
  varianceReasons: string[];
} {
  const varianceReasons: string[] = [];

  if (trials.length < 2) {
    return { hasVariance: false, varianceReasons: [] };
  }

  // Check bottle state differences
  const bottleStates = new Set(trials.map((t) => t.bottleState));
  if (bottleStates.size > 1) {
    varianceReasons.push(
      '試線之間充填狀態不同（包含空瓶與滿水測試）。空瓶與滿瓶之質量、重心高低及慣性力矩有重大物理差異，不得直接進行同條件絕對指標比對。'
    );
  }

  // Check target speed differences
  const speeds = trials.map((t) => t.targetSpeedBpm || 0);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);
  if (maxSpeed - minSpeed >= 20) {
    varianceReasons.push(
      `目標產速跨距較大 (${minSpeed} bpm vs ${maxSpeed} bpm)，高低產速下導軌震動與星輪夾持力需求不同，建議分產速層次進行判定。`
    );
  }

  return {
    hasVariance: varianceReasons.length > 0,
    varianceReasons,
  };
}

/**
 * Equipment setting delta comparator
 */
export function compareEquipmentSettings(s1: EquipmentSettings, s2: EquipmentSettings) {
  const parseNum = (v: any): number | null => (typeof v === 'number' ? v : null);

  return {
    railWidthDiff: parseNum(s2.railWidthMm) !== null && parseNum(s1.railWidthMm) !== null
      ? Number((parseNum(s2.railWidthMm)! - parseNum(s1.railWidthMm)!).toFixed(2))
      : null,
    torqueDiff: parseNum(s2.starwheelTorqueNm) !== null && parseNum(s1.starwheelTorqueNm) !== null
      ? Number((parseNum(s2.starwheelTorqueNm)! - parseNum(s1.starwheelTorqueNm)!).toFixed(2))
      : null,
    cappingPressureDiff: parseNum(s2.cappingPressureMpa) !== null && parseNum(s1.cappingPressureMpa) !== null
      ? Number((parseNum(s2.cappingPressureMpa)! - parseNum(s1.cappingPressureMpa)!).toFixed(2))
      : null,
    labelingPressureDiff: parseNum(s2.labelingPressureMpa) !== null && parseNum(s1.labelingPressureMpa) !== null
      ? Number((parseNum(s2.labelingPressureMpa)! - parseNum(s1.labelingPressureMpa)!).toFixed(2))
      : null,
    conveyorSpeedDiff: parseNum(s2.conveyorSpeedMPerMin) !== null && parseNum(s1.conveyorSpeedMPerMin) !== null
      ? Number((parseNum(s2.conveyorSpeedMPerMin)! - parseNum(s1.conveyorSpeedMPerMin)!).toFixed(1))
      : null,
  };
}

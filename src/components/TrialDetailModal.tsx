import React, { useState } from 'react';
import { TrialRecord, AnomalyRecord, UserRole } from '../types';
import {
  checkTrialCompleteness,
  calculateTrialMetrics,
} from '../utils/calculations';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Clock,
  Gauge
} from 'lucide-react';

interface TrialDetailModalProps {
  trial: TrialRecord;
  anomalies: AnomalyRecord[];
  currentRole: UserRole;
  onClose: () => void;
  onUpdateTrial: (updated: TrialRecord) => void;
}

export const TrialDetailModal: React.FC<TrialDetailModalProps> = ({
  trial,
  anomalies,
  currentRole,
  onClose,
  onUpdateTrial,
}) => {
  const completeness = checkTrialCompleteness(trial);
  const metrics = calculateTrialMetrics(trial, anomalies);
  const trialAnomalies = anomalies.filter((a) => a.trialId === trial.id);

  const [qaVerdict, setQaVerdict] = useState<'pass' | 'fail' | 'conditional'>(
    trial.qaVerdict || 'fail'
  );
  const [qaComments, setQaComments] = useState(trial.qaComments || '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveDraft = () => {
    onUpdateTrial({
      ...trial,
      status: 'draft',
    });
    setSaveMessage('已成功儲存為暫存草稿！可隨時補充不足之數據。');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSubmitReview = () => {
    if (!completeness.isValidForSubmission) {
      alert('【系統防呆提示】：本試線缺少必要欄位，依照規格書規定「缺少必要資料時，不得提交正式審核」！請先補充待補項目。');
      return;
    }

    onUpdateTrial({
      ...trial,
      status: 'submitted',
    });
    setSaveMessage('資料完整性查驗合格，已成功提交正式審核！');
    setTimeout(() => {
      setSaveMessage(null);
      onClose();
    }, 1500);
  };

  const handleSaveQaVerdict = () => {
    onUpdateTrial({
      ...trial,
      qaVerdict,
      qaComments,
      status: qaVerdict === 'pass' ? 'approved' : 'under_review',
    });
    setSaveMessage('品保判定與驗收審核紀錄已更新！');
    setTimeout(() => {
      setSaveMessage(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-mono font-semibold text-slate-900">
                試線 #{trial.trialNumber} ({trial.trialCode})
              </span>
              <span>·</span>
              <span>{trial.date}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              試線條件設定與資料完整性檢驗
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {saveMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {saveMessage}
            </div>
          )}

          {/* F05 Completeness Guard Banner */}
          <div
            className={`p-4 rounded-xl border ${
              completeness.isValidForSubmission
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {completeness.isValidForSubmission ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <span>F05 資料完整性檢查防呆機制</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded">
                      完整度 {completeness.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {completeness.isValidForSubmission
                      ? '所有必填數值與單位皆符合規格，具備計算分母，可提交正式審核。'
                      : '缺少必要項目時禁止提交正式審核；允許先儲存暫存草稿。缺少測試數量時不計算每千瓶異常數，且不得以零代替缺值。'}
                  </p>

                  {completeness.missingFields.length > 0 && (
                    <div className="mt-2 text-xs text-amber-800 font-medium">
                      待補欄位清單: {completeness.missingFields.join('、')}
                    </div>
                  )}
                  {completeness.warnings.length > 0 && (
                    <div className="mt-1 text-xs text-amber-700">
                      警示: {completeness.warnings.join('；')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Parameters & Measurements */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              一、試線條件與實測指標 (固定公式計算)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">目標產速</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {trial.targetSpeedBpm !== null ? `${trial.targetSpeedBpm} bpm` : '[未提供]'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">實際產速</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {trial.actualSpeedBpm !== null ? `${trial.actualSpeedBpm} bpm` : '[未提供]'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">測試數量 (計算分母)</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {trial.testQuantity !== null ? `${trial.testQuantity.toLocaleString()} 瓶` : '[未提供 - 不得計DPTO]'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">測試時間</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {trial.testDurationMinutes !== null ? `${trial.testDurationMinutes} 分鐘` : '[未提供]'}
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              二、關鍵設備設定與單位標示 (F03)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-mono">
                  <tr>
                    <th className="py-2 px-3">設定項目</th>
                    <th className="py-2 px-3">單位</th>
                    <th className="py-2 px-3">設定值</th>
                    <th className="py-2 px-3">數值狀態判讀</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  <tr>
                    <td className="py-2 px-3">輸送帶夾瓶導軌寬度</td>
                    <td className="py-2 px-3">mm</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {String(trial.equipmentSettings.railWidthMm)}
                    </td>
                    <td className="py-2 px-3 text-slate-500">實測有效數值 (非零非缺)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">理瓶星輪過載保護扭力</td>
                    <td className="py-2 px-3">Nm</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {String(trial.equipmentSettings.starwheelTorqueNm)}
                    </td>
                    <td className="py-2 px-3 text-slate-500">實測有效數值</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">旋蓋伺服壓輪氣壓</td>
                    <td className="py-2 px-3">MPa</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {String(trial.equipmentSettings.cappingPressureMpa)}
                    </td>
                    <td className="py-2 px-3 text-slate-500">實測有效數值</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">雙面貼標機壓輪壓力</td>
                    <td className="py-2 px-3">MPa</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {String(trial.equipmentSettings.labelingPressureMpa)}
                    </td>
                    <td className="py-2 px-3 text-slate-500">實測有效數值</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">主輸送帶運轉線速</td>
                    <td className="py-2 px-3">m/min</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {String(trial.equipmentSettings.conveyorSpeedMPerMin)}
                    </td>
                    <td className="py-2 px-3 text-slate-500">實測有效數值</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {trial.equipmentSettings.notes && (
              <p className="text-xs text-slate-500">
                調校備註: {trial.equipmentSettings.notes}
              </p>
            )}
          </div>

          {/* Acceptance Criteria vs Actual Performance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              三、驗收標準門檻與計算對照 (F02 & F06)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">總停機時間</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {metrics.totalDowntimeMinutes} 分
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  門檻: ≤ {trial.criteria.maxDowntimeMin} 分 (
                  {metrics.totalDowntimeMinutes <= trial.criteria.maxDowntimeMin ? '符合' : '超標'}
                  )
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">每千瓶異常數 (DPTO)</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {metrics.dpto !== null ? `${metrics.dpto} ‰` : '未計算'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  門檻: ≤ {trial.criteria.maxDpto} ‰ (
                  {metrics.dpto !== null && metrics.dpto <= trial.criteria.maxDpto ? '符合' : '超標'}
                  )
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">產速達成率</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5">
                  {metrics.speedAchievementPct !== null ? `${metrics.speedAchievementPct}%` : '-'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">門檻: ≥ 95.0%</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">綜合系統判定</span>
                <div
                  className={`font-semibold text-sm mt-0.5 ${
                    metrics.isPass ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {metrics.verdictSummary}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">依固定公式判定</div>
              </div>
            </div>
          </div>

          {/* QA Quality Verdict section (Role QA or Admin) */}
          {(currentRole === 'qa' || currentRole === 'admin') && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-600" />
                品保人員驗收審核簽核區 (QA Quality Verdict)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="qaVerdict"
                    value="pass"
                    checked={qaVerdict === 'pass'}
                    onChange={() => setQaVerdict('pass')}
                  />
                  <span className="font-semibold text-emerald-800">合格 (PASS)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="qaVerdict"
                    value="conditional"
                    checked={qaVerdict === 'conditional'}
                    onChange={() => setQaVerdict('conditional')}
                  />
                  <span className="font-semibold text-amber-800">條件合格 (待複測)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="qaVerdict"
                    value="fail"
                    checked={qaVerdict === 'fail'}
                    onChange={() => setQaVerdict('fail')}
                  />
                  <span className="font-semibold text-rose-800">不合格 (退回改善)</span>
                </label>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">品保審核意見與技術要求:</label>
                <textarea
                  value={qaComments}
                  onChange={(e) => setQaComments(e.target.value)}
                  placeholder="填寫品保主管驗收核可意見或改善指導..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveQaVerdict}
                  className="px-3 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800"
                >
                  確認品保判定
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            登錄人: {trial.recordedBy} · 狀態: {trial.status}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              儲存暫存草稿
            </button>

            <button
              onClick={handleSubmitReview}
              disabled={!completeness.isValidForSubmission}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                completeness.isValidForSubmission
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
              title={
                !completeness.isValidForSubmission
                  ? '缺少必要資料時，不得提交正式審核'
                  : '提交品保與專案窗口審查'
              }
            >
              <FileCheck className="w-3.5 h-3.5" />
              提交正式審核
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

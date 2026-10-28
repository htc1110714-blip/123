export type UserRole = 'pm' | 'engineer' | 'qa' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  permissions: string[];
}

export interface AttachmentFile {
  id: string;
  name: string;
  version: string;
  uploadedAt: string;
  size: string;
  fileType: 'dwg' | 'pdf' | 'xlsx' | 'png' | 'other';
  url?: string;
  description: string;
}

export interface EquipmentSettings {
  railWidthMm: number | null | 'N/M' | 'N/A'; // 導軌夾持寬度 (mm)
  starwheelTorqueNm: number | null | 'N/M' | 'N/A'; // 理瓶星輪扭力限制 (Nm)
  cappingPressureMpa: number | null | 'N/M' | 'N/A'; // 旋蓋伺服壓輪氣壓 (MPa)
  labelingPressureMpa: number | null | 'N/M' | 'N/A'; // 貼標機海綿壓輪壓力 (MPa)
  conveyorSpeedMPerMin: number | null | 'N/M' | 'N/A'; // 輸送帶傳送線速 (m/min)
  notes?: string;
}

export interface AcceptanceCriteria {
  maxFallRatePct: number; // 倒瓶率上限 (%) e.g. 0.1%
  maxJamRatePct: number; // 卡瓶率上限 (%) e.g. 0.05%
  maxScuffRatePct: number; // 刮傷率上限 (%) e.g. 0.2%
  maxDowntimeMin: number; // 總停機分鐘上限 e.g. 5.0
  maxDpto: number; // 每千瓶異常數 (DPTO) 上限 e.g. 2.0 ‰
}

export type BottleState = 'empty' | 'half_water' | 'full_water' | 'full_product';

export interface TrialRecord {
  id: string; // e.g. "T1", "T2", "T3"
  trialNumber: number; // 1, 2, 3
  trialCode: string; // e.g. "TR-2026-1022-01"
  date: string;
  testedStations: string[]; // e.g. ["理瓶機", "過渡輸送", "活塞充填", "旋蓋機", "雙面貼標"]
  bottleState: BottleState;
  targetSpeedBpm: number | null; // 目標產速 (bpm, 瓶/分)
  actualSpeedBpm: number | null; // 實際產速 (bpm)
  testQuantity: number | null; // 測試數量 (瓶)
  testDurationMinutes: number | null; // 測試時間 (分鐘)
  equipmentSettings: EquipmentSettings;
  criteria: AcceptanceCriteria;
  status: 'draft' | 'submitted' | 'under_review' | 'approved';
  qaVerdict?: 'pass' | 'fail' | 'conditional';
  qaComments?: string;
  recordedBy: string;
  hasConditionVarianceWarning?: boolean;
}

export type AnomalyType = 'tumble' | 'jam' | 'orientation' | 'scratch' | 'capping_skew' | 'label_bubble' | 'other';

export interface AnomalyRecord {
  id: string; // e.g. "ERR-T1-001"
  trialId: string; // "T1", "T2", "T3"
  type: AnomalyType;
  typeName: string; // "倒瓶", "卡瓶", "方向偏移", "刮傷", "旋蓋傾斜", "貼標氣泡"
  station: string; // "輸送帶分流過渡段", "理瓶星輪出瓶撥道", "雙面貼標機進瓶導正段"
  timestamp: string; // e.g. "10:14"
  count: number; // 發生次數 (例如 12)
  downtimeMinutes: number; // 停機時間 (分鐘)
  immediateAction: string; // 即時處置
  photoUrl?: string; // 照片佐證
  videoUrl?: string; // 影片佐證連結
  severity: 'high' | 'medium' | 'low';
  operator: string;
}

export type ActionStatus = 'pending' | 'in_progress' | 'implemented_awaiting_retest' | 'verified_closed' | 'rejected';

export interface ActionItem {
  id: string; // e.g. "ACT-001"
  sourceAnomalyId: string; // e.g. "ERR-T1-001"
  station: string;
  actionDescription: string;
  assignee: string; // 負責人 e.g. "陳建良 (設備)"
  dueDate: string; // 期限 e.g. "2026-10-23"
  status: ActionStatus;
  retestTrialId?: string; // 複測試線 e.g. "T2"
  retestResult?: 'qualified' | 'unqualified' | 'pending';
  closureNotes?: string; // 結案說明與驗證依據
  closedAt?: string;
}

export interface ReportReviewLog {
  id: string;
  version: string; // e.g. "v1.0", "v1.1", "v2.0"
  reviewer: string;
  reviewerRole: UserRole;
  action: 'submit' | 'edit' | 'reject' | 'approve';
  comments: string;
  timestamp: string;
}

export interface OfficialReport {
  version: string; // "v1.0"
  isApproved: boolean;
  isDraft: boolean;
  approvedAt?: string;
  approvedBy?: string;
  qaApprovedBy?: string;
  pmApprovedBy?: string;
  content: string; // Markdown / Rich text
  history: ReportReviewLog[];
  sourcesCount: number;
}

export interface EfficiencyKpi {
  trialId: string;
  trialName: string;
  manualCompilationMinutes: number; // 人工整理工時 (分)
  manualVerificationMinutes: number; // 核對修改工時 (分)
  queryCount: number; // 補問次數 (次)
  totalCompletionHours: number; // 報告完成總工時 (小時)
  submissionDate: string;
  approvalDate: string;
}

export interface CaseData {
  caseNo: string; // e.g. "CAS-2026-EP01"
  clientName: string; // "晶華生醫 (Crystal BioTech)"
  bottleModel: string; // "500ml 經典雙弧平肩橢圓瓶"
  bottleVersion: string; // "Rev.B2"
  lineName: string; // "包裝 Line-A (自動理瓶-灌裝-旋蓋-雙面貼標)"
  pmName: string; // "林維德"
  engineerName: string; // "陳建良"
  qaName: string; // "黃雅涵"
  targetCompletionDate: string; // "2026-11-15"
  attachments: AttachmentFile[];
}

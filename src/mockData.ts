import {
  CaseData,
  TrialRecord,
  AnomalyRecord,
  ActionItem,
  OfficialReport,
  EfficiencyKpi,
  UserProfile,
} from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_pm',
    name: '林維德',
    role: 'pm',
    roleTitle: '專案窗口 (PM)',
    department: '專案管理處',
    permissions: ['create_case', 'check_integrity', 'generate_report', 'track_actions', 'export_report', 'confirm_client'],
  },
  {
    id: 'user_engineer',
    name: '陳建良',
    role: 'engineer',
    roleTitle: '生產／設備工程師',
    department: '製造工程部',
    permissions: ['edit_trial_conditions', 'log_equipment_settings', 'log_anomalies', 'submit_actions'],
  },
  {
    id: 'user_qa',
    name: '黃雅涵',
    role: 'qa',
    roleTitle: '品保主管 (QA)',
    department: '品質保證部',
    permissions: ['view_records', 'log_qa_results', 'review_approval', 'sign_report'],
  },
  {
    id: 'user_admin',
    name: '系統管理員',
    role: 'admin',
    roleTitle: '系統管理者 (Admin)',
    department: '資訊科技處',
    permissions: ['all_permissions'],
  },
];

export const INITIAL_CASE: CaseData = {
  caseNo: 'CAS-2026-EP01',
  clientName: '晶華生醫 (Crystal BioTech)',
  bottleModel: '500ml 經典雙弧平肩橢圓瓶',
  bottleVersion: 'Rev.B2 (壁厚均勻化升級版)',
  lineName: '包裝產線 Line-A (高速伺服夾瓶-活塞充填-伺服旋蓋-雙面貼標)',
  pmName: '林維德',
  engineerName: '陳建良',
  qaName: '黃雅涵',
  targetCompletionDate: '2026-11-15',
  attachments: [
    {
      id: 'att-01',
      name: '500ml_Oval_Bottle_B2_Specification.dwg',
      version: 'v2.2',
      uploadedAt: '2026-10-18',
      size: '4.8 MB',
      fileType: 'dwg',
      description: '橢圓長軸 88.5mm / 短軸 48.0mm 模具開模圖面與長短徑曲率標註',
    },
    {
      id: 'att-02',
      name: 'Line_A_Oval_Conveyor_Rail_Layout.pdf',
      version: 'v1.1',
      uploadedAt: '2026-10-20',
      size: '2.1 MB',
      fileType: 'pdf',
      description: '輸送帶導軌間距與理瓶星輪治具配線工程圖',
    },
    {
      id: 'att-03',
      name: 'Client_Seal_Inspection_Protocol.pdf',
      version: 'v1.0',
      uploadedAt: '2026-10-21',
      size: '1.4 MB',
      fileType: 'pdf',
      description: '晶華生醫客戶封樣驗收規範標準（旋蓋扭力與貼標容差）',
    },
  ],
};

export const INITIAL_TRIALS: TrialRecord[] = [
  {
    id: 'T1',
    trialNumber: 1,
    trialCode: 'TR-2026-1022-01',
    date: '2026-10-22',
    testedStations: ['高速夾瓶理瓶機', '轉向過渡輸送帶', '8頭活塞式灌裝機', '4爪伺服旋蓋機', '高速雙面貼標機'],
    bottleState: 'empty',
    targetSpeedBpm: 80,
    actualSpeedBpm: 62,
    testQuantity: 3000,
    testDurationMinutes: 58,
    equipmentSettings: {
      railWidthMm: 64.0,
      starwheelTorqueNm: 4.5,
      cappingPressureMpa: 0.35,
      labelingPressureMpa: 0.20,
      conveyorSpeedMPerMin: 18.0,
      notes: '初次試機，導軌原廠設定 64mm，理瓶轉向出現卡滯搖晃',
    },
    criteria: {
      maxFallRatePct: 0.10,
      maxJamRatePct: 0.05,
      maxScuffRatePct: 0.20,
      maxDowntimeMin: 5.0,
      maxDpto: 2.0,
    },
    status: 'submitted',
    qaVerdict: 'fail',
    qaComments: '倒瓶率與停機時間超標，貼標站方向偏移嚴重，需設備工程部完成治具改善後始得進行試線#2。',
    recordedBy: '陳建良 (設備)',
    hasConditionVarianceWarning: true,
  },
  {
    id: 'T2',
    trialNumber: 2,
    trialCode: 'TR-2026-1024-02',
    date: '2026-10-24',
    testedStations: ['高速夾瓶理瓶機', '轉向過渡輸送帶', '8頭活塞式灌裝機', '4爪伺服旋蓋機', '高速雙面貼標機'],
    bottleState: 'half_water',
    targetSpeedBpm: 100,
    actualSpeedBpm: 92,
    testQuantity: 3000,
    testDurationMinutes: 36,
    equipmentSettings: {
      railWidthMm: 62.5,
      starwheelTorqueNm: 5.0,
      cappingPressureMpa: 0.38,
      labelingPressureMpa: 0.25,
      conveyorSpeedMPerMin: 22.0,
      notes: '導軌微調為 62.5mm 並加裝 POM 耐磨襯條，貼標更換仿形壓輪',
    },
    criteria: {
      maxFallRatePct: 0.10,
      maxJamRatePct: 0.05,
      maxScuffRatePct: 0.20,
      maxDowntimeMin: 5.0,
      maxDpto: 2.0,
    },
    status: 'submitted',
    qaVerdict: 'conditional',
    qaComments: '倒瓶與偏移明顯改善，但灌裝螺桿仍有 2 次微卡滯，同意放行進入滿水試線#3並追蹤螺桿間隙。',
    recordedBy: '陳建良 (設備)',
    hasConditionVarianceWarning: true,
  },
  {
    id: 'T3',
    trialNumber: 3,
    trialCode: 'TR-2026-1026-03',
    date: '2026-10-26',
    testedStations: ['高速夾瓶理瓶機', '轉向過渡輸送帶', '8頭活塞式灌裝機', '4爪伺服旋蓋機', '高速雙面貼標機'],
    bottleState: 'full_water',
    targetSpeedBpm: 120,
    actualSpeedBpm: 120,
    testQuantity: 5000,
    testDurationMinutes: 43,
    equipmentSettings: {
      railWidthMm: 62.5,
      starwheelTorqueNm: 5.2,
      cappingPressureMpa: 0.40,
      labelingPressureMpa: 0.28,
      conveyorSpeedMPerMin: 25.0,
      notes: '全速滿載連續 5,000 瓶，各工站動作流暢，無倒瓶與卡瓶',
    },
    criteria: {
      maxFallRatePct: 0.10,
      maxJamRatePct: 0.05,
      maxScuffRatePct: 0.20,
      maxDowntimeMin: 5.0,
      maxDpto: 2.0,
    },
    status: 'approved',
    qaVerdict: 'pass',
    qaComments: '各項品質指標與產速皆達商業標準，零停機，DPTO 僅 0.60 ‰ (門檻 2.0 ‰)，准予結案量產。',
    recordedBy: '陳建良 (設備)',
    hasConditionVarianceWarning: false,
  },
];

export const INITIAL_ANOMALIES: AnomalyRecord[] = [
  {
    id: 'ERR-T1-001',
    trialId: 'T1',
    type: 'tumble',
    typeName: '倒瓶',
    station: '輸送帶分流過渡段',
    timestamp: '10:14',
    count: 12,
    downtimeMinutes: 4.5,
    immediateAction: '人工手動扶正並暫降帶速至 15 m/min，觀察瓶身夾角',
    photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
    severity: 'high',
    operator: '陳建良',
  },
  {
    id: 'ERR-T1-002',
    trialId: 'T1',
    type: 'orientation',
    typeName: '方向偏移',
    station: '雙面貼標機進瓶導正段',
    timestamp: '10:28',
    count: 18,
    downtimeMinutes: 2.0,
    immediateAction: '加裝輔助定位撥輪，但長軸方向仍有 ±15° 晃動致標籤貼歪',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    severity: 'high',
    operator: '王啟明',
  },
  {
    id: 'ERR-T1-003',
    trialId: 'T1',
    type: 'scratch',
    typeName: '刮傷',
    station: '理瓶星輪出瓶撥道',
    timestamp: '10:45',
    count: 8,
    downtimeMinutes: 0.0,
    immediateAction: '檢查星輪尼龍材質表面，發現模具分模線毛邊微刮外弧',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    severity: 'medium',
    operator: '陳建良',
  },
  {
    id: 'ERR-T2-001',
    trialId: 'T2',
    type: 'orientation',
    typeName: '方向微偏',
    station: '雙面貼標前定位段',
    timestamp: '14:12',
    count: 4,
    downtimeMinutes: 1.0,
    immediateAction: '微調光電感應觸發延遲 15ms，校正入標時機',
    severity: 'low',
    operator: '陳建良',
  },
  {
    id: 'ERR-T2-002',
    trialId: 'T2',
    type: 'jam',
    typeName: '卡瓶',
    station: '灌裝機進瓶分料螺桿',
    timestamp: '14:26',
    count: 2,
    downtimeMinutes: 2.0,
    immediateAction: '清除螺桿凹槽碎屑，量測螺桿螺距與橢圓短軸密合度',
    severity: 'medium',
    operator: '王啟明',
  },
  {
    id: 'ERR-T3-001',
    trialId: 'T3',
    type: 'label_bubble',
    typeName: '貼標微氣泡',
    station: '雙面貼標機海綿撫標段',
    timestamp: '16:20',
    count: 3,
    downtimeMinutes: 0.0,
    immediateAction: '調整刮標海綿夾角 3° 並加強滾壓壓力，後續無再發',
    severity: 'low',
    operator: '陳建良',
  },
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'ACT-001',
    sourceAnomalyId: 'ERR-T1-001',
    station: '輸送帶分流過渡段',
    actionDescription: '縮小導軌夾持寬度至 62.5mm，並加裝超高分子聚乙烯 (POM) 耐磨導引襯條，防止橢圓瓶短軸側翻',
    assignee: '陳建良 (設備)',
    dueDate: '2026-10-23',
    status: 'verified_closed',
    retestTrialId: 'T2',
    retestResult: 'qualified',
    closureNotes: '試線#2 複測 3,000 瓶，過渡段倒瓶降為 0 次，導軌滑順度符合預期，依據試線#2紀錄核可結案。',
    closedAt: '2026-10-24 16:30',
  },
  {
    id: 'ACT-002',
    sourceAnomalyId: 'ERR-T1-002',
    station: '雙面貼標機進瓶導正段',
    actionDescription: '更換吻合 500ml 橢圓雙弧曲率之仿形定心壓輪，並重新校驗雙側同步帶速',
    assignee: '陳建良 (設備)',
    dueDate: '2026-10-23',
    status: 'verified_closed',
    retestTrialId: 'T2',
    retestResult: 'qualified',
    closureNotes: '試線#2 貼標進瓶角度偏差收斂至 ±2° 內，符合封樣要求，結案。',
    closedAt: '2026-10-24 17:00',
  },
  {
    id: 'ACT-003',
    sourceAnomalyId: 'ERR-T1-003',
    station: '理瓶星輪出瓶撥道',
    actionDescription: '星輪尼龍夾槽接觸面人工細磨修整，消除注塑分模毛邊',
    assignee: '王啟明 (模具)',
    dueDate: '2026-10-25',
    status: 'verified_closed',
    retestTrialId: 'T3',
    retestResult: 'qualified',
    closureNotes: '試線#3 滿載 5,000 瓶抽檢 100 瓶，瓶身光澤平整，無任何外弧刮痕。',
    closedAt: '2026-10-26 18:00',
  },
  {
    id: 'ACT-004',
    sourceAnomalyId: 'ERR-T2-002',
    station: '灌裝機進瓶分料螺桿',
    actionDescription: '微幅打磨分料螺桿起始導角 0.5mm，防止橢圓瓶大圓弧進入時產生卡阻應力',
    assignee: '陳建良 (設備)',
    dueDate: '2026-10-25',
    status: 'verified_closed',
    retestTrialId: 'T3',
    retestResult: 'qualified',
    closureNotes: '試線#3 產速 120 bpm 下連續進瓶流暢，完全無卡瓶。',
    closedAt: '2026-10-26 18:30',
  },
];

export const INITIAL_KPIS: {
  baseline: {
    manualCompilationMinutes: number;
    manualVerificationMinutes: number;
    queryCount: number;
    totalCompletionDays: number;
  };
  trials: EfficiencyKpi[];
} = {
  baseline: {
    manualCompilationMinutes: 240, // 導入前現況基準：4 小時整理
    manualVerificationMinutes: 120, // 2 小時核對
    queryCount: 8, // 8 次資料補問
    totalCompletionDays: 4.5, // 4.5 天才能產出正式對客報告
  },
  trials: [
    {
      trialId: 'T1',
      trialName: '試線 #1 (初測)',
      manualCompilationMinutes: 90,
      manualVerificationMinutes: 45,
      queryCount: 3,
      totalCompletionHours: 2.25,
      submissionDate: '2026-10-22',
      approvalDate: '2026-10-23',
    },
    {
      trialId: 'T2',
      trialName: '試線 #2 (改善複測)',
      manualCompilationMinutes: 40,
      manualVerificationMinutes: 25,
      queryCount: 1,
      totalCompletionHours: 1.08,
      submissionDate: '2026-10-24',
      approvalDate: '2026-10-25',
    },
    {
      trialId: 'T3',
      trialName: '試線 #3 (滿載驗收)',
      manualCompilationMinutes: 25,
      manualVerificationMinutes: 15,
      queryCount: 0,
      totalCompletionHours: 0.67,
      submissionDate: '2026-10-26',
      approvalDate: '2026-10-26',
    },
  ],
};

export const INITIAL_REPORT: OfficialReport = {
  version: 'v2.0',
  isApproved: true,
  isDraft: false,
  approvedAt: '2026-10-26 19:15',
  approvedBy: '黃雅涵 (品保)',
  qaApprovedBy: '黃雅涵 (品保主管)',
  pmApprovedBy: '林維德 (專案窗口)',
  sourcesCount: 14,
  content: `# 橢圓瓶產線試線工程總結與改善報告（核准版）

**案件編號**：CAS-2026-EP01 · **客戶**：晶華生醫 (Crystal BioTech) · **瓶型規格**：500ml 經典雙弧平肩橢圓瓶 (Rev.B2)  
**測試產線**：包裝產線 Line-A · **專案窗口**：林維德 · **品保審核**：黃雅涵  
**核准生效時間**：2026-10-26 19:15 · **版本狀態**：v2.0-正式核准版 (OFFICIAL APPROVED)

---

## 一、試線基本資訊與執行摘要 (Executive Summary)
本專案針對「500ml 經典雙弧平肩橢圓瓶」進行三次產線試驗，目標驗證在包裝 Line-A 上達成商業承諾產速 120 bpm 之可行性與運轉穩定度。

- **試線 #1 [來源: 試線#1]**：採空瓶初測，目標 80 bpm，實際達 62 bpm (產速達成率 77.5%)。共發生 38 次異常 [來源: 試線#1 ERR-T1-001/002/003]，停機 6.5 分鐘，每千瓶異常數 DPTO 為 12.67 ‰。初評為「不合格，需調校軌道與理瓶夾具」。
- **試線 #2 [來源: 試線#2]**：修正導軌間隙（由 64.0mm 縮至 62.5mm 並更換耐磨襯條），進行半滿水測試，實際產速達 92 bpm。異常下降至 6 次 [來源: 試線#2 ERR-T2-001/002]，停機 3.0 分鐘，DPTO 降至 2.00 ‰。
- **試線 #3 [來源: 試線#3]**：滿瓶全速連續 5,000 瓶測試，目標與實際產速均為 120 bpm (產速達成率 100.0%)。全線零停機 (0.0 分鐘)，僅出現 3 次貼標微氣泡 [來源: 試線#3 ERR-T3-001]，DPTO 降至 0.60 ‰，優於品保驗收門檻 (2.00 ‰)。
- ⚠️ **條件差異警示**：試線 #1 為空瓶 (80 bpm)，試線 #2 為半水 (100 bpm)，試線 #3 為滿瓶 (120 bpm)。因各次試線之瓶身重心、慣性及測試產速條件不同，數據應分層審視，量產基準以試線 #3 滿瓶全速數據為準。

---

## 二、試線條件與設備參數演變對比 (Trial Conditions & Parameter Deltas)
依據現場設備工程師登錄之實際參數，三次試線關鍵設備調整歷程如下：

| 設備設定項目 (單位) | 試線 #1 (空瓶) | 試線 #2 (半水) | 試線 #3 (滿瓶) | 參數演進說明 |
|---|:---:|:---:|:---:|---|
| **導軌夾持寬度 (mm)** | 64.0 mm | 62.5 mm | 62.5 mm | 縮小 1.5mm，加裝 POM 襯條消除晃動 [來源: 試線#2] |
| **理瓶星輪扭力 (Nm)** | 4.5 Nm | 5.0 Nm | 5.2 Nm | 依滿瓶慣性微增扭力防止咬死 [來源: 試線#3] |
| **旋蓋壓輪氣壓 (MPa)** | 0.35 MPa | 0.38 MPa | 0.40 MPa | 提升氣壓確保雙弧瓶身旋蓋扭力穩定 [來源: 試線#3] |
| **貼標機壓輪壓力 (MPa)** | 0.20 MPa | 0.25 MPa | 0.28 MPa | 更換橢圓弧形貼合滾輪改善貼標邊緣 [來源: 試線#2] |
| **輸送帶線速 (m/min)** | 18 m/min | 22 m/min | 25 m/min | 隨產速逐步平穩提速至 120 bpm 對應速度 |

---

## 三、異常問題清單與工站瓶頸分析 (Anomalies & Bottlenecks)
各工站異常紀錄與追溯清單：

1. **倒瓶異常 (12 次)** [來源: 試線#1 ERR-T1-001]
   - 發生位置：輸送帶分流過渡段。造成停機 4.5 分鐘。
   - 處置：現場人工扶正，試線 #2 加裝防倒導引壓板後未再發生。
2. **方向偏移 / 扭轉 (18 次)** [來源: 試線#1 ERR-T1-002]
   - 發生位置：雙面貼標機進瓶導正段。造成停機 2.0 分鐘。
   - 處置：調整光電感應延遲與雙側皮帶差速撥正機構。
3. **外弧微刮傷 (8 次)** [來源: 試線#1 ERR-T1-003]
   - 發生位置：理瓶星輪出瓶撥道。未停機 (0.0 分鐘)。
   - 處置：打磨星輪毛邊並噴塗食品級潤滑保護層。
4. **貼標邊緣微氣泡 (3 次)** [來源: 試線#3 ERR-T3-001]
   - 發生位置：雙面貼標機撫標段。未停機 (0.0 分鐘)。
   - 處置：調整刮標海綿角度 3° 後排除。

---

## 四、資料完整性與待補項目查驗 (Data Integrity)
- **必填欄位檢查**：所有三次試線之產速、測試數量、設備參數均已完整登錄 (完整度 100%)。
- **單位一致性**：產速 (bpm)、氣壓 (MPa)、扭力 (Nm)、線速 (m/min) 均已明確標示。
- **缺漏項目**：無缺漏必填項目。每千瓶異常數均有對應測試數量為計算分母，無以零代缺值情事。

---

## 五、技術原因假說與工程驗證進度 (Root Cause Hypotheses)
*(註：依系統規範，技術假說由現場工程人員提出，均屬待驗證狀態，不視為已定案根因)*

1. **過渡段倒瓶假說**：研判因橢圓瓶短軸支撐面窄 (長寬比 1.85:1)，在轉彎過渡段離心力大於重力穩定力矩 [待驗證]，現場更換低磨擦導軌後倒瓶率已獲抑制。
2. **貼標角度偏移假說**：研判因橢圓瓶雙曲面模具公差約 ±0.3mm，造成兩側夾帶受力不對稱致使瓶身旋轉 [待驗證]，已藉由伺服定心撥輪實施補償。

---

## 六、改善待辦與後續複測結論 (Action Items & Retest Status)
- **待辦 ACT-001** (導軌間隙縮減至 62.5mm 並更換 POM 襯條)：負責人 陳建良，已於試線 #2 複測，判定「複測合格結案」。
- **待辦 ACT-002** (更換貼標機橢圓仿形壓輪與光電延遲校正)：負責人 陳建良，已於試線 #2 複測，判定「複測合格結案」。
- **待辦 ACT-003** (理瓶星輪撥道表面精拋光)：負責人 王啟明，已於試線 #3 複測，表面無刮傷，判定「複測合格結案」。
- **待辦 ACT-004** (分料螺桿起始導角微研磨)：負責人 陳建良，已於試線 #3 複測，完全無卡瓶，判定「複測合格結案」。

---

## 七、專案窗口對客溝通與量產建議 (Client-Facing Points)
1. **驗收結論**：試線 #3 在 120 bpm 滿載條件下連續測試 5,000 瓶，總停機時間 0 分鐘，DPTO 0.60 ‰ 遠優於驗收標準 (≤ 2.00 ‰)，技術面具備正式量產能力。
2. **對客承諾與交期**：相關量產交期與模具保養週期，由專案窗口林維德與晶華生醫窗口進行正式交期協議簽署。
3. **正式報告授權**：本件已由品保主管黃雅涵及專案窗口林維德雙重核准，具備正式報告效力。`,
  history: [
    {
      id: 'rev-01',
      version: 'v1.0-草稿',
      reviewer: '林維德',
      reviewerRole: 'pm',
      action: 'submit',
      comments: '系統自動彙整試線#1至#3紀錄產出初始草稿，提交品保審查。',
      timestamp: '2026-10-26 17:10',
    },
    {
      id: 'rev-02',
      version: 'v1.1-審核中',
      reviewer: '黃雅涵',
      reviewerRole: 'qa',
      action: 'edit',
      comments: '補充試線#1與#3之條件差異警示條款，核對每千瓶異常數公式。',
      timestamp: '2026-10-26 18:20',
    },
    {
      id: 'rev-03',
      version: 'v2.0-核准版',
      reviewer: '黃雅涵',
      reviewerRole: 'qa',
      action: 'approve',
      comments: '品質指標均已達標且改善待辦全數驗證結案，正式簽核通過。',
      timestamp: '2026-10-26 19:15',
    },
  ],
};

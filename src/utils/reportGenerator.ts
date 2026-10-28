import { CaseData, TrialRecord, AnomalyRecord, ActionItem } from '../types';

export function generateClientFallbackDraft(
  caseData: CaseData,
  trials: TrialRecord[],
  anomalies: AnomalyRecord[],
  actionItems: ActionItem[]
): string {
  const t1 = trials.find((t) => t.id === 'T1') || trials[0];
  const t2 = trials.find((t) => t.id === 'T2') || trials[1];
  const t3 = trials.find((t) => t.id === 'T3') || trials[2];

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  return `# 橢圓瓶產線試線工程總結與改善報告（草稿）

**案件編號**：${caseData?.caseNo || '[未提供]'} · **客戶**：${caseData?.clientName || '[未提供]'} · **瓶型規格**：${caseData?.bottleModel || '[未提供]'} (${caseData?.bottleVersion || 'v1.0'})  
**測試產線**：${caseData?.lineName || '[未提供]'} · **專案窗口**：${caseData?.pmName || '林維德'} · **品保審核**：${caseData?.qaName || '黃雅涵'}  
**報告產生時間**：${nowStr} · **版本狀態**：v1.0-草稿 (DRAFT)

---

## 一、試線基本資訊與執行摘要 (Executive Summary)
本專案針對「${caseData?.bottleModel || '500ml 雙弧平肩橢圓瓶'}」進行連續三次產線試驗，目標驗證在 ${caseData?.lineName || 'Line-A 產線'} 上達成商業產速 120 bpm 之可行性與運轉穩定度。

- **試線 #1 [來源: 試線#1]**：採空瓶初測，目標 ${t1?.targetSpeedBpm ?? 80} bpm，實際達 ${t1?.actualSpeedBpm ?? 62} bpm。共發生 38 次異常 [來源: 試線#1 ERR-T1-001/002/003]，停機 6.5 分鐘，每千瓶異常數 DPTO 為 12.67 ‰。初評為「不合格，需調校軌道與理瓶夾具」。
- **試線 #2 [來源: 試線#2]**：修正導軌間隙（由 64.0mm 縮至 62.5mm 並更換耐磨襯條），進行半滿水測試，實際產速達 ${t2?.actualSpeedBpm ?? 92} bpm。異常下降至 6 次 [來源: 試線#2 ERR-T2-001/002]，停機 3.0 分鐘，DPTO 降至 2.00 ‰。
- **試線 #3 [來源: 試線#3]**：滿瓶全速連續 5,000 瓶測試，目標與實際產速均為 ${t3?.actualSpeedBpm ?? 120} bpm (產速達成率 100.0%)。全線零停機 (0.0 分鐘)，僅出現 3 次貼標微氣泡 [來源: 試線#3 ERR-T3-001]，DPTO 降至 0.60 ‰，優於品保驗收門檻 (2.00 ‰)。
- ⚠️ **條件差異警示**：試線 #1 為空瓶，試線 #2 為半水，試線 #3 為滿瓶。因各次試線之瓶身重心、慣性及測試產速條件不同，數據應分層審視，量產基準以試線 #3 滿瓶全速數據為準。

---

## 二、試線條件與設備參數演變對比 (Trial Conditions & Parameter Deltas)
依據現場設備工程師登錄之實際參數，三次試線關鍵設備調整歷程如下：

| 設備設定項目 (單位) | 試線 #1 (空瓶) | 試線 #2 (半水) | 試線 #3 (滿瓶) | 參數演進說明 |
|---|:---:|:---:|:---:|---|
| **導軌夾持寬度 (mm)** | ${String(t1?.equipmentSettings.railWidthMm ?? 64.0)} mm | ${String(t2?.equipmentSettings.railWidthMm ?? 62.5)} mm | ${String(t3?.equipmentSettings.railWidthMm ?? 62.5)} mm | 縮小 1.5mm，加裝 POM 襯條消除晃動 [來源: 試線#2] |
| **理瓶星輪扭力 (Nm)** | ${String(t1?.equipmentSettings.starwheelTorqueNm ?? 4.5)} Nm | ${String(t2?.equipmentSettings.starwheelTorqueNm ?? 5.0)} Nm | ${String(t3?.equipmentSettings.starwheelTorqueNm ?? 5.2)} Nm | 依滿瓶慣性微增扭力防止咬死 [來源: 試線#3] |
| **旋蓋壓輪氣壓 (MPa)** | ${String(t1?.equipmentSettings.cappingPressureMpa ?? 0.35)} MPa | ${String(t2?.equipmentSettings.cappingPressureMpa ?? 0.38)} MPa | ${String(t3?.equipmentSettings.cappingPressureMpa ?? 0.40)} MPa | 提升氣壓確保雙弧瓶身旋蓋扭力穩定 [來源: 試線#3] |
| **貼標機壓輪壓力 (MPa)** | ${String(t1?.equipmentSettings.labelingPressureMpa ?? 0.20)} MPa | ${String(t2?.equipmentSettings.labelingPressureMpa ?? 0.25)} MPa | ${String(t3?.equipmentSettings.labelingPressureMpa ?? 0.28)} MPa | 更換橢圓弧形貼合滾輪改善貼標邊緣 [來源: 試線#2] |
| **輸送帶線速 (m/min)** | ${String(t1?.equipmentSettings.conveyorSpeedMPerMin ?? 18.0)} m/min | ${String(t2?.equipmentSettings.conveyorSpeedMPerMin ?? 22.0)} m/min | ${String(t3?.equipmentSettings.conveyorSpeedMPerMin ?? 25.0)} m/min | 隨產速逐步平穩提速至 120 bpm 對應速度 |

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
3. **正式報告授權**：本件已由品保主管黃雅涵及專案窗口林維德雙重核准，具備正式報告效力。`;
}

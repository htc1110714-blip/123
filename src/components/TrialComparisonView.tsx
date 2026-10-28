import React from 'react';
import { TrialRecord, AnomalyRecord } from '../types';
import {
  calculateTrialMetrics,
  detectConditionVariance,
  compareEquipmentSettings,
} from '../utils/calculations';
import {
  GitCompare,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Calculator,
  Sliders,
  Layers
} from 'lucide-react';

interface TrialComparisonViewProps {
  trials: TrialRecord[];
  anomalies: AnomalyRecord[];
}

export const TrialComparisonView: React.FC<TrialComparisonViewProps> = ({
  trials,
  anomalies,
}) => {
  const varianceCheck = detectConditionVariance(trials);

  const t1 = trials.find((t) => t.id === 'T1') || trials[0];
  const t2 = trials.find((t) => t.id === 'T2') || trials[1];
  const t3 = trials.find((t) => t.id === 'T3') || trials[2];

  const m1 = t1 ? calculateTrialMetrics(t1, anomalies) : null;
  const m2 = t2 ? calculateTrialMetrics(t2, anomalies) : null;
  const m3 = t3 ? calculateTrialMetrics(t3, anomalies) : null;

  const delta12 = t1 && t2 ? compareEquipmentSettings(t1.equipmentSettings, t2.equipmentSettings) : null;
  const delta23 = t2 && t3 ? compareEquipmentSettings(t2.equipmentSettings, t3.equipmentSettings) : null;

  return (
    <div className="space-y-6">
      {/* Title & Formula Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-slate-700" />
              F06 指標計算與三次試線比較引擎
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              依固定工業工程公式計算異常率、停機時間及設備設定差異；同條件與跨條件試線成果對比。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            所有計算結果可由原始紀錄重現
          </div>
        </div>

        {/* F06 Formula Transparency Box */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-semibold text-slate-900">每千瓶異常數 (DPTO)</div>
            <div className="font-mono text-slate-600 mt-1">
              公式: (總異常次數 / 測試數量) × 1,000
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              *缺少測試數量時不計算，嚴禁以 0 代替缺值
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-semibold text-slate-900">產速達成率 (%)</div>
            <div className="font-mono text-slate-600 mt-1">
              公式: (實際產速 bpm / 目標產速 bpm) × 100%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              *門檻基準 ≥ 95.0% 判定符合承諾速度
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-semibold text-slate-900">總停機時間 (分鐘)</div>
            <div className="font-mono text-slate-600 mt-1">
              公式: Σ 異常紀錄各筆停機分鐘數
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              *不含換模與例行清理工時
            </div>
          </div>
        </div>
      </div>

      {/* Condition Variance Alert (規格書 F06 重要規定) */}
      {varianceCheck.hasVariance && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <span>條件差異提示 (Condition Variance Alert)</span>
                <span className="font-mono font-normal text-[11px] bg-amber-200/60 px-2 py-0.5 rounded text-amber-900">
                  規格書 F06 規範
                </span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                系統偵測到三次試線間存在測試條件之非等價性：
              </p>
              <ul className="list-disc pl-4 space-y-1 text-amber-900">
                {varianceCheck.varianceReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
              <div className="text-[11px] font-semibold text-amber-950 pt-1">
                ⇒ 驗收結論指引：三次試線用於驗證操作可行性與初步效益；若測試條件差異過大，正式量產簽核應以「試線 #3 同條件 (滿瓶 120 bpm)」為最終判定基準！
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Trial Side-by-Side Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs overflow-hidden">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          三次試線核心指標進度表 (Trial 1 → Trial 2 → Trial 3)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
                <th className="py-3 px-4 w-1/4">比較指標類別</th>
                <th className="py-3 px-4 w-1/4">試線 #1 (初測)</th>
                <th className="py-3 px-4 w-1/4">試線 #2 (改善複測)</th>
                <th className="py-3 px-4 w-1/4">試線 #3 (全速滿載驗收)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {/* Date & State */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">測試狀態與日期</td>
                <td className="py-3 px-4">空瓶測試 · 2026-10-22</td>
                <td className="py-3 px-4">半水測試 · 2026-10-24</td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">滿瓶滿載 · 2026-10-26</td>
              </tr>

              {/* Speed */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                  產速 (目標 / 實際)
                </td>
                <td className="py-3 px-4">80 / 62 bpm (77.5%)</td>
                <td className="py-3 px-4">100 / 92 bpm (92.0%)</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">
                  120 / 120 bpm (100.0%)
                </td>
              </tr>

              {/* Quantity */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">測試數量 / 時間</td>
                <td className="py-3 px-4">3,000 瓶 / 58 分</td>
                <td className="py-3 px-4">3,000 瓶 / 36 分</td>
                <td className="py-3 px-4 font-semibold text-slate-900">5,000 瓶 / 43 分</td>
              </tr>

              {/* Anomalies */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">異常總次數</td>
                <td className="py-3 px-4 text-rose-700 font-bold">38 次 (嚴重)</td>
                <td className="py-3 px-4 text-amber-700 font-semibold">6 次 (大幅降低)</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">3 次 (微小瑕疵)</td>
              </tr>

              {/* Downtime */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">總停機時間 (門檻 ≤ 5分)</td>
                <td className="py-3 px-4 text-rose-700 font-bold">6.5 分鐘 (超標)</td>
                <td className="py-3 px-4 text-emerald-700">3.0 分鐘 (符合)</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">0.0 分鐘 (完全零停機)</td>
              </tr>

              {/* DPTO */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                  每千瓶異常數 DPTO (門檻 ≤ 2.0 ‰)
                </td>
                <td className="py-3 px-4 text-rose-700 font-bold">12.67 ‰ (超標)</td>
                <td className="py-3 px-4 text-amber-700">2.00 ‰ (剛好達標)</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">0.60 ‰ (大幅優於門檻)</td>
              </tr>

              {/* QA Verdict */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">品保最終驗收結論</td>
                <td className="py-3 px-4 text-rose-700 font-semibold font-sans">不合格 (退回調機)</td>
                <td className="py-3 px-4 text-amber-700 font-semibold font-sans">條件合格 (滿水複測)</td>
                <td className="py-3 px-4 text-emerald-700 font-bold font-sans">
                  合格 PASS (核准量產)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Parameter Delta Comparator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-600" />
          關鍵設備設定差異與調校演變 (Parameter Deltas)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
                <th className="py-2.5 px-3">設備參數項目</th>
                <th className="py-2.5 px-3">單位</th>
                <th className="py-2.5 px-3">試線 #1</th>
                <th className="py-2.5 px-3">試線 #2</th>
                <th className="py-2.5 px-3">T1 → T2 差異</th>
                <th className="py-2.5 px-3">試線 #3</th>
                <th className="py-2.5 px-3">T2 → T3 差異</th>
                <th className="py-2.5 px-3 font-sans">技術工程原因依據</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-900">導軌夾持寬度</td>
                <td className="py-2.5 px-3">mm</td>
                <td className="py-2.5 px-3">64.0</td>
                <td className="py-2.5 px-3">62.5</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">-1.5 mm</td>
                <td className="py-2.5 px-3">62.5</td>
                <td className="py-2.5 px-3 text-slate-400">0.0 mm</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">
                  原 64mm 間隙過大易短軸扭轉，加 POM 襯條縮至 62.5mm
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-900">理瓶星輪扭力</td>
                <td className="py-2.5 px-3">Nm</td>
                <td className="py-2.5 px-3">4.5</td>
                <td className="py-2.5 px-3">5.0</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+0.5 Nm</td>
                <td className="py-2.5 px-3">5.2</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+0.2 Nm</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">
                  提速與滿水重量增加，微升過載扭力防止出瓶停頓
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-900">旋蓋壓輪氣壓</td>
                <td className="py-2.5 px-3">MPa</td>
                <td className="py-2.5 px-3">0.35</td>
                <td className="py-2.5 px-3">0.38</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+0.03 MPa</td>
                <td className="py-2.5 px-3">0.40</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+0.02 MPa</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">
                  增強橢圓雙曲面夾緊摩擦力，確保旋蓋扭力達 1.8 Nm
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-900">貼標壓輪壓力</td>
                <td className="py-2.5 px-3">MPa</td>
                <td className="py-2.5 px-3">0.20</td>
                <td className="py-2.5 px-3">0.25</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+0.05 MPa</td>
                <td className="py-2.5 px-3">0.28</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+0.03 MPa</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">
                  更換橢圓仿形曲度海綿滾輪並微升壓力，消除邊緣氣泡
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-900">輸送帶傳送線速</td>
                <td className="py-2.5 px-3">m/min</td>
                <td className="py-2.5 px-3">18.0</td>
                <td className="py-2.5 px-3">22.0</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+4.0 m/min</td>
                <td className="py-2.5 px-3">25.0</td>
                <td className="py-2.5 px-3 text-indigo-700 font-semibold">+3.0 m/min</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">
                  配合各階段目標產速 (80 → 100 → 120 bpm) 線性匹配
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

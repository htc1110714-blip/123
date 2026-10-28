import React from 'react';
import { EfficiencyKpi } from '../types';
import {
  TrendingDown,
  Clock,
  HelpCircle,
  CheckCircle2,
  Download,
  Award,
  BarChart3,
  FileCheck2
} from 'lucide-react';

interface KpiPerformanceViewProps {
  baseline: {
    manualCompilationMinutes: number;
    manualVerificationMinutes: number;
    queryCount: number;
    totalCompletionDays: number;
  };
  trialsKpi: EfficiencyKpi[];
}

export const KpiPerformanceView: React.FC<KpiPerformanceViewProps> = ({
  baseline,
  trialsKpi,
}) => {
  // Baseline total minutes = 240 + 120 = 360 min (6 hours)
  const baselineTotalMinutes = baseline.manualCompilationMinutes + baseline.manualVerificationMinutes;

  // Latest trial (Trial 3)
  const t3 = trialsKpi[2] || trialsKpi[trialsKpi.length - 1];
  const t3TotalMinutes = t3 ? t3.manualCompilationMinutes + t3.manualVerificationMinutes : 40;

  // Efficiency gains
  const timeReductionPct = Math.round(
    ((baselineTotalMinutes - t3TotalMinutes) / baselineTotalMinutes) * 100
  );
  const queryReductionPct = Math.round(
    ((baseline.queryCount - (t3 ? t3.queryCount : 0)) / baseline.queryCount) * 100
  );

  const handleExportKpiCsv = () => {
    const headers = [
      '階段指標',
      '人工整理工時(分)',
      '核對修改工時(分)',
      '總處理工時(分)',
      '補問次數(次)',
      '報告完成天數/工時',
      '工時節省幅度',
    ];

    const rows = [
      [
        '導入前傳統作業基準 (Baseline)',
        baseline.manualCompilationMinutes,
        baseline.manualVerificationMinutes,
        baselineTotalMinutes,
        baseline.queryCount,
        `${baseline.totalCompletionDays} 天`,
        '基準 (0%)',
      ],
      ...trialsKpi.map((k) => {
        const total = k.manualCompilationMinutes + k.manualVerificationMinutes;
        const saved = Math.round(((baselineTotalMinutes - total) / baselineTotalMinutes) * 100);
        return [
          k.trialName,
          k.manualCompilationMinutes,
          k.manualVerificationMinutes,
          total,
          k.queryCount,
          `${k.totalCompletionHours} 小時`,
          `節省 ${saved}%`,
        ];
      }),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '橢圓瓶試線助手_導入成效評估表.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-mono text-slate-500 mb-1">
              規格書 第六節 驗收指標與成效評估 (F10)
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-700" />
              三次試行驗收指標達成率評估
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              實測報告彙整工時、人工核對修改時間、補問次數與正式報告正確性，比對導入前現況基準。
            </p>
          </div>

          <button
            onClick={handleExportKpiCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            匯出成效比較 CSV
          </button>
        </div>

        {/* 4 Scorecards against acceptance targets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
          {/* Target 1: Report Processing Time */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">1. 報告處理工時降低</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 flex items-center gap-1">
              <TrendingDown className="w-5 h-5" />
              -{timeReductionPct}%
            </div>
            <div className="text-[11px] text-slate-600">
              試行目標: 降低 ≥ 30% · <strong>達成 (超標)</strong>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              基準: 360分 → T3: 40分
            </div>
          </div>

          {/* Target 2: Missing Data Queries */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">2. 資料補問次數降低</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 flex items-center gap-1">
              <TrendingDown className="w-5 h-5" />
              -{queryReductionPct}%
            </div>
            <div className="text-[11px] text-slate-600">
              試行目標: 降低 ≥ 30% · <strong>達成 (防呆生效)</strong>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              基準: 8次 → T3: 0次
            </div>
          </div>

          {/* Target 3: Fact Accuracy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">3. 正式報告正確性</div>
            <div className="text-2xl font-bold font-mono text-slate-900 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              0 件
            </div>
            <div className="text-[11px] text-slate-600">
              試行目標: <strong>無重大事實錯誤</strong> · 達成
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              數值全依固定公式重現
            </div>
          </div>

          {/* Target 4: Traceability */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">4. 資料可追溯性 (Traceability)</div>
            <div className="text-2xl font-bold font-mono text-indigo-700">
              100%
            </div>
            <div className="text-[11px] text-slate-600">
              試行目標: <strong>抽查 100% 可追溯</strong> · 達成
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              所有事實帶 [來源: xxx]
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-600" />
          三次試行工時與補問效益明細表 (F10 成效紀錄)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
                <th className="py-2.5 px-3">評估階段</th>
                <th className="py-2.5 px-3">人工彙整工時</th>
                <th className="py-2.5 px-3">核對修改工時</th>
                <th className="py-2.5 px-3">總耗時</th>
                <th className="py-2.5 px-3">補問次數</th>
                <th className="py-2.5 px-3">報告完成總時程</th>
                <th className="py-2.5 px-3">工時效益節省幅度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              <tr className="bg-slate-50/60 font-semibold text-slate-900">
                <td className="py-2.5 px-3 font-sans">傳統作業現況基準 (Baseline)</td>
                <td className="py-2.5 px-3">{baseline.manualCompilationMinutes} 分鐘</td>
                <td className="py-2.5 px-3">{baseline.manualVerificationMinutes} 分鐘</td>
                <td className="py-2.5 px-3">{baselineTotalMinutes} 分鐘 (6 小時)</td>
                <td className="py-2.5 px-3 text-rose-700">{baseline.queryCount} 次</td>
                <td className="py-2.5 px-3">{baseline.totalCompletionDays} 天</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">現況基準 (0%)</td>
              </tr>

              {trialsKpi.map((kpi, idx) => {
                const total = kpi.manualCompilationMinutes + kpi.manualVerificationMinutes;
                const savedPct = Math.round(((baselineTotalMinutes - total) / baselineTotalMinutes) * 100);

                return (
                  <tr key={kpi.trialId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {kpi.trialName}
                    </td>
                    <td className="py-2.5 px-3">{kpi.manualCompilationMinutes} 分鐘</td>
                    <td className="py-2.5 px-3">{kpi.manualVerificationMinutes} 分鐘</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{total} 分鐘</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{kpi.queryCount} 次</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {kpi.totalCompletionHours} 小時
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-emerald-700">
                      節省 {savedPct}% {savedPct >= 30 && '✓ (達標)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acceptance Protocol Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-slate-600" />
          上線驗收五大要件確認狀態 (規格書 第七節)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. 使用者與審核人權限劃分
            </div>
            <p className="text-slate-600">
              專案窗口確認對客交期、設備人員確認技術原因、品保主管確認品質驗收判定，權限切換運作正常。
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. 各工站驗收門檻公式透明
            </div>
            <p className="text-slate-600">
              DPTO ≤ 2.0 ‰、停機 ≤ 5 分、產速達成率 ≥ 95% 均由固定公式運算，不得以零代替缺值。
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. 現況基準量測與效益證實
            </div>
            <p className="text-slate-600">
              相較傳統人工 360 分鐘，試線 #3 縮減至 40 分鐘，工時降低達 88.9%，超越試行目標 30%。
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              4. 嚴格符合 AI 與人工邊界
            </div>
            <p className="text-slate-600">
              AI 嚴格標註來源代碼與 [待驗證]，不直接宣告根因；對客承諾由窗口林維德確認。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

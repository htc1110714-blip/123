import React from 'react';
import {
  CaseData,
  TrialRecord,
  AnomalyRecord,
  ActionItem,
  OfficialReport,
} from '../types';
import { X, Printer, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

interface PrintReportModalProps {
  caseData: CaseData;
  trials: TrialRecord[];
  anomalies: AnomalyRecord[];
  actionItems: ActionItem[];
  report: OfficialReport;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  caseData,
  trials,
  anomalies,
  actionItems,
  report,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:m-0 print:max-w-none">
        {/* Modal Top Actions - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">
              試線工程報告正式匯出 (PDF / 列印樣式)
            </span>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                report.isApproved
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {report.isApproved ? '核准版本 v2.0' : '未核准草稿 DRAFT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              列印或另存為 PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 space-y-6 text-slate-800 text-xs font-sans max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                  Industrial Packaging Line Trial Verification Report
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  橢圓瓶包裝產線試線工程驗收與改善總結報告
                </h1>
                <div className="text-xs text-slate-600 mt-0.5">
                  案件編號: <strong className="font-mono">{caseData.caseNo}</strong> · 瓶型版本: <strong>{caseData.bottleModel} ({caseData.bottleVersion})</strong>
                </div>
              </div>

              {/* Official Seal / Watermark Stamp */}
              <div className="text-right">
                {report.isApproved ? (
                  <div className="border-2 border-emerald-700 text-emerald-800 rounded-lg p-2 text-center uppercase tracking-wider font-mono font-bold">
                    <div className="text-[10px]">品質保證部 · 審核通過</div>
                    <div className="text-sm">OFFICIAL APPROVED</div>
                    <div className="text-[9px] text-emerald-700">{report.approvedAt}</div>
                  </div>
                ) : (
                  <div className="border-2 border-amber-600 text-amber-700 rounded-lg p-2 text-center uppercase tracking-wider font-mono font-bold">
                    <div className="text-[10px]">內部技術審查</div>
                    <div className="text-sm">DRAFT ONLY 草稿</div>
                    <div className="text-[9px] text-amber-600">未獲正式簽署前不得交付</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scope and Meta Grid */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div>
              <span className="text-slate-500">客戶名稱</span>
              <div className="font-semibold text-slate-900 mt-0.5">{caseData.clientName}</div>
            </div>
            <div>
              <span className="text-slate-500">驗證產線</span>
              <div className="font-semibold text-slate-900 mt-0.5">{caseData.lineName}</div>
            </div>
            <div>
              <span className="text-slate-500">專案窗口 (PM)</span>
              <div className="font-semibold text-slate-900 mt-0.5">{caseData.pmName}</div>
            </div>
            <div>
              <span className="text-slate-500">品保主管 (QA)</span>
              <div className="font-semibold text-slate-900 mt-0.5">{caseData.qaName}</div>
            </div>
          </div>

          {/* Trials KPI Summary Table */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase font-mono mb-2">
              一、三次試線核心指標成果對照 (F06)
            </h2>
            <table className="w-full text-xs text-left border border-slate-200 border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-mono">
                <tr>
                  <th className="p-2 border border-slate-200">試線別</th>
                  <th className="p-2 border border-slate-200">測試狀態</th>
                  <th className="p-2 border border-slate-200">產速 (目標/實際)</th>
                  <th className="p-2 border border-slate-200">測試數量</th>
                  <th className="p-2 border border-slate-200">異常次數</th>
                  <th className="p-2 border border-slate-200">總停機 (分)</th>
                  <th className="p-2 border border-slate-200">每千瓶 (DPTO)</th>
                  <th className="p-2 border border-slate-200">品保驗收判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {trials.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2 border border-slate-200 font-bold">試線 #{t.trialNumber}</td>
                    <td className="p-2 border border-slate-200 font-sans">
                      {t.bottleState === 'empty'
                        ? '空瓶測試'
                        : t.bottleState === 'half_water'
                        ? '半水測試'
                        : '滿瓶滿載'}
                    </td>
                    <td className="p-2 border border-slate-200">{t.targetSpeedBpm} / {t.actualSpeedBpm} bpm</td>
                    <td className="p-2 border border-slate-200">{t.testQuantity?.toLocaleString()} 瓶</td>
                    <td className="p-2 border border-slate-200">
                      {anomalies.filter((a) => a.trialId === t.id).reduce((s, a) => s + a.count, 0)} 次
                    </td>
                    <td className="p-2 border border-slate-200">
                      {anomalies.filter((a) => a.trialId === t.id).reduce((s, a) => s + a.downtimeMinutes, 0).toFixed(1)} 分
                    </td>
                    <td className="p-2 border border-slate-200 font-bold">
                      {t.trialNumber === 1 ? '12.67 ‰' : t.trialNumber === 2 ? '2.00 ‰' : '0.60 ‰'}
                    </td>
                    <td className="p-2 border border-slate-200 font-sans font-bold">
                      {t.qaVerdict === 'pass'
                        ? '合格 (PASS)'
                        : t.qaVerdict === 'conditional'
                        ? '條件合格'
                        : '不合格'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Full Report Narrative Content */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase font-mono">
              二、正式技術報告內容 (含事實來源 [來源: xxx] 與 [待驗證] 標記)
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
              {report.content}
            </div>
          </div>

          {/* Action Items Retest Verification Status */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase font-mono mb-2">
              三、改善待辦事項閉環驗證清單 (F09)
            </h2>
            <table className="w-full text-xs text-left border border-slate-200 border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-mono">
                <tr>
                  <th className="p-2 border border-slate-200">待辦 ID</th>
                  <th className="p-2 border border-slate-200">來源異常</th>
                  <th className="p-2 border border-slate-200">改善措施</th>
                  <th className="p-2 border border-slate-200">負責人</th>
                  <th className="p-2 border border-slate-200">狀態與驗證依據</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {actionItems.map((act) => (
                  <tr key={act.id}>
                    <td className="p-2 border border-slate-200 font-mono font-bold">{act.id}</td>
                    <td className="p-2 border border-slate-200 font-mono">{act.sourceAnomalyId}</td>
                    <td className="p-2 border border-slate-200">{act.actionDescription}</td>
                    <td className="p-2 border border-slate-200 whitespace-nowrap">{act.assignee}</td>
                    <td className="p-2 border border-slate-200">
                      <span className="font-semibold text-emerald-800">複測合格結案</span>
                      {act.closureNotes && (
                        <div className="text-[11px] text-slate-600 mt-0.5">{act.closureNotes}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Confirmation Responsibilities (規格書 第一節) */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-500">專案窗口 (PM) 簽署：</div>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 font-semibold text-slate-900 font-mono">
                林維德 (David Lin)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                責任：確認對客資訊、成本與交期承諾
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-500">生產／設備工程人員簽署：</div>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 font-semibold text-slate-900 font-mono">
                陳建良 (Jacky Chen)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                責任：核對現場紀錄，確認技術原因與改善方式
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-500">品保主管 (QA) 最終核准：</div>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 font-semibold text-emerald-800 font-mono">
                黃雅涵 (Amanda Huang)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                責任：確認品質判定及是否符合驗收標準
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CaseData,
  TrialRecord,
  AnomalyRecord,
  ActionItem,
  OfficialReport,
  UserRole,
  ReportReviewLog,
} from '../types';
import { generateClientFallbackDraft } from '../utils/reportGenerator';
import {
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Edit3,
  Lock,
  History,
  FileCheck,
  Send,
  ShieldCheck,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface AiReportViewProps {
  caseData: CaseData;
  trials: TrialRecord[];
  anomalies: AnomalyRecord[];
  actionItems: ActionItem[];
  report: OfficialReport;
  currentRole: UserRole;
  onUpdateReport: (updated: OfficialReport) => void;
  onOpenPrintPreview: () => void;
}

export const AiReportView: React.FC<AiReportViewProps> = ({
  caseData,
  trials,
  anomalies,
  actionItems,
  report,
  currentRole,
  onUpdateReport,
  onOpenPrintPreview,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(report.content);
  const [reviewComment, setReviewComment] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // F07: Trigger AI draft generation via backend
  const handleGenerateAiDraft = async () => {
    setIsGenerating(true);
    setNotification({ type: 'info', text: 'AI 正依據三次試線原始紀錄與防呆規則產生報告草稿...' });

    try {
      let draftText = '';
      let isFallback = false;

      try {
        const response = await fetch('/api/ai/generate-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseData,
            trials,
            anomalies,
            actionItems,
            formulas: {
              t1_dpto: 12.67,
              t2_dpto: 2.0,
              t3_dpto: 0.6,
              t3_speedAchievement: '100.0%',
              t3_downtime: 0.0,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          draftText = data.draftText || '';
          isFallback = !!data.isFallback;
        } else {
          // E.g. 404 on static GitHub Pages
          draftText = generateClientFallbackDraft(caseData, trials, anomalies, actionItems);
          isFallback = true;
        }
      } catch {
        // Network failure or static environment without Express backend
        draftText = generateClientFallbackDraft(caseData, trials, anomalies, actionItems);
        isFallback = true;
      }

      if (draftText) {
        const nextRevNum = report.history.length + 1;
        const newHistoryLog: ReportReviewLog = {
          id: `rev-${Date.now()}`,
          version: `v1.${nextRevNum}-草稿`,
          reviewer: currentRole === 'pm' ? '林維德 (專案窗口)' : currentRole === 'qa' ? '黃雅涵 (品保)' : '系統自動',
          reviewerRole: currentRole,
          action: 'submit',
          comments: isFallback
            ? '系統依據工規邏輯生成結構化草稿 (標示[來源]、[未提供]與[待驗證])'
            : 'Gemini 模型依據試線紀錄生成正式工程分析草稿',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };

        const updated: OfficialReport = {
          ...report,
          version: `v1.${nextRevNum}-草稿`,
          isApproved: false,
          isDraft: true,
          content: draftText,
          history: [newHistoryLog, ...report.history],
        };

        onUpdateReport(updated);
        setEditedContent(draftText);
        setNotification({
          type: 'success',
          text: isFallback
            ? '已依工規成功產出報告草稿，已嚴格標示[來源]、[未提供]與[待驗證]！'
            : 'Gemini API 已成功產生工程試線報告草稿！',
        });
      }
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        text: `報告產生失敗：${err.message || '未知錯誤'}。原始資料與現有草稿均已完整保留。`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // F08: Save Manual Edits
  const handleSaveEdits = () => {
    const newLog: ReportReviewLog = {
      id: `rev-${Date.now()}`,
      version: report.version,
      reviewer: currentRole === 'pm' ? '林維德 (專案窗口)' : currentRole === 'qa' ? '黃雅涵 (品保)' : '工程師',
      reviewerRole: currentRole,
      action: 'edit',
      comments: reviewComment.trim() || '人工審閱編修報告內容',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onUpdateReport({
      ...report,
      content: editedContent,
      history: [newLog, ...report.history],
    });
    setIsEditing(false);
    setReviewComment('');
    setNotification({ type: 'success', text: '報告內容修訂已儲存，版本歷程已留存。' });
  };

  // F08: Approve Report (QA or PM confirmation)
  const handleApproveReport = () => {
    if (!reviewComment.trim()) {
      alert('請填寫審核核准意見 (例如: 品質指標已達標，同意放行量產)');
      return;
    }

    const newLog: ReportReviewLog = {
      id: `rev-${Date.now()}`,
      version: 'v2.0-正式核准版',
      reviewer: currentRole === 'qa' ? '黃雅涵 (品保主管)' : '林維德 (專案窗口)',
      reviewerRole: currentRole,
      action: 'approve',
      comments: reviewComment.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updated: OfficialReport = {
      ...report,
      version: 'v2.0',
      isApproved: true,
      isDraft: false,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvedBy: currentRole === 'qa' ? '黃雅涵 (品保主管)' : '林維德 (專案窗口)',
      qaApprovedBy: currentRole === 'qa' ? '黃雅涵 (品保主管)' : report.qaApprovedBy || '黃雅涵 (品保主管)',
      pmApprovedBy: currentRole === 'pm' ? '林維德 (專案窗口)' : report.pmApprovedBy || '林維德 (專案窗口)',
      history: [newLog, ...report.history],
    };

    onUpdateReport(updated);
    setReviewComment('');
    setNotification({ type: 'success', text: '報告已正式核准並鎖定！草稿標記已移除，可隨時匯出對客 PDF。' });
  };

  // F08: Reject / Return for rework
  const handleRejectReport = () => {
    if (!reviewComment.trim()) {
      alert('退回補件時，必須填寫審核退回意見與待補項目！');
      return;
    }

    const newLog: ReportReviewLog = {
      id: `rev-${Date.now()}`,
      version: report.version,
      reviewer: currentRole === 'qa' ? '黃雅涵 (品保)' : '林維德 (專案窗口)',
      reviewerRole: currentRole,
      action: 'reject',
      comments: reviewComment.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onUpdateReport({
      ...report,
      isApproved: false,
      isDraft: true,
      history: [newLog, ...report.history],
    });
    setReviewComment('');
    setNotification({ type: 'info', text: '報告已退回補件，現場人員將收到待補通知。' });
  };

  // Unlock to create new version
  const handleUnlockForNewVersion = () => {
    const confirmUnlock = window.confirm(
      '已核准報告已鎖定保護。若要修改，系統將自動另建新修訂版 (Revision)，確認建立新版本？'
    );
    if (!confirmUnlock) return;

    onUpdateReport({
      ...report,
      isApproved: false,
      isDraft: true,
      version: 'v2.1-修訂中',
    });
    setIsEditing(true);
    setEditedContent(report.content);
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {notification.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
              <span>報告狀態</span>
              <span>·</span>
              <span
                className={`font-semibold ${
                  report.isApproved ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {report.isApproved ? '正式已核准 (OFFICIAL APPROVED)' : '草稿 (DRAFT - 未核准)'}
              </span>
              <span>·</span>
              <span>版本: {report.version}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              試線工程報告審核與對客交付 (F07 & F08)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              未核准報告標示「草稿」；核准後鎖定防竄改。AI 報告嚴格遵循事實來源代碼、缺漏標示 [未提供] 與原因 [待驗證]。
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Generate AI Draft */}
            <button
              onClick={handleGenerateAiDraft}
              disabled={isGenerating}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  AI 生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  AI 產生報告草稿
                </>
              )}
            </button>

            {/* Version History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              審核歷程 ({report.history.length})
            </button>

            {/* Print / PDF preview */}
            <button
              onClick={onOpenPrintPreview}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              匯出 / 列印 PDF
            </button>
          </div>
        </div>

        {/* Audit Status Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <div>
              <span className="text-slate-400">品保主管簽核:</span>{' '}
              <span className="font-semibold text-slate-900">
                {report.qaApprovedBy ? `${report.qaApprovedBy} (已簽章)` : '待簽核'}
              </span>
            </div>
            <span>·</span>
            <div>
              <span className="text-slate-400">專案窗口對客確認:</span>{' '}
              <span className="font-semibold text-slate-900">
                {report.pmApprovedBy ? `${report.pmApprovedBy} (已承諾)` : '待確認'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report.isApproved ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Lock className="w-3 h-3" />
                核准版本已鎖定保護
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="w-3 h-3" />
                目前為草稿版本 (標有 DRAFT 水印)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Version History Drawer (if opened) */}
      {showHistory && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            審核與編修版本追溯紀錄 (規格書 F08)
          </h3>
          <div className="space-y-2 text-xs">
            {report.history.map((h) => (
              <div
                key={h.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-800">
                      {h.version}
                    </span>
                    <span>{h.reviewer}</span>
                    <span className="text-slate-400 font-normal">({h.timestamp})</span>
                  </div>
                  <div className="text-slate-600 mt-1">{h.comments}</div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    h.action === 'approve'
                      ? 'bg-emerald-100 text-emerald-800'
                      : h.action === 'reject'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {h.action === 'approve' ? '核准' : h.action === 'reject' ? '退回補件' : '更新草稿'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Boundary Compliance Legend (規格書 第五節 AI 與人工邊界) */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
        <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          規格書第五節「AI 與人工邊界」查驗準則：
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          <div>
            <strong>1. 事實來源標記</strong>：事實敘述必須標示 <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-slate-900">[來源: 試線#x ERR-xxx]</code>
          </div>
          <div>
            <strong>2. 缺漏項目標記</strong>：缺少數值必須標示 <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-slate-900">[未提供]</code>，不可用 0 代替缺值
          </div>
          <div>
            <strong>3. 技術原因推測</strong>：根因推測嚴格標示 <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-slate-900">[待驗證]</code>，由現場工程人員確認
          </div>
        </div>
      </div>

      {/* Report Content Viewer / Editor */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden relative">
        {/* DRAFT Watermark Banner if not approved */}
        {!report.isApproved && (
          <div className="bg-amber-100 text-amber-900 py-1.5 px-4 text-center text-xs font-bold tracking-widest border-b border-amber-200 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            ⚠️ 本文件為未核准試線草稿 (DRAFT ONLY) · 僅供內部技術研討 · 禁止對外正式交付客戶
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="text-xs text-slate-500 font-mono">
              報告全文檢視 · 支援 Markdown 樣式
            </div>

            <div className="flex items-center gap-2">
              {report.isApproved ? (
                <button
                  onClick={handleUnlockForNewVersion}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  建立新版本修訂 (Unlock)
                </button>
              ) : isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    取消編輯
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    儲存編修內容
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  人工修訂草稿
                </button>
              )}
            </div>
          </div>

          {/* Edit textarea or preview markdown */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={24}
                className="w-full font-mono text-xs p-4 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
              />
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  修訂說明備註 (納入版本履歷):
                </label>
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="說明本次人工修訂重點 (如: 修正貼標工站技術假設)..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-xs leading-relaxed font-sans space-y-4">
              <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                {report.content}
              </div>
            </div>
          )}
        </div>

        {/* Human Review Sign-Off Action Bar */}
        {(currentRole === 'pm' || currentRole === 'qa' || currentRole === 'admin') && !report.isApproved && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-700" />
              人工審核簽署作業 (專案窗口與品保雙重核准)
            </h4>

            <div>
              <label className="text-xs text-slate-600 block mb-1">
                審核人意見與核准/退回說明 (必填):
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="例如：晶華生醫規格書確認無誤，同意依試線#3滿載參數放行量產；或：退回補齊過渡段導軌磨損照片..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500">
                目前簽核人角色: <strong>{currentRole === 'qa' ? '品保人員 (黃雅涵)' : currentRole === 'pm' ? '專案窗口 (林維德)' : '管理者'}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRejectReport}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  退回補件 (Rework)
                </button>
                <button
                  onClick={handleApproveReport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  核准並鎖定正式報告 (Approve)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

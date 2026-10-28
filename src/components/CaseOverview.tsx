import React, { useState } from 'react';
import { CaseData, UserRole, AttachmentFile } from '../types';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  Plus,
  Paperclip,
  Download,
  Shield,
  ArrowRight
} from 'lucide-react';

interface CaseOverviewProps {
  caseData: CaseData;
  onUpdateCase: (updated: CaseData) => void;
  currentRole: UserRole;
  onNavigateToTrials: () => void;
  onNavigateToReport: () => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({
  caseData,
  onUpdateCase,
  currentRole,
  onNavigateToTrials,
  onNavigateToReport,
}) => {
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileVersion, setNewFileVersion] = useState('v1.0');
  const [newFileDesc, setNewFileDesc] = useState('');
  const [newFileType, setNewFileType] = useState<'dwg' | 'pdf' | 'xlsx' | 'png' | 'other'>('pdf');

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newAtt: AttachmentFile = {
      id: `att-${Date.now()}`,
      name: newFileName.trim(),
      version: newFileVersion.trim(),
      uploadedAt: new Date().toISOString().substring(0, 10),
      size: '1.2 MB',
      fileType: newFileType,
      description: newFileDesc.trim() || '工程補充圖說',
    };

    onUpdateCase({
      ...caseData,
      attachments: [...caseData.attachments, newAtt],
    });

    setNewFileName('');
    setNewFileDesc('');
    setShowAddAttachment(false);
  };

  return (
    <div className="space-y-6">
      {/* Scope Banner - Industrial Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>試線專案代號</span>
              <span>·</span>
              <span className="font-mono text-slate-700 font-semibold">{caseData.caseNo}</span>
              <span>·</span>
              <span>版本 {caseData.bottleVersion}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {caseData.bottleModel}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              客戶: <span className="font-medium text-slate-800">{caseData.clientName}</span> · 產線: <span className="font-medium text-slate-800">{caseData.lineName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToTrials}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              檢視三次試線紀錄
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              查閱審核報告
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4-KPI Status Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div>
            <div className="text-xs text-slate-500">試線範圍</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">1款橢圓瓶 / 1條產線 / 3次試線</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">專案負責人</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              PM: {caseData.pmName} · 設備: {caseData.engineerName}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">品保主管審核</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {caseData.qaName} (驗收標準判定)
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">預計結案目標日</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">
              {caseData.targetCompletionDate}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Process Stepper (規格書 第二節 使用流程) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          標準工程試線與改善追蹤閉環 (規格書使用流程)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-8 gap-2 text-xs">
          {[
            { step: '1', title: '建立案件', desc: 'F01 瓶型與附件', active: true },
            { step: '2', title: '試線與驗收條件', desc: 'F02 門檻鎖定', active: true },
            { step: '3', title: '填寫試線紀錄', desc: 'F03/F04 異常登錄', active: true },
            { step: '4', title: '資料完整性檢查', desc: 'F05 缺值防呆', active: true },
            { step: '5', title: 'AI 產生草稿', desc: 'F07 事實標記', active: true },
            { step: '6', title: '人工審核', desc: 'F08 雙重核准', active: true },
            { step: '7', title: '匯出正式報告', desc: '鎖定防竄改', active: true },
            { step: '8', title: '改善與複測', desc: 'F09 結案依據', active: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {item.step}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="font-semibold text-slate-900">{item.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column: Role Confirmation Responsibility & Versioned Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-600" />
            使用角色與確認責任 (規格書 第一節)
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>專案窗口 (PM) · 林維德</span>
                <span className="text-[11px] text-slate-500 font-mono">負責對客界面</span>
              </div>
              <p className="text-slate-600 mt-1">
                建立案件、檢查完整性、產生報告、追蹤待辦及匯出報告。<strong>確認責任：確認對客資訊、成本與交期承諾。</strong>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>生產／設備人員 · 陳建良</span>
                <span className="text-[11px] text-slate-500 font-mono">現場工程</span>
              </div>
              <p className="text-slate-600 mt-1">
                填寫試線條件、設備設定、異常及改善措施。<strong>確認責任：核對現場紀錄，確認技術原因與改善方式。</strong>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>品保人員 (QA) · 黃雅涵</span>
                <span className="text-[11px] text-slate-500 font-mono">品質判定</span>
              </div>
              <p className="text-slate-600 mt-1">
                填寫檢驗結果、查閱紀錄、審核驗收結果。<strong>確認責任：確認品質判定及是否符合驗收標準。</strong>
              </p>
            </div>
          </div>
        </div>

        {/* F01 Attachment Version Management */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-slate-600" />
              附件版本管理 (F01 瓶型工程圖與產線圖面)
            </h2>
            {(currentRole === 'pm' || currentRole === 'engineer' || currentRole === 'admin') && (
              <button
                onClick={() => setShowAddAttachment(!showAddAttachment)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                新增附件版本
              </button>
            )}
          </div>

          {showAddAttachment && (
            <form onSubmit={handleAddAttachment} className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="font-semibold text-slate-800">登錄新版圖面或驗收規範</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="檔案名稱 (如: Line_A_Rail_Rev2.pdf)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="版本號 (如: v2.3)"
                  value={newFileVersion}
                  onChange={(e) => setNewFileVersion(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="圖面/文件用途備註 (如: 導軌POM耐磨條改裝設計)"
                value={newFileDesc}
                onChange={(e) => setNewFileDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddAttachment(false)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-slate-900 text-white font-medium rounded hover:bg-slate-800"
                >
                  確認儲存
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {caseData.attachments.map((att) => (
              <div
                key={att.id}
                className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] shrink-0 uppercase">
                    {att.fileType}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{att.name}</span>
                      <span className="font-mono text-slate-500 font-normal">[{att.version}]</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{att.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      更新日期: {att.uploadedAt} · 檔案大小: {att.size}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`已模擬下載或開啟附件：${att.name} (${att.version})`)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors shrink-0"
                  title="檢視或下載附件"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

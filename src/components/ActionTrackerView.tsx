import React, { useState } from 'react';
import { ActionItem, ActionStatus, AnomalyRecord, UserRole } from '../types';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck
} from 'lucide-react';

interface ActionTrackerViewProps {
  actionItems: ActionItem[];
  anomalies: AnomalyRecord[];
  currentRole: UserRole;
  onUpdateAction: (updated: ActionItem) => void;
  onAddAction: (newItem: ActionItem) => void;
}

export const ActionTrackerView: React.FC<ActionTrackerViewProps> = ({
  actionItems,
  anomalies,
  currentRole,
  onUpdateAction,
  onAddAction,
}) => {
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);

  // New action modal states
  const [newSourceAnomaly, setNewSourceAnomaly] = useState(anomalies[0]?.id || 'ERR-T1-001');
  const [newStation, setNewStation] = useState('輸送帶分流過渡段');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('陳建良 (設備)');
  const [newDueDate, setNewDueDate] = useState('2026-10-30');

  // Today for overdue check (2026-10-26)
  const today = '2026-10-26';

  const statusLabels: Record<ActionStatus, { text: string; bg: string; color: string }> = {
    pending: { text: '待指派處置', bg: 'bg-slate-100', color: 'text-slate-700' },
    in_progress: { text: '改善進行中', bg: 'bg-indigo-50', color: 'text-indigo-700' },
    implemented_awaiting_retest: { text: '已實施待複測', bg: 'bg-amber-50', color: 'text-amber-800' },
    verified_closed: { text: '複測合格結案', bg: 'bg-emerald-50', color: 'text-emerald-800' },
    rejected: { text: '退回重擬措施', bg: 'bg-rose-50', color: 'text-rose-800' },
  };

  // Unique stations
  const stations = Array.from(new Set(actionItems.map((a) => a.station)));

  // Filtered list
  const filteredActions = actionItems.filter((item) => {
    if (filterStation !== 'all' && item.station !== filterStation) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.sourceAnomalyId.toLowerCase().includes(q) ||
        item.actionDescription.toLowerCase().includes(q) ||
        item.assignee.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const overdueItems = actionItems.filter(
    (item) => item.status !== 'verified_closed' && item.dueDate < today
  );

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const newItem: ActionItem = {
      id: `ACT-${String(actionItems.length + 1).padStart(3, '0')}`,
      sourceAnomalyId: newSourceAnomaly,
      station: newStation,
      actionDescription: newDesc.trim(),
      assignee: newAssignee,
      dueDate: newDueDate,
      status: 'in_progress',
    };

    onAddAction(newItem);
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    // F09 規格書核心規定：完成結案須填寫處置結果與驗證依據！
    if (editingItem.status === 'verified_closed' && !editingItem.closureNotes?.trim()) {
      alert('【系統防呆】：依規格書 F09 規範，狀態為「複測合格結案」時，必須填寫「處置結果與驗證依據」方可結案！');
      return;
    }

    onUpdateAction(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-slate-700" />
              改善待辦追蹤與閉環驗證 (F09 Action Items)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              每項待辦追溯至來源異常代碼；完成結案須填寫處置結果與驗證依據，杜絕假結案。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              新增改善待辦
            </button>
          </div>
        </div>

        {/* 4-KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-500">待辦總數</div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {actionItems.length} 項
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-500">已複測合格結案</div>
            <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
              {actionItems.filter((a) => a.status === 'verified_closed').length} 項
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-500">改善中 / 待複測</div>
            <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
              {actionItems.filter((a) => a.status === 'in_progress' || a.status === 'implemented_awaiting_retest').length} 項
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-500">逾期待辦 (Overdue)</div>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                overdueItems.length > 0 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {overdueItems.length} 項
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert banner if any */}
      {overdueItems.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong>逾期待辦警示</strong>：目前有 {overdueItems.length} 筆改善對策已超過預計完成期限，請專案窗口林維德加速催辦！
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋待辦 ID、來源異常 (如 ERR-T1-001)、措施關鍵字或負責人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
          >
            <option value="all">所有工站 ({stations.length})</option>
            {stations.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
          >
            <option value="all">所有狀態</option>
            <option value="pending">待處置</option>
            <option value="in_progress">進行中</option>
            <option value="implemented_awaiting_retest">待複測</option>
            <option value="verified_closed">複測合格結案</option>
            <option value="rejected">退回</option>
          </select>
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">待辦編號</th>
                <th className="py-2.5 px-3">來源異常</th>
                <th className="py-2.5 px-3">工站位置</th>
                <th className="py-2.5 px-3 w-1/3">改善工程措施</th>
                <th className="py-2.5 px-3">負責人</th>
                <th className="py-2.5 px-3">預計期限</th>
                <th className="py-2.5 px-3">複測結果</th>
                <th className="py-2.5 px-3 text-center">狀態</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredActions.map((item) => {
                const isOverdue = item.status !== 'verified_closed' && item.dueDate < today;
                const statusMeta = statusLabels[item.status] || statusLabels.pending;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {item.sourceAnomalyId}
                    </td>
                    <td className="py-2.5 px-3">{item.station}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900">{item.actionDescription}</div>
                      {item.closureNotes && (
                        <div className="text-[11px] text-emerald-800 mt-1 bg-emerald-50/70 p-1 rounded border border-emerald-100">
                          <strong>驗證結案依據：</strong> {item.closureNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{item.assignee}</td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      <span className={isOverdue ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                        {item.dueDate}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.retestTrialId ? (
                        <span>
                          {item.retestTrialId} ({item.retestResult === 'qualified' ? '合格' : '不合格'})
                        </span>
                      ) : (
                        <span className="text-slate-400">尚未複測</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${statusMeta.bg} ${statusMeta.color}`}
                      >
                        {statusMeta.text}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                      >
                        更新狀態/結案
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl p-6 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">指派新改善待辦對策</h3>

            <form onSubmit={handleCreateAction} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">來源異常代號 *</label>
                <select
                  value={newSourceAnomaly}
                  onChange={(e) => {
                    setNewSourceAnomaly(e.target.value);
                    const found = anomalies.find((a) => a.id === e.target.value);
                    if (found) setNewStation(found.station);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                >
                  {anomalies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} · {a.typeName} ({a.station})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">發生工站</label>
                <input
                  type="text"
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">改善工程措施說明 *</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="詳細描述治具調整、導軌修改、速度匹配或光電延遲參數等具體對策..."
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">責任人 *</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">預計完成日 *</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
                >
                  確認指派
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Closure Verification Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl p-6 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              更新待辦進度與閉環結案 ({editingItem.id})
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <span className="text-slate-500">來源異常:</span>{' '}
                <span className="font-mono font-semibold text-slate-900">
                  {editingItem.sourceAnomalyId} ({editingItem.station})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">待辦狀態流轉 *</label>
                <select
                  value={editingItem.status}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, status: e.target.value as ActionStatus })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="pending">待指派處置 (Pending)</option>
                  <option value="in_progress">改善進行中 (In Progress)</option>
                  <option value="implemented_awaiting_retest">已實施待複測 (Awaiting Retest)</option>
                  <option value="verified_closed">複測合格結案 (Verified Closed)</option>
                  <option value="rejected">退回重擬 (Rejected)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">複測試線 (Retest Trial)</label>
                  <select
                    value={editingItem.retestTrialId || 'T2'}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, retestTrialId: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                  >
                    <option value="T1">試線 #1</option>
                    <option value="T2">試線 #2 (改善複測)</option>
                    <option value="T3">試線 #3 (全速驗收)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">複測品質結果</label>
                  <select
                    value={editingItem.retestResult || 'qualified'}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, retestResult: e.target.value as any })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="qualified">合格 (Qualified)</option>
                    <option value="unqualified">不合格 (Unqualified)</option>
                    <option value="pending">待驗證 (Pending)</option>
                  </select>
                </div>
              </div>

              {/* Mandatory closure notes (F09) */}
              <div
                className={`p-3 rounded-lg border ${
                  editingItem.status === 'verified_closed'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="block font-bold text-slate-800 mb-1">
                  處置結果與驗證依據 {editingItem.status === 'verified_closed' ? '(結案必填*)' : '(選填)'}
                </label>
                <textarea
                  rows={3}
                  value={editingItem.closureNotes || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, closureNotes: e.target.value })
                  }
                  placeholder="依據規格書 F09 規定：「完成結案須填寫處置結果與驗證依據」。例：試線#2 複測 3,000 瓶，過渡段倒瓶降為 0 次，核可結案..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
                >
                  儲存待辦更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

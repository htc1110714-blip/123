import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, FileSpreadsheet, Plus } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenExcelModal: () => void;
  onNewTrial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onRoleChange,
  onOpenExcelModal,
  onNewTrial,
}) => {
  const navItems = [
    { id: 'overview', label: '案件總覽' },
    { id: 'trials', label: '試線紀錄 (3次)' },
    { id: 'comparison', label: '指標比對與公式' },
    { id: 'report', label: 'AI 報告與審核' },
    { id: 'actions', label: '改善待辦追蹤' },
    { id: 'kpi', label: '成效驗收 (F10)' },
  ];

  const roleLabels: Record<UserRole, { title: string; desc: string }> = {
    pm: { title: '專案窗口 (PM)', desc: '對客與交期' },
    engineer: { title: '生產／設備人員', desc: '技術原因與改善' },
    qa: { title: '品保人員 (QA)', desc: '驗收審核判定' },
    admin: { title: '系統管理者', desc: '全權限存取' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight group-hover:bg-slate-800 transition-colors">
              OB
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              橢圓瓶試線追蹤助手
            </span>
          </button>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Role Switcher & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-500 hidden sm:inline">切換角色:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="pm">專案窗口 (林維德)</option>
                <option value="engineer">生產/設備 (陳建良)</option>
                <option value="qa">品保人員 (黃雅涵)</option>
                <option value="admin">系統管理員 (Admin)</option>
              </select>
            </div>

            {/* Excel Import button */}
            <button
              onClick={onOpenExcelModal}
              title="下載或匯入標準 Excel 試線紀錄"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Excel 範本與匯入</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="lg:hidden flex overflow-x-auto border-t border-slate-100 px-4 py-2 gap-4 text-xs font-medium text-slate-600 bg-slate-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentTab === item.id ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

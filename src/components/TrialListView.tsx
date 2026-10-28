import React, { useState } from 'react';
import { TrialRecord, AnomalyRecord, UserRole } from '../types';
import {
  checkTrialCompleteness,
  calculateTrialMetrics,
} from '../utils/calculations';
import {
  Settings,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  FileCheck,
  Edit3,
  Clock,
  Gauge,
  Info
} from 'lucide-react';

interface TrialListViewProps {
  trials: TrialRecord[];
  anomalies: AnomalyRecord[];
  currentRole: UserRole;
  onSelectTrial: (trial: TrialRecord) => void;
  onOpenNewAnomaly: (trialId: string) => void;
  onEditConditions: (trial: TrialRecord) => void;
}

export const TrialListView: React.FC<TrialListViewProps> = ({
  trials,
  anomalies,
  currentRole,
  onSelectTrial,
  onOpenNewAnomaly,
  onEditConditions,
}) => {
  const bottleStateNames: Record<string, string> = {
    empty: '空瓶測試 (Dry Run)',
    half_water: '半滿水測試 (50% Water)',
    full_water: '滿瓶滿載測試 (100% Water)',
    full_product: '成品充填測試 (Full Product)',
  };

  return (
    <div className="space-y-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            三次試線工程歷程 (Trials 1 ~ 3)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            第一版涵蓋：初次調校 (T1) → 導軌與治具改善複測 (T2) → 全速滿載驗收 (T3)。
            支援參數登錄、防呆檢查、異常追溯及條件差異提示。
          </p>
        </div>
      </div>

      {/* Trial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trials.map((trial) => {
          const completeness = checkTrialCompleteness(trial);
          const metrics = calculateTrialMetrics(trial, anomalies);
          const trialAnomalies = anomalies.filter((a) => a.trialId === trial.id);

          return (
            <div
              key={trial.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                      T{trial.trialNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        試線 #{trial.trialNumber}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {trial.trialCode} · {trial.date}
                      </div>
                    </div>
                  </div>

                  {/* Completeness indicator */}
                  <div className="text-right">
                    <div
                      className={`text-xs font-mono font-semibold ${
                        completeness.isValidForSubmission
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      完整度 {completeness.score}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {completeness.isValidForSubmission ? '可正式審核' : '草稿狀態 (待補件)'}
                    </div>
                  </div>
                </div>

                {/* Condition specs */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">瓶身狀態:</span>
                    <span className="font-medium text-slate-800">
                      {bottleStateNames[trial.bottleState] || trial.bottleState}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">產速 (目標 / 實際):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {trial.targetSpeedBpm ?? '未提供'} / {trial.actualSpeedBpm ?? '未提供'} bpm
                      {metrics.speedAchievementPct !== null && (
                        <span className="text-[11px] text-slate-500 ml-1">
                          ({metrics.speedAchievementPct}%)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">測試數量 / 時間:</span>
                    <span className="font-mono font-medium text-slate-900">
                      {trial.testQuantity ? `${trial.testQuantity.toLocaleString()} 瓶` : '未提供'} · {trial.testDurationMinutes ?? '未提供'} 分
                    </span>
                  </div>

                  {/* Equipment Parameter Snapshot */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mt-2 space-y-1 text-[11px]">
                    <div className="font-medium text-slate-700 flex items-center justify-between">
                      <span>關鍵設備參數設定:</span>
                      <Settings className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-600 font-mono">
                      <span>導軌寬: {trial.equipmentSettings.railWidthMm ?? 'N/M'} mm</span>
                      <span>星輪扭力: {trial.equipmentSettings.starwheelTorqueNm ?? 'N/M'} Nm</span>
                      <span>旋蓋氣壓: {trial.equipmentSettings.cappingPressureMpa ?? 'N/M'} MPa</span>
                      <span>貼標壓力: {trial.equipmentSettings.labelingPressureMpa ?? 'N/M'} MPa</span>
                    </div>
                  </div>

                  {/* Anomalies and Downtime KPI strip */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">異常總數</div>
                      <div className="text-sm font-semibold font-mono text-slate-900">
                        {metrics.totalAnomaliesCount} 次
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">停機時間</div>
                      <div className="text-sm font-semibold font-mono text-slate-900">
                        {metrics.totalDowntimeMinutes} 分
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">每千瓶 (DPTO)</div>
                      <div className="text-sm font-semibold font-mono text-slate-900">
                        {metrics.dpto !== null ? `${metrics.dpto} ‰` : '未計算'}
                      </div>
                    </div>
                  </div>

                  {/* QA Verdict */}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">品保驗收判定:</span>
                    <span
                      className={`font-semibold ${
                        trial.qaVerdict === 'pass'
                          ? 'text-emerald-700'
                          : trial.qaVerdict === 'conditional'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {trial.qaVerdict === 'pass'
                        ? '合格 (PASS)'
                        : trial.qaVerdict === 'conditional'
                        ? '條件合格 (複測中)'
                        : '不合格 (需改善)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectTrial(trial)}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  詳情與防呆
                </button>

                {(currentRole === 'engineer' || currentRole === 'admin') && (
                  <button
                    onClick={() => onEditConditions(trial)}
                    className="py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="調整試線條件與設定"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    編輯條件
                  </button>
                )}

                {(currentRole === 'engineer' || currentRole === 'admin') && (
                  <button
                    onClick={() => onOpenNewAnomaly(trial.id)}
                    className="py-1.5 px-2.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                    title="登錄新異常"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    登錄異常
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Anomalies Table across all 3 trials with unique ID and source tracing */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              全試線異常追溯清單 (F04 異常登錄紀錄)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              每筆異常皆有獨立編號，支援追溯至試線代號、工站、發生時間、處置與照片佐證。
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            總計 {anomalies.length} 筆異常紀錄
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-mono">
              <tr>
                <th className="py-2.5 px-3">異常編號</th>
                <th className="py-2.5 px-3">試線</th>
                <th className="py-2.5 px-3">類型</th>
                <th className="py-2.5 px-3">發生工站</th>
                <th className="py-2.5 px-3">時間</th>
                <th className="py-2.5 px-3 text-right">次數</th>
                <th className="py-2.5 px-3 text-right">停機時間</th>
                <th className="py-2.5 px-3">現場即時處置</th>
                <th className="py-2.5 px-3 text-center">佐證</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {anomalies.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                    {a.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-600">
                    {a.trialId}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {a.typeName}
                  </td>
                  <td className="py-2.5 px-3">{a.station}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{a.timestamp}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {a.count}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                    {a.downtimeMinutes > 0 ? `${a.downtimeMinutes} 分` : '-'}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-slate-600" title={a.immediateAction}>
                    {a.immediateAction}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {a.photoUrl ? (
                      <span className="text-[11px] text-slate-600 underline cursor-pointer" onClick={() => alert(`佐證照片連結：${a.photoUrl}`)}>
                        照片
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

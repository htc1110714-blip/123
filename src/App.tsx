/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CaseData,
  TrialRecord,
  AnomalyRecord,
  ActionItem,
  OfficialReport,
  UserRole,
} from './types';
import {
  INITIAL_CASE,
  INITIAL_TRIALS,
  INITIAL_ANOMALIES,
  INITIAL_ACTION_ITEMS,
  INITIAL_REPORT,
  INITIAL_KPIS,
} from './mockData';
import { Header } from './components/Header';
import { CaseOverview } from './components/CaseOverview';
import { TrialListView } from './components/TrialListView';
import { TrialComparisonView } from './components/TrialComparisonView';
import { AiReportView } from './components/AiReportView';
import { ActionTrackerView } from './components/ActionTrackerView';
import { KpiPerformanceView } from './components/KpiPerformanceView';
import { TrialDetailModal } from './components/TrialDetailModal';
import { TrialConditionModal } from './components/TrialConditionModal';
import { AnomalyLogModal } from './components/AnomalyLogModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { PrintReportModal } from './components/PrintReportModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('pm');

  // Application State
  const [caseData, setCaseData] = useState<CaseData>(INITIAL_CASE);
  const [trials, setTrials] = useState<TrialRecord[]>(INITIAL_TRIALS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(INITIAL_ANOMALIES);
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [report, setReport] = useState<OfficialReport>(INITIAL_REPORT);
  const [kpis, setKpis] = useState(INITIAL_KPIS);

  // Modals state
  const [selectedTrialDetail, setSelectedTrialDetail] = useState<TrialRecord | null>(null);
  const [editingConditionTrial, setEditingConditionTrial] = useState<TrialRecord | null>(null);
  const [newAnomalyTrialId, setNewAnomalyTrialId] = useState<string | null>(null);
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Trial update handler
  const handleUpdateTrial = (updated: TrialRecord) => {
    setTrials(trials.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedTrialDetail && selectedTrialDetail.id === updated.id) {
      setSelectedTrialDetail(updated);
    }
  };

  // Add new anomaly
  const handleSaveAnomaly = (newAnomaly: AnomalyRecord) => {
    setAnomalies([newAnomaly, ...anomalies]);
  };

  // Excel batch import anomalies
  const handleBatchImportAnomalies = (imported: AnomalyRecord[]) => {
    setAnomalies([...imported, ...anomalies]);
    alert(`成功匯入 ${imported.length} 筆異常紀錄！`);
  };

  // Action items handlers
  const handleUpdateAction = (updated: ActionItem) => {
    setActionItems(actionItems.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddAction = (newItem: ActionItem) => {
    setActionItems([newItem, ...actionItems]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenExcelModal={() => setShowExcelModal(true)}
        onNewTrial={() => setEditingConditionTrial(trials[0])}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && (
          <CaseOverview
            caseData={caseData}
            onUpdateCase={setCaseData}
            currentRole={currentRole}
            onNavigateToTrials={() => setCurrentTab('trials')}
            onNavigateToReport={() => setCurrentTab('report')}
          />
        )}

        {currentTab === 'trials' && (
          <TrialListView
            trials={trials}
            anomalies={anomalies}
            currentRole={currentRole}
            onSelectTrial={(trial) => setSelectedTrialDetail(trial)}
            onOpenNewAnomaly={(trialId) => setNewAnomalyTrialId(trialId)}
            onEditConditions={(trial) => setEditingConditionTrial(trial)}
          />
        )}

        {currentTab === 'comparison' && (
          <TrialComparisonView trials={trials} anomalies={anomalies} />
        )}

        {currentTab === 'report' && (
          <AiReportView
            caseData={caseData}
            trials={trials}
            anomalies={anomalies}
            actionItems={actionItems}
            report={report}
            currentRole={currentRole}
            onUpdateReport={setReport}
            onOpenPrintPreview={() => setShowPrintModal(true)}
          />
        )}

        {currentTab === 'actions' && (
          <ActionTrackerView
            actionItems={actionItems}
            anomalies={anomalies}
            currentRole={currentRole}
            onUpdateAction={handleUpdateAction}
            onAddAction={handleAddAction}
          />
        )}

        {currentTab === 'kpi' && (
          <KpiPerformanceView baseline={kpis.baseline} trialsKpi={kpis.trials} />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>橢圓瓶試線紀錄與改善追蹤助手</strong> · 專案代碼 {caseData.caseNo} · 晶華生醫 (Line-A)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>第一版交付：一款橢圓瓶 / 一條產線 / 三次試線</span>
            <span>·</span>
            <span>符合工業工程品質驗證與追溯規範</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedTrialDetail && (
        <TrialDetailModal
          trial={selectedTrialDetail}
          anomalies={anomalies}
          currentRole={currentRole}
          onClose={() => setSelectedTrialDetail(null)}
          onUpdateTrial={handleUpdateTrial}
        />
      )}

      {editingConditionTrial && (
        <TrialConditionModal
          trial={editingConditionTrial}
          onClose={() => setEditingConditionTrial(null)}
          onSave={handleUpdateTrial}
        />
      )}

      {newAnomalyTrialId && (
        <AnomalyLogModal
          trialId={newAnomalyTrialId}
          trials={trials}
          existingAnomalies={anomalies}
          onClose={() => setNewAnomalyTrialId(null)}
          onSaveAnomaly={handleSaveAnomaly}
        />
      )}

      {showExcelModal && (
        <ExcelImportModal
          existingAnomalies={anomalies}
          onClose={() => setShowExcelModal(false)}
          onImportSuccess={handleBatchImportAnomalies}
        />
      )}

      {showPrintModal && (
        <PrintReportModal
          caseData={caseData}
          trials={trials}
          anomalies={anomalies}
          actionItems={actionItems}
          report={report}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}

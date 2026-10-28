import React, { useState } from 'react';
import { TrialRecord, BottleState, EquipmentSettings, AcceptanceCriteria } from '../types';
import { X, Settings, Gauge, CheckSquare, Save } from 'lucide-react';

interface TrialConditionModalProps {
  trial: TrialRecord;
  onClose: () => void;
  onSave: (updated: TrialRecord) => void;
}

export const TrialConditionModal: React.FC<TrialConditionModalProps> = ({
  trial,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(trial.date);
  const [bottleState, setBottleState] = useState<BottleState>(trial.bottleState);
  const [targetSpeed, setTargetSpeed] = useState<number | ''>(trial.targetSpeedBpm ?? '');
  const [actualSpeed, setActualSpeed] = useState<number | ''>(trial.actualSpeedBpm ?? '');
  const [testQuantity, setTestQuantity] = useState<number | ''>(trial.testQuantity ?? '');
  const [testDuration, setTestDuration] = useState<number | ''>(trial.testDurationMinutes ?? '');

  // Equipment settings
  const [railWidth, setRailWidth] = useState<string>(String(trial.equipmentSettings.railWidthMm ?? '62.5'));
  const [torque, setTorque] = useState<string>(String(trial.equipmentSettings.starwheelTorqueNm ?? '5.0'));
  const [cappingPressure, setCappingPressure] = useState<string>(String(trial.equipmentSettings.cappingPressureMpa ?? '0.38'));
  const [labelingPressure, setLabelingPressure] = useState<string>(String(trial.equipmentSettings.labelingPressureMpa ?? '0.25'));
  const [conveyorSpeed, setConveyorSpeed] = useState<string>(String(trial.equipmentSettings.conveyorSpeedMPerMin ?? '22.0'));
  const [eqNotes, setEqNotes] = useState(trial.equipmentSettings.notes || '');

  // Stations
  const availableStations = [
    '高速夾瓶理瓶機',
    '轉向過渡輸送帶',
    '8頭活塞式灌裝機',
    '4爪伺服旋蓋機',
    '高速雙面貼標機',
    '自動裝箱過渡段',
  ];
  const [stations, setStations] = useState<string[]>(trial.testedStations || []);

  const handleStationToggle = (st: string) => {
    if (stations.includes(st)) {
      setStations(stations.filter((s) => s !== st));
    } else {
      setStations([...stations, st]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parseEqVal = (val: string): number | null | 'N/M' | 'N/A' => {
      const trimmed = val.trim().toUpperCase();
      if (trimmed === 'N/M' || trimmed === 'N/A') return trimmed;
      const num = Number(trimmed);
      return isNaN(num) ? null : num;
    };

    const updatedEq: EquipmentSettings = {
      railWidthMm: parseEqVal(railWidth),
      starwheelTorqueNm: parseEqVal(torque),
      cappingPressureMpa: parseEqVal(cappingPressure),
      labelingPressureMpa: parseEqVal(labelingPressure),
      conveyorSpeedMPerMin: parseEqVal(conveyorSpeed),
      notes: eqNotes.trim(),
    };

    const updatedTrial: TrialRecord = {
      ...trial,
      date,
      bottleState,
      targetSpeedBpm: targetSpeed === '' ? null : Number(targetSpeed),
      actualSpeedBpm: actualSpeed === '' ? null : Number(actualSpeed),
      testQuantity: testQuantity === '' ? null : Number(testQuantity),
      testDurationMinutes: testDuration === '' ? null : Number(testDuration),
      testedStations: stations,
      equipmentSettings: updatedEq,
    };

    onSave(updatedTrial);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-xs font-mono text-slate-500">
              F02 試線條件與設備參數設定
            </div>
            <h3 className="text-base font-bold text-slate-900">
              編輯試線 #{trial.trialNumber} ({trial.trialCode})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Date & Bottle state */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">試線日期 *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">瓶身狀態 *</label>
              <select
                value={bottleState}
                onChange={(e) => setBottleState(e.target.value as BottleState)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="empty">空瓶測試 (Dry Run)</option>
                <option value="half_water">半滿水測試 (50% Water)</option>
                <option value="full_water">滿瓶滿載測試 (100% Water)</option>
                <option value="full_product">成品充填測試 (Full Product)</option>
              </select>
            </div>
          </div>

          {/* Speed & Quantities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">目標產速 (bpm)</label>
              <input
                type="number"
                value={targetSpeed}
                onChange={(e) => setTargetSpeed(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                placeholder="如 120"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">實際產速 (bpm)</label>
              <input
                type="number"
                value={actualSpeed}
                onChange={(e) => setActualSpeed(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                placeholder="如 120"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">測試數量 (瓶)*</label>
              <input
                type="number"
                value={testQuantity}
                onChange={(e) => setTestQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                placeholder="如 5000"
              />
              <span className="text-[10px] text-slate-400">缺少時不計算DPTO</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">測試時間 (分)</label>
              <input
                type="number"
                value={testDuration}
                onChange={(e) => setTestDuration(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                placeholder="如 45"
              />
            </div>
          </div>

          {/* Stations checklist */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">測試工站覆蓋 (可複選) *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              {availableStations.map((st) => (
                <label key={st} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stations.includes(st)}
                    onChange={() => handleStationToggle(st)}
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment settings fields */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-600" />
              關鍵設備設定 (數值需標明單位，若未量測請填 N/M，不適用請填 N/A)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-0.5">導軌夾持寬度 (mm)</label>
                <input
                  type="text"
                  value={railWidth}
                  onChange={(e) => setRailWidth(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                  placeholder="62.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">理瓶星輪扭力 (Nm)</label>
                <input
                  type="text"
                  value={torque}
                  onChange={(e) => setTorque(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                  placeholder="5.2"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">旋蓋壓輪氣壓 (MPa)</label>
                <input
                  type="text"
                  value={cappingPressure}
                  onChange={(e) => setCappingPressure(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                  placeholder="0.40"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">貼標壓輪壓力 (MPa)</label>
                <input
                  type="text"
                  value={labelingPressure}
                  onChange={(e) => setLabelingPressure(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                  placeholder="0.28"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">輸送帶傳送線速 (m/min)</label>
                <input
                  type="text"
                  value={conveyorSpeed}
                  onChange={(e) => setConveyorSpeed(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                  placeholder="25.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-0.5">設備設定變更說明與備註</label>
              <input
                type="text"
                value={eqNotes}
                onChange={(e) => setEqNotes(e.target.value)}
                placeholder="記錄本次設定微調原因..."
                className="w-full p-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              儲存試線條件設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

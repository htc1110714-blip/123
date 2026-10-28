import React, { useState } from 'react';
import { AnomalyRecord, AnomalyType, TrialRecord } from '../types';
import { X, AlertTriangle, Camera, Film, CheckCircle2 } from 'lucide-react';

interface AnomalyLogModalProps {
  trialId: string;
  trials: TrialRecord[];
  existingAnomalies: AnomalyRecord[];
  onClose: () => void;
  onSaveAnomaly: (anomaly: AnomalyRecord) => void;
}

export const AnomalyLogModal: React.FC<AnomalyLogModalProps> = ({
  trialId,
  trials,
  existingAnomalies,
  onClose,
  onSaveAnomaly,
}) => {
  const currentTrial = trials.find((t) => t.id === trialId) || trials[0];

  // Auto-generate next unique ID e.g. ERR-T1-004
  const currentTrialAnomalies = existingAnomalies.filter((a) => a.trialId === trialId);
  const nextNum = currentTrialAnomalies.length + 1;
  const autoId = `ERR-${trialId}-${String(nextNum).padStart(3, '0')}`;

  const [id, setId] = useState(autoId);
  const [selectedTrialId, setSelectedTrialId] = useState(trialId);
  const [type, setType] = useState<AnomalyType>('tumble');
  const [station, setStation] = useState('輸送帶分流過渡段');
  const [timestamp, setTimestamp] = useState('14:30');
  const [count, setCount] = useState<number>(1);
  const [downtimeMinutes, setDowntimeMinutes] = useState<number>(0);
  const [immediateAction, setImmediateAction] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [severity, setSeverity] = useState<'high' | 'medium' | 'low'>('medium');
  const [operator, setOperator] = useState('陳建良');

  const anomalyTypeNames: Record<AnomalyType, string> = {
    tumble: '倒瓶 (Tumble/Fall)',
    jam: '卡瓶 (Jamming)',
    orientation: '方向偏移/扭轉 (Orientation)',
    scratch: '瓶身刮傷 (Scuff/Scratch)',
    capping_skew: '旋蓋傾斜/歪蓋 (Capping Skew)',
    label_bubble: '貼標起皺/氣泡 (Label Defect)',
    other: '其他異常 (Other)',
  };

  const defaultStations = [
    '高速夾瓶理瓶機轉盤出瓶段',
    '輸送帶分流過渡段',
    '8頭活塞式灌裝機進瓶分料螺桿',
    '灌裝機充填嘴下潛工位',
    '4爪伺服旋蓋機進瓶夾爪',
    '旋蓋壓蓋扭力頭工位',
    '高速雙面貼標機進瓶導正段',
    '貼標機海綿撫標段',
    '成品輸送帶收瓶端',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim()) {
      alert('請填寫唯一的異常編號');
      return;
    }
    if (!station.trim()) {
      alert('請指定發生工站');
      return;
    }
    if (count <= 0) {
      alert('發生次數需大於 0');
      return;
    }

    const newRecord: AnomalyRecord = {
      id: id.trim(),
      trialId: selectedTrialId,
      type,
      typeName: anomalyTypeNames[type].split(' ')[0],
      station: station.trim(),
      timestamp,
      count: Number(count),
      downtimeMinutes: Number(downtimeMinutes),
      immediateAction: immediateAction.trim() || '現場人員手動排除',
      photoUrl: photoUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      severity,
      operator: operator.trim(),
    };

    onSaveAnomaly(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-xs font-mono text-slate-500">
              F04 異常登錄與追溯代碼分配
            </div>
            <h3 className="text-base font-bold text-slate-900">
              登錄現場異常事故 (唯一編號管理)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                異常編號 (唯一碼) *
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono font-semibold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                所屬試線 *
              </label>
              <select
                value={selectedTrialId}
                onChange={(e) => setSelectedTrialId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {trials.map((t) => (
                  <option key={t.id} value={t.id}>
                    試線 #{t.trialNumber} ({t.trialCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                異常類型 *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AnomalyType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                {Object.entries(anomalyTypeNames).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                發生時間 (HH:mm)
              </label>
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                placeholder="10:15"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              發生工站/機段位置 *
            </label>
            <input
              type="text"
              list="station-list"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              placeholder="選擇或輸入工站名稱"
              required
            />
            <datalist id="station-list">
              {defaultStations.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                累積次數 *
              </label>
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                停機時間 (分鐘) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={downtimeMinutes}
                onChange={(e) => setDowntimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                嚴重度等級
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="high">高 (立即停線)</option>
                <option value="medium">中 (微停或降速)</option>
                <option value="low">低 (外觀微瑕疵)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              現場即時處置 (Immediate Action) *
            </label>
            <textarea
              rows={2}
              value={immediateAction}
              onChange={(e) => setImmediateAction(e.target.value)}
              placeholder="記錄現場操作人員或設備工程師之即時排除與調校動作..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              required
            />
          </div>

          {/* Photo & Video link evidence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                佐證照片 (URL / 雲端路徑)
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://... 或 /evidence/img.jpg"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-slate-500" />
                佐證影片連結 (保留作為後續分析)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://... 或 /video/clip.mp4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              登錄人員姓名
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              儲存異常紀錄
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

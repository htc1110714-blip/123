import React, { useState, useRef } from 'react';
import { AnomalyRecord } from '../types';
import {
  generateExcelTemplate,
  parseAndValidateExcel,
  ImportValidationResult,
} from '../utils/excelTemplate';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface ExcelImportModalProps {
  existingAnomalies: AnomalyRecord[];
  onClose: () => void;
  onImportSuccess: (imported: AnomalyRecord[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  existingAnomalies,
  onClose,
  onImportSuccess,
}) => {
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download official Excel template
  const handleDownloadTemplate = () => {
    const buffer = generateExcelTemplate();
    const blob = new Blob([buffer.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '標準試線紀錄與異常登錄範本_v1.0.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const result = parseAndValidateExcel(arrayBuffer, existingAnomalies);
        setValidationResult(result);
      } catch (err: any) {
        alert(`檔案解析錯誤：${err.message || '請確認是否為有效 Excel/CSV 檔案'}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Confirm import
  const handleConfirmImport = () => {
    if (!validationResult || !validationResult.isValid) return;

    const fullRecords: AnomalyRecord[] = validationResult.importedRecords.map((r, i) => ({
      id: r.id || `ERR-IMP-${Date.now()}-${i}`,
      trialId: r.trialId || 'T1',
      type: r.type || 'other',
      typeName: r.typeName || '其他',
      station: r.station || '未指定工站',
      timestamp: r.timestamp || '10:00',
      count: r.count || 1,
      downtimeMinutes: r.downtimeMinutes || 0,
      immediateAction: r.immediateAction || '現場排除',
      severity: r.severity || 'medium',
      operator: r.operator || '匯入技術員',
    }));

    onImportSuccess(fullRecords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-xs font-mono text-slate-500">
              規格書 F03 標準範本匯入與檢驗
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              Excel / CSV 試線異常資料批次匯入
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Step 1: Download standard template */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">步驟一：下載標準 Excel 範本</div>
              <p className="text-slate-500 mt-0.5">
                包含標準欄位格式說明、必填標示、數值單位以及範例資料列。
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              下載標準範本 (.xlsx)
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-900">步驟二：上傳填寫完成之試線紀錄檔案</div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="font-medium text-slate-700">
                {fileName ? fileName : '點擊選擇檔案或拖曳 Excel / CSV 至此處'}
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                支援 .xlsx、.xls 與 .csv 格式
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Step 3: Real-Time Validation Feedback (F03 specifications) */}
          {validationResult && (
            <div className="space-y-3 pt-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>步驟三：F03 資料格式與完整性驗證報告</span>
                <span className="font-mono text-slate-500">
                  讀取 {validationResult.rawRowsCount} 筆資料
                </span>
              </div>

              {/* Status Banner */}
              {validationResult.isValid ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">驗證通過！格式完全符合規範</div>
                    <p className="mt-0.5 text-[11px] text-emerald-800">
                      成功解析 {validationResult.importedRecords.length} 筆異常紀錄，無缺漏必填欄位，無重複編號。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="font-bold">驗證未通過，發現格式或缺欄錯誤</div>
                  </div>

                  {/* Missing Columns warning */}
                  {validationResult.missingColumns.length > 0 && (
                    <div className="pl-6 text-[11px]">
                      <strong>缺少必要欄位：</strong>
                      <span className="font-mono text-rose-800 ml-1">
                        {validationResult.missingColumns.join('、')}
                      </span>
                    </div>
                  )}

                  {/* Duplicate IDs warning */}
                  {validationResult.duplicateCount > 0 && (
                    <div className="pl-6 text-[11px]">
                      <strong>重複紀錄警告：</strong>
                      偵測到 {validationResult.duplicateCount} 筆重複的異常編號 (如: {validationResult.duplicateIds.join(', ')})
                    </div>
                  )}

                  {/* Format Errors */}
                  {validationResult.formatErrors.length > 0 && (
                    <div className="pl-6 text-[11px] space-y-0.5">
                      <strong>資料格式錯誤：</strong>
                      {validationResult.formatErrors.slice(0, 4).map((err, i) => (
                        <div key={i} className="text-rose-800">
                          第 {err.row} 列 [{err.column}]: {err.message}
                        </div>
                      ))}
                      {validationResult.formatErrors.length > 4 && (
                        <div className="text-slate-500">
                          ...其餘 {validationResult.formatErrors.length - 4} 處格式錯誤已略過顯示
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            匯入後將自動保留原始日誌資料，便於稽核追溯
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 text-xs"
            >
              取消
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={!validationResult || !validationResult.isValid}
              className={`px-4 py-2 font-semibold text-xs rounded-lg transition-colors ${
                validationResult && validationResult.isValid
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              確認匯入資料
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

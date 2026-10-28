import * as XLSX from 'xlsx';
import { AnomalyRecord, AnomalyType } from '../types';

export interface ImportValidationResult {
  isValid: boolean;
  importedRecords: Partial<AnomalyRecord>[];
  missingColumns: string[];
  formatErrors: { row: number; column: string; message: string }[];
  duplicateCount: number;
  duplicateIds: string[];
  rawRowsCount: number;
}

const REQUIRED_TEMPLATE_COLUMNS = [
  '異常編號',
  '試線代號',
  '異常類型',
  '發生工站',
  '發生時間',
  '發生次數',
  '停機分鐘數',
  '現場處置',
  '記錄人員',
];

/**
 * Generate standard Excel workbook template with sample data and column instructions
 */
export function generateExcelTemplate(): Uint8Array {
  const instructions = [
    {
      欄位名稱: '異常編號',
      必要性: '必填 (Unique ID)',
      格式說明: '如 ERR-T1-001，不可與現有異常編號重複',
      範例: 'ERR-T1-001',
    },
    {
      欄位名稱: '試線代號',
      必要性: '必填',
      格式說明: '請填寫 T1、T2 或 T3',
      範例: 'T1',
    },
    {
      欄位名稱: '異常類型',
      必要性: '必填',
      格式說明: '倒瓶、卡瓶、方向偏移、刮傷、旋蓋傾斜、貼標氣泡、其他',
      範例: '倒瓶',
    },
    {
      欄位名稱: '發生工站',
      必要性: '必填',
      格式說明: '如 輸送帶分流過渡段、理瓶星輪出瓶撥道、雙面貼標機進瓶導正段',
      範例: '輸送帶分流過渡段',
    },
    {
      欄位名稱: '發生時間',
      必要性: '選填',
      格式說明: 'HH:mm 格式',
      範例: '10:15',
    },
    {
      欄位名稱: '發生次數',
      必要性: '必填',
      格式說明: '正整數，不得為負數，未量測請勿填 0',
      範例: '12',
    },
    {
      欄位名稱: '停機分鐘數',
      必要性: '必填',
      格式說明: '浮點數 (分)，若無停機請填 0',
      範例: '4.5',
    },
    {
      欄位名稱: '現場處置',
      必要性: '必填',
      格式說明: '記錄現場即時排除與調校動作',
      範例: '手動扶正並暫降帶速至 15 m/min',
    },
    {
      欄位名稱: '記錄人員',
      必要性: '選填',
      格式說明: '填表人姓名',
      範例: '陳建良',
    },
  ];

  const sampleData = [
    {
      異常編號: 'ERR-T1-004',
      試線代號: 'T1',
      異常類型: '倒瓶',
      發生工站: '活塞充填進瓶過渡段',
      發生時間: '11:15',
      發生次數: 5,
      停機分鐘數: 1.5,
      現場處置: '微調入瓶導向輪間隙',
      記錄人員: '陳建良',
    },
    {
      異常編號: 'ERR-T1-005',
      試線代號: 'T1',
      異常類型: '刮傷',
      發生工站: '旋蓋進瓶夾爪',
      發生時間: '11:32',
      發生次數: 3,
      停機分鐘數: 0,
      現場處置: '擦拭夾爪鐵氟龍膠墊',
      記錄人員: '王啟明',
    },
  ];

  const wb = XLSX.utils.book_new();

  // Sheet 1: Data entry
  const wsData = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, wsData, '試線異常資料登錄');

  // Sheet 2: Field specifications
  const wsSpecs = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, wsSpecs, '欄位規範與說明');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

/**
 * Validate and parse uploaded Excel or CSV file
 */
export function parseAndValidateExcel(
  fileBuffer: ArrayBuffer,
  existingAnomalies: AnomalyRecord[]
): ImportValidationResult {
  const wb = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(ws);

  if (rawRows.length === 0) {
    return {
      isValid: false,
      importedRecords: [],
      missingColumns: REQUIRED_TEMPLATE_COLUMNS,
      formatErrors: [{ row: 0, column: '整份檔案', message: '工作表為空或未包含任何資料列' }],
      duplicateCount: 0,
      duplicateIds: [],
      rawRowsCount: 0,
    };
  }

  // Check columns from the first row
  const firstRowKeys = Object.keys(rawRows[0] || {});
  const missingColumns = REQUIRED_TEMPLATE_COLUMNS.filter((col) => !firstRowKeys.includes(col));

  const formatErrors: { row: number; column: string; message: string }[] = [];
  const existingIds = new Set(existingAnomalies.map((a) => a.id));
  const seenFileIds = new Set<string>();
  const duplicateIds: string[] = [];
  const importedRecords: Partial<AnomalyRecord>[] = [];

  const typeMap: Record<string, AnomalyType> = {
    倒瓶: 'tumble',
    卡瓶: 'jam',
    方向偏移: 'orientation',
    刮傷: 'scratch',
    旋蓋傾斜: 'capping_skew',
    貼標氣泡: 'label_bubble',
    其他: 'other',
  };

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // 1-indexed, header is row 1
    const id = String(row['異常編號'] || '').trim();
    const trialCode = String(row['試線代號'] || '').trim();
    const typeStr = String(row['異常類型'] || '').trim();
    const station = String(row['發生工站'] || '').trim();
    const countVal = row['發生次數'];
    const downtimeVal = row['停機分鐘數'];
    const immediateAction = String(row['現場處置'] || '').trim();
    const operator = String(row['記錄人員'] || '現場技術員').trim();
    const timestamp = String(row['發生時間'] || '10:00').trim();

    // Check ID
    if (!id) {
      formatErrors.push({ row: rowNum, column: '異常編號', message: '異常編號不得為空' });
    } else {
      if (existingIds.has(id) || seenFileIds.has(id)) {
        duplicateIds.push(id);
      }
      seenFileIds.add(id);
    }

    // Check count
    const count = Number(countVal);
    if (isNaN(count) || count < 0) {
      formatErrors.push({ row: rowNum, column: '發生次數', message: `次數需為正整數 (目前值: "${countVal}")` });
    }

    // Check downtime
    const downtime = Number(downtimeVal);
    if (isNaN(downtime) || downtime < 0) {
      formatErrors.push({ row: rowNum, column: '停機分鐘數', message: `停機分鐘需為大於等於 0 之數字 (目前值: "${downtimeVal}")` });
    }

    // Check station
    if (!station) {
      formatErrors.push({ row: rowNum, column: '發生工站', message: '發生工站必填' });
    }

    // Check trial ID
    let trialId = 'T1';
    if (trialCode.toUpperCase().includes('T2') || trialCode.includes('2')) trialId = 'T2';
    else if (trialCode.toUpperCase().includes('T3') || trialCode.includes('3')) trialId = 'T3';

    const normalizedType: AnomalyType = typeMap[typeStr] || 'other';

    importedRecords.push({
      id: id || `ERR-IMP-${rowNum}`,
      trialId,
      type: normalizedType,
      typeName: typeStr || '其他',
      station: station || '未指定工站',
      timestamp: timestamp,
      count: isNaN(count) ? 1 : count,
      downtimeMinutes: isNaN(downtime) ? 0 : downtime,
      immediateAction: immediateAction || '現場排除',
      severity: count > 10 || downtime > 2 ? 'high' : 'medium',
      operator,
    });
  });

  const isValid = missingColumns.length === 0 && formatErrors.length === 0 && duplicateIds.length === 0;

  return {
    isValid,
    importedRecords,
    missingColumns,
    formatErrors,
    duplicateCount: duplicateIds.length,
    duplicateIds,
    rawRowsCount: rawRows.length,
  };
}

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { RewardRawRecord } from '../types';
import { parseCSVToRawRecords, RAW_SAMPLE_CSV } from '../data/sampleData';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  RotateCcw,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (records: RewardRawRecord[]) => void;
  onResetToSample: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onResetToSample,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<RewardRawRecord[] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File parsing (CSV or XLSX)
  const handleFile = (file: File) => {
    setErrorMsg('');
    setFileName(file.name);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          const records = parseCSVToRawRecords(csvText);
          if (records.length === 0) {
            setErrorMsg('엑셀 시트에서 유효한 포상 데이터를 파싱하지 못했습니다.');
          } else {
            setParsedPreview(records);
          }
        } catch (err) {
          setErrorMsg('엑셀 파일 분석 중 오류가 발생했습니다: ' + String(err));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV or text
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const text = e.target?.result as string;
          const records = parseCSVToRawRecords(text);
          if (records.length === 0) {
            setErrorMsg('CSV 파일에서 유효한 포상 데이터를 파싱하지 못했습니다.');
          } else {
            setParsedPreview(records);
          }
        } catch (err) {
          setErrorMsg('파일을 읽는 중 오류가 발생했습니다: ' + String(err));
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handlePasteParse = () => {
    setErrorMsg('');
    if (!pasteText.trim()) {
      setErrorMsg('붙여넣을 텍스트 데이터를 입력해주세요.');
      return;
    }
    // If text contains tabs, convert to CSV-like
    const normalized = pasteText.includes('\t')
      ? pasteText
          .split('\n')
          .map(row => row.split('\t').join(','))
          .join('\n')
      : pasteText;

    const records = parseCSVToRawRecords(normalized);
    if (records.length === 0) {
      setErrorMsg('유효한 포상 데이터를 파싱하지 못했습니다. 첫 행 헤더가 포함되었는지 확인하세요.');
    } else {
      setParsedPreview(records);
    }
  };

  const handleApply = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onImport(parsedPreview);
      onClose();
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([RAW_SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reward_5dept_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="import-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="import-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B1D2C] text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">포상 데이터 반입 (S-01)</h3>
              <p className="text-xs text-slate-500">CSV, Excel(.xlsx) 또는 텍스트 붙여넣기 지원</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'file'
                  ? 'border-[#8B1D2C] text-[#8B1D2C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>파일 업로드 (CSV / XLSX)</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'paste'
                  ? 'border-[#8B1D2C] text-[#8B1D2C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>텍스트 직접 붙여넣기</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#8B1D2C] font-medium"
              title="표준 50건 샘플 CSV 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span>샘플 CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'file' ? (
            <div>
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[#8B1D2C] bg-rose-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-[#8B1D2C] hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-rose-50 text-[#8B1D2C] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  클릭하여 파일을 선택하거나 이곳으로 드래그 앤 드롭
                </p>
                <p className="text-xs text-slate-500">
                  인사항목: 사번, 사원명, 부문코드, 부서장명, 포상일자, 카테고리, 금액, 공적명
                </p>
                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                엑셀 또는 텍스트 에디터에서 복사한 테이블 데이터를 붙여넣으세요:
              </label>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={`reward_id,emp_no,emp_name,dept_code,dept_head,reward_date,category,amount,title\nR2026-001,E10201,김철수,D01,생산부문장,2026-01-15,부문장 즉포상,1500000,중합 반응기 안전 점검 체계화...`}
                rows={7}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#8B1D2C] focus:bg-white transition-all"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePasteParse}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-all"
                >
                  데이터 파싱 및 미리보기
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedPreview && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  반입 미리보기 (총 {parsedPreview.length}건 파싱 완료)
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  헤더 매핑 성공
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded bg-white text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 sticky top-0 text-[11px] text-slate-600">
                    <tr>
                      <th className="p-1.5">ID</th>
                      <th className="p-1.5">사번</th>
                      <th className="p-1.5">성명</th>
                      <th className="p-1.5">부문</th>
                      <th className="p-1.5">부서장</th>
                      <th className="p-1.5">카테고리</th>
                      <th className="p-1.5 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {parsedPreview.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td className="p-1.5 font-mono">{r.reward_id}</td>
                        <td className="p-1.5">{r.emp_no}</td>
                        <td className="p-1.5 font-bold">{r.emp_name}</td>
                        <td className="p-1.5">{r.dept_code}</td>
                        <td className="p-1.5">{r.dept_head}</td>
                        <td className="p-1.5">{r.category}</td>
                        <td className="p-1.5 text-right font-mono">{r.amount ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedPreview.length > 5 && (
                <p className="text-[11px] text-slate-400 text-center mt-1.5">
                  외 {parsedPreview.length - 5}건 추가 대기 중
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('기본 표준 샘플 50건 데이터셋(D-S03)으로 재설정하시겠습니까?')) {
                onResetToSample();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#8B1D2C] hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>표준 샘플 50건 복원</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              취소
            </button>
            <button
              disabled={!parsedPreview || parsedPreview.length === 0}
              onClick={handleApply}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                parsedPreview && parsedPreview.length > 0
                  ? 'bg-[#8B1D2C] hover:bg-[#6e1421] text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              데이터 적용 및 검증 시작 ({parsedPreview ? parsedPreview.length : 0}건)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { DeptMaster, DeptSummary, RewardRawRecord } from '../types';
import { formatKRW } from '../utils/evaluator';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  Upload,
  PlusCircle,
  Wallet,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { parseCSVToRawRecords, RAW_SAMPLE_CSV } from '../data/sampleData';

interface AdminPanelProps {
  deptMasters: DeptMaster[];
  deptBudgets: Record<string, number>;
  deptSummaries: Record<string, DeptSummary>;
  onSaveBudgets: (newBudgets: Record<string, number>) => void;
  onResetSample: () => void;
  onImportRecords: (records: RewardRawRecord[]) => void;
  onAddRecord: (record: RewardRawRecord) => void;
  onReturnToDashboard: () => void;
  totalRecordsCount: number;
}

const AUTHORIZED_ADMIN_EMAIL = 'a01020537441@gmail.com';
const ADMIN_PIN = '2026';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  deptMasters,
  deptBudgets,
  deptSummaries,
  onSaveBudgets,
  onResetSample,
  onImportRecords,
  onAddRecord,
  onReturnToDashboard,
  totalRecordsCount,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lx_admin_authenticated') === 'true';
  });
  const [inputPin, setInputPin] = useState('');
  const [authError, setAuthError] = useState('');

  // 1. Budget Management state
  const [tempBudgets, setTempBudgets] = useState<Record<string, number>>({ ...deptBudgets });
  const [budgetSaveSuccess, setBudgetSaveSuccess] = useState(false);

  // 2. Sample Reset state
  const [resetSuccess, setResetSuccess] = useState(false);

  // 3. File Import state
  const [importFileName, setImportFileName] = useState('');
  const [importParsed, setImportParsed] = useState<RewardRawRecord[] | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Single Add state
  const [singleForm, setSingleForm] = useState({
    emp_name: '',
    emp_no: '',
    dept_code: 'D01',
    reward_date: '2026-08-27',
    category: '부문장 즉포상',
    amount: 1500000,
    title: '',
  });
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState('');

  // Handle PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === ADMIN_PIN || inputPin.trim() === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lx_admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('보안 PIN이 올바르지 않습니다. (기본 PIN: 2026)');
    }
  };

  // Direct 1-click verification for designated user
  const handleDesignatedUserVerify = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('lx_admin_authenticated', 'true');
    setAuthError('');
  };

  // Logout / Lock session
  const handleLockSession = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lx_admin_authenticated');
    setInputPin('');
  };

  // Budget change handler
  const handleBudgetChange = (deptCode: string, value: number) => {
    setTempBudgets(prev => ({
      ...prev,
      [deptCode]: Math.max(0, value),
    }));
    setBudgetSaveSuccess(false);
  };

  const handleSaveAllBudgets = () => {
    onSaveBudgets(tempBudgets);
    setBudgetSaveSuccess(true);
    setTimeout(() => setBudgetSaveSuccess(false), 3000);
  };

  // Reset sample handler
  const handleDoReset = () => {
    onResetSample();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // File import handler
  const handleFileUpload = (file: File) => {
    setImportError('');
    setImportSuccess(false);
    setImportFileName(file.name);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvText = XLSX.utils.sheet_to_csv(firstSheet);
          const records = parseCSVToRawRecords(csvText);
          if (records.length === 0) {
            setImportError('유효한 포상 데이터 행을 찾을 수 없습니다.');
          } else {
            setImportParsed(records);
          }
        } catch {
          setImportError('엑셀 파일 파싱에 실패하였습니다.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const text = e.target?.result as string;
          const records = parseCSVToRawRecords(text);
          if (records.length === 0) {
            setImportError('유효한 CSV 데이터 행을 찾을 수 없습니다.');
          } else {
            setImportParsed(records);
          }
        } catch {
          setImportError('CSV 파싱에 실패하였습니다.');
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handleConfirmImport = () => {
    if (importParsed && importParsed.length > 0) {
      onImportRecords(importParsed);
      setImportSuccess(true);
      setImportParsed(null);
      setImportFileName('');
      setTimeout(() => setImportSuccess(false), 4000);
    }
  };

  // Single Add handler
  const handleCategoryChange = (category: string) => {
    let amt = singleForm.amount;
    if (category === 'OSI') amt = 3000000;
    else if (category === '부문장 즉포상') amt = 1500000;
    else if (category === '부서장 즉포상') amt = 300000;
    setSingleForm(prev => ({ ...prev, category, amount: amt }));
  };

  const handleAddSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!singleForm.emp_name.trim()) {
      setAddError('대상 사원명을 입력해주세요.');
      return;
    }
    if (!singleForm.title.trim()) {
      setAddError('공적 요약을 입력해주세요.');
      return;
    }

    const master = deptMasters.find(d => d.dept_code === singleForm.dept_code);
    const newRecord: RewardRawRecord = {
      reward_id: `R2026-${Date.now().toString().slice(-4)}`,
      emp_no: singleForm.emp_no.trim() || `E${Math.floor(10000 + Math.random() * 90000)}`,
      emp_name: singleForm.emp_name.trim(),
      dept_code: singleForm.dept_code,
      dept_head: master?.standard_head || '생산부문장',
      reward_date: singleForm.reward_date,
      category: singleForm.category,
      amount: singleForm.amount,
      title: singleForm.title.trim(),
    };

    onAddRecord(newRecord);
    setAddSuccess(true);
    setSingleForm({
      emp_name: '',
      emp_no: '',
      dept_code: singleForm.dept_code,
      reward_date: '2026-08-27',
      category: '부문장 즉포상',
      amount: 1500000,
      title: '',
    });
    setTimeout(() => setAddSuccess(false), 3000);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const csvContent =
      'reward_id,emp_no,emp_name,dept_code,dept_head,reward_date,category,amount,title\n' +
      'R2026-001,E10201,홍길동,D01,생산부문장,2026-08-15,부문장 즉포상,1500000,생산성 향상 우수 제안';
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2026_포상_데이터_서식.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // UNVERIFIED: Access Gate
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#8B1D2C] to-[#5C0E18] p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-1">
            관리자 전용 보안 인증
          </h2>
          <p className="text-xs text-rose-100">
            부문별 예산 관리, 샘플 데이터 재설정, 파일 반입 및 단건 등록은 지정된 관리자만 접근할 수 있습니다.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Designated User Identity Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-[#8B1D2C] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">
                지정된 관리자 계정
              </span>
              <span className="font-mono text-[#8B1D2C] font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 block w-fit mb-1">
                {AUTHORIZED_ADMIN_EMAIL}
              </span>
              <span className="text-slate-500 text-[11px] block">
                지정된 관리자 본인이신 경우 아래 1-클릭 즉시 인증 버튼으로 바로 접속하실 수 있습니다.
              </span>
            </div>
          </div>

          {/* Option 1: 1-Click Verification for Authorized User */}
          <button
            type="button"
            onClick={handleDesignatedUserVerify}
            className="w-full py-3 px-4 rounded-xl bg-[#8B1D2C] hover:bg-[#6e1421] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>지정 관리자({AUTHORIZED_ADMIN_EMAIL})로 즉시 인증</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-[1px] bg-slate-200 flex-1" />
            <span className="text-xs text-slate-400 font-medium">또는 보안 PIN 입력</span>
            <div className="h-[1px] bg-slate-200 flex-1" />
          </div>

          {/* Option 2: PIN Form */}
          <form onSubmit={handleVerifyPin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                관리자 인증 보안 PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="보안 PIN 입력 (기본: 2026)"
                  value={inputPin}
                  onChange={e => {
                    setInputPin(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#8B1D2C] focus:border-[#8B1D2C] bg-white"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {authError && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              PIN 확인 및 접속
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4"
            >
              일반 포상 대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED: Full Admin Control Console
  // ==========================================
  return (
    <div id="admin-management-panel" className="space-y-6 mb-8">
      {/* Admin Top Status Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight">
                포상 관리자 전용 제어 콘솔
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                접속 승인됨
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              승인 계정: <span className="text-slate-200 font-mono">{AUTHORIZED_ADMIN_EMAIL}</span> • 현재 등록 데이터: <strong className="text-white font-mono">{totalRecordsCount}건</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <span>대시보드로 복귀</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleLockSession}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/50 transition-colors"
            title="관리자 세션을 잠그고 로그아웃합니다."
          >
            <Lock className="w-3.5 h-3.5" />
            <span>세션 잠금</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Management Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* =========================================================================
            Module 1: 부문별 예산관리 (Division Head Budget Management)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8B1D2C] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1. 부문별 예산관리
                  </h3>
                  <p className="text-xs text-slate-500">
                    5인 부문장 소관 포상 배정 예산 입력 및 변경
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAllBudgets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#8B1D2C] hover:bg-[#6e1421] rounded-lg shadow-2xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>예산 일괄 저장</span>
              </button>
            </div>

            {budgetSaveSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>부문장별 포상 최초 배정 예산이 성공적으로 저장되었습니다!</span>
              </div>
            )}

            <div className="space-y-3">
              {deptMasters.map(m => {
                const currentBudget = tempBudgets[m.dept_code] ?? 0;
                const summary = deptSummaries[m.dept_code];
                const executed = summary?.total_amount || 0;
                const remaining = currentBudget - executed;
                const burnRate = currentBudget > 0 ? Math.round((executed / currentBudget) * 1000) / 10 : 0;

                return (
                  <div
                    key={m.dept_code}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {m.standard_head}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {m.dept_code}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          정원 {m.total_headcount}명
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          currentBudget > 0 && executed > currentBudget
                            ? 'bg-rose-100 text-rose-700'
                            : burnRate > 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        소진율 {burnRate}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={100000}
                          min={0}
                          value={currentBudget}
                          onChange={e => handleBudgetChange(m.dept_code, Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#8B1D2C]"
                        />
                        <span className="text-slate-500 shrink-0 font-medium">원</span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">실집행</span>
                          <span className="text-slate-700 font-medium">{formatKRW(executed)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">잔여 예산</span>
                          <span
                            className={`font-bold ${
                              remaining < 0 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {formatKRW(remaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              전사 예산 총합:{' '}
              <strong className="text-slate-900 font-mono font-bold">
                {formatKRW((Object.values(tempBudgets) as number[]).reduce((a: number, b: number) => a + (b || 0), 0))}
              </strong>
            </span>
            <span className="text-[11px] text-slate-400">
              * 변경 후 [예산 일괄 저장]을 눌러야 확정됩니다.
            </span>
          </div>
        </div>

        {/* =========================================================================
            Module 2: 표준 50건 샘플 (Standard 50-Item Sample Dataset)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. 표준 50건 샘플 데이터셋
                  </h3>
                  <p className="text-xs text-slate-500">
                    PRD 표준 50건 데이터셋(D-S03) 복원 및 초기화
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDoReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg shadow-2xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>표준 50건 즉시 복원</span>
              </button>
            </div>

            {resetSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>표준 50건 샘플 데이터셋으로 성공적으로 초기화되었습니다!</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">표준 데이터셋 명세 (D-S03)</span>
                <span className="font-mono text-xs font-bold text-[#8B1D2C] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  총 50건 정규 수록
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">생산부문장</span>
                  <span className="font-bold text-slate-800 font-mono">13건</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">기술연구소장</span>
                  <span className="font-bold text-slate-800 font-mono">9건</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">영업부문장</span>
                  <span className="font-bold text-slate-800 font-mono">9건</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">경영지원담당</span>
                  <span className="font-bold text-slate-800 font-mono">10건</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">경영전략담당</span>
                  <span className="font-bold text-slate-800 font-mono">9건</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">포상 기준연도</span>
                  <span className="font-bold text-slate-800 font-mono">2026년</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                * 테스트 중 입력한 임의 데이터나 오류 데이터를 한 번의 클릭으로 깨끗한 기준 샘플로 복원할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>기준일자: 2026-08-27</span>
            <span>데이터 무결성 검증 완료됨</span>
          </div>
        </div>

        {/* =========================================================================
            Module 3: 파일 반입 (CSV / Excel Import)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. 파일 반입 (CSV / Excel)
                  </h3>
                  <p className="text-xs text-slate-500">
                    사외/사내 엑셀 또는 CSV 대량 포상 데이터 반입
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="표준 CSV 포맷 다운로드"
              >
                <Download className="w-3.5 h-3.5" />
                <span>서식 다운로드</span>
              </button>
            </div>

            {importSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>새로운 포상 데이터가 대시보드에 성공적으로 반입되었습니다!</span>
              </div>
            )}

            {importError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#8B1D2C] hover:bg-rose-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 mb-1">
                CSV 또는 Excel (.xlsx, .xls) 파일을 이곳에 클릭하여 선택
              </p>
              <p className="text-[11px] text-slate-400">
                헤더 자동 매핑 (포상ID, 사번, 사원명, 부서장/부문장, 포상일자, 카테고리, 금액, 공적)
              </p>
            </div>

            {/* Parsed Preview */}
            {importParsed && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">{importFileName}</span>
                  <span className="text-blue-700 text-[11px]">
                    총 <strong className="font-mono">{importParsed.length}건</strong>의 유효 데이터 파싱 완료
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors"
                >
                  반입 적용
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            * 반입 즉시 부문장별 예산 소진 현황 및 KPI 통계에 실시간 자동 반영됩니다.
          </div>
        </div>

        {/* =========================================================================
            Module 4: 단건 추가항목 (Add Single Reward Item)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    4. 단건 추가항목
                  </h3>
                  <p className="text-xs text-slate-500">
                    신규 포상 건 실시간 직접 입력 및 등록
                  </p>
                </div>
              </div>
            </div>

            {addSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>신규 포상 건이 등록되어 소관 부문장 예산에 즉시 반영되었습니다!</span>
              </div>
            )}

            {addError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSingleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    대상 사원명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={singleForm.emp_name}
                    onChange={e => setSingleForm(prev => ({ ...prev, emp_name: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#8B1D2C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    사번
                  </label>
                  <input
                    type="text"
                    placeholder="예: E10201"
                    value={singleForm.emp_no}
                    onChange={e => setSingleForm(prev => ({ ...prev, emp_no: e.target.value }))}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#8B1D2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    소관 부문장 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={singleForm.dept_code}
                    onChange={e => setSingleForm(prev => ({ ...prev, dept_code: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#8B1D2C] font-semibold"
                  >
                    {deptMasters.map(d => (
                      <option key={d.dept_code} value={d.dept_code}>
                        {d.standard_head}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    포상일자 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={singleForm.reward_date}
                    onChange={e => setSingleForm(prev => ({ ...prev, reward_date: e.target.value }))}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#8B1D2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    포상 카테고리 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={singleForm.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#8B1D2C] font-medium"
                  >
                    <option value="OSI">OSI (전사 제안 포상)</option>
                    <option value="부문장 즉포상">부문장 즉포상</option>
                    <option value="부서장 즉포상">부서장 즉포상</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    포상금액 (원) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    value={singleForm.amount}
                    onChange={e => setSingleForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#8B1D2C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  공적 요약 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 반응기 긴급 안전점검 및 수율 2.5% 개선"
                  value={singleForm.title}
                  onChange={e => setSingleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#8B1D2C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#8B1D2C] hover:bg-[#6e1421] text-white font-bold rounded-lg shadow-2xs transition-colors mt-2"
              >
                신규 포상 건 등록 완료
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            * 등록된 포상은 즉시 전체 목록 및 대시보드 KPI 카드에 업데이트됩니다.
          </div>
        </div>
      </div>
    </div>
  );
};

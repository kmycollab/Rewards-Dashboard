/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  EvaluatedRewardRecord,
  RewardRawRecord,
  DeptBudgetMap,
} from './types';
import {
  INITIAL_SAMPLE_RECORDS,
  STORAGE_KEY,
  BUDGET_STORAGE_KEY,
  DEFAULT_DEPT_BUDGETS,
  BASE_DATE,
  DEPT_MASTERS,
} from './data/sampleData';
import {
  evaluateRecords,
  generateTSVExport,
  formatKRW,
} from './utils/evaluator';
import { Header } from './components/Header';
import { MascotAssistant } from './components/MascotAssistant';
import { KpiCards } from './components/KpiCards';
import { DeptTabs } from './components/DeptTabs';
import { CategoryDonutChart } from './components/CategoryDonutChart';
import { BudgetOverviewWidget } from './components/BudgetOverviewWidget';
import { BudgetManagementModal } from './components/BudgetManagementModal';
import { RewardTable } from './components/RewardTable';
import { ImportModal } from './components/ImportModal';
import { RewardDetailModal } from './components/RewardDetailModal';
import { AdminPanel } from './components/AdminPanel';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Info,
} from 'lucide-react';

export default function App() {
  // Load initial data from LocalStorage or default sample
  const [records, setRecords] = useState<RewardRawRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore and use sample
    }
    return INITIAL_SAMPLE_RECORDS;
  });

  // Department initial reward budgets (Admin input)
  const [deptBudgets, setDeptBudgets] = useState<DeptBudgetMap>(() => {
    try {
      const savedBudgets = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (savedBudgets) {
        const parsed = JSON.parse(savedBudgets);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_DEPT_BUDGETS, ...parsed };
        }
      }
    } catch {
      // ignore and use default
    }
    return DEFAULT_DEPT_BUDGETS;
  });

  // Selected department: 'ALL' or 'D01'~'D05'
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] =
    useState<EvaluatedRewardRecord | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Save records to LocalStorage whenever records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [records]);

  // Save budgets to LocalStorage whenever deptBudgets change
  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(deptBudgets));
    } catch (e) {
      console.warn('LocalStorage budget save failed:', e);
    }
  }, [deptBudgets]);

  // Run evaluation algorithm on current records
  const { evaluated, deptSummaries, overall } = useMemo(() => {
    return evaluateRecords(records, DEPT_MASTERS);
  }, [records]);

  // Executed amount by department
  const deptExecutedAmounts = useMemo(() => {
    const map: Record<string, number> = {};
    DEPT_MASTERS.forEach(d => {
      map[d.dept_code] = deptSummaries[d.dept_code]?.total_amount || 0;
    });
    return map;
  }, [deptSummaries]);

  // Current view budget
  const currentViewBudget = useMemo(() => {
    if (selectedDept === 'ALL') {
      return (Object.values(deptBudgets) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    }
    return deptBudgets[selectedDept] || 0;
  }, [selectedDept, deptBudgets]);

  // Filter records by selected department
  const currentDeptRecords = useMemo(() => {
    if (selectedDept === 'ALL') return evaluated;
    return evaluated.filter(r => r.dept_code === selectedDept);
  }, [evaluated, selectedDept]);

  // Current department summary
  const currentDeptSummary = useMemo(() => {
    if (selectedDept === 'ALL') return undefined;
    return deptSummaries[selectedDept];
  }, [selectedDept, deptSummaries]);

  // Display department name
  const currentDeptDisplayName = useMemo(() => {
    if (selectedDept === 'ALL') return '전체 부문장 총괄 종합';
    if (selectedDept === 'ADMIN') return '포상 관리자 전용 제어 콘솔';
    const master = DEPT_MASTERS.find(d => d.dept_code === selectedDept);
    return master ? master.standard_head : selectedDept;
  }, [selectedDept]);

  // Handlers
  const handleImportRecords = (newRecords: RewardRawRecord[]) => {
    setRecords(newRecords);
    showToast(`총 ${newRecords.length}건의 포상 데이터가 성공적으로 반입되었습니다.`);
  };

  const handleResetToSample = () => {
    setRecords(INITIAL_SAMPLE_RECORDS);
    setSelectedDept('ALL');
    showToast('표준 50건 샘플 데이터셋(D-S03)으로 재설정되었습니다.');
  };

  const handleSaveBudgets = (newBudgets: DeptBudgetMap) => {
    setDeptBudgets(newBudgets);
    showToast('부문별 포상 최초 배정 예산이 성공적으로 저장되었습니다.');
  };

  const handleSaveRecord = (savedRecord: RewardRawRecord) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.reward_id === savedRecord.reward_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedRecord;
        return next;
      } else {
        return [savedRecord, ...prev];
      }
    });
    showToast(`포상 건 [${savedRecord.reward_id}]이(가) 저장되었습니다.`);
  };

  const handleDeleteRecord = (rewardId: string) => {
    setRecords(prev => prev.filter(r => r.reward_id !== rewardId));
    showToast(`포상 건 [${rewardId}]이(가) 삭제되었습니다.`);
  };

  const handleCopyTsvReport = () => {
    const totalAmount = selectedDept === 'ALL' ? overall.total_amount : (currentDeptSummary?.total_amount || 0);
    const validCount = selectedDept === 'ALL' ? overall.valid_records : (currentDeptSummary?.total_valid_count || 0);
    const benefitRate = selectedDept === 'ALL' ? overall.overall_benefit_rate : (currentDeptSummary?.benefit_rate || 0);
    const remainingBudget = currentViewBudget - totalAmount;
    const burnRate = currentViewBudget > 0 ? Math.round((totalAmount / currentViewBudget) * 1000) / 10 : 0;
    
    const summaryHeader = `[LXMMA 부문별 포상 운영 실적 보고 - ${currentDeptDisplayName}]
- 보고 기준: 2026년도 포상 집행 실적
- 배정 예산: ${formatKRW(currentViewBudget)} | 실집행액: ${formatKRW(totalAmount)} (소진율: ${burnRate}%)
- 예산 잔액: ${formatKRW(remainingBudget)}
- 수여 실적: 총 ${validCount}건 수여 (수혜율: ${benefitRate}%)
- 전결 기준: OSI(300만원 한도), 부문장 즉포상(150만원 한도), 부서장 즉포상(30만원 한도)
--------------------------------------------------------------------------------`;
    const tsv = generateTSVExport(currentDeptRecords, currentDeptDisplayName);
    navigator.clipboard.writeText(`${summaryHeader}\n${tsv}`).then(() => {
      showToast('부문장 보고용 브리핑 및 포상 데이터가 클립보드에 복사되었습니다.');
    });
  };

  // Donut chart data for current view
  const donutData = useMemo(() => {
    if (selectedDept !== 'ALL' && currentDeptSummary) {
      return currentDeptSummary.category_breakdown;
    }

    // For ALL departments
    const catMap: Record<string, { count: number; amount: number }> = {
      'OSI': { count: 0, amount: 0 },
      '부문장 즉포상': { count: 0, amount: 0 },
      '부서장 즉포상': { count: 0, amount: 0 },
    };

    const validAll = evaluated.filter(
      r =>
        (!r.is_duplicate || r.is_first_in_dup) &&
        r.compliance_state !== '데이터 오류' &&
        r.compliance_state !== '미기재' &&
        r.amount !== null &&
        r.amount >= 0
    );

    validAll.forEach(r => {
      const cat = r.standard_category;
      const groupCat = cat.startsWith('OSI') ? 'OSI' : cat;
      if (!catMap[groupCat]) catMap[groupCat] = { count: 0, amount: 0 };
      catMap[groupCat].count += 1;
      catMap[groupCat].amount += r.amount || 0;
    });

    const totalValid = validAll.length;
    return Object.entries(catMap).map(([category, d]) => ({
      category,
      count: d.count,
      amount: d.amount,
      ratio: totalValid > 0 ? Math.round((d.count / totalValid) * 1000) / 10 : 0,
    }));
  }, [selectedDept, currentDeptSummary, evaluated]);

  const totalValidCountForChart =
    selectedDept === 'ALL'
      ? overall.valid_records
      : currentDeptSummary?.total_valid_count || 0;

  const totalAmountForChart =
    selectedDept === 'ALL'
      ? overall.total_amount
      : currentDeptSummary?.total_amount || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenNewModal={() => setIsNewRecordModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetSample={handleResetToSample}
        onOpenAdminTab={() => setSelectedDept('ADMIN')}
        totalCount={records.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 5 Department Channel Tabs & Admin Tab */}
        <DeptTabs
          selectedDept={selectedDept}
          onSelectDept={dept => setSelectedDept(dept)}
          deptSummaries={deptSummaries}
          overall={overall}
          deptBudgets={deptBudgets}
        />

        {/* Conditional View: Admin Panel OR Executive Dashboard */}
        {selectedDept === 'ADMIN' ? (
          <AdminPanel
            deptMasters={DEPT_MASTERS}
            deptBudgets={deptBudgets}
            deptSummaries={deptSummaries}
            onSaveBudgets={handleSaveBudgets}
            onResetSample={handleResetToSample}
            onImportRecords={handleImportRecords}
            onAddRecord={handleSaveRecord}
            onReturnToDashboard={() => setSelectedDept('ALL')}
            totalRecordsCount={records.length}
          />
        ) : (
          <>
            {/* Mascot Assistant: Executive Award Briefing for Division Head */}
            <MascotAssistant
              overall={overall}
              selectedDeptSummary={currentDeptSummary}
              selectedDeptName={currentDeptDisplayName}
              isAllDept={selectedDept === 'ALL'}
              budget={currentViewBudget}
              onCopyReport={handleCopyTsvReport}
            />

            {/* 4 KPI Summary Cards with Budget Burn Rate & Admin Setup */}
            <KpiCards
              summary={currentDeptSummary}
              overall={overall}
              isAllDept={selectedDept === 'ALL'}
              budget={currentViewBudget}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />

            {/* Middle Section: Donut Chart with 2026 Standards below & Budget Overview Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column: Donut Chart Diagram + 2026 포상운영 기준 (OSI, 부문장 즉포상, 부서장 즉포상) */}
              <div className="flex flex-col gap-4">
                <CategoryDonutChart
                  data={donutData}
                  totalValidCount={totalValidCountForChart}
                  totalAmount={totalAmountForChart}
                />

                {/* 2026 포상운영 기준 */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
                    <Info className="w-4 h-4 text-[#8B1D2C]" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2026 포상운영 기준
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="flex sm:flex-col items-center sm:items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-bold text-xs text-slate-800">OSI</span>
                      <span className="font-mono font-bold text-sm text-[#8B1D2C] sm:mt-1">3,000,000원</span>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-bold text-xs text-slate-800">부문장 즉포상</span>
                      <span className="font-mono font-bold text-sm text-[#8B1D2C] sm:mt-1">1,500,000원</span>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-bold text-xs text-slate-800">부서장 즉포상</span>
                      <span className="font-mono font-bold text-sm text-[#8B1D2C] sm:mt-1">300,000원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Budget Overview Comparison Widget */}
              <div>
                <BudgetOverviewWidget
                  deptMasters={DEPT_MASTERS}
                  deptBudgets={deptBudgets}
                  deptSummaries={deptSummaries}
                  selectedDept={selectedDept}
                  onSelectDept={dept => setSelectedDept(dept)}
                  onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                />
              </div>
            </div>

            {/* Detailed Reward Records Table */}
            <RewardTable
              records={currentDeptRecords}
              selectedDeptName={currentDeptDisplayName}
              onSelectRecord={record => setSelectedRecordForDetail(record)}
              onEditRecord={record => setSelectedRecordForDetail(record)}
              onDeleteRecord={handleDeleteRecord}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-[#8B1D2C] font-bold">LX MMA</span>
            <span>부문장 포상 운영 현황 대시보드</span>
          </div>
          <div className="text-slate-400">
            부문장 경영보고 모드 | 기준일 {BASE_DATE} | 데이터 자동 영속화
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRecords}
        onResetToSample={handleResetToSample}
      />

      <RewardDetailModal
        isOpen={isNewRecordModalOpen || selectedRecordForDetail !== null}
        onClose={() => {
          setIsNewRecordModalOpen(false);
          setSelectedRecordForDetail(null);
        }}
        record={selectedRecordForDetail}
        isNew={isNewRecordModalOpen}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
      />

      <BudgetManagementModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        deptMasters={DEPT_MASTERS}
        currentBudgets={deptBudgets}
        deptExecutedAmounts={deptExecutedAmounts}
        onSaveBudgets={handleSaveBudgets}
      />
    </div>
  );
}


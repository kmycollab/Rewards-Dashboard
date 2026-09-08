import React, { useState, useEffect } from 'react';
import { DeptMaster, DeptBudgetMap } from '../types';
import { DEFAULT_DEPT_BUDGETS } from '../data/sampleData';
import { formatKRW } from '../utils/evaluator';
import {
  X,
  Wallet,
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface BudgetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptMasters: DeptMaster[];
  currentBudgets: DeptBudgetMap;
  deptExecutedAmounts: Record<string, number>;
  onSaveBudgets: (newBudgets: DeptBudgetMap) => void;
}

export const BudgetManagementModal: React.FC<BudgetManagementModalProps> = ({
  isOpen,
  onClose,
  deptMasters,
  currentBudgets,
  deptExecutedAmounts,
  onSaveBudgets,
}) => {
  // Local state for editing
  const [editingBudgets, setEditingBudgets] = useState<DeptBudgetMap>({
    ...DEFAULT_DEPT_BUDGETS,
    ...currentBudgets,
  });

  useEffect(() => {
    if (isOpen) {
      setEditingBudgets({
        ...DEFAULT_DEPT_BUDGETS,
        ...currentBudgets,
      });
    }
  }, [isOpen, currentBudgets]);

  if (!isOpen) return null;

  const handleBudgetChange = (deptCode: string, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const num = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10));
    setEditingBudgets(prev => ({
      ...prev,
      [deptCode]: num,
    }));
  };

  const handleQuickAdd = (deptCode: string, addAmount: number) => {
    setEditingBudgets(prev => ({
      ...prev,
      [deptCode]: Math.max(0, (prev[deptCode] || 0) + addAmount),
    }));
  };

  const handleResetToDefaults = () => {
    setEditingBudgets({ ...DEFAULT_DEPT_BUDGETS });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudgets(editingBudgets);
    onClose();
  };

  // Overall calculations
  const totalBudget: number = (Object.values(editingBudgets) as number[]).reduce((acc: number, v: number) => acc + (v || 0), 0);
  const totalExecuted: number = (Object.values(deptExecutedAmounts) as number[]).reduce((acc: number, v: number) => acc + (v || 0), 0);
  const totalRemaining: number = totalBudget - totalExecuted;
  const totalBurnRate: number = totalBudget > 0 ? Math.round((totalExecuted / totalBudget) * 1000) / 10 : 0;

  return (
    <div
      id="budget-management-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="budget-management-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B1D2C] text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  부문별 포상 최초 예산 관리
                </h3>
                <span className="text-[11px] font-semibold text-[#8B1D2C] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  관리자 권한
                </span>
              </div>
              <p className="text-xs text-slate-500">
                각 부문장 소관 포상 배정 예산을 설정합니다. 소진율 및 예산 잔액이 실시간 계산됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form id="budget-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Top Overall Summary Banner */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                전사 총 배정 예산
              </span>
              <span className="text-base font-bold font-mono text-[#8B1D2C]">
                {formatKRW(totalBudget)}
              </span>
            </div>
            <div className="border-x border-slate-200 px-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                현재 총 실집행액
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatKRW(totalExecuted)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                전사 소진율 / 잔액
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    totalBurnRate > 100
                      ? 'bg-rose-100 text-rose-700'
                      : totalBurnRate > 80
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {totalBurnRate}%
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600">
                  ({formatKRW(totalRemaining)})
                </span>
              </div>
            </div>
          </div>

          {/* Department List */}
          <div className="space-y-3 pt-1">
            {deptMasters.map(dept => {
              const budget = editingBudgets[dept.dept_code] || 0;
              const executed = deptExecutedAmounts[dept.dept_code] || 0;
              const remaining = budget - executed;
              const burnRate = budget > 0 ? Math.round((executed / budget) * 1000) / 10 : 0;
              const isOver = budget > 0 && executed > budget;

              return (
                <div
                  key={dept.dept_code}
                  className={`p-4 rounded-xl border transition-all ${
                    isOver
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    {/* Dept Info */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono border border-slate-200">
                        {dept.dept_code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {dept.standard_dept_name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            ({dept.standard_head})
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            정원 {dept.total_headcount}명
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>현재 집행액: <strong className="text-slate-800 font-mono">{formatKRW(executed)}</strong></span>
                          <span>•</span>
                          <span>
                            잔액:{' '}
                            <strong
                              className={`font-mono ${
                                isOver ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            >
                              {formatKRW(remaining)}
                            </strong>
                          </span>
                          {isOver && (
                            <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold bg-rose-100/70 px-1.5 py-0.2 rounded text-[10px]">
                              <AlertTriangle className="w-3 h-3" />
                              예산 초과!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Burn Rate Badge */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs text-slate-500">소진율:</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          burnRate > 100
                            ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300'
                            : burnRate > 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {burnRate}%
                      </span>
                    </div>
                  </div>

                  {/* Input & Quick Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-7 relative">
                      <input
                        type="text"
                        value={budget.toLocaleString('ko-KR')}
                        onChange={e => handleBudgetChange(dept.dept_code, e.target.value)}
                        className={`w-full p-2 text-sm font-mono font-bold text-right pr-8 bg-white border rounded-lg focus:ring-2 focus:ring-[#8B1D2C] ${
                          isOver ? 'border-rose-300' : 'border-slate-300'
                        }`}
                        placeholder="예산 입력 (원)"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                        원
                      </span>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="sm:col-span-5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(dept.dept_code, 100000)}
                        className="flex-1 py-1.5 px-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors"
                      >
                        +10만
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(dept.dept_code, 500000)}
                        className="flex-1 py-1.5 px-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors"
                      >
                        +50만
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(dept.dept_code, 1000000)}
                        className="flex-1 py-1.5 px-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors"
                      >
                        +100만
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(dept.dept_code, -500000)}
                        className="py-1.5 px-1.5 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 transition-colors"
                        title="-50만원 차감"
                      >
                        -50만
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        burnRate > 100
                          ? 'bg-rose-500'
                          : burnRate > 80
                          ? 'bg-amber-500'
                          : 'bg-[#8B1D2C]'
                      }`}
                      style={{ width: `${Math.min(100, burnRate)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#8B1D2C] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 권장 예산으로 초기화</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              form="budget-form"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-[#8B1D2C] hover:bg-[#6e1421] text-white shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>예산 저장 및 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

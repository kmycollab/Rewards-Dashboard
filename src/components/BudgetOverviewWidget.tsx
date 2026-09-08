import React from 'react';
import { DeptMaster, DeptSummary } from '../types';
import { formatKRW } from '../utils/evaluator';
import { Wallet, Settings, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface BudgetOverviewWidgetProps {
  deptMasters: DeptMaster[];
  deptBudgets: Record<string, number>;
  deptSummaries: Record<string, DeptSummary>;
  selectedDept: string;
  onSelectDept: (deptCode: string) => void;
  onOpenBudgetModal: () => void;
}

export const BudgetOverviewWidget: React.FC<BudgetOverviewWidgetProps> = ({
  deptMasters,
  deptBudgets,
  deptSummaries,
  selectedDept,
  onSelectDept,
  onOpenBudgetModal,
}) => {
  const totalBudget: number = (Object.values(deptBudgets) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
  const totalExecuted: number = (Object.values(deptSummaries) as DeptSummary[]).reduce(
    (a: number, s: DeptSummary) => a + (s?.total_amount || 0),
    0
  );
  const totalRemaining: number = totalBudget - totalExecuted;
  const totalBurnRate: number = totalBudget > 0 ? Math.round((totalExecuted / totalBudget) * 1000) / 10 : 0;

  return (
    <div
      id="budget-overview-widget"
      className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-50 text-[#8B1D2C] flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                부문별 포상 예산 소진 현황
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B1D2C] hover:text-[#6e1421] bg-rose-50/80 hover:bg-rose-100 px-2 py-1 rounded-md transition-colors"
            title="관리자 예산 설정 열기"
          >
            <Settings className="w-3 h-3" />
            <span>예산 관리</span>
          </button>
        </div>

        {/* Dept Rows */}
        <div className="space-y-3">
          {deptMasters.map(m => {
            const budget = deptBudgets[m.dept_code] || 0;
            const executed = deptSummaries[m.dept_code]?.total_amount || 0;
            const remaining = budget - executed;
            const burnRate = budget > 0 ? Math.round((executed / budget) * 1000) / 10 : 0;
            const isOver = budget > 0 && executed > budget;
            const isSelected = selectedDept === m.dept_code;

            return (
              <div
                key={m.dept_code}
                onClick={() => onSelectDept(m.dept_code)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'border-[#8B1D2C] bg-rose-50/40 ring-1 ring-[#8B1D2C]/30'
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                {/* Top Row: Dept Name and Burn Rate */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-[13px]">{m.standard_dept_name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({m.standard_head})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        isOver
                          ? 'bg-rose-100 text-rose-700'
                          : burnRate > 80
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      소진율 {burnRate}%
                    </span>
                  </div>
                </div>

                {/* Amounts Row: 배정, 집행, 잔액 */}
                <div className="grid grid-cols-3 gap-1 bg-slate-50/80 rounded-md p-1.5 mb-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">배정 예산</span>
                    <span className="text-slate-600 font-medium">{formatKRW(budget)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">실집행액</span>
                    <span className="text-[#8B1D2C] font-semibold">{formatKRW(executed)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">예산 잔액</span>
                    <span
                      className={`font-bold ${
                        isOver ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isOver ? `-${formatKRW(executed - budget)}` : formatKRW(remaining)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
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
      </div>

      {/* Footer Total Summary */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 font-bold">5개 부문 예산 총괄</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
              totalBurnRate > 100
                ? 'bg-rose-100 text-rose-700'
                : totalBurnRate > 80
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            전사 소진율 {totalBurnRate}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-100/70 rounded-lg p-2 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">총 배정액</span>
            <span className="font-semibold text-slate-700">{formatKRW(totalBudget)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">총 실집행액</span>
            <span className="font-semibold text-[#8B1D2C]">{formatKRW(totalExecuted)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans font-bold text-emerald-800">
              총 잔여액 (잔액)
            </span>
            <span className="font-bold text-emerald-700">
              {totalRemaining < 0
                ? `-${formatKRW(Math.abs(totalRemaining))}`
                : formatKRW(totalRemaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

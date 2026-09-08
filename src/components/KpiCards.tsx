import React from 'react';
import { DeptSummary, OverallSummary } from '../types';
import { formatKRW } from '../utils/evaluator';
import {
  DollarSign,
  Award,
  Users,
  Coins,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Settings,
} from 'lucide-react';

interface KpiCardsProps {
  summary?: DeptSummary;
  overall: OverallSummary;
  isAllDept: boolean;
  budget: number;
  onOpenBudgetModal?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  summary,
  overall,
  isAllDept,
  budget,
  onOpenBudgetModal,
}) => {
  const totalAmount = isAllDept ? overall.total_amount : summary?.total_amount || 0;
  const validCount = isAllDept ? overall.valid_records : summary?.total_valid_count || 0;
  const totalRecords = isAllDept ? overall.total_records : (summary ? summary.total_valid_count + summary.issue_counts.missing + summary.issue_counts.error : 0);
  const benefitRate = isAllDept ? overall.overall_benefit_rate : summary?.benefit_rate || 0;
  const beneficiaryCount = isAllDept ? overall.total_employees_awarded : summary?.beneficiary_count || 0;
  const totalHeadcount = summary?.total_headcount || 84;
  const hasBias = summary?.has_bias || false;
  const biasList = summary?.bias_employees || [];

  // Budget calculations
  const remainingBudget = budget - totalAmount;
  const burnRate = budget > 0 ? Math.round((totalAmount / budget) * 1000) / 10 : 0;
  const remainingRate = budget > 0 ? Math.max(0, Math.round((remainingBudget / budget) * 1000) / 10) : 0;
  const isOverBudget = budget > 0 && totalAmount > budget;

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. 포상 집행 및 최초 배정 예산 현황 */}
      <div
        id="kpi-card-total-amount"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isOverBudget
              ? 'bg-gradient-to-r from-rose-500 to-amber-500'
              : 'bg-gradient-to-r from-[#8B1D2C] to-[#C13247]'
          }`}
        />
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {isAllDept ? '전사 예산 및 실집행' : '부문 예산 및 실집행'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-400">
                배정 {formatKRW(budget)}
              </span>
              {onOpenBudgetModal && (
                <button
                  type="button"
                  onClick={onOpenBudgetModal}
                  className="text-[10px] font-semibold text-[#8B1D2C] hover:underline flex items-center gap-0.5"
                  title="관리자 부문별 예산 변경"
                >
                  <Settings className="w-2.5 h-2.5" />
                  <span>설정</span>
                </button>
              )}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-rose-50 text-[#8B1D2C] group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {formatKRW(totalAmount)}
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
              isOverBudget
                ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                : burnRate > 80
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            소진율 {burnRate}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-rose-500'
                : burnRate > 80
                ? 'bg-amber-500'
                : 'bg-[#8B1D2C]'
            }`}
            style={{ width: `${Math.min(100, burnRate)}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 flex items-center justify-between">
          <span className="text-slate-400">
            {isOverBudget ? '초과 집행' : '잔여 예산'}
          </span>
          <span
            className={`font-mono font-bold ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {isOverBudget
              ? `+${formatKRW(totalAmount - budget)} 초과`
              : formatKRW(remainingBudget)}
          </span>
        </p>
      </div>

      {/* 2. 총 포상 수여 실적 및 건당 평균 */}
      <div
        id="kpi-card-total-count"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            총 포상 수여 실적
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {validCount}건
          </span>
          <span className="text-xs text-slate-400 font-medium font-mono">
            / 총 {totalRecords}행
          </span>
        </div>
        <p className="text-xs text-slate-600 flex items-center justify-between mt-1">
          <span className="text-slate-400">건당 평균 포상액</span>
          <span className="font-mono font-bold text-slate-700">
            {validCount > 0 ? formatKRW(Math.round(totalAmount / validCount)) : '0원'}
          </span>
        </p>
      </div>

      {/* 3. 부문 수혜율 및 참여 현황 */}
      <div
        id="kpi-card-benefit-rate"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAllDept ? '전사 평균 수혜율' : '부문 수혜율'}
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {benefitRate}%
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
          <span>수혜자 {beneficiaryCount}명 / 총원 {totalHeadcount}명</span>
          {hasBias && (
            <span
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded"
              title={`다수 수혜: ${biasList.map(b => `${b.emp_name}(${b.count}회)`).join(', ')}`}
            >
              <AlertTriangle className="w-3 h-3" />
              다수 수혜 확인
            </span>
          )}
        </div>
      </div>

      {/* 4. 부문 배정 예산 잔액 (잔액 표시) */}
      <div
        id="kpi-card-budget-balance"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isOverBudget
              ? 'bg-gradient-to-r from-rose-500 to-amber-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
        />
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAllDept ? '전사 예산 잔액' : '부문 예산 잔액'}
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`text-2xl lg:text-3xl font-bold tracking-tight ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {isOverBudget
              ? `-${formatKRW(Math.abs(remainingBudget))}`
              : formatKRW(remainingBudget)}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              isOverBudget
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}
          >
            {isOverBudget ? '예산 초과' : `잔여율 ${remainingRate}%`}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1 font-mono">
          <span>배정액 {formatKRW(budget)}</span>
          <span className="font-semibold text-slate-600">집행 {formatKRW(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

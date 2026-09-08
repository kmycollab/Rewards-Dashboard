import React from 'react';
import { LxMascotAvatar } from './LxMascotAvatar';
import { OverallSummary, DeptSummary } from '../types';
import { formatKRW } from '../utils/evaluator';
import {
  Sparkles,
  FileText,
  Wallet,
  Coins,
  Award,
  Users,
} from 'lucide-react';

interface MascotAssistantProps {
  overall: OverallSummary;
  selectedDeptSummary?: DeptSummary;
  selectedDeptName: string;
  isAllDept: boolean;
  budget: number;
  onCopyReport: () => void;
}

export const MascotAssistant: React.FC<MascotAssistantProps> = ({
  overall,
  selectedDeptSummary,
  selectedDeptName,
  isAllDept,
  budget,
  onCopyReport,
}) => {
  const totalAmount = isAllDept
    ? overall.total_amount
    : selectedDeptSummary?.total_amount || 0;
  const validCount = isAllDept
    ? overall.valid_records
    : selectedDeptSummary?.total_valid_count || 0;
  const benefitRate = isAllDept
    ? overall.overall_benefit_rate
    : selectedDeptSummary?.benefit_rate || 0;
  const beneficiaryCount = isAllDept
    ? overall.total_employees_awarded
    : selectedDeptSummary?.beneficiary_count || 0;

  const remainingBudget = budget - totalAmount;
  const burnRate = budget > 0 ? Math.round((totalAmount / budget) * 1000) / 10 : 0;
  const remainingRate = budget > 0 ? Math.max(0, Math.round((remainingBudget / budget) * 1000) / 10) : 0;
  const isOverBudget = budget > 0 && totalAmount > budget;

  return (
    <div
      id="executive-mascot-briefing"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7A1523] via-[#8B1D2C] to-[#5C0E18] text-white shadow-lg p-5 md:p-6 mb-6"
    >
      {/* Background subtle atmospheric patterns */}
      <div className="absolute -right-8 -bottom-8 w-72 h-72 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      <div className="absolute right-40 top-0 w-36 h-36 rounded-full bg-rose-400/10 pointer-events-none blur-xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5">
        {/* Mascot Character Avatar (Exact LX MMA Bear with Glasses, Hoodie & Badge) */}
        <LxMascotAvatar size="lg" className="shrink-0" />

        {/* Speech / Executive Briefing Section */}
        <div className="flex-1 text-center md:text-left">
          {/* Top Pill: Executive Context */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 text-rose-200 text-xs font-medium mb-2 border border-white/10 flex-wrap justify-center md:justify-start">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold text-white">부문장 포상 운영 현황 브리핑</span>
            <span className="text-white/40">|</span>
            <span className="text-rose-100 font-bold bg-white/15 px-2 py-0.5 rounded-full text-[11px]">
              {selectedDeptName}
            </span>
            <span className="text-white/40">|</span>
            <span className="text-emerald-300 font-mono text-[11px] font-bold">
              예산 잔액 {formatKRW(remainingBudget)}
            </span>
          </div>

          {/* Headline for Division Head */}
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-white mb-2 leading-snug">
            {isAllDept ? (
              <>부문장님, 2026년도 전사 포상 총 {formatKRW(totalAmount)} 집행 중이며, 잔액은 {formatKRW(remainingBudget)}입니다.</>
            ) : (
              <>{selectedDeptName} 포상 집행액 {formatKRW(totalAmount)} (소진율 {burnRate}%), 예산 잔액 {formatKRW(remainingBudget)} 현황입니다.</>
            )}
          </h2>

          {/* Executive Narrative */}
          <p className="text-xs md:text-sm text-rose-100/90 leading-relaxed max-w-3xl mb-4">
            현재 총 <strong className="text-white font-bold">{validCount}건</strong>의 포상이 수여되어 
            총 <strong className="text-white font-bold">{beneficiaryCount}명</strong>의 임직원이 수혜(수혜율 <strong className="text-amber-300 font-bold">{benefitRate}%</strong>)를 받았습니다. 
            배정 예산 <strong className="text-white font-mono">{formatKRW(budget)}</strong> 중 <strong className="text-white font-mono">{formatKRW(totalAmount)}</strong>을 실집행하여 
            현재 <strong className="text-emerald-300 font-mono">{formatKRW(remainingBudget)}</strong>의 잔여 예산({remainingRate}%)이 편성 관리되고 있습니다.
          </p>

          {/* Executive Quick Stats Badges: 4 key indicators focusing on Budget, Spent, Remaining, Awards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 font-mono">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-rose-200 block font-sans">배정 예산</span>
              <span className="text-sm md:text-base font-bold text-white">
                {formatKRW(budget)}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-rose-200 block font-sans">실집행 총액 (소진율)</span>
              <span className="text-sm md:text-base font-bold text-amber-300">
                {formatKRW(totalAmount)} <span className="text-[10px] text-white/80 font-normal">({burnRate}%)</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-rose-200 block font-sans">예산 잔액 (잔여액)</span>
              <span
                className={`text-sm md:text-base font-bold ${
                  isOverBudget ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {isOverBudget ? `-${formatKRW(Math.abs(remainingBudget))}` : formatKRW(remainingBudget)}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-rose-200 block font-sans">수여 실적 (수혜율)</span>
              <span className="text-sm md:text-base font-bold text-white">
                {validCount}건 <span className="text-[10px] text-emerald-300 font-normal font-sans">({benefitRate}%)</span>
              </span>
            </div>
          </div>

          {/* Executive Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            {/* Copy Executive Briefing Report */}
            <button
              id="btn-mascot-copy-report"
              onClick={onCopyReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#8B1D2C] hover:bg-rose-50 shadow-md transition-all active:scale-95"
              title="부문장 보고용 요약 브리핑 텍스트 복사"
            >
              <FileText className="w-4 h-4 text-[#8B1D2C]" />
              <span>부문장 보고서 요약 복사 (클립보드)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

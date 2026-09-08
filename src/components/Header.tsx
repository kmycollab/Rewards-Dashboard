import React from 'react';
import { LxMmaLogo } from './LxMmaLogo';
import { BASE_DATE } from '../data/sampleData';
import { Upload, Plus, RotateCcw, Calendar, ShieldCheck, Wallet } from 'lucide-react';

interface HeaderProps {
  onOpenImport: () => void;
  onOpenNewModal: () => void;
  onOpenBudgetModal: () => void;
  onResetSample: () => void;
  onOpenAdminTab?: () => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenImport,
  onOpenNewModal,
  onOpenBudgetModal,
  onResetSample,
  onOpenAdminTab,
  totalCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: LXMMA Logo & Title */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <LxMmaLogo size="md" />
            <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  부문장 포상 운영 현황 대시보드
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1D2C] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <ShieldCheck className="w-3 h-3" />
                  부문장 경영 보고 모드
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                생산부문장 등 부문장 소관 포상 집행 실적 · 예산 소진 현황 · 부문별 수혜율 총괄 보고
              </p>
            </div>
          </div>

          {/* Mobile indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 md:hidden font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#8B1D2C]" />
            <span>{BASE_DATE}</span>
          </div>
        </div>

        {/* Right: Actions & Base Date */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* Base date badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200"
            title="PRD 5.1 기준일 (BASE_DATE = 2026-08-27)"
          >
            <Calendar className="w-3.5 h-3.5 text-[#8B1D2C]" />
            <span>기준일: {BASE_DATE}</span>
          </div>

          {/* Admin Tab Entry Button */}
          {onOpenAdminTab && (
            <button
              id="btn-header-admin-tab"
              onClick={onOpenAdminTab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-2xs transition-colors"
              title="지정 관리자 전용 제어 콘솔 (예산관리, 샘플 복원, 파일 반입, 단건 추가)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>관리자 콘솔</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


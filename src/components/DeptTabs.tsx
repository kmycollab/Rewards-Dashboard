import React from 'react';
import { DEPT_MASTERS } from '../data/sampleData';
import { DeptSummary, OverallSummary } from '../types';
import { Layers, Factory, FlaskConical, Briefcase, Landmark, Compass, ShieldAlert } from 'lucide-react';

interface DeptTabsProps {
  selectedDept: string; // 'ALL', 'D01'~'D05', or 'ADMIN'
  onSelectDept: (deptCode: string) => void;
  deptSummaries: Record<string, DeptSummary>;
  overall: OverallSummary;
  deptBudgets?: Record<string, number>;
}

export const DeptTabs: React.FC<DeptTabsProps> = ({
  selectedDept,
  onSelectDept,
  deptSummaries,
  overall,
  deptBudgets = {},
}) => {
  const getDeptIcon = (code: string) => {
    switch (code) {
      case 'D01':
        return <Factory className="w-4 h-4" />;
      case 'D02':
        return <FlaskConical className="w-4 h-4" />;
      case 'D03':
        return <Briefcase className="w-4 h-4" />;
      case 'D04':
        return <Landmark className="w-4 h-4" />;
      case 'D05':
        return <Compass className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const totalBudget: number = (Object.values(deptBudgets) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
  const totalBurnRate: number = totalBudget > 0 ? Math.round((overall.total_amount / totalBudget) * 1000) / 10 : 0;

  return (
    <div id="dept-tabs-container" className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          부문장별 포상 운영 채널
        </h2>
        <span className="text-xs text-slate-400">
          부문장 선택 시 배정 예산 소진율 · 실집행액 · 수혜율 · 주요 포상 실적 브리핑 전환
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {/* 전체 부문장 총괄 탭 */}
        <button
          id="dept-tab-all"
          onClick={() => onSelectDept('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all shadow-2xs ${
            selectedDept === 'ALL'
              ? 'bg-[#8B1D2C] text-white shadow-md shadow-[#8B1D2C]/20 ring-2 ring-[#8B1D2C]/30'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="font-bold">전체</span>
          <span className={`text-xs ${selectedDept === 'ALL' ? 'text-rose-200' : 'text-slate-500'}`}>
            (부문장 총괄)
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedDept === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {overall.total_records}건
          </span>
          {totalBudget > 0 && (
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-medium ${
                selectedDept === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
              title={`전사 예산 소진율: ${totalBurnRate}%`}
            >
              소진 {totalBurnRate}%
            </span>
          )}
        </button>

        {/* 부문장별 탭 (부문 명칭 없이 부문장 명칭만 표시) */}
        {DEPT_MASTERS.map(m => {
          const isSelected = selectedDept === m.dept_code;
          const summary = deptSummaries[m.dept_code];
          const count = summary ? summary.total_valid_count + summary.issue_counts.missing + summary.issue_counts.error : 0;
          const deptBudget = deptBudgets[m.dept_code] || 0;
          const deptExecuted = summary?.total_amount || 0;
          const burnRate = deptBudget > 0 ? Math.round((deptExecuted / deptBudget) * 1000) / 10 : 0;
          const isOver = deptBudget > 0 && deptExecuted > deptBudget;

          return (
            <button
              key={m.dept_code}
              id={`dept-tab-${m.dept_code.toLowerCase()}`}
              onClick={() => onSelectDept(m.dept_code)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all shadow-2xs ${
                isSelected
                  ? 'bg-[#8B1D2C] text-white shadow-md shadow-[#8B1D2C]/20 ring-2 ring-[#8B1D2C]/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {getDeptIcon(m.dept_code)}
              <span className="font-bold">{m.standard_head}</span>

              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>

              {deptBudget > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    isOver
                      ? isSelected
                        ? 'bg-rose-900 text-white font-bold ring-1 ring-white/50'
                        : 'bg-rose-100 text-rose-700 font-bold'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  title={`${m.standard_head} 예산 소진율: ${burnRate}%`}
                >
                  {isOver ? '초과!' : `${burnRate}%`}
                </span>
              )}
            </button>
          );
        })}

        {/* 관리자 탭 (지정된 관리자 접속) */}
        <button
          id="dept-tab-admin"
          onClick={() => onSelectDept('ADMIN')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all shadow-2xs ml-auto ${
            selectedDept === 'ADMIN'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-slate-800'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
          }`}
          title="지정 관리자 전용 (예산관리, 샘플, 파일반입, 단건추가)"
        >
          <ShieldAlert className={`w-4 h-4 ${selectedDept === 'ADMIN' ? 'text-amber-400' : 'text-amber-600'}`} />
          <span className="font-bold">관리자</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              selectedDept === 'ADMIN' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            보안
          </span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { formatKRW } from '../utils/evaluator';

interface CategoryBreakdown {
  category: string;
  count: number;
  amount: number;
  ratio: number;
}

interface CategoryDonutChartProps {
  data: CategoryBreakdown[];
  totalValidCount: number;
  totalAmount: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  totalValidCount,
  totalAmount,
}) => {
  // SVG Donut settings
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Colors for categories
  const categoryColors: Record<string, { stroke: string; bg: string; text: string }> = {
    'OSI': { stroke: '#8B1D2C', bg: 'bg-[#8B1D2C]', text: 'text-[#8B1D2C]' },
    'OSI (개인)': { stroke: '#8B1D2C', bg: 'bg-[#8B1D2C]', text: 'text-[#8B1D2C]' },
    'OSI (단체)': { stroke: '#A52A3A', bg: 'bg-[#A52A3A]', text: 'text-[#A52A3A]' },
    '부문장 즉포상': { stroke: '#C13247', bg: 'bg-[#C13247]', text: 'text-[#C13247]' },
    '부서장 즉포상': { stroke: '#E07A8B', bg: 'bg-[#E07A8B]', text: 'text-[#E07A8B]' },
    '팀장 즉포상': { stroke: '#F0A8B4', bg: 'bg-[#F0A8B4]', text: 'text-[#F0A8B4]' },
  };

  // Compute SVG stroke-dasharray & dashoffset for each slice
  let accumulatedOffset = 0;
  const slices = data.map(item => {
    const itemRatio = totalValidCount > 0 ? item.count / totalValidCount : 0;
    const strokeDasharray = `${itemRatio * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += itemRatio * circumference;

    const colors = categoryColors[item.category] || {
      stroke: '#94A3B8',
      bg: 'bg-slate-400',
      text: 'text-slate-600',
    };

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      colors,
    };
  });

  return (
    <div
      id="category-donut-chart-container"
      className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6"
    >
      {/* Donut graphic */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transform"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Category slices */}
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.colors.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-500 hover:opacity-85"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs font-semibold text-slate-400">총 집행</span>
          <span className="text-xl font-extrabold text-slate-800">{totalValidCount}건</span>
          <span className="text-[11px] font-medium text-[#8B1D2C] mt-0.5">
            {formatKRW(totalAmount)}
          </span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            포상 카테고리별 비중 및 집행 내역
          </span>
          <span className="text-xs text-slate-400">규정 전결액 기준</span>
        </div>

        <div className="space-y-2.5">
          {data.map((item, idx) => {
            const colors = categoryColors[item.category] || {
              stroke: '#94A3B8',
              bg: 'bg-slate-400',
              text: 'text-slate-600',
            };
            const standardLimit =
              item.category.startsWith('OSI')
                ? '300만원'
                : item.category === '부문장 즉포상'
                ? '150만원'
                : '30만원';

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-rose-50/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${colors.bg} shrink-0`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800">{item.category}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                        한도 {standardLimit}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatKRW(item.amount)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-800">{item.count}건</span>
                  <div className="text-xs font-semibold text-slate-500">
                    {item.ratio.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { EvaluatedRewardRecord } from '../types';
import { formatKRW, generateTSVExport } from '../utils/evaluator';
import {
  Search,
  Copy,
  Check,
  AlertTriangle,
  Edit2,
  Trash2,
} from 'lucide-react';

interface RewardTableProps {
  records: EvaluatedRewardRecord[];
  selectedDeptName: string;
  onSelectRecord: (record: EvaluatedRewardRecord) => void;
  onEditRecord: (record: EvaluatedRewardRecord) => void;
  onDeleteRecord: (rewardId: string) => void;
}

export const RewardTable: React.FC<RewardTableProps> = ({
  records,
  selectedDeptName,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesQuery =
          r.emp_name.toLowerCase().includes(query) ||
          r.emp_no.toLowerCase().includes(query) ||
          r.reward_id.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.dept_head.toLowerCase().includes(query) ||
          r.standard_dept_name.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'OSI') {
          if (!r.standard_category.startsWith('OSI')) return false;
        } else if (r.standard_category !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [records, searchTerm, selectedCategory]);

  // Total sum of filtered records
  const filteredTotalAmount = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [filteredRecords]);

  // Copy to clipboard handler
  const handleCopyTSV = () => {
    const tsv = generateTSVExport(filteredRecords, selectedDeptName);
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="reward-table-card" className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="table-search-input"
            type="text"
            placeholder="사번, 사원명, 공적명, 부서명 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#8B1D2C]/40 focus:border-[#8B1D2C] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              지우기
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* TSV Copy button */}
          <button
            id="btn-copy-tsv"
            onClick={handleCopyTSV}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="현재 조회된 포상 목록을 클립보드에 탭 구분 텍스트(TSV)로 복사합니다 (부문장 보고용)"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? '복사 완료!' : '부문장 보고용 목록 복사 (TSV)'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs Bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 mr-1">포상 구분:</span>
          {['ALL', 'OSI', '부문장 즉포상', '부서장 즉포상'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#8B1D2C] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'ALL' ? '전체 보기' : cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          조회 결과 <strong className="text-slate-800 font-mono">{filteredRecords.length}</strong>건
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table id="reward-data-table" className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="px-3 py-3 w-10 text-center text-slate-400">#</th>
              <th className="px-3 py-3 w-24">포상 ID</th>
              <th className="px-3 py-3 w-36">대상 사원</th>
              <th className="px-3 py-3 w-36">소관 부문장</th>
              <th className="px-3 py-3 w-28">포상일자</th>
              <th className="px-3 py-3 w-28">카테고리</th>
              <th className="px-3 py-3 w-32 text-right">포상금액</th>
              <th className="px-3 py-3 min-w-[240px]">공적 요약</th>
              <th className="px-3 py-3 w-16 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium">검색 및 필터 조건에 부합하는 포상 데이터가 없습니다.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('ALL');
                      }}
                      className="text-xs text-[#8B1D2C] hover:underline font-semibold mt-1"
                    >
                      필터 초기화
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, idx) => {
                return (
                  <tr
                    key={r.reward_id + idx}
                    onClick={() => onSelectRecord(r)}
                    className="cursor-pointer transition-colors hover:bg-rose-50/40 group"
                  >
                    {/* Index */}
                    <td className="px-3 py-3 text-center text-xs text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    {/* Reward ID */}
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-700">
                      {r.reward_id}
                    </td>

                    {/* Employee */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{r.emp_name || '(미기재)'}</span>
                        <span className="text-xs text-slate-500 font-mono">({r.emp_no || '-'})</span>
                      </div>
                    </td>

                    {/* Dept & Head */}
                    <td className="px-3 py-3">
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">{r.standard_dept_name}</div>
                        <div className="text-slate-500 text-[11px]">{r.standard_dept_head || r.dept_head}</div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 text-xs font-mono">
                      <span className="text-slate-700">{r.reward_date || '-'}</span>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {r.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-3 text-right font-mono">
                      <span className="font-bold text-slate-800">
                        {r.amount !== null ? formatKRW(r.amount) : '0원'}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-3 py-3">
                      <p className="text-xs text-slate-800 line-clamp-1 group-hover:text-[#8B1D2C] font-medium">
                        {r.title || '-'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td
                      className="px-3 py-3 text-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditRecord(r)}
                          className="p-1 rounded text-slate-400 hover:text-[#8B1D2C] hover:bg-rose-50 transition-colors"
                          title="수정하기"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`포상 건 [${r.reward_id} / ${r.emp_name}]을 삭제하시겠습니까?`)) {
                              onDeleteRecord(r.reward_id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="삭제하기"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Summary of displayed rows */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          표시 중: <strong className="text-slate-800 font-mono">{filteredRecords.length}</strong>건 / 전체{' '}
          <strong className="text-slate-800 font-mono">{records.length}</strong>건
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-500 font-sans">목록 합계 금액:</span>
          <span className="font-bold text-[#8B1D2C] text-sm">
            {formatKRW(filteredTotalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

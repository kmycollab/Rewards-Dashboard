import React, { useState, useEffect } from 'react';
import { EvaluatedRewardRecord, RewardRawRecord } from '../types';
import { CATEGORY_LIMITS, DEPT_MASTERS } from '../data/sampleData';
import { formatKRW } from '../utils/evaluator';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Save,
  PlusCircle,
  Clock,
  User,
  Building,
  Award,
} from 'lucide-react';

interface RewardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EvaluatedRewardRecord | null;
  isNew?: boolean;
  onSave: (record: RewardRawRecord) => void;
  onDelete?: (rewardId: string) => void;
}

export const RewardDetailModal: React.FC<RewardDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  isNew = false,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<RewardRawRecord>({
    reward_id: '',
    emp_no: '',
    emp_name: '',
    dept_code: 'D01',
    dept_head: '생산부문장',
    reward_date: '',
    category: '부문장 즉포상',
    amount: 1500000,
    title: '',
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        reward_id: record.reward_id,
        emp_no: record.emp_no,
        emp_name: record.emp_name,
        dept_code: record.dept_code || 'D01',
        dept_head: record.dept_head || '생산부문장',
        reward_date: record.reward_date || '',
        category: record.category || '부문장 즉포상',
        amount: record.amount ?? '',
        title: record.title || '',
      });
    } else if (isNew) {
      setFormData({
        reward_id: `R2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        emp_no: '',
        emp_name: '',
        dept_code: 'D01',
        dept_head: '생산부문장',
        reward_date: new Date().toISOString().slice(0, 10),
        category: '부문장 즉포상',
        amount: 1500000,
        title: '',
      });
    }
  }, [record, isNew, isOpen]);

  if (!isOpen) return null;

  const handleDeptChange = (code: string) => {
    const found = DEPT_MASTERS.find(d => d.dept_code === code);
    setFormData(prev => ({
      ...prev,
      dept_code: code,
      dept_head: found ? found.standard_head : prev.dept_head,
    }));
  };

  const handleCategoryChange = (cat: string) => {
    const defaultAmt = CATEGORY_LIMITS[cat] || 1500000;
    setFormData(prev => ({
      ...prev,
      category: cat,
      amount: defaultAmt,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleCopyRecordSummary = () => {
    if (!record) return;
    const text = `[LXMMA 포상 내역 상세]
포상ID: ${record.reward_id}
대상사원: ${record.emp_name} (${record.emp_no})
소관부문장: ${record.standard_dept_head}
포상일자: ${record.reward_date || '(결측)'}
카테고리: ${record.category}
지급금액: ${formatKRW(record.amount)}
공적내용: ${record.title}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentCategoryLimit = CATEGORY_LIMITS[formData.category];
  const numAmount = Number(formData.amount);
  const isLimitExceeded = currentCategoryLimit && !isNaN(numAmount) && numAmount > currentCategoryLimit;

  return (
    <div
      id="reward-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="reward-detail-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B1D2C] text-white flex items-center justify-center">
              {isNew ? <PlusCircle className="w-4 h-4" /> : <Award className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isNew ? '신규 포상 등록' : `포상 상세 정보 (${record?.reward_id})`}
              </h3>
              <p className="text-xs text-slate-500">
                {isNew ? '새로운 포상 레코드를 등록합니다' : '포상 내역을 확인하고 정보를 수정합니다'}
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Summary Box for existing records */}
          {record && !isNew && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  포상 기본 정보
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-[#8B1D2C] border border-rose-200">
                  {record.standard_dept_name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">수혜자</span>
                  <span className="font-semibold text-slate-800">{record.emp_name} ({record.emp_no})</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">포상 카테고리</span>
                  <span className="font-semibold text-slate-800">{record.category}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">지급액</span>
                  <span className="font-bold text-[#8B1D2C] font-mono">{formatKRW(record.amount || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form id="reward-edit-form" onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  포상 ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.reward_id}
                  onChange={e => setFormData({ ...formData, reward_id: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#8B1D2C]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  포상일자 (YYYY-MM-DD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="2026-05-12"
                  value={formData.reward_date}
                  onChange={e => setFormData({ ...formData, reward_date: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#8B1D2C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Employee No */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  사번 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E10201"
                  value={formData.emp_no}
                  onChange={e => setFormData({ ...formData, emp_no: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#8B1D2C]"
                />
              </div>

              {/* Employee Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  성명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="김철수"
                  value={formData.emp_name}
                  onChange={e => setFormData({ ...formData, emp_name: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B1D2C]"
                />
              </div>
            </div>

            {/* Department Head */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  소관 부문장 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.dept_code}
                  onChange={e => handleDeptChange(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B1D2C] font-semibold"
                >
                  {DEPT_MASTERS.map(d => (
                    <option key={d.dept_code} value={d.dept_code}>
                      {d.standard_head} ({d.dept_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  부서장 표기 (원문)
                </label>
                <input
                  type="text"
                  value={formData.dept_head}
                  onChange={e => setFormData({ ...formData, dept_head: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B1D2C]"
                />
              </div>
            </div>

            {/* Category & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  포상 카테고리 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B1D2C]"
                >
                  <option value="OSI">OSI (기준 3,000,000원)</option>
                  <option value="OSI (개인)">OSI [개인] (기준 3,000,000원)</option>
                  <option value="OSI (단체)">OSI [단체] (기준 3,000,000원)</option>
                  <option value="부문장 즉포상">부문장 즉포상 (기준 1,500,000원)</option>
                  <option value="부서장 즉포상">부서장 즉포상 (기준 300,000원)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    포상금액 (원)
                  </label>
                  {currentCategoryLimit && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      기준액: {formatKRW(currentCategoryLimit)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="1500000"
                  value={formData.amount ?? ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      amount: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#8B1D2C]"
                />
              </div>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                공적 요약 (포상 사유)
              </label>
              <textarea
                rows={2}
                placeholder="공적 상세 내용을 입력하세요..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B1D2C]"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isNew && record && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`포상 건 [${record.reward_id}]을 삭제하시겠습니까?`)) {
                    onDelete(record.reward_id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제</span>
              </button>
            )}

            {!isNew && record && (
              <button
                type="button"
                onClick={handleCopyRecordSummary}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨' : '상세 복사'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              닫기
            </button>
            <button
              type="submit"
              form="reward-edit-form"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-[#8B1D2C] hover:bg-[#6e1421] text-white shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isNew ? '저장하기' : '변경사항 저장'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import {
  BenefitRateState,
  ComplianceState,
  DeptMaster,
  DeptSummary,
  EvaluatedRewardRecord,
  OverallSummary,
  RewardRawRecord,
} from '../types';
import { BASE_DATE, CATEGORY_LIMITS, DEPT_MASTERS } from '../data/sampleData';

/**
 * Standardize category names for comparison
 */
export function normalizeCategory(cat: string): string {
  const clean = (cat || '').replace(/\s+/g, '');
  if (clean === 'osi' || clean === 'OSI') return 'OSI';
  if (clean === 'osi(개인)' || clean === 'OSI(개인)' || clean === 'osi개인' || clean === 'OSI개인') return 'OSI (개인)';
  if (clean === 'osi(단체)' || clean === 'OSI(단체)' || clean === 'osi단체' || clean === 'OSI단체') return 'OSI (단체)';
  if (clean === '부문장즉포상' || clean === '부문장포상') return '부문장 즉포상';
  if (clean === '부서장즉포상' || clean === '부서장포상') return '부서장 즉포상';
  if (clean === '팀장즉포상' || clean === '팀장포상' || clean === '팀장 즉포상') return '부서장 즉포상';
  return cat.trim();
}

/**
 * Parse numeric amount safely (handles KRW symbols, commas, nulls)
 */
export function parseAmount(val: unknown): { amount: number | null; isError: boolean } {
  if (val === null || val === undefined || val === '') {
    return { amount: null, isError: false };
  }
  if (typeof val === 'number') {
    if (isNaN(val)) return { amount: null, isError: true };
    return { amount: val, isError: false };
  }
  const str = String(val).replace(/[₩,\s원]/g, '').trim();
  if (str === '' || str === '-' || str.toUpperCase() === 'N/A') {
    return { amount: null, isError: false };
  }
  const num = Number(str);
  if (isNaN(num)) {
    return { amount: null, isError: true };
  }
  return { amount: num, isError: false };
}

/**
 * Full evaluation algorithm according to PRD section 5
 */
export function evaluateRecords(
  records: RewardRawRecord[],
  deptMasters: DeptMaster[] = DEPT_MASTERS
): {
  evaluated: EvaluatedRewardRecord[];
  deptSummaries: Record<string, DeptSummary>;
  overall: OverallSummary;
} {
  const masterMap = new Map<string, DeptMaster>();
  deptMasters.forEach(m => masterMap.set(m.dept_code, m));

  // 1. First pass: Collect counts for duplicates, employee rewards, and dept_head values
  const dupKeyMap = new Map<string, number>();
  const dupFirstSeenMap = new Map<string, boolean>();
  const empRewardCountMap = new Map<string, number>();
  const deptHeadVariations = new Map<string, Set<string>>();

  records.forEach(r => {
    // Dup key: emp_no + reward_date + category (exact string)
    const empNo = (r.emp_no || '').trim();
    const date = (r.reward_date || '').trim();
    const cat = (r.category || '').trim();
    const dupKey = `${empNo}|${date}|${cat}`;

    if (empNo && date && cat) {
      dupKeyMap.set(dupKey, (dupKeyMap.get(dupKey) || 0) + 1);
    }

    if (empNo) {
      empRewardCountMap.set(empNo, (empRewardCountMap.get(empNo) || 0) + 1);
    }

    // Collect dept_head variations for dept_code
    const deptCode = (r.dept_code || '').trim();
    const headNorm = (r.dept_head || '').trim().replace(/\s+/g, ' ');
    if (deptCode && headNorm) {
      if (!deptHeadVariations.has(deptCode)) {
        deptHeadVariations.set(deptCode, new Set<string>());
      }
      deptHeadVariations.get(deptCode)!.add(headNorm);
    }
  });

  // 2. Second pass: Evaluate each individual record
  const evaluated: EvaluatedRewardRecord[] = [];

  records.forEach(r => {
    const rawEmpNo = (r.emp_no || '').trim();
    const rawDeptCode = (r.dept_code || '').trim();
    const rawDeptHead = (r.dept_head || '').trim();
    const rawDate = (r.reward_date || '').trim();
    const rawCat = (r.category || '').trim();
    const rawTitle = (r.title || '').trim();

    const { amount, isError: isParseError } = parseAmount(r.amount);
    const standardCategory = normalizeCategory(rawCat);

    const master = masterMap.get(rawDeptCode);
    const standardDeptHead = master ? master.standard_head : rawDeptHead;
    const standardDeptName = master ? master.standard_dept_name : rawDeptCode;

    // Check Duplicate
    const dupKey = `${rawEmpNo}|${rawDate}|${rawCat}`;
    const dupCount = (rawEmpNo && rawDate && rawCat) ? (dupKeyMap.get(dupKey) || 0) : 1;
    const isDuplicate = dupCount >= 2;
    let isFirstInDup = true;
    if (isDuplicate) {
      if (dupFirstSeenMap.has(dupKey)) {
        isFirstInDup = false;
      } else {
        dupFirstSeenMap.set(dupKey, true);
        isFirstInDup = true;
      }
    }

    // Check Missing
    const missingFields: string[] = [];
    if (!rawDate) missingFields.push('포상일자 누락');
    if (amount === null && !isParseError) missingFields.push('금액 누락');
    if (!rawEmpNo) missingFields.push('사번 누락');
    if (!rawCat) missingFields.push('카테고리 누락');
    const isMissing = missingFields.length > 0;

    // Check Notation Issues
    const notationIssues: string[] = [];
    // 1) dept_head variations in same dept_code >= 2
    const deptHeads = deptHeadVariations.get(rawDeptCode);
    if (deptHeads && deptHeads.size >= 2) {
      if (rawDeptHead !== standardDeptHead) {
        notationIssues.push(`부서장 표기 상이 ('${rawDeptHead}' ↔ 표준 '${standardDeptHead}')`);
      }
    }
    // 2) category spacing or phrasing differences
    const validCats = ['OSI', 'OSI (개인)', 'OSI (단체)', '부문장 즉포상', '부서장 즉포상'];
    if (rawCat && !validCats.includes(rawCat) && validCats.includes(standardCategory)) {
      notationIssues.push(`카테고리 표기 상이 ('${rawCat}' ↔ 표준 '${standardCategory}')`);
    }
    const hasNotationIssue = notationIssues.length > 0;

    // Compliance State calculation (PRD 5.2)
    let complianceState: ComplianceState = '정상';
    const targetLimit = CATEGORY_LIMITS[standardCategory];

    if (amount === null || isMissing) {
      complianceState = '미기재';
    } else if (isParseError || amount < 0) {
      complianceState = '데이터 오류';
    } else if (!targetLimit) {
      complianceState = '미등록 카테고리';
    } else if (amount === 0) {
      complianceState = '무상 포상';
    } else if (amount > targetLimit) {
      complianceState = '한도 초과';
    } else if (amount < targetLimit && amount > 0) {
      complianceState = '한도 미달';
    } else if (amount === targetLimit) {
      complianceState = '정상';
    }

    // State rank according to PRD 5.6:
    // 0: '데이터 오류', '중복'
    // 1: '한도 초과', '한도 미달'
    // 2: '표기 상이'
    // 3: '정상', '무상 포상', '미기재'
    let stateRank = 3;
    if (complianceState === '데이터 오류' || isDuplicate) {
      stateRank = 0;
    } else if (complianceState === '한도 초과' || complianceState === '한도 미달') {
      stateRank = 1;
    } else if (hasNotationIssue) {
      stateRank = 2;
    } else {
      stateRank = 3;
    }

    // Bias Warning: employee received 3 or more awards (PRD 5.3)
    const empAwardCount = empRewardCountMap.get(rawEmpNo) || 0;
    const biasWarning = empAwardCount >= 3;

    evaluated.push({
      reward_id: r.reward_id || '',
      emp_no: rawEmpNo,
      emp_name: r.emp_name || '',
      dept_code: rawDeptCode,
      dept_head: rawDeptHead,
      standard_dept_head: standardDeptHead,
      standard_dept_name: standardDeptName,
      reward_date: rawDate,
      category: rawCat,
      standard_category: standardCategory,
      amount,
      raw_amount: r.amount ?? null,
      title: rawTitle,
      compliance_state: complianceState,
      is_duplicate: isDuplicate,
      duplicate_count: dupCount,
      is_first_in_dup: isFirstInDup,
      has_notation_issue: hasNotationIssue,
      notation_issues: notationIssues,
      is_missing: isMissing,
      missing_fields: missingFields,
      state_rank: stateRank,
      bias_warning: biasWarning,
      user_reward_count: empAwardCount,
    });
  });

  // 3. Sort records cleanly: reward_date desc, amount desc, reward_id asc
  evaluated.sort((a, b) => {
    // Dates: nulls last, then desc
    if (!a.reward_date && b.reward_date) return 1;
    if (a.reward_date && !b.reward_date) return -1;
    if (a.reward_date && b.reward_date && a.reward_date !== b.reward_date) {
      return b.reward_date.localeCompare(a.reward_date);
    }
    // Amount: nulls last, then desc
    if (a.amount === null && b.amount !== null) return 1;
    if (a.amount !== null && b.amount === null) return -1;
    if (a.amount !== null && b.amount !== null && a.amount !== b.amount) {
      return b.amount - a.amount;
    }
    // reward_id asc
    return a.reward_id.localeCompare(b.reward_id);
  });

  // 4. Summaries calculation per Department & Overall
  const deptSummaries: Record<string, DeptSummary> = {};

  deptMasters.forEach(dm => {
    const deptRecords = evaluated.filter(r => r.dept_code === dm.dept_code);
    
    // All recorded awards with an amount are aggregated directly
    const validRecords = deptRecords.filter(r => r.amount !== null && r.amount >= 0);

    const distinctBeneficiaries = new Set<string>();
    let totalAmount = 0;
    const catMap: Record<string, { count: number; amount: number }> = {
      'OSI': { count: 0, amount: 0 },
      '부문장 즉포상': { count: 0, amount: 0 },
      '부서장 즉포상': { count: 0, amount: 0 },
    };

    validRecords.forEach(r => {
      if (r.emp_no) distinctBeneficiaries.add(r.emp_no);
      const amt = r.amount || 0;
      totalAmount += amt;

      const stdCat = r.standard_category;
      const groupCat = stdCat.startsWith('OSI') ? 'OSI' : stdCat;
      if (!catMap[groupCat]) {
        catMap[groupCat] = { count: 0, amount: 0 };
      }
      catMap[groupCat].count += 1;
      catMap[groupCat].amount += amt;
    });

    const U = distinctBeneficiaries.size;
    const T = dm.total_headcount || Math.max(U, 1);
    // Benefit rate R = (U / T) * 100
    const rawRate = T > 0 ? (U / T) * 100 : 0;
    const roundedRate = Math.round(rawRate * 10) / 10;

    let benefitRateState: BenefitRateState = '보통';
    if (rawRate < 20.0) {
      benefitRateState = '수혜 저조';
    } else {
      benefitRateState = '보통';
    }

    // Bias employees in dept
    const deptEmpCount = new Map<string, { name: string; count: number }>();
    deptRecords.forEach(r => {
      if (r.emp_no) {
        const cur = deptEmpCount.get(r.emp_no) || { name: r.emp_name, count: 0 };
        cur.count += 1;
        deptEmpCount.set(r.emp_no, cur);
      }
    });

    const biasEmployees: { emp_no: string; emp_name: string; count: number }[] = [];
    deptEmpCount.forEach((val, empNo) => {
      if (val.count >= 3) {
        biasEmployees.push({ emp_no: empNo, emp_name: val.name, count: val.count });
      }
    });

    // Category breakdown with ratios
    const totalValid = validRecords.length;
    const categoryBreakdown = Object.entries(catMap).map(([category, data]) => ({
      category,
      count: data.count,
      amount: data.amount,
      ratio: totalValid > 0 ? Math.round((data.count / totalValid) * 1000) / 10 : 0,
    }));

    // Issue counts in department
    const issueCounts = {
      total_issues: 0,
      duplicate: deptRecords.filter(r => r.is_duplicate).length,
      limit_exceeded: deptRecords.filter(r => r.compliance_state === '한도 초과').length,
      limit_under: deptRecords.filter(r => r.compliance_state === '한도 미달').length,
      notation: deptRecords.filter(r => r.has_notation_issue).length,
      missing: deptRecords.filter(r => r.is_missing).length,
      error: deptRecords.filter(r => r.compliance_state === '데이터 오류').length,
      free: deptRecords.filter(r => r.compliance_state === '무상 포상').length,
    };
    issueCounts.total_issues =
      issueCounts.duplicate +
      issueCounts.limit_exceeded +
      issueCounts.limit_under +
      issueCounts.notation +
      issueCounts.missing +
      issueCounts.error;

    deptSummaries[dm.dept_code] = {
      dept_code: dm.dept_code,
      dept_name: dm.standard_dept_name,
      dept_head: dm.standard_head,
      total_headcount: T,
      beneficiary_count: U,
      benefit_rate: roundedRate,
      benefit_rate_state: benefitRateState,
      has_bias: biasEmployees.length > 0,
      bias_employees: biasEmployees,
      total_amount: totalAmount,
      total_valid_count: totalValid,
      category_breakdown: categoryBreakdown,
      issue_counts: issueCounts,
    };
  });

  // Overall summary
  const allValid = evaluated.filter(r => {
    if (r.is_duplicate && !r.is_first_in_dup) return false;
    if (r.compliance_state === '데이터 오류' || r.compliance_state === '미기재') return false;
    return r.amount !== null && r.amount >= 0;
  });

  const totalHeadcountAll = deptMasters.reduce((acc, m) => acc + m.total_headcount, 0);
  const distinctAllBeneficiaries = new Set(allValid.map(r => r.emp_no).filter(Boolean)).size;
  const overallRate = totalHeadcountAll > 0
    ? Math.round((distinctAllBeneficiaries / totalHeadcountAll) * 1000) / 10
    : 0;

  const totalDuplicates = evaluated.filter(r => r.is_duplicate).length;
  const totalLimitExceeded = evaluated.filter(r => r.compliance_state === '한도 초과').length;
  const totalNotation = evaluated.filter(r => r.has_notation_issue).length;
  const totalMissing = evaluated.filter(r => r.is_missing).length;
  const totalErrors = evaluated.filter(r => r.compliance_state === '데이터 오류').length;
  const totalFree = evaluated.filter(r => r.compliance_state === '무상 포상').length;

  const overall: OverallSummary = {
    total_records: evaluated.length,
    valid_records: allValid.length,
    total_amount: allValid.reduce((sum, r) => sum + (r.amount || 0), 0),
    total_employees_awarded: distinctAllBeneficiaries,
    overall_benefit_rate: overallRate,
    total_issues: totalDuplicates + totalLimitExceeded + totalNotation + totalMissing + totalErrors,
    duplicates: totalDuplicates,
    limit_exceeded: totalLimitExceeded,
    notation_issues: totalNotation,
    missing_data: totalMissing,
    errors: totalErrors,
    free_awards: totalFree,
  };

  return { evaluated, deptSummaries, overall };
}

/**
 * Format currency to KRW (e.g. 100,000원)
 */
export function formatKRW(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-';
  return `${val.toLocaleString('ko-KR')}원`;
}

/**
 * Generate tab-separated text for clipboard export (TSV)
 */
export function generateTSVExport(
  records: EvaluatedRewardRecord[],
  deptName?: string
): string {
  const headers = [
    '포상ID',
    '사번',
    '성명',
    '소관부문장',
    '포상일자',
    '카테고리',
    '지급금액',
    '공적명',
  ];

  const rows = records.map(r => [
    r.reward_id,
    r.emp_no,
    r.emp_name,
    r.standard_dept_head,
    r.reward_date || '(결측)',
    r.category,
    r.amount !== null ? r.amount : '(미기재)',
    r.title,
  ]);

  const titlePrefix = deptName
    ? `[LXMMA 포상 집행 실적 - ${deptName} 기준일: ${BASE_DATE}]\n`
    : `[LXMMA 전사 부문장 포상 집행 실적 - 기준일: ${BASE_DATE}]\n`;
  return titlePrefix + [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
}

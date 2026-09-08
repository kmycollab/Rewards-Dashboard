export type ComplianceState =
  | '정상'
  | '한도 초과'
  | '한도 미달'
  | '무상 포상'
  | '미등록 카테고리'
  | '데이터 오류'
  | '미기재';

export type BenefitRateState = '보통' | '수혜 저조';

export interface RewardRawRecord {
  reward_id: string;
  emp_no: string;
  emp_name: string;
  dept_code: string;
  dept_head: string;
  reward_date: string;
  category: string;
  amount: number | null | string;
  title?: string;
}

export interface EvaluatedRewardRecord {
  reward_id: string;
  emp_no: string;
  emp_name: string;
  dept_code: string;
  dept_head: string;
  standard_dept_head: string;
  standard_dept_name: string;
  reward_date: string;
  category: string;
  standard_category: string;
  amount: number | null;
  raw_amount: string | number | null;
  title: string;

  // Evaluation states
  compliance_state: ComplianceState;
  is_duplicate: boolean;
  duplicate_count?: number;
  is_first_in_dup: boolean;
  has_notation_issue: boolean;
  notation_issues: string[];
  is_missing: boolean;
  missing_fields: string[];
  state_rank: number; // 0: error/duplicate, 1: limit exceed/under, 2: notation, 3: normal/free/missing
  bias_warning: boolean; // 3+ rewards in dept
  user_reward_count: number;
}

export interface DeptMaster {
  dept_code: string;
  standard_head: string;
  standard_dept_name: string;
  total_headcount: number; // T
}

export type DeptBudgetMap = Record<string, number>;

export interface DeptBudgetInfo {
  dept_code: string;
  dept_name: string;
  dept_head: string;
  headcount: number;
  allocated_budget: number;
  executed_amount: number;
  remaining_budget: number;
  burn_rate: number; // percentage e.g. 65.4
  is_over_budget: boolean;
}

export interface DeptSummary {
  dept_code: string;
  dept_name: string;
  dept_head: string;
  total_headcount: number; // T
  beneficiary_count: number; // U (distinct emp_no with valid rewards)
  benefit_rate: number; // R = (U/T)*100
  benefit_rate_state: BenefitRateState;
  has_bias: boolean;
  bias_employees: { emp_no: string; emp_name: string; count: number }[];
  total_amount: number;
  total_valid_count: number;
  category_breakdown: {
    category: string;
    count: number;
    amount: number;
    ratio: number;
  }[];
  issue_counts: {
    total_issues: number;
    duplicate: number;
    limit_exceeded: number;
    limit_under: number;
    notation: number;
    missing: number;
    error: number;
    free: number;
  };
}

export interface OverallSummary {
  total_records: number;
  valid_records: number;
  total_amount: number;
  total_employees_awarded: number;
  overall_benefit_rate: number;
  total_issues: number;
  duplicates: number;
  limit_exceeded: number;
  notation_issues: number;
  missing_data: number;
  errors: number;
  free_awards: number;
}

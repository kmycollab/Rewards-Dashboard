import { DeptMaster, RewardRawRecord } from '../types';

export const BASE_DATE = '2026-08-27';
export const STORAGE_KEY = 'exs03.reward_5dept.v2';
export const BUDGET_STORAGE_KEY = 'exs03.reward_dept_budgets.v2';

export const DEFAULT_DEPT_BUDGETS: Record<string, number> = {
  'D01': 20000000, // 생산부문장 (정원 24명): 20,000,000원
  'D02': 16000000, // 기술연구소장 (정원 18명): 16,000,000원
  'D03': 15000000, // 영업부문장 (정원 16명): 15,000,000원
  'D04': 12000000, // 경영지원담당 (정원 14명): 12,000,000원
  'D05': 10000000, // 경영전략담당 (정원 12명): 10,000,000원
};

export const CATEGORY_LIMITS: Record<string, number> = {
  'OSI': 3000000,
  'OSI (개인)': 3000000,
  'OSI (단체)': 3000000,
  '부문장 즉포상': 1500000,
  '부서장 즉포상': 300000,
  '팀장 즉포상': 300000,
};

export const DEPT_MASTERS: DeptMaster[] = [
  { dept_code: 'D01', standard_head: '생산부문장', standard_dept_name: '생산부문장', total_headcount: 24 },
  { dept_code: 'D02', standard_head: '기술연구소장', standard_dept_name: '기술연구소장', total_headcount: 18 },
  { dept_code: 'D03', standard_head: '영업부문장', standard_dept_name: '영업부문장', total_headcount: 16 },
  { dept_code: 'D04', standard_head: '경영지원담당', standard_dept_name: '경영지원담당', total_headcount: 14 },
  { dept_code: 'D05', standard_head: '경영전략담당', standard_dept_name: '경영전략담당', total_headcount: 12 },
];

export const RAW_SAMPLE_CSV = `reward_id,emp_no,emp_name,dept_code,dept_head,reward_date,category,amount,title
R2026-001,E10201,김철수,D01,생산부문장,2026-01-15,OSI (개인),3000000,공정 모노머 회수율 3.2% 개선
R2026-002,E10202,박영희,D01,생산부문장,2026-01-22,부문장 즉포상,1500000,중합 반응기 안전 점검 체계화
R2026-003,E10203,이지훈,D01,생산부문장,2026-02-05,부서장 즉포상,300000,야간 배관 이상 누출 사전 감지
R2026-004,E10204,최민지,D01,생산 부문장,2026-02-18,부문장 즉포상,1500000,원료 입고 라인 라벨링 정비
R2026-005,E10201,김철수,D01,생산부문장,2026-03-04,부서장 즉포상,300000,현장 5S 우수 분임조 활동
R2026-006,E10206,정우성,D01,생산부문장,2026-03-12,OSI (단체),3000000,스팀 에너지 절감 설비 개조
R2026-007,E10207,한지민,D01,생산부문장,2026-03-25,부문장 즉포상,1500000,정기 보수 무재해 달성 기여
R2026-008,E10208,강하늘,D01,생산부문장,2026-04-02,부서장 즉포상,300000,출하 차량 대기시간 단축
R2026-009,E10209,송중기,D01,생산부문장,2026-04-15,OSI,3000000,품질 분산 안정화 신기술 도입
R2026-010,E10210,윤아라,D01,생산부문장,2026-04-28,부문장 즉포상,1500000,폐수 처리 공정 효율 최적화
R2026-011,E10201,김철수,D01,생산부문장,2026-05-10,부문장 즉포상,1500000,원가 절감 태스크포스 우수 제안
R2026-012,E10205,홍길동,D01,생산부문장,2026-04-10,부서장 즉포상,300000,포장 라인 센서 점검
R2026-013,E10205,홍길동,D01,생산부문장,2026-04-10,부서장 즉포상,300000,포장 라인 센서 점검
R2026-014,E20301,신세경,D02,기술연구소장,2026-01-18,OSI,3000000,고투명 MMA 광학소재 배합 개발
R2026-015,E20302,조인성,D02,기술연구소장,2026-01-29,부문장 즉포상,1500000,내열성 첨가제 신규 합성 성공
R2026-016,E20303,배수지,D02,기술연구소장,2026-02-11,부서장 즉포상,300000,분석 기기 크로마토그래피 유지보수
R2026-017,E20304,현빈,D02,기술연구소장,2026-02-24,OSI (개인),3000000,친환경 재활용 PMMA 특허 출원
R2026-018,E20305,손예진,D02,기술연구소장,2026-03-08,부문장 즉포상,1500000,고객사 물성 스펙 만족 레시피 도출
R2026-019,E20306,공유,D02,기술연구소장,2026-03-20,부서장 즉포상,300000,연구실 안전 점검 우수 연구원
R2026-020,E20307,김태리,D02,기술연구소장,2026-04-05,OSI (단체),3000000,압출 성형성 불량 개선 기술 확립
R2026-021,E20308,이도현,D02,기술연구소장,2026-04-19,부문장 즉포상,1500000,국제 학회 논문 발표 및 기술 홍보
R2026-022,E20309,임윤아,D02,기술연구소장,2026-05-02,부문장즉포상,1500000,신규 분석 표준 시험법 사내 등재
R2026-023,E30401,박서준,D03,영업부문장,2026-01-12,OSI,3000000,동남아 신규 거래선 3천톤 수주
R2026-024,E30402,박보검,D03,영업부문장,2026-01-25,부문장 즉포상,1500000,주요 고객사 채권 관리 리스크 선제 해소
R2026-025,E30403,아이유,D03,영업부문장,2026-02-09,부서장 즉포상,300000,수출 선적 일정 조율 및 지연 예방
R2026-026,E30404,유재석,D03,영업부문장,2026-02-22,OSI (개인),3000000,고수익 특수 그레이드 판매 비중 확대
R2026-027,E30405,하하,D03,영업부문장,2026-03-15,부문장 즉포상,1500000,단가 인상 협상 성공적 타결
R2026-028,E30406,송지효,D03,영업부문장,2026-03-28,부서장 즉포상,300000,CRM 데이터 무결성 검증 완료
R2026-029,E30407,김종국,D03,영업부문장,2026-04-12,OSI (단체),3000000,유럽 신규 친환경 규제 선제 대응
R2026-030,E30408,이광수,D03,영업부문장,2026-04-26,부문장 즉포상,1500000,클레임 신속 접수 및 현장 대응 만족
R2026-031,E30409,지석진,D03,영업부문장,2026-05-15,부서장 즉포상,300000,신규 잠재 고객 발굴 20개사
R2026-032,E40501,전도연,D04,경영지원담당,2026-01-14,OSI,3000000,차세대 전사 ERP 인사 모듈 구축 안정화
R2026-033,E40502,이정재,D04,경영지원담당,2026-01-30,부문장 즉포상,1500000,법인세 결산 세무 조정 환급 달성
R2026-034,E40503,정우,D04,경영지원담당,2026-02-15,부서장 즉포상,300000,사내 전산 보안 모니터링 취약점 개선
R2026-035,E40504,한소희,D04,경영지원담당,2026-03-02,부문장 즉포상,1500000,노경 상생 간담회 성공적 운영
R2026-036,E40505,안보현,D04,경영지원담당,2026-03-22,부서장 즉포상,300000,임직원 복리후생 시설 환경 정비
R2026-037,E40506,김우빈,D04,경영지원담당,2026-04-08,OSI (개인),3000000,안전보건경영시스템(ISO45001) 재인증
R2026-038,E40507,신민아,D04,경영지원담당,2026-04-25,부문장 즉포상,1500000,신규 입사자 온보딩 프로그램 개편
R2026-039,E40508,남주혁,D04,경영지원담당,2026-05-08,부서장 즉포상,300000,사내 문서 중앙화 및 보안 체계 정착
R2026-040,E50601,원빈,D05,경영전략담당,2026-01-10,OSI,3000000,중장기 ESG 경영 로드맵 수립
R2026-041,E50602,이나영,D05,경영전략담당,2026-01-27,부문장 즉포상,1500000,신사업 타당성 조사 및 M&A 스크리닝
R2026-042,E50603,강동원,D05,경영전략담당,2026-02-20,부서장 즉포상,300000,분기 경영실적 분석 보고서 작성
R2026-043,E50604,송혜교,D05,경영전략담당,2026-03-18,부문장 즉포상,1500000,원자재 가격 변동 리스크 헷지 전략
R2026-044,E50605,박형식,D05,경영전략담당,2026-04-14,부서장 즉포상,300000,전사 KPI 지표 고도화 및 정기 모니터링
R2026-045,E50606,임시완,D05,경영전략담당,2026-05-05,부서장 즉포상,0,전사 지식포털 제안 등록(무상 표창)
R2026-046,E10202,박영희,D01,생산부문장,2026-05-20,부문장 즉포상,1500000,공정 밸브 표준화(한도 정액)
R2026-047,E20302,조인성,D02,기술연구소장,2026-05-25,부문장 즉포상,1600000,고기능성 시험 분석(한도 10만원 초과)
R2026-048,E30402,박보검,D03,영업부문장,,부문장 즉포상,1500000,물류 파트너십 체결(일자 누락)
R2026-049,E40502,이정재,D04,경영지원담당,2026-06-02,부문장 즉포상,,회계 감사 수검 지원(금액 누락)
R2026-050,E50602,이나영,D05,경영전략담당,2026-06-15,부문장 즉포상,-50000,환입 취소 건(음수 오류)`;

export function parseCSVToRawRecords(csvText: string): RewardRawRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s_]/g, ''));
  
  // Find column indices
  const getIdx = (candidates: string[]) => {
    return headers.findIndex(h => candidates.some(c => h.includes(c.toLowerCase().replace(/[\s_]/g, ''))));
  };

  const idIdx = getIdx(['rewardid', 'id', '포상id', '포상번호']);
  const empNoIdx = getIdx(['empno', '사번']);
  const nameIdx = getIdx(['empname', '사원명', '이름', '성명']);
  const deptCodeIdx = getIdx(['deptcode', '부문코드', '부서코드']);
  const deptHeadIdx = getIdx(['depthead', '부서장', '부문장', '담당', '직책']);
  const dateIdx = getIdx(['rewarddate', 'date', '포상일자', '일자', '날짜']);
  const catIdx = getIdx(['category', '포상구분', '카테고리']);
  const amtIdx = getIdx(['amount', '금액', '포상금']);
  const titleIdx = getIdx(['title', '공적', '공적명', '제목', '내용']);

  const records: RewardRawRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV handling simple commas
    const parts = line.split(',');
    
    const rawId = (idIdx >= 0 ? parts[idIdx] : parts[0])?.trim() || `R2026-${String(i).padStart(3, '0')}`;
    const rawEmpNo = (empNoIdx >= 0 ? parts[empNoIdx] : parts[1])?.trim() || '';
    const rawEmpName = (nameIdx >= 0 ? parts[nameIdx] : parts[2])?.trim() || '';
    const rawDeptCode = (deptCodeIdx >= 0 ? parts[deptCodeIdx] : parts[3])?.trim() || '';
    const rawDeptHead = (deptHeadIdx >= 0 ? parts[deptHeadIdx] : parts[4])?.trim() || '';
    const rawDate = (dateIdx >= 0 ? parts[dateIdx] : parts[5])?.trim() || '';
    const rawCat = (catIdx >= 0 ? parts[catIdx] : parts[6])?.trim() || '';
    const rawAmt = (amtIdx >= 0 ? parts[amtIdx] : parts[7])?.trim();
    const rawTitle = (titleIdx >= 0 ? parts[titleIdx] : parts[8])?.trim() || '';

    records.push({
      reward_id: rawId,
      emp_no: rawEmpNo,
      emp_name: rawEmpName,
      dept_code: rawDeptCode,
      dept_head: rawDeptHead,
      reward_date: rawDate,
      category: rawCat,
      amount: rawAmt === '' || rawAmt === undefined ? null : rawAmt,
      title: rawTitle,
    });
  }

  return records;
}

export const INITIAL_SAMPLE_RECORDS: RewardRawRecord[] = parseCSVToRawRecords(RAW_SAMPLE_CSV);

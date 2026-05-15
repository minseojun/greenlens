// ─── DB 엔티티 타입 ───────────────────────────────────────────────────────────

export type AnalysisStatus =
  | 'pending'
  | 'processing'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'stage4'
  | 'completed'
  | 'failed';

export type ClaimType =
  | 'FACTUAL_CLAIM'
  | 'INTENTION_DECLARATION'
  | 'NUMERICAL_CLAIM'
  | 'VAGUE_RHETORIC';

export type ClaimFlag = 'red' | 'amber' | 'green';

export type Grade = 'trusted' | 'suspicious' | 'critical';

export interface Analysis {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  report_year: number;
  report_text?: string;
  pdf_url?: string;
  status: AnalysisStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  analysis_id: string;
  score: number;
  grade: Grade;
  stage1_result: Stage1Result | null;
  stage2_result: Stage2Result | null;
  stage3_result: Stage3Result | null;
  stage4_result: Stage4Result | null;
  verdict: string;
  radar_data: RadarData;
  recommendations: string[];
  created_at: string;
}

export interface Claim {
  id: string;
  analysis_id: string;
  text: string;
  type: ClaimType;
  flag: ClaimFlag;
  penalty_points: number;
  evidence_found: boolean;
  evidence_type?: string;
  stage: number;
}

// ─── Claude 파이프라인 응답 타입 ──────────────────────────────────────────────

export interface ExtractedClaim {
  text: string;
  type: ClaimType;
  page_reference?: string;
  evidence_found: boolean;
  evidence_type:
    | 'NUMERICAL'
    | 'METHODOLOGY'
    | 'THIRD_PARTY'
    | 'ROADMAP'
    | 'NONE';
  evidence_detail?: string;
  gri_tcfd_reference?: string;
  flag: ClaimFlag;
  flag_reason: string;
  penalty_points: number;
}

export interface Stage1Result {
  total_claims: number;
  claims: ExtractedClaim[];
  missing_gri_items: string[];
  has_third_party_verification: boolean;
  summary: string;
}

export interface VerificationItem {
  claim_text: string;
  claim_type: ClaimType;
  public_db_source: 'DART' | 'GHG_REGISTRY' | 'KEMCO' | 'OTHER';
  verification_method: string;
  discrepancy_suspected: boolean;
  discrepancy_detail?: string;
  suspicion_level: 'high' | 'medium' | 'low';
  penalty_points: number;
}

export interface Stage2Result {
  items: VerificationItem[];
  total_discrepancies_suspected: number;
  summary: string;
}

export interface Stage3Result {
  // 단일 보고서 MVP에서는 항상 null
  retrogressions: never[];
  summary: string;
}

export interface ScoreBreakdown {
  base_score: number;
  penalties: Array<{
    reason: string;
    points: number;
    count: number;
  }>;
  bonuses: Array<{
    reason: string;
    points: number;
  }>;
  final_score: number;
  grade: Grade;
}

export interface Stage4Result {
  score_breakdown: ScoreBreakdown;
  final_score: number;
  grade: Grade;
  verdict: string;
  recommendations: string[];
}

export interface RadarData {
  exaggeration: number;     // 과장성
  vagueness: number;        // 모호성
  data_missing: number;     // 수치 누락
  standard_gap: number;     // 기준 불일치
  regression: number;       // 전년 대비 후퇴 (MVP: 항상 0)
}

// ─── API 요청/응답 타입 ────────────────────────────────────────────────────────

export interface StartAnalysisRequest {
  company_name: string;
  industry: string;
  report_year: number;
  report_text?: string;
  pdf_url?: string;
}

export interface StartAnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: AnalysisStatus;
  progress: number; // 0-100
  result?: AnalysisResult;
  claims?: Claim[];
  error_message?: string;
}

export interface IndustryCompareData {
  industry: string;
  analyses: Array<{
    company_name: string;
    report_year: number;
    score: number;
    grade: Grade;
  }>;
  avg_score: number;
}

// ─── UI 상태 타입 ─────────────────────────────────────────────────────────────

export interface PipelineStage {
  id: number;
  name: string;
  description: string;
  status: 'waiting' | 'running' | 'done' | 'error';
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    name: '클레임 추출',
    description: 'ESG 주장 문장 분류 및 증거 연결 분석',
    status: 'waiting',
  },
  {
    id: 2,
    name: '외부 DB 교차검증',
    description: 'DART·온실가스 공공 DB 대조',
    status: 'waiting',
  },
  {
    id: 3,
    name: '시계열 후퇴 탐지',
    description: '목표 하향·지표 삭제·언어 완화 감지',
    status: 'waiting',
  },
  {
    id: 4,
    name: '종합 판정',
    description: '신뢰도 점수 산출 및 개선 권고 생성',
    status: 'waiting',
  },
];

export const INDUSTRIES = [
  '제조업', '화학', '철강', '시멘트', '반도체', '자동차',
  '조선', '건설', '에너지', '금융', '유통', '통신', '식품',
  '바이오/제약', '패션/섬유', '기타',
] as const;

export type Industry = typeof INDUSTRIES[number];

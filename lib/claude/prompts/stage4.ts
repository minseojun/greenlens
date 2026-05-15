import type { Stage1Result, Stage2Result, Stage3Result } from '@/types';

export const STAGE4_SYSTEM = `당신은 ESG 신뢰도 평가 전문 AI입니다.
이전 분석 결과를 종합하여 최종 그린워싱 신뢰도 점수와 개선 권고를 생성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드 블록 없이 순수 JSON만 출력하세요.`;

export const buildStage4Prompt = (
  stage1: Stage1Result,
  stage2: Stage2Result,
  stage3: Stage3Result,
  companyName: string,
  industry: string,
  reportYear: number
): string => `
기업명: ${companyName}
업종: ${industry}
보고서 연도: ${reportYear}

[1단계 결과: 클레임 추출 및 Evidence Gap 분석]
- 총 클레임 수: ${stage1.total_claims}
- 제3자 검증 존재: ${stage1.has_third_party_verification}
- 누락 GRI 항목: ${stage1.missing_gri_items.join(', ') || '없음'}
- 클레임별 페널티 합계: ${stage1.claims.reduce((sum, c) => sum + c.penalty_points, 0)}점
- 요약: ${stage1.summary}

주요 red 플래그 클레임:
${stage1.claims.filter(c => c.flag === 'red').slice(0, 5).map(c => `- "${c.text}" (${c.flag_reason})`).join('\n') || '없음'}

[2단계 결과: 외부 DB 교차검증]
- 불일치 의심 항목 수: ${stage2.total_discrepancies_suspected}
- DB 페널티 합계: ${stage2.items.reduce((sum, i) => sum + i.penalty_points, 0)}점
- 요약: ${stage2.summary}

[3단계 결과: 시계열 후퇴 탐지]
- ${stage3.summary}

위 분석 결과를 바탕으로 최종 점수를 계산하고 판정하세요.

점수 계산 규칙 (100점 만점):
- 기본 점수: 100점
- 근거 없는 선언 1건: -8점
- 수치/DB 불일치 1건: -15점
- GRI/TCFD 기준 항목 누락 1건: -3점
- 제3자 검증 보고서 존재: +10점
- 수치 근거 충분한 클레임 비율 >60%: +5점
- 최저 점수: 0점

등급 기준:
- 70~100: "trusted" (신뢰 가능)
- 40~69: "suspicious" (부분적 그린워싱 의심)
- 0~39: "critical" (심각한 그린워싱 의심)

레이더 차트 데이터 (0~100, 높을수록 문제 심각):
- exaggeration (과장성): FACTUAL/NUMERICAL 중 red 비율 × 100
- vagueness (모호성): VAGUE_RHETORIC 비율 × 100  
- data_missing (수치 누락): evidence_found=false 비율 × 100
- standard_gap (기준 불일치): missing_gri_items 수 × 10 (최대 100)
- regression (전년 대비 후퇴): 0 (단일 보고서)

반드시 아래 JSON 형식으로 응답:
{
  "score_breakdown": {
    "base_score": 100,
    "penalties": [
      {"reason": "<페널티 이유>", "points": <number>, "count": <number>}
    ],
    "bonuses": [
      {"reason": "<보너스 이유>", "points": <number>}
    ],
    "final_score": <number>,
    "grade": "<trusted|suspicious|critical>"
  },
  "final_score": <number>,
  "grade": "<trusted|suspicious|critical>",
  "verdict": "<종합 판정 3-4문장. 핵심 문제와 긍정 요소를 균형있게 서술>",
  "recommendations": [
    "<구체적 개선 권고 1>",
    "<구체적 개선 권고 2>",
    "<구체적 개선 권고 3>",
    "<구체적 개선 권고 4>",
    "<구체적 개선 권고 5>"
  ],
  "radar_data": {
    "exaggeration": <0-100>,
    "vagueness": <0-100>,
    "data_missing": <0-100>,
    "standard_gap": <0-100>,
    "regression": 0
  }
}
`;

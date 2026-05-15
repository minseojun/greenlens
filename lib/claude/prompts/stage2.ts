import type { ExtractedClaim } from '@/types';

export const STAGE2_SYSTEM = `당신은 ESG 데이터 검증 전문 AI입니다.
기업이 보고서에서 주장한 수치를 공공 데이터베이스 기준으로 교차검증합니다.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드 블록 없이 순수 JSON만 출력하세요.`;

export const buildStage2Prompt = (
  numericalClaims: ExtractedClaim[],
  companyName: string,
  industry: string,
  reportYear: number
): string => `
기업명: ${companyName}
업종: ${industry}
보고서 연도: ${reportYear}

[검증 대상 수치 주장 목록]
${numericalClaims.map((c, i) => `${i + 1}. "${c.text}"`).join('\n')}

위 수치 주장들에 대해 공공 DB 교차검증이 필요한 항목을 분석하세요.

검증 대상 공공 DB:
- DART 전자공시 (금융감독원): 온실가스 배출량, 에너지 사용량 등 지속가능경영 공시
- 온실가스종합정보센터 (GHG): 업종별 배출량 통계
- KEMCO 한국에너지공단: 에너지 효율, 재생에너지 통계
- OTHER: 기타 공공 데이터

각 수치 주장에 대해:
1. 어떤 공공 DB로 검증해야 하는지 판단
2. 검증 방법 설명
3. 불일치 가능성 평가 (보고서 수치가 업종 평균과 크게 다르거나, 단기간 급격 개선이면 의심)
4. 의심 수준 판정: high(매우 의심)/medium(주의)/low(정상 범위)

반드시 아래 JSON 형식으로 응답:
{
  "items": [
    {
      "claim_text": "<원문>",
      "claim_type": "<FACTUAL_CLAIM|NUMERICAL_CLAIM>",
      "public_db_source": "<DART|GHG_REGISTRY|KEMCO|OTHER>",
      "verification_method": "<검증 방법 설명>",
      "discrepancy_suspected": <boolean>,
      "discrepancy_detail": "<불일치 의심 내용 또는 null>",
      "suspicion_level": "<high|medium|low>",
      "penalty_points": <0|5|15>
    }
  ],
  "total_discrepancies_suspected": <number>,
  "summary": "<교차검증 결과 요약 2-3문장>"
}

penalty_points 기준:
- high 불일치 의심: 15점
- medium 불일치 의심: 5점
- low 또는 정상: 0점
`;

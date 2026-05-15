export const STAGE1_SYSTEM = `당신은 ESG 그린워싱 탐지 전문 AI입니다.
기업 ESG/지속가능경영 보고서를 분석하여 환경 관련 주장을 추출하고 그린워싱 여부를 판정합니다.

반드시 아래 JSON 형식으로만 응답하세요. 그 외 텍스트는 절대 포함하지 마세요.
마크다운 코드 블록(\`\`\`json)도 포함하지 마세요. 순수 JSON만 출력하세요.`;

export const buildStage1Prompt = (
  reportText: string,
  companyName: string,
  industry: string,
  reportYear: number
): string => `
기업명: ${companyName}
업종: ${industry}
보고서 연도: ${reportYear}

[보고서 전문]
${reportText.slice(0, 80000)}

위 ESG 보고서를 분석하여 다음을 수행하세요:

1. 환경 관련 주장 문장을 모두 추출하고 4가지 유형으로 분류:
   - FACTUAL_CLAIM: 검증 가능한 사실 주장 (예: "배출량 30% 감축")
   - INTENTION_DECLARATION: 미래 의도 선언 (예: "2030년까지 탄소중립")
   - NUMERICAL_CLAIM: 수치 제시 (예: "재생에너지 40% 사용")
   - VAGUE_RHETORIC: 모호한 수사 (예: "친환경 경영 강화")

2. 각 주장에 대해 보고서 내 증거 존재 여부 판단:
   - NUMERICAL: 구체적 수치 근거
   - METHODOLOGY: 방법론/계산 방식 설명
   - THIRD_PARTY: 제3자 검증 인증
   - ROADMAP: 구체적 실행 로드맵
   - NONE: 증거 없음

3. 그린워싱 플래그 판정:
   - red: 근거 없는 주장, 수치 불명확, 심각한 과장
   - amber: 증거 부족, 모호한 목표, 부분적 근거만 있음
   - green: 충분한 근거, 검증 가능, 구체적 수치 제시

4. GRI/TCFD/SASB 주요 항목 누락 체크 (환경 분야)

반드시 아래 JSON 형식으로 응답:
{
  "total_claims": <number>,
  "claims": [
    {
      "text": "<주장 원문>",
      "type": "<FACTUAL_CLAIM|INTENTION_DECLARATION|NUMERICAL_CLAIM|VAGUE_RHETORIC>",
      "page_reference": "<해당 섹션명 또는 null>",
      "evidence_found": <boolean>,
      "evidence_type": "<NUMERICAL|METHODOLOGY|THIRD_PARTY|ROADMAP|NONE>",
      "evidence_detail": "<증거 내용 요약 또는 null>",
      "gri_tcfd_reference": "<관련 기준 항목 또는 null>",
      "flag": "<red|amber|green>",
      "flag_reason": "<판정 이유 1-2문장>",
      "penalty_points": <0|3|7|8|15>
    }
  ],
  "missing_gri_items": ["<누락된 GRI/TCFD 항목명>"],
  "has_third_party_verification": <boolean>,
  "summary": "<전체 분석 요약 2-3문장>"
}

penalty_points 기준:
- VAGUE_RHETORIC + 증거 없음: 8점
- FACTUAL/NUMERICAL + 증거 없음: 8점  
- INTENTION + 로드맵 없음: 3점
- 증거 있는 주장: 0점
- GRI 기준 항목 누락: 각 3점 (missing_gri_items에 포함)
`;

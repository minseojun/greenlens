// Node.js 환경에서만 import (API Route에서 사용)
// pdf-parse는 서버사이드 전용

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // dynamic import: Next.js 번들에서 서버사이드로만 로드
  const pdfParse = (await import('pdf-parse')).default;

  const data = await pdfParse(buffer, {
    // 텍스트 추출만, 렌더링 없음
    max: 0,
  });

  if (!data.text || data.text.trim().length === 0) {
    throw new Error('PDF에서 텍스트를 추출할 수 없습니다. 스캔 이미지 PDF이거나 텍스트 레이어가 없을 수 있습니다.');
  }

  // 과도한 공백/줄바꿈 정리
  const cleaned = data.text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return cleaned;
}

export function estimateTokens(text: string): number {
  // 한국어 기준 대략적 토큰 수 추정 (1글자 ≈ 1.5토큰)
  return Math.ceil(text.length * 1.5);
}

export function truncateForAPI(text: string, maxChars = 80000): string {
  if (text.length <= maxChars) return text;

  // 앞부분 60% + 뒷부분 40% 유지 (요약/결론 부분 포함)
  const frontChars = Math.floor(maxChars * 0.6);
  const backChars = maxChars - frontChars;

  return (
    text.slice(0, frontChars) +
    '\n\n[... 중간 내용 생략 ...]\n\n' +
    text.slice(-backChars)
  );
}

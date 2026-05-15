import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과합니다.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = (await import('pdf-parse' as any)).default ?? (await import('pdf-parse' as any));
      // 최대 50페이지만 파싱 (환경 섹션 위주)
      const data = await pdfParse(buffer, { max: 50 });
      text = data.text;
    } catch (parseErr) {
      console.error('pdf-parse 오류:', parseErr);
      return NextResponse.json(
        { error: 'PDF 텍스트 추출에 실패했습니다. 텍스트 직접 입력 모드를 사용해주세요.' },
        { status: 422 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'PDF에서 텍스트를 추출할 수 없습니다. 스캔 이미지 PDF이거나 텍스트 레이어가 없을 수 있습니다.' },
        { status: 422 }
      );
    }

    // 텍스트 정리
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    // 최대 40,000자로 제한 (안전한 JSON 바디 크기)
    const MAX_CHARS = 40000;
    const truncated = cleaned.length > MAX_CHARS;
    const finalText = truncated
      ? cleaned.slice(0, MAX_CHARS)
      : cleaned;

    return NextResponse.json({
      text: finalText,
      pdf_url: null,
      char_count: cleaned.length,
      truncated,
    });
  } catch (err) {
    console.error('PDF 업로드 오류:', err);
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

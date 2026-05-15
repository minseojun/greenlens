import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { extractTextFromPDF, truncateForAPI } from '@/lib/pdf';

// Vercel: 최대 60초, 10MB 바디
export const maxDuration = 60;

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

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과합니다.' },
        { status: 400 }
      );
    }

    // PDF → 텍스트 추출
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromPDF(buffer);
    const text = truncateForAPI(rawText);

    // Supabase Storage에 원본 업로드 (선택적)
    let pdfUrl: string | null = null;
    try {
      const supabase = createAdminClient();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData } = await supabase.storage
        .from('reports')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });
      if (uploadData?.path) {
        const { data: urlData } = supabase.storage
          .from('reports')
          .getPublicUrl(uploadData.path);
        pdfUrl = urlData.publicUrl;
      }
    } catch (storageErr) {
      // Storage 업로드 실패해도 텍스트 추출은 성공으로 처리
      console.warn('PDF Storage 업로드 실패:', storageErr);
    }

    return NextResponse.json({
      text,
      pdf_url: pdfUrl,
      char_count: rawText.length,
      truncated: rawText.length > 80000,
    });
  } catch (err) {
    console.error('PDF 업로드 오류:', err);
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

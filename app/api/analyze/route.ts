import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { runAnalysisPipeline } from '@/lib/claude/pipeline';
import type { StartAnalysisRequest } from '@/types';

// Vercel Fluid Compute: 최대 60초 허용
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: StartAnalysisRequest = await request.json();
    const { company_name, industry, report_year, report_text, pdf_url } = body;

    // 입력 검증
    if (!company_name || !industry || !report_year) {
      return NextResponse.json(
        { error: '기업명, 업종, 보고서 연도는 필수입니다.' },
        { status: 400 }
      );
    }
    if (!report_text || report_text.trim().length < 100) {
      return NextResponse.json(
        { error: '보고서 텍스트가 너무 짧습니다. 최소 100자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증 확인 (선택적 — 비로그인 데모도 허용)
    // MVP에서는 user_id null 허용
    let userId: string | null = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        // 추후 Supabase Auth 연동
        userId = null;
      }
    } catch {
      userId = null;
    }

    const supabase = createAdminClient();

    // analyses 레코드 생성
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        company_name: company_name.trim(),
        industry,
        report_year,
        report_text: report_text.trim(),
        pdf_url,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError || !analysis) {
      console.error('분석 레코드 생성 실패:', insertError);
      return NextResponse.json(
        { error: '분석을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 파이프라인 비동기 실행 (응답을 기다리지 않음)
    // Vercel에서는 응답 반환 후에도 실행 계속됨 (maxDuration 60s)
    runAnalysisPipeline({
      analysisId: analysis.id,
      companyName: analysis.company_name,
      industry: analysis.industry,
      reportYear: analysis.report_year,
      reportText: report_text.trim(),
    }).catch((err) => {
      console.error(`[API] 파이프라인 오류 (${analysis.id}):`, err);
    });

    return NextResponse.json({
      analysis_id: analysis.id,
      status: 'processing',
    });
  } catch (err) {
    console.error('분석 시작 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

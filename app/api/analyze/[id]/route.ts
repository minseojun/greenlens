import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const STATUS_PROGRESS: Record<string, number> = {
  pending: 0,
  processing: 5,
  stage1: 25,
  stage2: 50,
  stage3: 72,
  stage4: 88,
  completed: 100,
  failed: 0,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: '분석 ID가 필요합니다.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 분석 기본 정보 조회
  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('id, status, company_name, industry, report_year, error_message, created_at')
    .eq('id', id)
    .single();

  if (analysisError || !analysis) {
    return NextResponse.json(
      { error: '분석을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const progress = STATUS_PROGRESS[analysis.status] ?? 0;

  // 완료된 경우 결과도 같이 반환
  if (analysis.status === 'completed') {
    const { data: result } = await supabase
      .from('results')
      .select('*')
      .eq('analysis_id', id)
      .single();

    const { data: claims } = await supabase
      .from('claims')
      .select('*')
      .eq('analysis_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      analysis_id: id,
      status: analysis.status,
      progress: 100,
      analysis,
      result,
      claims: claims ?? [],
    });
  }

  // 처리 중인 경우: 완료된 단계 결과만 포함
  if (['stage2', 'stage3', 'stage4'].includes(analysis.status)) {
    const { data: partialResult } = await supabase
      .from('results')
      .select('stage1_result, stage2_result, stage3_result')
      .eq('analysis_id', id)
      .single();

    return NextResponse.json({
      analysis_id: id,
      status: analysis.status,
      progress,
      partial_result: partialResult,
    });
  }

  return NextResponse.json({
    analysis_id: id,
    status: analysis.status,
    progress,
    error_message: analysis.error_message,
  });
}

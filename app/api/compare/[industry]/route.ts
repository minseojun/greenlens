import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { industry: string } }
) {
  try {
    const industry = decodeURIComponent(params.industry);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('analyses')
      .select(`
        company_name,
        report_year,
        results (score, grade)
      `)
      .eq('industry', industry)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const analyses = (data ?? [])
      .filter((a) => a.results)
      .map((a) => ({
        company_name: a.company_name,
        report_year: a.report_year,
        score: (a.results as { score: number; grade: string }).score,
        grade: (a.results as { score: number; grade: string }).grade,
      }));

    const avgScore =
      analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
        : 0;

    return NextResponse.json({
      industry,
      analyses,
      avg_score: avgScore,
    });
  } catch (err) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';
import {
  Stage1Result,
  Stage2Result,
  Stage3Result,
  Stage4Result,
  ExtractedClaim,
} from '@/types';
import { STAGE1_SYSTEM, buildStage1Prompt } from './prompts/stage1';
import { STAGE2_SYSTEM, buildStage2Prompt } from './prompts/stage2';
import { STAGE3_SKIP_RESULT } from './prompts/stage3';
import { STAGE4_SYSTEM, buildStage4Prompt } from './prompts/stage4';
import type { PipelineContext } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Claude 단일 호출 ─────────────────────────────────────────────────────────

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');
  return content.text;
}

function parseJSON<T>(raw: string): T {
  // 혹시 마크다운 펜스가 포함된 경우 제거
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as T;
}

// ─── DB 상태 업데이트 헬퍼 ───────────────────────────────────────────────────

async function updateStatus(
  analysisId: string,
  status: string,
  extra?: Record<string, unknown>
) {
  const supabase = createAdminClient();
  await supabase
    .from('analyses')
    .update({ status, ...extra })
    .eq('id', analysisId);
}

async function savePartialResult(
  analysisId: string,
  data: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from('results')
    .select('id')
    .eq('analysis_id', analysisId)
    .single();

  if (existing) {
    await supabase.from('results').update(data).eq('analysis_id', analysisId);
  } else {
    await supabase.from('results').insert({ analysis_id: analysisId, ...data });
  }
}

async function saveClaims(analysisId: string, claims: ExtractedClaim[]) {
  const supabase = createAdminClient();
  // 기존 클레임 삭제 후 재삽입
  await supabase.from('claims').delete().eq('analysis_id', analysisId);
  if (claims.length === 0) return;

  await supabase.from('claims').insert(
    claims.map((c) => ({
      analysis_id: analysisId,
      text: c.text,
      type: c.type,
      flag: c.flag,
      penalty_points: c.penalty_points,
      evidence_found: c.evidence_found,
      evidence_type: c.evidence_type,
      stage: 1,
    }))
  );
}

// ─── 파이프라인 메인 ─────────────────────────────────────────────────────────

export async function runAnalysisPipeline(ctx: PipelineContext): Promise<void> {
  const { analysisId, companyName, industry, reportYear, reportText } = ctx;

  try {
    // ── Stage 1: 클레임 추출 + Evidence Gap ──────────────────────────────────
    await updateStatus(analysisId, 'stage1');
    console.log(`[Pipeline ${analysisId}] Stage 1 시작`);

    const s1Raw = await callClaude(
      STAGE1_SYSTEM,
      buildStage1Prompt(reportText, companyName, industry, reportYear),
      6000
    );
    const stage1: Stage1Result = parseJSON<Stage1Result>(s1Raw);

    await savePartialResult(analysisId, { stage1_result: stage1 });
    await saveClaims(analysisId, stage1.claims);
    console.log(`[Pipeline ${analysisId}] Stage 1 완료: ${stage1.total_claims}개 클레임`);

    // ── Stage 2: 외부 DB 교차검증 ────────────────────────────────────────────
    await updateStatus(analysisId, 'stage2');
    console.log(`[Pipeline ${analysisId}] Stage 2 시작`);

    const numericalClaims = stage1.claims.filter(
      (c) => c.type === 'NUMERICAL_CLAIM' || c.type === 'FACTUAL_CLAIM'
    );

    let stage2: Stage2Result;
    if (numericalClaims.length === 0) {
      stage2 = {
        items: [],
        total_discrepancies_suspected: 0,
        summary: '교차검증 대상 수치 주장이 발견되지 않았습니다.',
      };
    } else {
      const s2Raw = await callClaude(
        STAGE2_SYSTEM,
        buildStage2Prompt(numericalClaims, companyName, industry, reportYear),
        3000
      );
      stage2 = parseJSON<Stage2Result>(s2Raw);
    }

    await savePartialResult(analysisId, { stage2_result: stage2 });
    console.log(`[Pipeline ${analysisId}] Stage 2 완료: ${stage2.total_discrepancies_suspected}개 불일치 의심`);

    // ── Stage 3: 시계열 후퇴 탐지 (MVP: 스킵) ───────────────────────────────
    await updateStatus(analysisId, 'stage3');
    const stage3: Stage3Result = STAGE3_SKIP_RESULT as Stage3Result;
    await savePartialResult(analysisId, { stage3_result: stage3 });
    console.log(`[Pipeline ${analysisId}] Stage 3 스킵 (단일 보고서)`);

    // ── Stage 4: 종합 판정 ───────────────────────────────────────────────────
    await updateStatus(analysisId, 'stage4');
    console.log(`[Pipeline ${analysisId}] Stage 4 시작`);

    const s4Raw = await callClaude(
      STAGE4_SYSTEM,
      buildStage4Prompt(stage1, stage2, stage3, companyName, industry, reportYear),
      3000
    );
    const stage4: Stage4Result = parseJSON<Stage4Result>(s4Raw);

    // 최종 결과 저장
    await savePartialResult(analysisId, {
      stage4_result: stage4,
      score: stage4.final_score,
      grade: stage4.grade,
      verdict: stage4.verdict,
      radar_data: stage4.radar_data,
      recommendations: stage4.recommendations,
    });

    await updateStatus(analysisId, 'completed');
    console.log(
      `[Pipeline ${analysisId}] 완료! 점수: ${stage4.final_score} / 등급: ${stage4.grade}`
    );
  } catch (err) {
    console.error(`[Pipeline ${analysisId}] 오류:`, err);
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    await updateStatus(analysisId, 'failed', { error_message: message });
    throw err;
  }
}

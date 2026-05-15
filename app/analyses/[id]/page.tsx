'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PipelineProgress from '@/components/analyze/PipelineProgress';
import ScoreCard from '@/components/results/ScoreCard';
import RadarChart from '@/components/results/RadarChart';
import ClaimsTable from '@/components/results/ClaimsTable';
import StageAccordion from '@/components/results/StageAccordion';
import type { AnalysisStatus, AnalysisResult, Claim, Analysis } from '@/types';

interface PollResponse {
  analysis_id: string;
  status: AnalysisStatus;
  progress: number;
  analysis?: Analysis;
  result?: AnalysisResult;
  claims?: Claim[];
  error_message?: string;
}

const POLL_INTERVAL = 3000; // 3초마다 폴링
const MAX_POLLS = 60; // 최대 3분

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PollResponse | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyze/${id}`);
      if (!res.ok) {
        setIsPolling(false);
        return;
      }
      const json: PollResponse = await res.json();
      setData(json);

      if (json.status === 'completed' || json.status === 'failed') {
        setIsPolling(false);
      }
    } catch {
      // 네트워크 오류는 무시하고 계속 폴링
    }
  }, [id]);

  useEffect(() => {
    if (!isPolling || pollCount >= MAX_POLLS) return;

    poll();
    const timer = setInterval(() => {
      setPollCount((c) => c + 1);
      poll();
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [isPolling, pollCount, poll]);

  // ── 로딩 상태 ────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gl-green/30 border-t-gl-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-mono text-sm">분석 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const { status, progress, result, claims, analysis, error_message } = data;

  return (
    <div className="min-h-screen bg-canvas">
      {/* 배경 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,232,122,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,232,122,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 헤더 */}
      <header className="relative z-10 border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gl-green flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14 7L9 12L4 7L9 2Z" fill="#080C0A"/>
              <path d="M9 7L14 12L9 17L4 12L9 7Z" fill="#080C0A" opacity="0.5"/>
            </svg>
          </div>
          <span className="font-display text-lg text-text-primary">GreenLens</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/analyze" className="btn-secondary text-sm py-2 px-4">
            새 분석
          </Link>
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-mono">
            대시보드
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* ── 분석 중 ── */}
        {status !== 'completed' && status !== 'failed' && (
          <div className="max-w-lg mx-auto">
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl text-text-primary mb-2">
                AI 분석 진행 중
              </h1>
              {analysis && (
                <p className="text-text-secondary font-mono text-sm">
                  {analysis.company_name} · {analysis.industry} · {analysis.report_year}년
                </p>
              )}
            </div>
            <PipelineProgress status={status} progress={progress} />
          </div>
        )}

        {/* ── 실패 ── */}
        {status === 'failed' && (
          <div className="max-w-lg mx-auto text-center">
            <div className="card border-red-900">
              <div className="text-5xl mb-4">⚠</div>
              <h2 className="font-display text-2xl text-red-400 mb-3">분석 실패</h2>
              <p className="text-text-secondary mb-6">
                {error_message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
              </p>
              <Link href="/analyze" className="btn-primary">
                다시 시도
              </Link>
            </div>
          </div>
        )}

        {/* ── 완료 ── */}
        {status === 'completed' && result && (
          <div className="space-y-6 animate-fade-in">
            {/* 분석 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl text-text-primary mb-1">
                  분석 완료
                </h1>
                {analysis && (
                  <p className="text-text-muted font-mono text-sm">
                    {analysis.company_name} · {analysis.industry} · {analysis.report_year}년 보고서
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="label mb-1">분석 ID</p>
                <p className="font-mono text-xs text-text-muted">{id.slice(0, 8)}...</p>
              </div>
            </div>

            {/* 점수 카드 */}
            <ScoreCard
              score={result.score}
              grade={result.grade}
              companyName={analysis?.company_name ?? ''}
              industry={analysis?.industry ?? ''}
              reportYear={analysis?.report_year ?? 0}
              verdict={result.verdict}
            />

            {/* 레이더 차트 + 클레임 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.radar_data && (
                <RadarChart data={result.radar_data} score={result.score} />
              )}

              {/* 빠른 요약 카드 */}
              <div className="card space-y-4">
                <h3 className="text-text-primary font-semibold">클레임 요약</h3>
                {claims && claims.length > 0 ? (
                  <div className="space-y-3">
                    {[
                      {
                        label: '위험 클레임',
                        count: claims.filter((c) => c.flag === 'red').length,
                        className: 'text-red-400',
                        bg: 'bg-red-950/30',
                      },
                      {
                        label: '주의 클레임',
                        count: claims.filter((c) => c.flag === 'amber').length,
                        className: 'text-amber-400',
                        bg: 'bg-amber-950/30',
                      },
                      {
                        label: '양호 클레임',
                        count: claims.filter((c) => c.flag === 'green').length,
                        className: 'text-gl-green',
                        bg: 'bg-gl-green-muted',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 ${item.bg}`}
                      >
                        <span className="text-text-secondary text-sm">{item.label}</span>
                        <span className={`font-mono font-bold text-lg ${item.className}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-panel border border-border">
                      <span className="text-text-secondary text-sm">총 클레임</span>
                      <span className="font-mono font-bold text-lg text-text-primary">
                        {claims.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">클레임 데이터 없음</p>
                )}
              </div>
            </div>

            {/* 클레임 상세 테이블 */}
            {claims && claims.length > 0 && <ClaimsTable claims={claims} />}

            {/* 단계별 아코디언 */}
            <StageAccordion
              stage1={result.stage1_result}
              stage2={result.stage2_result}
              stage4={result.stage4_result}
              recommendations={result.recommendations}
            />

            {/* 하단 액션 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/analyze" className="btn-primary flex-1 text-center py-3">
                새 보고서 분석
              </Link>
              <Link href="/dashboard" className="btn-secondary flex-1 text-center py-3">
                대시보드로 이동
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

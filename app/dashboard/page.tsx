'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Grade } from '@/types';

interface AnalysisItem {
  id: string;
  company_name: string;
  industry: string;
  report_year: number;
  status: string;
  created_at: string;
  results?: {
    score: number;
    grade: Grade;
    verdict: string;
  };
}

const GRADE_LABELS: Record<Grade, { label: string; class: string }> = {
  trusted: { label: '신뢰 가능', class: 'badge-trusted' },
  suspicious: { label: '부분 의심', class: 'badge-suspicious' },
  critical: { label: '심각 의심', class: 'badge-critical' },
};

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyses')
      .then((r) => r.json())
      .then((data) => {
        setAnalyses(data.analyses ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const completed = analyses.filter((a) => a.status === 'completed');
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, a) => sum + (a.results?.score ?? 0), 0) /
            completed.length
        )
      : null;

  return (
    <div className="min-h-screen bg-canvas">
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
        <Link href="/analyze" className="btn-primary text-sm py-2.5 px-5">
          새 분석 시작
        </Link>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-text-primary mb-2">대시보드</h1>
          <p className="text-text-muted font-mono text-sm">분석 이력 및 신뢰도 추이</p>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '총 분석', value: analyses.length, unit: '건' },
            { label: '완료', value: completed.length, unit: '건' },
            {
              label: '평균 점수',
              value: avgScore ?? '—',
              unit: avgScore !== null ? '점' : '',
            },
            {
              label: '위험 등급',
              value: completed.filter((a) => a.results?.grade === 'critical').length,
              unit: '건',
            },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="label mb-2">{stat.label}</div>
              <div className="text-3xl font-mono font-bold text-text-primary">
                {stat.value}
                <span className="text-sm text-text-muted ml-1">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 분석 이력 */}
        <div className="card">
          <h2 className="text-text-primary font-semibold mb-5">분석 이력</h2>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-gl-green/30 border-t-gl-green rounded-full animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm font-mono">불러오는 중...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-text-muted text-4xl mb-4">📊</p>
              <p className="text-text-secondary mb-2">아직 분석 이력이 없습니다</p>
              <Link href="/analyze" className="btn-primary mt-4 inline-block">
                첫 번째 보고서 분석하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((a) => (
                <Link
                  key={a.id}
                  href={`/analyses/${a.id}`}
                  className="flex items-center justify-between p-4 bg-panel rounded-xl border border-border hover:border-border-bright transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* 점수 */}
                    <div className="w-12 h-12 rounded-lg bg-canvas border border-border flex items-center justify-center flex-shrink-0">
                      {a.results ? (
                        <span
                          className={`font-mono font-bold text-sm ${
                            a.results.grade === 'trusted'
                              ? 'text-gl-green'
                              : a.results.grade === 'suspicious'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {a.results.score}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs font-mono">
                          {a.status === 'failed' ? '✕' : '...'}
                        </span>
                      )}
                    </div>

                    {/* 정보 */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-semibold text-sm">
                          {a.company_name}
                        </span>
                        {a.results && (
                          <span className={GRADE_LABELS[a.results.grade].class}>
                            {GRADE_LABELS[a.results.grade].label}
                          </span>
                        )}
                        {a.status !== 'completed' && a.status !== 'failed' && (
                          <span className="text-xs font-mono text-gl-green animate-pulse">
                            분석 중
                          </span>
                        )}
                        {a.status === 'failed' && (
                          <span className="text-xs font-mono text-red-400">실패</span>
                        )}
                      </div>
                      <div className="text-text-muted text-xs font-mono mt-0.5">
                        {a.industry} · {a.report_year}년 ·{' '}
                        {new Date(a.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-text-muted group-hover:text-text-secondary transition-colors"
                  >
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

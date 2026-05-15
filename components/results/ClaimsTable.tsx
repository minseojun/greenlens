'use client';

import { useState } from 'react';
import type { Claim } from '@/types';

interface ClaimsTableProps {
  claims: Claim[];
}

const TYPE_LABELS = {
  FACTUAL_CLAIM: '사실 주장',
  INTENTION_DECLARATION: '의도 선언',
  NUMERICAL_CLAIM: '수치 주장',
  VAGUE_RHETORIC: '모호한 수사',
};

const EVIDENCE_LABELS = {
  NUMERICAL: '수치 근거',
  METHODOLOGY: '방법론',
  THIRD_PARTY: '제3자 검증',
  ROADMAP: '로드맵',
  NONE: '없음',
};

export default function ClaimsTable({ claims }: ClaimsTableProps) {
  const [filter, setFilter] = useState<'all' | 'red' | 'amber' | 'green'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? claims : claims.filter((c) => c.flag === filter);
  const redCount = claims.filter((c) => c.flag === 'red').length;
  const amberCount = claims.filter((c) => c.flag === 'amber').length;
  const greenCount = claims.filter((c) => c.flag === 'green').length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-text-primary font-semibold">
          클레임 분석 결과
          <span className="ml-2 text-text-muted text-sm font-normal font-mono">
            총 {claims.length}건
          </span>
        </h3>

        {/* 필터 */}
        <div className="flex items-center gap-2">
          {[
            { key: 'all' as const, label: `전체 ${claims.length}` },
            { key: 'red' as const, label: `위험 ${redCount}` },
            { key: 'amber' as const, label: `주의 ${amberCount}` },
            { key: 'green' as const, label: `양호 ${greenCount}` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all duration-200 ${
                filter === key
                  ? key === 'red'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : key === 'amber'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : key === 'green'
                    ? 'bg-gl-green-muted text-gl-green border border-gl-green/30'
                    : 'bg-border text-text-primary border border-border-bright'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted font-mono text-sm">
          해당 항목이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((claim) => (
            <div
              key={claim.id}
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                claim.flag === 'red'
                  ? 'border-red-900 bg-red-950/20'
                  : claim.flag === 'amber'
                  ? 'border-amber-900 bg-amber-950/20'
                  : 'border-border bg-panel/50'
              }`}
            >
              <button
                className="w-full flex items-start gap-3 p-4 text-left"
                onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}
              >
                {/* 플래그 도트 */}
                <div className="flex-shrink-0 mt-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      claim.flag === 'red'
                        ? 'bg-red-400'
                        : claim.flag === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-gl-green'
                    }`}
                  />
                </div>

                {/* 주장 텍스트 */}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm leading-relaxed">
                    {claim.text}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs font-mono text-text-muted bg-border px-2 py-0.5 rounded">
                      {TYPE_LABELS[claim.type]}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        claim.evidence_found
                          ? 'bg-gl-green-muted text-gl-green-dim'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      증거: {claim.evidence_type ? EVIDENCE_LABELS[claim.evidence_type as keyof typeof EVIDENCE_LABELS] : '없음'}
                    </span>
                    {claim.penalty_points > 0 && (
                      <span className="text-xs font-mono text-red-400">
                        -{claim.penalty_points}점
                      </span>
                    )}
                  </div>
                </div>

                {/* 확장 버튼 */}
                <div className="flex-shrink-0 text-text-muted">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className={`transition-transform duration-200 ${
                      expandedId === claim.id ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

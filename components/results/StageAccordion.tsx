'use client';

import { useState } from 'react';
import type { Stage1Result, Stage2Result, Stage4Result } from '@/types';

interface StageAccordionProps {
  stage1?: Stage1Result | null;
  stage2?: Stage2Result | null;
  stage4?: Stage4Result | null;
  recommendations?: string[];
}

function AccordionItem({
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-text-primary font-semibold">{title}</h3>
            {badge}
          </div>
          <p className="text-text-muted text-xs font-mono mt-0.5">{subtitle}</p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`flex-shrink-0 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-border animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function StageAccordion({
  stage1,
  stage2,
  stage4,
  recommendations,
}: StageAccordionProps) {
  return (
    <div className="space-y-4">
      {/* Stage 1 */}
      {stage1 && (
        <AccordionItem
          title="1단계 — 클레임 추출 및 Evidence Gap"
          subtitle={`${stage1.total_claims}개 주장 분석 · ${stage1.missing_gri_items.length}개 GRI 항목 누락`}
          badge={
            stage1.has_third_party_verification ? (
              <span className="badge-trusted text-xs">제3자 검증 ✓</span>
            ) : (
              <span className="badge-suspicious text-xs">제3자 검증 없음</span>
            )
          }
          defaultOpen
        >
          <div className="space-y-4">
            <p className="text-text-secondary text-sm leading-relaxed">{stage1.summary}</p>

            {stage1.missing_gri_items.length > 0 && (
              <div>
                <div className="label mb-2">누락된 GRI/TCFD 항목</div>
                <div className="flex flex-wrap gap-2">
                  {stage1.missing_gri_items.map((item, i) => (
                    <span key={i} className="badge-amber">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 클레임 유형 통계 */}
            <div>
              <div className="label mb-2">클레임 유형 분포</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(
                  [
                    ['FACTUAL_CLAIM', '사실 주장'],
                    ['INTENTION_DECLARATION', '의도 선언'],
                    ['NUMERICAL_CLAIM', '수치 주장'],
                    ['VAGUE_RHETORIC', '모호한 수사'],
                  ] as const
                ).map(([type, label]) => {
                  const count = stage1.claims.filter((c) => c.type === type).length;
                  return (
                    <div key={type} className="bg-panel rounded-lg p-3 text-center">
                      <div className="text-xl font-mono font-bold text-text-primary">{count}</div>
                      <div className="text-xs text-text-muted mt-0.5">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AccordionItem>
      )}

      {/* Stage 2 */}
      {stage2 && (
        <AccordionItem
          title="2단계 — 외부 DB 교차검증"
          subtitle={`${stage2.items.length}개 수치 검증 · ${stage2.total_discrepancies_suspected}개 불일치 의심`}
          badge={
            stage2.total_discrepancies_suspected > 0 ? (
              <span className="badge-critical text-xs">
                불일치 {stage2.total_discrepancies_suspected}건
              </span>
            ) : (
              <span className="badge-trusted text-xs">이상 없음</span>
            )
          }
        >
          <div className="space-y-4">
            <p className="text-text-secondary text-sm leading-relaxed">{stage2.summary}</p>

            {stage2.items.length > 0 && (
              <div className="space-y-3">
                {stage2.items.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-4 border ${
                      item.discrepancy_suspected
                        ? item.suspicion_level === 'high'
                          ? 'bg-red-950/20 border-red-900'
                          : 'bg-amber-950/20 border-amber-900'
                        : 'bg-panel border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-text-primary text-sm flex-1">{item.claim_text}</p>
                      <span
                        className={`text-xs font-mono flex-shrink-0 ${
                          item.suspicion_level === 'high'
                            ? 'text-red-400'
                            : item.suspicion_level === 'medium'
                            ? 'text-amber-400'
                            : 'text-gl-green'
                        }`}
                      >
                        {item.suspicion_level === 'high'
                          ? '고위험'
                          : item.suspicion_level === 'medium'
                          ? '중위험'
                          : '저위험'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-text-muted font-mono">
                      검증 DB: {item.public_db_source}
                    </div>
                    {item.discrepancy_detail && (
                      <p className="mt-2 text-xs text-amber-400">{item.discrepancy_detail}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccordionItem>
      )}

      {/* Stage 4: 점수 내역 */}
      {stage4 && (
        <AccordionItem
          title="4단계 — 점수 산출 내역"
          subtitle="가중 페널티 기반 신뢰도 점수 계산"
        >
          <div className="space-y-4">
            <div className="bg-panel rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex justify-between">
                <span className="text-text-secondary text-sm">기본 점수</span>
                <span className="text-text-primary font-mono">+{stage4.score_breakdown.base_score}</span>
              </div>

              {stage4.score_breakdown.penalties.map((p, i) => (
                <div key={i} className="px-4 py-3 border-b border-border flex justify-between">
                  <span className="text-text-secondary text-sm">
                    {p.reason}
                    <span className="text-text-muted ml-1 text-xs">({p.count}건)</span>
                  </span>
                  <span className="text-red-400 font-mono">-{p.points * p.count}</span>
                </div>
              ))}

              {stage4.score_breakdown.bonuses.map((b, i) => (
                <div key={i} className="px-4 py-3 border-b border-border flex justify-between">
                  <span className="text-text-secondary text-sm">{b.reason}</span>
                  <span className="text-gl-green font-mono">+{b.points}</span>
                </div>
              ))}

              <div className="px-4 py-3 bg-gl-green-muted flex justify-between">
                <span className="text-text-primary font-semibold">최종 신뢰도 점수</span>
                <span className="text-gl-green font-mono font-bold text-lg">
                  {stage4.final_score}점
                </span>
              </div>
            </div>
          </div>
        </AccordionItem>
      )}

      {/* 개선 권고사항 */}
      {recommendations && recommendations.length > 0 && (
        <AccordionItem
          title="개선 권고사항"
          subtitle="AI가 생성한 맞춤형 개선 제안"
          defaultOpen
        >
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gl-green-muted border border-gl-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gl-green text-xs font-mono">{i + 1}</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </AccordionItem>
      )}
    </div>
  );
}

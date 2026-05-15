'use client';

import type { Grade } from '@/types';

interface ScoreCardProps {
  score: number;
  grade: Grade;
  companyName: string;
  industry: string;
  reportYear: number;
  verdict: string;
}

const GRADE_CONFIG = {
  trusted: {
    label: '신뢰 가능',
    color: 'text-gl-green',
    borderColor: 'border-gl-green/30',
    bgColor: 'bg-gl-green-muted',
    badgeClass: 'badge-trusted',
    description: 'ESG 주장에 충분한 근거가 있습니다',
    icon: '✓',
  },
  suspicious: {
    label: '부분적 그린워싱 의심',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-950/30',
    badgeClass: 'badge-suspicious',
    description: '일부 주장에 근거가 부족합니다',
    icon: '⚠',
  },
  critical: {
    label: '심각한 그린워싱 의심',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-950/30',
    badgeClass: 'badge-critical',
    description: '다수의 근거 없는 환경 주장이 발견됩니다',
    icon: '✕',
  },
} as const;

export default function ScoreCard({
  score,
  grade,
  companyName,
  industry,
  reportYear,
  verdict,
}: ScoreCardProps) {
  const config = GRADE_CONFIG[grade];

  // 점수 게이지 각도 (0~100 → 0~180도)
  const angle = (score / 100) * 180;
  const radius = 80;
  const cx = 100;
  const cy = 100;

  // 반원 호 좌표 계산
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startAngle = 180; // 왼쪽에서 시작
  const endAngle = 180 - angle;
  
  const arcX = cx + radius * Math.cos(toRad(endAngle));
  const arcY = cy + radius * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className={`card border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* 게이지 차트 */}
        <div className="flex-shrink-0">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* 배경 반원 */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1E2B20"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* 점수 호 */}
            {angle > 0 && (
              <path
                d={`M 20 100 A 80 80 0 ${largeArc} 1 ${arcX} ${arcY}`}
                fill="none"
                stroke={
                  grade === 'trusted'
                    ? '#00E87A'
                    : grade === 'suspicious'
                    ? '#F59E0B'
                    : '#EF4444'
                }
                strokeWidth="12"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${
                    grade === 'trusted'
                      ? 'rgba(0,232,122,0.4)'
                      : grade === 'suspicious'
                      ? 'rgba(245,158,11,0.4)'
                      : 'rgba(239,68,68,0.4)'
                  })`,
                }}
              />
            )}
            {/* 점수 텍스트 */}
            <text
              x="100"
              y="90"
              textAnchor="middle"
              className={`font-mono font-bold ${config.color}`}
              fill="currentColor"
              fontSize="42"
              fontFamily="Space Mono, monospace"
              fontWeight="700"
            >
              {score}
            </text>
            <text
              x="100"
              y="108"
              textAnchor="middle"
              fill="#4A6B50"
              fontSize="11"
              fontFamily="Space Mono, monospace"
            >
              / 100
            </text>
            {/* 눈금 */}
            <text x="16" y="116" fill="#4A6B50" fontSize="9" fontFamily="Space Mono, monospace">0</text>
            <text x="92" y="24" fill="#4A6B50" fontSize="9" fontFamily="Space Mono, monospace">50</text>
            <text x="178" y="116" fill="#4A6B50" fontSize="9" fontFamily="Space Mono, monospace">100</text>
          </svg>
        </div>

        {/* 판정 정보 */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
            <div className={companyName ? 'text-lg font-semibold text-text-primary' : ''}>
              {companyName}
            </div>
            <span className="text-text-muted text-sm font-mono">
              {industry} · {reportYear}년
            </span>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
            <span className={`text-3xl ${config.color}`}>{config.icon}</span>
            <div>
              <div className={`text-xl font-bold ${config.color}`}>{config.label}</div>
              <div className="text-text-muted text-sm">{config.description}</div>
            </div>
          </div>

          <p className="text-text-secondary text-sm leading-relaxed border-l-2 border-border pl-4">
            {verdict}
          </p>
        </div>
      </div>
    </div>
  );
}

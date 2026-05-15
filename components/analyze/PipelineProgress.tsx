'use client';

import { PIPELINE_STAGES } from '@/types';
import type { AnalysisStatus } from '@/types';

interface PipelineProgressProps {
  status: AnalysisStatus;
  progress: number;
}

const STATUS_TO_ACTIVE_STAGE: Record<string, number> = {
  pending: 0,
  processing: 0,
  stage1: 1,
  stage2: 2,
  stage3: 3,
  stage4: 4,
  completed: 5,
  failed: -1,
};

export default function PipelineProgress({ status, progress }: PipelineProgressProps) {
  const activeStage = STATUS_TO_ACTIVE_STAGE[status] ?? 0;

  return (
    <div className="card">
      {/* 전체 진행률 바 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="label">분석 진행 중</span>
          <span className="font-mono text-sm text-gl-green">{progress}%</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gl-green rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="space-y-4">
        {PIPELINE_STAGES.map((stage) => {
          const isDone = activeStage > stage.id;
          const isRunning = activeStage === stage.id;
          const isWaiting = activeStage < stage.id;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 transition-opacity duration-300 ${
                isWaiting ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* 상태 아이콘 */}
              <div className="flex-shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-7 h-7 rounded-full bg-gl-green-muted border border-gl-green flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="#00E87A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : isRunning ? (
                  <div className="w-7 h-7 rounded-full border border-gl-green bg-gl-green-muted flex items-center justify-center scan-overlay">
                    <div className="w-2 h-2 rounded-full bg-gl-green animate-pulse" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center">
                    <span className="text-xs font-mono text-text-muted">{stage.id}</span>
                  </div>
                )}
              </div>

              {/* 단계 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-sm font-semibold ${
                      isDone
                        ? 'text-gl-green'
                        : isRunning
                        ? 'text-text-primary'
                        : 'text-text-muted'
                    }`}
                  >
                    {stage.name}
                  </span>
                  {isRunning && (
                    <span className="text-xs font-mono text-gl-green animate-pulse">
                      처리 중...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-xs font-mono text-gl-green-dim">완료</span>
                  )}
                </div>
                <p className="text-xs text-text-muted">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-text-muted text-center font-mono">
          Claude AI가 보고서를 분석하는 중입니다 · 약 30~60초 소요
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import UploadForm from '@/components/analyze/UploadForm';

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* 상단 그리드 배경 */}
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
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-mono">
            대시보드
          </Link>
        </nav>
      </header>

      {/* 메인 */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gl-green animate-pulse" />
            <span className="label text-gl-green-dim">ESG 그린워싱 탐지 AI</span>
          </div>
          <h1 className="font-display text-4xl text-text-primary mb-3">
            보고서 분석 시작
          </h1>
          <p className="text-text-secondary">
            ESG/지속가능경영 보고서를 업로드하면 AI가 4단계 파이프라인으로
            그린워싱 여부를 탐지하고 신뢰도 점수를 산출합니다.
          </p>
        </div>

        <UploadForm />
      </main>
    </div>
  );
}

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* 배경 그리드 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,232,122,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,232,122,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 상단 글로우 */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0,232,122,0.08) 0%, transparent 70%)',
        }}
      />

      {/* 헤더 */}
      <header className="relative z-10 border-b border-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gl-green flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14 7L9 12L4 7L9 2Z" fill="#080C0A" stroke="#080C0A" strokeWidth="0.5"/>
              <path d="M9 7L14 12L9 17L4 12L9 7Z" fill="#080C0A" opacity="0.5"/>
            </svg>
          </div>
          <span className="font-display text-xl text-text-primary">GreenLens</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">기능</a>
          <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">분석 방식</a>
          <Link href="/analyze" className="btn-primary text-sm px-5 py-2.5">
            무료로 시작하기
          </Link>
        </nav>
      </header>

      {/* 히어로 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-gl-green-muted border border-gl-green/20 text-gl-green text-xs font-mono px-4 py-2 rounded-full mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gl-green animate-pulse" />
          AI 기반 ESG 그린워싱 탐지
        </div>

        <h1 className="font-display text-5xl md:text-7xl text-text-primary mb-6 leading-tight animate-slide-up">
          기업의 ESG 주장,<br />
          <span className="text-gl-green">진짜인지 확인하세요</span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mb-12 leading-relaxed animate-slide-up animation-delay-100">
          GreenLens는 ESG 보고서를 AI로 분석해 의미 없는 선언과 실제 근거를 구별하고,
          0~100 신뢰도 점수로 그린워싱 위험을 정확히 진단합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-200">
          <Link href="/analyze" className="btn-primary text-base px-8 py-4">
            보고서 분석 시작 →
          </Link>
          <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">
            분석 방식 보기
          </a>
        </div>

        {/* 신뢰도 점수 데모 카드 */}
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-md w-full animate-fade-in animation-delay-300">
          {[
            { score: 82, grade: 'trusted', company: 'A기업', label: '신뢰 가능' },
            { score: 54, grade: 'suspicious', company: 'B기업', label: '의심' },
            { score: 23, grade: 'critical', company: 'C기업', label: '위험' },
          ].map((item) => (
            <div key={item.company} className="card text-center p-4">
              <div className="label mb-2">{item.company}</div>
              <div
                className={`text-3xl font-mono font-bold mb-1 ${
                  item.grade === 'trusted'
                    ? 'text-gl-green'
                    : item.grade === 'suspicious'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {item.score}
              </div>
              <div className="text-xs text-text-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* 기능 섹션 */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl text-text-primary mb-4">
            4단계 정밀 분석 파이프라인
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            단순 키워드 검색을 넘어, 의미 기반 클레임 추출부터 공공 DB 교차검증까지
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              step: '01',
              title: '의미 기반 클레임 추출',
              desc: 'LLM으로 환경 관련 주장을 4가지 유형으로 분류하고, 각 주장의 내부 증거 존재 여부를 판단합니다.',
              tag: 'Evidence Gap Analysis',
            },
            {
              step: '02',
              title: '외부 DB 교차검증',
              desc: 'DART 전자공시, 온실가스종합정보센터 등 공공 DB와 보고서 수치를 대조해 불일치를 탐지합니다.',
              tag: 'DART · GHG Registry',
            },
            {
              step: '03',
              title: '시계열 후퇴 탐지',
              desc: '과거 보고서와 비교해 목표 수치 하향, 지표 삭제, 언어 강도 완화 패턴을 자동 감지합니다.',
              tag: '5개년 추이 분석',
            },
            {
              step: '04',
              title: '가중 페널티 점수 산출',
              desc: '근거 없는 선언(-8점), 수치 불일치(-15점) 등 가중 페널티로 0~100 신뢰도 점수를 계산합니다.',
              tag: '레이더 차트 시각화',
            },
          ].map((f) => (
            <div key={f.step} className="card-hover">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gl-green-muted border border-gl-green/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gl-green font-mono text-sm font-bold">{f.step}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-text-primary font-semibold">{f.title}</h3>
                    <span className="badge-green">{f.tag}</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto card glow-green">
          <h2 className="font-display text-3xl text-text-primary mb-4">
            지금 바로 분석을 시작하세요
          </h2>
          <p className="text-text-secondary mb-8">
            PDF 업로드 또는 텍스트 직접 입력, 30~60초 안에 결과를 확인하세요
          </p>
          <Link href="/analyze" className="btn-primary text-base px-10 py-4">
            무료 분석 시작 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 border-t border-border px-8 py-6 text-center">
        <p className="text-text-muted text-sm font-mono">
          © 2025 GreenLens · ESG Greenwashing Detection AI
        </p>
      </footer>
    </div>
  );
}

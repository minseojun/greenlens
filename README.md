# GreenLens — ESG 그린워싱 탐지 AI

> 기업 ESG 보고서를 AI로 분석해 그린워싱 여부를 탐지하고 신뢰도 점수를 제공하는 B2B SaaS 플랫폼

## 기술 스택

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI**: Anthropic Claude Sonnet 4 API (4단계 파이프라인)
- **DB**: Supabase (PostgreSQL + Storage + Auth)
- **배포**: Vercel (maxDuration 60s)

---

## 로컬 개발 세팅

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local.example`을 `.env.local`로 복사하고 값 채우기:

```bash
cp .env.local.example .env.local
```

필요한 값:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (API Route용)
- `ANTHROPIC_API_KEY`: Anthropic API key

### 3. Supabase 세팅

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial.sql` 실행
3. Storage에서 `reports` 버킷 생성 (Public 또는 Private)

### 4. 개발 서버 시작

```bash
npm run dev
```

---

## 프로젝트 구조

```
app/
├── page.tsx                    # 랜딩 페이지
├── analyze/page.tsx            # 보고서 업로드 + 분석 시작
├── analyses/[id]/page.tsx      # 분석 결과 + 폴링
├── dashboard/page.tsx          # 이력 대시보드
└── api/
    ├── analyze/route.ts        # POST: 분석 시작
    ├── analyze/[id]/route.ts   # GET: 상태/결과 조회
    ├── analyses/route.ts       # GET: 이력 목록
    ├── upload/pdf/route.ts     # POST: PDF → 텍스트
    └── compare/[industry]/route.ts

components/
├── analyze/
│   ├── UploadForm.tsx          # 업로드 + 기업 정보 입력
│   └── PipelineProgress.tsx    # 4단계 진행 실시간 표시
└── results/
    ├── ScoreCard.tsx           # 신뢰도 점수 게이지
    ├── RadarChart.tsx          # 5축 레이더 차트 (Recharts)
    ├── ClaimsTable.tsx         # 클레임 목록 + 필터
    └── StageAccordion.tsx      # 단계별 상세 + 개선 권고

lib/
├── claude/
│   ├── pipeline.ts             # 4단계 Claude API 오케스트레이터
│   └── prompts/                # Stage 1~4 프롬프트
└── supabase/                   # 클라이언트 (브라우저/서버/어드민)
```

---

## 분석 파이프라인

1. **Stage 1** — 클레임 추출 + Evidence Gap Analysis
   - 4가지 유형 분류 (FACTUAL/INTENTION/NUMERICAL/VAGUE)
   - 증거 유무 판단 (NUMERICAL/METHODOLOGY/THIRD_PARTY/ROADMAP/NONE)
   - GRI/TCFD 항목 충족 여부 체크

2. **Stage 2** — 외부 DB 교차검증
   - DART, 온실가스종합정보센터, KEMCO 대조
   - 불일치 의심 항목 플래그

3. **Stage 3** — 시계열 후퇴 탐지 (MVP: 스킵)

4. **Stage 4** — 종합 판정
   - 가중 페널티 점수 산출 (0~100)
   - 5축 레이더 차트 데이터
   - 개선 권고사항 생성

---

## Vercel 배포

1. Vercel에 프로젝트 연결
2. Environment Variables에 `.env.local` 값 추가
3. `vercel.json`에 의해 분석 API는 maxDuration 60s 적용

---

## 향후 개발 예정

- [ ] Supabase Auth 연동 (이메일/구글 로그인)
- [ ] 시계열 분석 (과거 보고서 복수 업로드)
- [ ] PDF 리포트 다운로드
- [ ] 업종 내 비교 대시보드 차트
- [ ] DART API 실제 연동

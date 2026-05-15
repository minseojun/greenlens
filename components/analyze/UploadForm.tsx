'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { INDUSTRIES } from '@/types';

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'pdf' | 'text'>('pdf');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [reportYear, setReportYear] = useState(new Date().getFullYear() - 1);
  const [reportText, setReportText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setError('PDF 파일만 업로드 가능합니다.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!companyName.trim()) { setError('기업명을 입력해주세요.'); return; }
    if (!industry) { setError('업종을 선택해주세요.'); return; }
    if (mode === 'pdf' && !pdfFile) { setError('PDF 파일을 업로드해주세요.'); return; }
    if (mode === 'text' && reportText.trim().length < 100) {
      setError('보고서 텍스트를 최소 100자 이상 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalText = reportText;
      let pdfUrl: string | undefined;

      // PDF → 텍스트 추출
      if (mode === 'pdf' && pdfFile) {
        setUploadProgress('PDF 텍스트 추출 중...');
        const formData = new FormData();
        formData.append('file', pdfFile);

        const uploadRes = await fetch('/api/upload/pdf', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const { error: uploadError } = await uploadRes.json();
          throw new Error(uploadError || 'PDF 업로드에 실패했습니다.');
        }

        const { text, pdf_url, truncated } = await uploadRes.json();
        finalText = text;
        pdfUrl = pdf_url;

        if (truncated) {
          setUploadProgress('텍스트가 너무 길어 일부를 분석합니다...');
        }
      }

      // 분석 시작
      setUploadProgress('AI 분석 파이프라인 시작 중...');

      // 80,000자 초과 시 잘라서 전송
      const truncatedText = finalText.length > 80000
        ? finalText.slice(0, 48000) + '\n\n[... 중간 내용 생략 ...]\n\n' + finalText.slice(-32000)
        : finalText;

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName.trim(),
          industry,
          report_year: reportYear,
          report_text: truncatedText,
          pdf_url: pdfUrl,
        }),
      });

      if (!analyzeRes.ok) {
        const { error: analyzeError } = await analyzeRes.json();
        throw new Error(analyzeError || '분석 시작에 실패했습니다.');
      }

      const { analysis_id } = await analyzeRes.json();
      router.push(`/analyses/${analysis_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* 기업 정보 */}
      <div className="card">
        <h2 className="text-text-primary font-semibold mb-5">기업 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="label block mb-2">기업명 *</label>
            <input
              type="text"
              className="input"
              placeholder="예: 삼성전자"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="label block mb-2">업종 *</label>
            <select
              className="select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">선택하세요</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-2">보고서 연도 *</label>
            <select
              className="select"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              disabled={isSubmitting}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 보고서 입력 */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-primary font-semibold">보고서 입력</h2>
          {/* 모드 토글 */}
          <div className="flex bg-panel border border-border rounded-lg p-1">
            {(['pdf', 'text'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={isSubmitting}
                className={`px-4 py-1.5 rounded-md text-sm font-mono transition-all duration-200 ${
                  mode === m
                    ? 'bg-gl-green text-canvas font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {m === 'pdf' ? 'PDF 업로드' : '텍스트 입력'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'pdf' ? (
          <div>
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-gl-green bg-gl-green-muted'
                  : pdfFile
                  ? 'border-gl-green-dim bg-gl-green-muted/50'
                  : 'border-border hover:border-border-bright hover:bg-panel'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {pdfFile ? (
                <div>
                  <div className="text-gl-green text-3xl mb-2">✓</div>
                  <p className="text-text-primary font-mono text-sm">{pdfFile.name}</p>
                  <p className="text-text-muted text-xs mt-1">
                    {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                    className="text-xs text-text-muted hover:text-red-400 mt-2 font-mono transition-colors"
                  >
                    파일 제거
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3 opacity-40">📄</div>
                  <p className="text-text-secondary text-sm mb-1">
                    PDF를 드래그하거나 클릭해서 업로드
                  </p>
                  <p className="text-text-muted text-xs">최대 10MB · PDF 전용</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div>
            <textarea
              className="textarea h-64"
              placeholder="ESG/지속가능경영 보고서 텍스트를 붙여넣으세요...&#10;&#10;최소 100자 이상, 분석 정확도를 위해 환경 관련 섹션 전체를 입력해주세요."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-text-muted font-mono">
                {reportText.length.toLocaleString()}자
              </span>
              {reportText.length > 80000 && (
                <span className="text-xs text-amber-400 font-mono">
                  80,000자 초과 시 일부 생략 후 분석
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="btn-primary w-full py-4 text-base relative"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
            {uploadProgress || 'AI 분석 중...'}
          </span>
        ) : (
          'AI 그린워싱 분석 시작 →'
        )}
      </button>

      <p className="text-center text-xs text-text-muted font-mono">
        분석에 30~60초가 소요됩니다 · Claude Sonnet 4 기반
      </p>
    </div>
  );
}

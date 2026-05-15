import type { Metadata } from 'next';
import { DM_Serif_Display, Space_Mono, Inter } from 'next/font/google';
import './globals.css';

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GreenLens — ESG 그린워싱 탐지 AI',
  description: '기업 ESG 보고서를 AI로 분석해 그린워싱 여부를 탐지하고 신뢰도 점수를 제공합니다.',
  keywords: ['ESG', '그린워싱', 'Greenwashing', '지속가능경영', 'AI 분석'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${dmSerif.variable} ${spaceMono.variable} ${inter.variable}`}>
      <body className="bg-canvas text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}

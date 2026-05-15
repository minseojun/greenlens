'use client';

import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { RadarData } from '@/types';

interface RadarChartProps {
  data: RadarData;
  score: number;
}

const AXIS_LABELS: Record<keyof RadarData, string> = {
  exaggeration: '과장성',
  vagueness: '모호성',
  data_missing: '수치 누락',
  standard_gap: '기준 불일치',
  regression: '전년 후퇴',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-border rounded-lg px-3 py-2">
        <p className="text-text-primary text-xs font-mono">
          {payload[0].value}점
        </p>
      </div>
    );
  }
  return null;
};

export default function RadarChart({ data, score }: RadarChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    axis: AXIS_LABELS[key as keyof RadarData],
    value,
    fullMark: 100,
  }));

  // 점수에 따른 레이더 색상
  const color =
    score >= 70 ? '#00E87A' : score >= 40 ? '#F59E0B' : '#EF4444';
  const fillColor =
    score >= 70
      ? 'rgba(0,232,122,0.15)'
      : score >= 40
      ? 'rgba(245,158,11,0.15)'
      : 'rgba(239,68,68,0.15)';

  return (
    <div className="card">
      <h3 className="text-text-primary font-semibold mb-2">그린워싱 리스크 레이더</h3>
      <p className="text-text-muted text-xs mb-6 font-mono">
        수치가 높을수록 해당 영역의 그린워싱 위험이 높습니다
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={chartData} cx="50%" cy="50%" outerRadius={100}>
          <PolarGrid
            stroke="#1E2B20"
            radialLines={true}
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: '#7A9B80',
              fontSize: 11,
              fontFamily: 'Space Mono, monospace',
            }}
          />
          <Radar
            name="리스크"
            dataKey="value"
            stroke={color}
            fill={fillColor}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {chartData.map((item) => (
          <div key={item.axis} className="flex items-center justify-between bg-panel rounded-lg px-3 py-2">
            <span className="text-xs text-text-secondary font-mono">{item.axis}</span>
            <span
              className={`text-xs font-mono font-bold ${
                item.value >= 60
                  ? 'text-red-400'
                  : item.value >= 30
                  ? 'text-amber-400'
                  : 'text-gl-green'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

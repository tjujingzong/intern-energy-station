import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { SkillScore } from '../types';
import { SKILL_DIMS } from '../constants';
import { toRadarData } from '../utils';

interface SkillRadarProps {
  score: SkillScore;
  height?: number;
  color?: string;
}

export default function SkillRadar({ score, height = 280, color = '#1f59f5' }: SkillRadarProps) {
  const data = toRadarData(score, SKILL_DIMS);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

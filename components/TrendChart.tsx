'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';

interface TrendChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  color?: string;
  label?: string;
  type?: 'line' | 'area';
}

export default function TrendChart({ 
  data, 
  dataKey, 
  color = '#f59e0b', 
  label, 
  type = 'area' 
}: TrendChartProps) {
  if (!data?.length) return (
    <div className="h-[300px] flex items-center justify-center text-slate-500 bg-slate-900/20 border border-white/5 rounded-3xl">
      No historical data available. Run a scrape to begin tracking.
    </div>
  );

  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(new Date(item.date as string | number | Date), 'MMM dd'),
  }));

  const Chart = type === 'area' ? AreaChart : LineChart;
  const Plot = type === 'area' ? Area : Line;

  return (
    <div className="h-[350px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={formattedData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #334155', 
              borderRadius: '12px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#f8fafc' }}
            formatter={(value: unknown) => [`Rp ${Number(value).toLocaleString('id-ID')}`, label]}
          />
          <Plot 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            dot={false}
            activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

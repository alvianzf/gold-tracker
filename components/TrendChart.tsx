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
import { formatCurrency } from '@/lib/utils';

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
    <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 rounded-3xl font-bold">
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
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
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            formatter={(value: unknown) => [`Rp ${formatCurrency(Number(value))}`, 'Price']}
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

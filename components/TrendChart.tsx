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
    <div className="h-[300px] flex items-center justify-center text-slate-400 bg-transparent border border-slate-200  font-bold">
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
    <div className="h-[400px] w-full mt-10 p-6 glass bg-slate-900/40 border-white/5 shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={formattedData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
            dy={15}
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.3)', 
              borderRadius: '16px',
              fontSize: '11px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '16px'
            }}
            itemStyle={{ color: '#D4AF37', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            cursor={{ stroke: 'rgba(212, 175, 55, 0.2)', strokeWidth: 2 }}
            formatter={(value: unknown) => [`Rp ${formatCurrency(Number(value))}`, 'Valuation']}
          />
          <Plot 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#D4AF37" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            dot={false}
            activeDot={{ 
              r: 8, 
              fill: '#D4AF37', 
              stroke: '#000000', 
              strokeWidth: 3,
              className: "animate-pulse"
            }}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

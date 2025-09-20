import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const PriceChart = ({ data }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format margin and display properties based on screen size
  const margin = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 };

  // Reduce the number of X-axis ticks on mobile
  const getTickCount = () => {
    return isMobile ? 4 : undefined;
  };

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            fontSize={isMobile ? 10 : 12}
            tickLine={false}
            tick={isMobile}
            interval={isMobile ? 'preserveStartEnd' : 0}
            tickCount={getTickCount()}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={isMobile ? 10 : 12}
            tickLine={false}
            tickFormatter={(value) => (isMobile ? `$${value}` : `$${value.toLocaleString()}`)}
            width={isMobile ? 40 : 60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
              padding: isMobile ? '4px 8px' : '8px 12px',
              fontSize: isMobile ? '12px' : '14px',
            }}
            formatter={(value, name) => [
              `$${value.toLocaleString()}`,
              name === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
            ]}
            labelStyle={{ color: '#9CA3AF', fontSize: isMobile ? '10px' : '12px' }}
          />
          <Legend
            wrapperStyle={{ color: '#9CA3AF', fontSize: isMobile ? '10px' : '12px' }}
            iconSize={isMobile ? 8 : 10}
          />
          <Line
            type="monotone"
            dataKey="bitcoin"
            stroke="#F59E0B"
            strokeWidth={isMobile ? 2 : 3}
            dot={{ fill: '#F59E0B', strokeWidth: isMobile ? 1 : 2, r: isMobile ? 2 : 4 }}
            name="Bitcoin"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ethereum"
            stroke="#3B82F6"
            strokeWidth={isMobile ? 2 : 3}
            dot={{ fill: '#3B82F6', strokeWidth: isMobile ? 1 : 2, r: isMobile ? 2 : 4 }}
            name="Ethereum"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

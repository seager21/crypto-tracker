import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar } from 'lucide-react';

const PerformanceVisualization = ({ cryptoConfig }) => {
  const { transactions, holdings, getPortfolioAllocation, portfolioValue, totalInvested, totalPnL } = usePortfolio();
  const [activeChart, setActiveChart] = useState('performance'); // performance, allocation, timeline
  const [timeRange, setTimeRange] = useState('all'); // 7d, 30d, 90d, all

  // Generate colors for pie chart
  const COLORS = ['#00D4AA', '#FF6B6B', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F97316'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate portfolio performance over time
  const portfolioPerformanceData = useMemo(() => {
    const data = [];
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    let runningValue = 0;
    let runningInvested = 0;
    const holdingsOverTime = {};

    sortedTransactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      
      // Update holdings
      if (!holdingsOverTime[transaction.cryptoId]) {
        holdingsOverTime[transaction.cryptoId] = { quantity: 0, totalInvested: 0 };
      }
      
      if (transaction.type === 'buy') {
        holdingsOverTime[transaction.cryptoId].quantity += transaction.quantity;
        holdingsOverTime[transaction.cryptoId].totalInvested += transaction.quantity * transaction.price;
        runningInvested += transaction.quantity * transaction.price;
      } else {
        holdingsOverTime[transaction.cryptoId].quantity -= transaction.quantity;
        holdingsOverTime[transaction.cryptoId].totalInvested -= transaction.quantity * (holdingsOverTime[transaction.cryptoId].totalInvested / (holdingsOverTime[transaction.cryptoId].quantity + transaction.quantity));
        runningInvested -= transaction.quantity * transaction.price;
      }
      
      // For simplicity, use transaction price as current value (in real app, you'd use market data)
      runningValue = Object.values(holdingsOverTime).reduce((sum, holding) => {
        return sum + (holding.quantity * transaction.price); // This is simplified
      }, 0);
      
      const pnl = runningValue - runningInvested;
      const pnlPercentage = runningInvested > 0 ? (pnl / runningInvested) * 100 : 0;
      
      data.push({
        date,
        value: runningValue,
        invested: runningInvested,
        pnl,
        pnlPercentage,
        transaction: `${transaction.type} ${transaction.quantity} ${cryptoConfig[transaction.cryptoId]?.symbol}`,
      });
    });
    
    return data;
  }, [transactions, cryptoConfig]);

  // Portfolio allocation data for pie chart
  const allocationData = useMemo(() => {
    const allocation = getPortfolioAllocation();
    return Object.entries(allocation).map(([cryptoId, data]) => ({
      name: cryptoConfig[cryptoId]?.name || cryptoId,
      symbol: cryptoConfig[cryptoId]?.symbol || cryptoId,
      value: data.value,
      percentage: data.percentage,
      quantity: data.quantity,
    }));
  }, [getPortfolioAllocation, cryptoConfig]);

  // Monthly transaction volume data
  const monthlyVolumeData = useMemo(() => {
    const monthlyData = {};
    
    transactions.forEach((transaction) => {
      const month = new Date(transaction.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const amount = transaction.quantity * transaction.price;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, buy: 0, sell: 0, total: 0 };
      }
      
      monthlyData[month][transaction.type] += amount;
      monthlyData[month].total += amount;
    });
    
    return Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-crypto-dark border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-white">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              {entry.name.includes('Percentage') ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-crypto-dark border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name} ({data.symbol})</p>
          <p className="text-crypto-gold">{formatCurrency(data.value)}</p>
          <p className="text-gray-400">{data.percentage.toFixed(2)}% of portfolio</p>
          <p className="text-gray-400">Quantity: {data.quantity.toFixed(8)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 animate-fade-in hover-glow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-white group-hover:text-crypto-gold transition-colors">
                {formatCurrency(portfolioValue)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-crypto-green group-hover:text-crypto-gold transition-colors" />
          </div>
        </div>

        <div className="card p-4 animate-fade-in hover-glow group" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'} group-hover:text-crypto-gold transition-colors`}>
                {formatCurrency(totalPnL)}
              </p>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0}%
              </p>
            </div>
            {totalPnL >= 0 ? (
              <TrendingUp className="w-8 h-8 text-crypto-green group-hover:text-crypto-gold transition-colors" />
            ) : (
              <TrendingDown className="w-8 h-8 text-crypto-red group-hover:text-crypto-gold transition-colors" />
            )}
          </div>
        </div>

        <div className="card p-4 animate-fade-in hover-glow group" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Assets</p>
              <p className="text-2xl font-bold text-white group-hover:text-crypto-gold transition-colors">
                {Object.keys(holdings).length}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-crypto-blue group-hover:text-crypto-gold transition-colors" />
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveChart('performance')}
              className={`btn-lightning px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeChart === 'performance' ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Performance</span>
            </button>
            <button
              onClick={() => setActiveChart('allocation')}
              className={`btn-lightning px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeChart === 'allocation' ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              <span>Allocation</span>
            </button>
            <button
              onClick={() => setActiveChart('timeline')}
              className={`btn-lightning px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeChart === 'timeline' ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Volume</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="card p-6">
        {activeChart === 'performance' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Portfolio Performance Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00D4AA"
                    fill="#00D4AA"
                    fillOpacity={0.3}
                    name="Portfolio Value"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                    name="Total Invested"
                  />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    name="P&L"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChart === 'allocation' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Portfolio Allocation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percentage }) => `${percentage.toFixed(1)}%`}
                      labelLine={false}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Holdings Breakdown</h4>
                {allocationData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-crypto-darker rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">{item.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(item.value)}</p>
                      <p className="text-gray-400 text-sm">{item.percentage.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeChart === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Monthly Transaction Volume</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="buy" stackId="a" fill="#00D4AA" name="Buy Volume" />
                  <Bar dataKey="sell" stackId="a" fill="#FF6B6B" name="Sell Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceVisualization;
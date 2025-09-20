import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

const DataExport = ({ cryptoConfig }) => {
  const {
    transactions,
    holdings,
    getPortfolioAllocation,
    portfolioValue,
    totalInvested,
    totalPnL,
    totalPnLPercentage,
    getHoldingPerformance,
  } = usePortfolio();

  const [exportType, setExportType] = useState('portfolio');
  const [dateRange, setDateRange] = useState('all');
  const [format, setFormat] = useState('csv');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US');
  };

  const getFilteredTransactions = () => {
    if (dateRange === 'all') return transactions;

    const now = new Date();
    const cutoffDate = new Date();

    switch (dateRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter((transaction) => new Date(transaction.timestamp) >= cutoffDate);
  };

  const getPortfolioSummaryData = () => {
    const allocation = getPortfolioAllocation();

    return [
      {
        'Report Type': 'Portfolio Summary',
        'Generated On': formatDate(new Date()),
        'Total Portfolio Value': formatCurrency(portfolioValue),
        'Total Invested': formatCurrency(totalInvested),
        'Total P&L': formatCurrency(totalPnL),
        'Total P&L %': `${totalPnLPercentage.toFixed(2)}%`,
        'Number of Holdings': Object.keys(holdings).length,
        'Number of Transactions': transactions.length,
      },
      {},
      { 'Holdings Breakdown': '' },
      ...Object.entries(allocation).map(([cryptoId, data]) => {
        const config = cryptoConfig[cryptoId];
        const performance = getHoldingPerformance(cryptoId);

        return {
          Cryptocurrency: config?.name || cryptoId,
          Symbol: config?.symbol || cryptoId,
          Quantity: data.quantity.toFixed(8),
          'Current Value': formatCurrency(data.value),
          Percentage: `${data.percentage.toFixed(2)}%`,
          'Average Price': formatCurrency(performance?.averagePrice || 0),
          'Current Price': formatCurrency(performance?.currentPrice || 0),
          'P&L': formatCurrency(performance?.pnl || 0),
          'P&L %': `${(performance?.pnlPercentage || 0).toFixed(2)}%`,
        };
      }),
    ];
  };

  const getTransactionsData = () => {
    const filteredTransactions = getFilteredTransactions();

    return filteredTransactions.map((transaction) => {
      const config = cryptoConfig[transaction.cryptoId];

      return {
        Date: formatDate(transaction.timestamp),
        Cryptocurrency: config?.name || transaction.cryptoId,
        Symbol: config?.symbol || transaction.cryptoId,
        Type: transaction.type.toUpperCase(),
        Quantity: transaction.quantity,
        'Price (USD)': formatCurrency(transaction.price),
        'Total Value': formatCurrency(transaction.quantity * transaction.price),
        Notes: transaction.notes || '',
      };
    });
  };

  const getHoldingsData = () => {
    return Object.entries(holdings).map(([cryptoId, holding]) => {
      const config = cryptoConfig[cryptoId];
      const performance = getHoldingPerformance(cryptoId);

      return {
        Cryptocurrency: config?.name || cryptoId,
        Symbol: config?.symbol || cryptoId,
        Quantity: holding.quantity.toFixed(8),
        'Average Price': formatCurrency(holding.averagePrice),
        'Total Invested': formatCurrency(holding.totalInvested),
        'Current Price': formatCurrency(performance?.currentPrice || 0),
        'Current Value': formatCurrency(performance?.currentValue || 0),
        'P&L': formatCurrency(performance?.pnl || 0),
        'P&L %': `${(performance?.pnlPercentage || 0).toFixed(2)}%`,
        'Number of Transactions': holding.transactions.length,
      };
    });
  };

  const exportToCSV = () => {
    let data = [];
    let filename = '';

    switch (exportType) {
      case 'portfolio':
        data = getPortfolioSummaryData();
        filename = `portfolio_summary_${formatDate(new Date()).replace(/\//g, '_')}.csv`;
        break;
      case 'transactions':
        data = getTransactionsData();
        filename = `transactions_${dateRange}_${formatDate(new Date()).replace(/\//g, '_')}.csv`;
        break;
      case 'holdings':
        data = getHoldingsData();
        filename = `holdings_${formatDate(new Date()).replace(/\//g, '_')}.csv`;
        break;
      default:
        return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text('Crypto Portfolio Report', 20, 30);

    pdf.setFontSize(12);
    pdf.text(`Generated on: ${formatDate(new Date())}`, 20, 45);

    let yPosition = 60;

    if (exportType === 'portfolio') {
      pdf.setFontSize(16);
      pdf.text('Portfolio Summary', 20, yPosition);
      yPosition += 20;

      pdf.setFontSize(12);
      const summaryData = [
        ['Total Portfolio Value', formatCurrency(portfolioValue)],
        ['Total Invested', formatCurrency(totalInvested)],
        ['Total P&L', formatCurrency(totalPnL)],
        ['Total P&L %', `${totalPnLPercentage.toFixed(2)}%`],
      ];

      summaryData.forEach(([label, value]) => {
        pdf.text(`${label}: ${value}`, 20, yPosition);
        yPosition += 15;
      });
    }

    const filename = `${exportType}_report_${formatDate(new Date()).replace(/\//g, '_')}.pdf`;
    pdf.save(filename);
  };

  const handleExport = () => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  const getDataPreview = () => {
    let data = [];

    switch (exportType) {
      case 'portfolio':
        data = getPortfolioSummaryData().slice(0, 5);
        break;
      case 'transactions':
        data = getTransactionsData().slice(0, 5);
        break;
      case 'holdings':
        data = getHoldingsData().slice(0, 5);
        break;
      default:
        return [];
    }

    return data;
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Export Portfolio Data</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Export Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="portfolio">Portfolio Summary</option>
              <option value="transactions">Transaction History</option>
              <option value="holdings">Current Holdings</option>
            </select>
          </div>

          {exportType === 'transactions' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="csv">CSV (Excel)</option>
              <option value="pdf">PDF Report</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="btn-lightning w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 bg-crypto-darker">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-8 h-8 text-crypto-green" />
              <div>
                <h3 className="text-white font-semibold">CSV Export</h3>
                <p className="text-gray-400 text-sm">Spreadsheet compatible format</p>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-crypto-darker">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-crypto-blue" />
              <div>
                <h3 className="text-white font-semibold">PDF Report</h3>
                <p className="text-gray-400 text-sm">Professional document format</p>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-crypto-darker">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-crypto-gold" />
              <div>
                <h3 className="text-white font-semibold">Date Filtering</h3>
                <p className="text-gray-400 text-sm">Customizable time ranges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Data Preview</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                {getDataPreview()[0] &&
                  Object.keys(getDataPreview()[0]).map((key) => (
                    <th key={key} className="text-left py-3 px-4 text-gray-400 font-medium">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {getDataPreview().map((row, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-crypto-darker">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="py-3 px-4 text-white">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Showing first 5 rows. Full export will include all{' '}
            {exportType === 'portfolio'
              ? 'portfolio data'
              : exportType === 'transactions'
                ? `${getFilteredTransactions().length} transactions`
                : `${Object.keys(holdings).length} holdings`}
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataExport;

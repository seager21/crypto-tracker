import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const PortfolioHoldings = ({ cryptoConfig }) => {
  const {
    holdings,
    addTransaction,
    getHoldingPerformance,
    portfolioValue,
    totalInvested,
    totalPnL,
    totalPnLPercentage,
  } = usePortfolio();

  const [showAddModal, setShowAddModal] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(8);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 animate-fade-in hover-glow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white group-hover:text-crypto-gold transition-colors">
                {formatCurrency(portfolioValue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-crypto-blue group-hover:text-crypto-gold transition-colors" />
          </div>
        </div>

        <div
          className="card p-4 animate-fade-in hover-glow group"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Invested</p>
              <p className="text-2xl font-bold text-white group-hover:text-crypto-gold transition-colors">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-crypto-green group-hover:text-crypto-gold transition-colors" />
          </div>
        </div>

        <div
          className="card p-4 animate-fade-in hover-glow group"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p
                className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'} group-hover:text-crypto-gold transition-colors`}
              >
                {formatCurrency(totalPnL)}
              </p>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {totalPnLPercentage >= 0 ? '+' : ''}
                {totalPnLPercentage.toFixed(2)}%
              </p>
            </div>
            {totalPnL >= 0 ? (
              <TrendingUp className="w-8 h-8 text-crypto-green group-hover:text-crypto-gold transition-colors" />
            ) : (
              <TrendingDown className="w-8 h-8 text-crypto-red group-hover:text-crypto-gold transition-colors" />
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Holdings</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-lightning flex items-center space-x-2 px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Holdings List */}
      <div className="grid grid-cols-1 gap-4">
        {Object.keys(holdings).length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400 text-lg mb-4">No holdings yet</p>
            <p className="text-gray-500 text-sm">
              Add your first transaction to start tracking your portfolio
            </p>
          </div>
        ) : (
          Object.entries(holdings).map(([cryptoId]) => {
            const config = cryptoConfig[cryptoId];
            const performance = getHoldingPerformance(cryptoId);

            if (!config || !performance) return null;

            return (
              <div key={cryptoId} className="card p-4 animate-fade-in hover-glow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{config.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{config.name}</h3>
                      <p className="text-gray-400 text-sm">{config.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Quantity</p>
                    <p className="text-lg font-semibold text-white">
                      {formatNumber(performance.quantity)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Avg. Price</p>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(performance.averagePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Price</p>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(performance.currentPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Value</p>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(performance.currentValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">P&L</p>
                    <p
                      className={`text-sm font-semibold ${performance.pnl >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}
                    >
                      {formatCurrency(performance.pnl)}
                    </p>
                    <p
                      className={`text-xs ${performance.pnl >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}
                    >
                      {performance.pnlPercentage >= 0 ? '+' : ''}
                      {performance.pnlPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Progress bar for P&L */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      performance.pnl >= 0 ? 'bg-crypto-green' : 'bg-crypto-red'
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(performance.pnlPercentage), 100)}%`,
                    }}
                  ></div>
                </div>

                {/* Transaction count */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {performance.transactions.length} transaction
                    {performance.transactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={addTransaction}
          cryptoConfig={cryptoConfig}
        />
      )}
    </div>
  );
};

// Add Transaction Modal Component
const AddTransactionModal = ({ onClose, onSave, cryptoConfig }) => {
  const [formData, setFormData] = useState({
    cryptoId: '',
    type: 'buy',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cryptoId || !formData.quantity || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      date: new Date(formData.date),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-crypto-dark rounded-lg p-6 w-full max-w-md animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4">Add Transaction</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Cryptocurrency *</label>
            <select
              value={formData.cryptoId}
              onChange={(e) => setFormData({ ...formData, cryptoId: e.target.value })}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Select cryptocurrency</option>
              {Object.entries(cryptoConfig).map(([id, config]) => (
                <option key={id} value={id}>
                  {config.icon} {config.name} ({config.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Transaction Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Quantity *</label>
              <input
                type="number"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Price (USD) *</label>
              <input
                type="number"
                step="any"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
              rows="3"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-lightning px-4 py-2 rounded-lg">
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioHoldings;

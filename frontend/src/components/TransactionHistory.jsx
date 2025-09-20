import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Edit, Trash2, Calendar, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react';

const TransactionHistory = ({ cryptoConfig }) => {
  const { transactions, updateTransaction, deleteTransaction } = usePortfolio();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, buy, sell
  const [filterCrypto, setFilterCrypto] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, type
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesCrypto = filterCrypto === 'all' || transaction.cryptoId === filterCrypto;
      const matchesSearch =
        !searchTerm ||
        cryptoConfig[transaction.cryptoId]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cryptoConfig[transaction.cryptoId]?.symbol
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesCrypto && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
          break;
        case 'amount':
          comparison = a.quantity * a.price - b.quantity * b.price;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(transactionId);
    }
  };

  const handleSaveEdit = (updatedTransaction) => {
    updateTransaction(updatedTransaction);
    setEditingTransaction(null);
  };

  const getTotalsByType = () => {
    const totals = { buy: 0, sell: 0 };
    transactions.forEach((transaction) => {
      totals[transaction.type] += transaction.quantity * transaction.price;
    });
    return totals;
  };

  const totals = getTotalsByType();

  return (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 animate-fade-in hover-glow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-white group-hover:text-crypto-gold transition-colors">
                {transactions.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-crypto-blue group-hover:text-crypto-gold transition-colors" />
          </div>
        </div>

        <div
          className="card p-4 animate-fade-in hover-glow group"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Bought</p>
              <p className="text-2xl font-bold text-crypto-green group-hover:text-crypto-gold transition-colors">
                {formatCurrency(totals.buy)}
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
              <p className="text-gray-400 text-sm">Total Sold</p>
              <p className="text-2xl font-bold text-crypto-red group-hover:text-crypto-gold transition-colors">
                {formatCurrency(totals.sell)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-crypto-red group-hover:text-crypto-gold transition-colors" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2 flex-1">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="buy">Buy Only</option>
              <option value="sell">Sell Only</option>
            </select>

            <select
              value={filterCrypto}
              onChange={(e) => setFilterCrypto(e.target.value)}
              className="bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Cryptos</option>
              {Object.entries(cryptoConfig).map(([id, config]) => (
                <option key={id} value={id}>
                  {config.name}
                </option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
              className="bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="type-asc">Type A-Z</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-crypto-darker border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm w-full lg:w-64"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">No transactions found</p>
            <p className="text-gray-500 text-sm">
              {transactions.length === 0
                ? 'Add your first transaction to start tracking your portfolio'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const config = cryptoConfig[transaction.cryptoId];
            if (!config) return null;

            return (
              <div key={transaction.id} className="card p-4 animate-fade-in hover-glow group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{config.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white">{config.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'buy'
                              ? 'bg-crypto-green/20 text-crypto-green'
                              : 'bg-crypto-red/20 text-crypto-red'
                          }`}
                        >
                          {transaction.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{config.symbol}</p>
                      <p className="text-gray-500 text-xs">{formatDate(transaction.timestamp)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-400">Quantity</p>
                        <p className="text-sm font-semibold text-white">{transaction.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(transaction.price)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(transaction.quantity * transaction.price)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-1 text-gray-400 hover:text-crypto-gold transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-1 text-gray-400 hover:text-crypto-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {transaction.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Notes: {transaction.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleSaveEdit}
          cryptoConfig={cryptoConfig}
        />
      )}
    </div>
  );
};

// Edit Transaction Modal Component
const EditTransactionModal = ({ transaction, onClose, onSave, cryptoConfig }) => {
  const [formData, setFormData] = useState({
    ...transaction,
    date: new Date(transaction.timestamp || transaction.date).toISOString().split('T')[0],
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
      timestamp: new Date(formData.date),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-crypto-dark rounded-lg p-6 w-full max-w-md animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4">Edit Transaction</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Cryptocurrency *</label>
            <select
              value={formData.cryptoId}
              onChange={(e) => setFormData({ ...formData, cryptoId: e.target.value })}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            >
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
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-crypto-darker border border-gray-600 rounded-lg px-3 py-2 text-white"
              rows="3"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionHistory;

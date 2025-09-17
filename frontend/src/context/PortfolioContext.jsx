import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Portfolio context
const PortfolioContext = createContext();

// Action types
const PORTFOLIO_ACTIONS = {
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_HOLDINGS: 'SET_HOLDINGS',
  UPDATE_MARKET_DATA: 'UPDATE_MARKET_DATA',
  LOAD_PORTFOLIO: 'LOAD_PORTFOLIO',
  RESET_PORTFOLIO: 'RESET_PORTFOLIO',
};

// Initial state
const initialState = {
  transactions: [],
  holdings: {},
  marketData: {},
  portfolioValue: 0,
  totalInvested: 0,
  totalPnL: 0,
  totalPnLPercentage: 0,
  lastUpdated: null,
};

// Portfolio reducer
const portfolioReducer = (state, action) => {
  switch (action.type) {
    case PORTFOLIO_ACTIONS.ADD_TRANSACTION: {
      const newTransactions = [...state.transactions, action.payload];
      return {
        ...state,
        transactions: newTransactions,
        holdings: calculateHoldings(newTransactions),
      };
    }

    case PORTFOLIO_ACTIONS.UPDATE_TRANSACTION: {
      const updatedTransactions = state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? action.payload : transaction
      );
      return {
        ...state,
        transactions: updatedTransactions,
        holdings: calculateHoldings(updatedTransactions),
      };
    }

    case PORTFOLIO_ACTIONS.DELETE_TRANSACTION: {
      const filteredTransactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload
      );
      return {
        ...state,
        transactions: filteredTransactions,
        holdings: calculateHoldings(filteredTransactions),
      };
    }

    case PORTFOLIO_ACTIONS.UPDATE_MARKET_DATA: {
      const updatedState = {
        ...state,
        marketData: action.payload,
        lastUpdated: new Date(),
      };
      
      // Recalculate portfolio metrics with new market data
      const portfolioMetrics = calculatePortfolioMetrics(
        updatedState.holdings,
        updatedState.transactions,
        action.payload
      );
      
      return {
        ...updatedState,
        ...portfolioMetrics,
      };
    }

    case PORTFOLIO_ACTIONS.LOAD_PORTFOLIO:
      return {
        ...state,
        ...action.payload,
      };

    case PORTFOLIO_ACTIONS.RESET_PORTFOLIO:
      return initialState;

    default:
      return state;
  }
};

// Helper function to calculate holdings from transactions
const calculateHoldings = (transactions) => {
  const holdings = {};
  
  transactions.forEach((transaction) => {
    const { cryptoId, type, quantity } = transaction;
    
    if (!holdings[cryptoId]) {
      holdings[cryptoId] = {
        quantity: 0,
        averagePrice: 0,
        totalInvested: 0,
        transactions: [],
      };
    }
    
    holdings[cryptoId].transactions.push(transaction);
    
    if (type === 'buy') {
      const currentTotal = holdings[cryptoId].quantity * holdings[cryptoId].averagePrice;
      const newTotal = currentTotal + quantity * transaction.price;
      holdings[cryptoId].quantity += quantity;
      holdings[cryptoId].averagePrice = newTotal / holdings[cryptoId].quantity;
      holdings[cryptoId].totalInvested += quantity * transaction.price;
    } else if (type === 'sell') {
      holdings[cryptoId].quantity -= quantity;
      holdings[cryptoId].totalInvested -= quantity * holdings[cryptoId].averagePrice;
      
      // Remove holding if quantity reaches 0
      if (holdings[cryptoId].quantity <= 0) {
        delete holdings[cryptoId];
      }
    }
  });
  
  return holdings;
};

// Helper function to calculate portfolio metrics
const calculatePortfolioMetrics = (holdings, transactions, marketData) => {
  let portfolioValue = 0;
  let totalInvested = 0;
  
  Object.entries(holdings).forEach(([cryptoId, holding]) => {
    const currentPrice = marketData[cryptoId]?.usd || 0;
    const holdingValue = holding.quantity * currentPrice;
    
    portfolioValue += holdingValue;
    totalInvested += holding.totalInvested;
  });
  
  const totalPnL = portfolioValue - totalInvested;
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  
  return {
    portfolioValue,
    totalInvested,
    totalPnL,
    totalPnLPercentage,
  };
};

// Portfolio Provider component
export const PortfolioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  
  // Load portfolio from localStorage on mount
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    if (savedPortfolio) {
      try {
        const portfolioData = JSON.parse(savedPortfolio);
        dispatch({ type: PORTFOLIO_ACTIONS.LOAD_PORTFOLIO, payload: portfolioData });
      } catch (error) {
        console.error('Error loading portfolio from localStorage:', error);
      }
    }
  }, []);
  
  // Save portfolio to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(state));
  }, [state]);
  
  // Portfolio actions
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    dispatch({ type: PORTFOLIO_ACTIONS.ADD_TRANSACTION, payload: newTransaction });
  };
  
  const updateTransaction = (transaction) => {
    dispatch({ type: PORTFOLIO_ACTIONS.UPDATE_TRANSACTION, payload: transaction });
  };
  
  const deleteTransaction = (transactionId) => {
    dispatch({ type: PORTFOLIO_ACTIONS.DELETE_TRANSACTION, payload: transactionId });
  };
  
  const updateMarketData = (marketData) => {
    dispatch({ type: PORTFOLIO_ACTIONS.UPDATE_MARKET_DATA, payload: marketData });
  };
  
  const resetPortfolio = () => {
    dispatch({ type: PORTFOLIO_ACTIONS.RESET_PORTFOLIO });
  };
  
  // Calculate holding performance for a specific crypto
  const getHoldingPerformance = (cryptoId) => {
    const holding = state.holdings[cryptoId];
    const currentPrice = state.marketData[cryptoId]?.usd || 0;
    
    if (!holding) return null;
    
    const currentValue = holding.quantity * currentPrice;
    const pnl = currentValue - holding.totalInvested;
    const pnlPercentage = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;
    
    return {
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      currentPrice,
      currentValue,
      totalInvested: holding.totalInvested,
      pnl,
      pnlPercentage,
      transactions: holding.transactions,
    };
  };
  
  // Get portfolio allocation (percentage of each holding)
  const getPortfolioAllocation = () => {
    const allocation = {};
    
    Object.entries(state.holdings).forEach(([cryptoId, holding]) => {
      const currentPrice = state.marketData[cryptoId]?.usd || 0;
      const holdingValue = holding.quantity * currentPrice;
      const percentage = state.portfolioValue > 0 ? (holdingValue / state.portfolioValue) * 100 : 0;
      
      allocation[cryptoId] = {
        value: holdingValue,
        percentage,
        quantity: holding.quantity,
      };
    });
    
    return allocation;
  };
  
  const value = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateMarketData,
    resetPortfolio,
    getHoldingPerformance,
    getPortfolioAllocation,
  };
  
  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// Custom hook to use portfolio context
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
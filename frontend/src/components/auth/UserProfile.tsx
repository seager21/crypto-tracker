import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { currentUser, userData, updateUserSettings, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      await updateUserSettings({ theme });
      toast.success(`Theme changed to ${theme} mode`);
    } catch (error) {
      toast.error('Failed to update theme');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!userData) return;
    
    const currency = e.target.value;
    setIsLoading(true);
    try {
      await updateUserSettings({ currency });
      toast.success(`Currency changed to ${currency.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to update currency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsChange = async (notifications: boolean) => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      await updateUserSettings({ notifications });
      toast.success(`Notifications ${notifications ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!currentUser || !userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-white">{currentUser.displayName || 'User'}</h2>
          <p className="text-gray-400">{currentUser.email}</p>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-white mb-4">Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-300">Theme</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleThemeChange('light')}
                disabled={isLoading || userData.settings.theme === 'light'}
                className={`px-3 py-1 rounded-md text-sm ${
                  userData.settings.theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                disabled={isLoading || userData.settings.theme === 'dark'}
                className={`px-3 py-1 rounded-md text-sm ${
                  userData.settings.theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="currency" className="text-gray-300">Currency</label>
            <select
              id="currency"
              value={userData.settings.currency}
              onChange={handleCurrencyChange}
              disabled={isLoading}
              className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="jpy">JPY</option>
              <option value="cad">CAD</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-gray-300">Notifications</label>
            <div className="relative inline-block w-10 align-middle select-none">
              <input
                type="checkbox"
                id="notifications"
                checked={userData.settings.notifications}
                onChange={() => handleNotificationsChange(!userData.settings.notifications)}
                disabled={isLoading}
                className="opacity-0 absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="notifications"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  userData.settings.notifications ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in ${
                    userData.settings.notifications ? 'translate-x-4' : 'translate-x-0'
                  }`}
                ></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;

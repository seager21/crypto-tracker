import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import toast from 'react-hot-toast';
import { Edit2, Save, X, LogOut } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const UserProfile: React.FC = () => {
  const { currentUser, userData, updateUserSettings, logout } = useAuth();
  const { CURRENCIES, TIMEZONES, NEWS_REGIONS } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: currentUser?.displayName || '',
    bio: userData?.profile?.bio || '',
    location: userData?.profile?.location || '',
    website: userData?.profile?.website || '',
  });

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

  const handleTimezoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!userData) return;

    const timezone = e.target.value;
    setIsLoading(true);
    try {
      await updateUserSettings({ timezone });
      toast.success(`Timezone changed to ${timezone}`);
    } catch (error) {
      toast.error('Failed to update timezone');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!userData) return;

    const newsRegion = e.target.value;
    setIsLoading(true);
    try {
      await updateUserSettings({ newsRegion });
      toast.success(`News region changed to ${newsRegion}`);
    } catch (error) {
      toast.error('Failed to update news region');
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

  const handleSaveProfile = async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: editData.displayName,
        profile: {
          bio: editData.bio,
          location: editData.location,
          website: editData.website,
        },
        updatedAt: new Date(),
      });

      // Update display name in Firebase Auth
      if (editData.displayName !== currentUser.displayName) {
        // This would need to be handled on the client side or via a backend endpoint
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
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
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
            {!isEditing ? (
              <div>
                <h2 className="text-2xl font-semibold text-white">{currentUser.displayName || 'User'}</h2>
                <p className="text-gray-400">{currentUser.email}</p>
                {userData.profile?.bio && (
                  <p className="text-gray-300 text-sm mt-1">{userData.profile.bio}</p>
                )}
                {userData.profile?.location && (
                  <p className="text-gray-400 text-sm">📍 {userData.profile.location}</p>
                )}
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  placeholder="Display Name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white text-sm"
                />
                <input
                  type="text"
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Bio"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white text-sm"
                />
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  placeholder="Location"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white text-sm"
                />
                <input
                  type="text"
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  placeholder="Website"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                title="Edit Profile"
              >
                <Edit2 size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
                  title="Save Profile"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-t border-gray-700 pt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Portfolio Value</p>
            <p className="text-xl font-semibold text-white">
              ${userData.stats?.currentValue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Invested</p>
            <p className="text-xl font-semibold text-white">
              ${userData.stats?.totalInvested?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Gain</p>
            <p className={`text-xl font-semibold ${(userData.stats?.totalGain ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${(userData.stats?.totalGain ?? 0).toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Gain %</p>
            <p className={`text-xl font-semibold ${(userData.stats?.totalGainPercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(userData.stats?.totalGainPercent ?? 0).toFixed(2) || '0.00'}%
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">⚙️</span> Preferences
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium">Theme</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleThemeChange('light')}
                disabled={isLoading || userData.settings.theme === 'light'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  userData.settings.theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                disabled={isLoading || userData.settings.theme === 'dark'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  userData.settings.theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="currency" className="text-gray-300 font-medium">
              Currency
            </label>
            <select
              id="currency"
              value={userData.settings.currency}
              onChange={handleCurrencyChange}
              disabled={isLoading}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(CURRENCIES || {}).map(([code, name]) => (
                <option key={code} value={code}>
                  {name as string}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="timezone" className="text-gray-300 font-medium">
              Timezone
            </label>
            <select
              id="timezone"
              value={userData.settings.timezone || 'UTC'}
              onChange={handleTimezoneChange}
              disabled={isLoading}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none max-w-xs"
            >
              {TIMEZONES?.map((tz: string) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="newsRegion" className="text-gray-300 font-medium">
              News Region
            </label>
            <select
              id="newsRegion"
              value={userData.settings.newsRegion || 'global'}
              onChange={handleNewsRegionChange}
              disabled={isLoading}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {NEWS_REGIONS?.map((region: string) => (
                <option key={region} value={region}>
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium">Notifications</label>
            <button
              onClick={() => handleNotificationsChange(!userData.settings.notifications)}
              disabled={isLoading}
              className={`relative inline-block w-12 h-7 rounded-full transition ${
                userData.settings.notifications ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute h-6 w-6 rounded-full bg-white shadow-md transform transition ${
                  userData.settings.notifications ? 'translate-x-6' : 'translate-x-1'
                } top-0.5`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default UserProfile;

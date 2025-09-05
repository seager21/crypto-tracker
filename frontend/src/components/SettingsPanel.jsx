import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, X, Globe, DollarSign, Clock, Calendar } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { 
    settings, 
    updateSettings, 
    LANGUAGES, 
    CURRENCIES, 
    NEWS_REGIONS, 
    TIMEZONES 
  } = useLocalization();

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (e) => {
    updateSettings({ language: e.target.value });
  };

  const handleCurrencyChange = (e) => {
    updateSettings({ currency: e.target.value });
  };

  const handleNewsRegionChange = (e) => {
    updateSettings({ newsRegion: e.target.value });
  };

  const handleTimezoneChange = (e) => {
    updateSettings({ timezone: e.target.value });
  };

  const handleThemeChange = (e) => {
    updateSettings({ theme: e.target.value });
  };

  return (
    <>
      <button
        onClick={togglePanel}
        className="fixed bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-50"
        aria-label={t('settings.title')}
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('settings.title')}</h2>
              <button
                onClick={togglePanel}
                className="text-gray-400 hover:text-white focus:outline-none"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Language Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <Globe size={18} className="mr-2" />
                  <label className="text-sm font-medium text-gray-300">
                    {t('settings.language')}
                  </label>
                </div>
                <select
                  value={settings.language}
                  onChange={handleLanguageChange}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.entries(LANGUAGES).map(([code, { nativeName }]) => (
                    <option key={code} value={code}>
                      {nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign size={18} className="mr-2" />
                  <label className="text-sm font-medium text-gray-300">
                    {t('settings.currency')}
                  </label>
                </div>
                <select
                  value={settings.currency}
                  onChange={handleCurrencyChange}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.entries(CURRENCIES).map(([code, { name, symbol }]) => (
                    <option key={code} value={code}>
                      {name} ({symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* News Region Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <Globe size={18} className="mr-2" />
                  <label className="text-sm font-medium text-gray-300">
                    {t('settings.newsRegion')}
                  </label>
                </div>
                <select
                  value={settings.newsRegion}
                  onChange={handleNewsRegionChange}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.entries(NEWS_REGIONS).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timezone Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <Clock size={18} className="mr-2" />
                  <label className="text-sm font-medium text-gray-300">
                    {t('settings.timezone')}
                  </label>
                </div>
                <select
                  value={settings.timezone}
                  onChange={handleTimezoneChange}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {TIMEZONES.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <Calendar size={18} className="mr-2" />
                  <label className="text-sm font-medium text-gray-300">
                    {t('settings.theme')}
                  </label>
                </div>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="dark"
                      checked={settings.theme === 'dark'}
                      onChange={handleThemeChange}
                      className="text-blue-600"
                    />
                    <span className="ml-2">{t('settings.dark')}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="light"
                      checked={settings.theme === 'light'}
                      onChange={handleThemeChange}
                      className="text-blue-600"
                    />
                    <span className="ml-2">{t('settings.light')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;

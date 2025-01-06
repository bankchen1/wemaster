import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(async (locale: string) => {
    try {
      await i18n.changeLanguage(locale);
      // 保存用户语言偏好
      localStorage.setItem('preferred_language', locale);
      // 更新 HTML lang 属性
      document.documentElement.lang = locale;
      // 更新时间格式等本地化设置
      updateLocaleSettings(locale);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);

  const formatMessage = useCallback((
    id: string,
    values?: Record<string, any>
  ) => {
    return t(id, values);
  }, [t]);

  const getLocale = useCallback(() => {
    return i18n.language;
  }, [i18n]);

  return {
    t: formatMessage,
    changeLanguage,
    getLocale,
  };
};

// 更新本地化设置
const updateLocaleSettings = (locale: string) => {
  // 时间格式
  const timeFormats = {
    'en-US': {
      short: {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      },
      long: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }
    },
    'zh-CN': {
      short: {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }
    }
  };

  // 数字格式
  const numberFormats = {
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 2
      }
    },
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY'
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 2
      }
    }
  };

  // 设置时间格式
  if (timeFormats[locale]) {
    Intl.DateTimeFormat.prototype = {
      ...Intl.DateTimeFormat.prototype,
      ...timeFormats[locale]
    };
  }

  // 设置数字格式
  if (numberFormats[locale]) {
    Intl.NumberFormat.prototype = {
      ...Intl.NumberFormat.prototype,
      ...numberFormats[locale]
    };
  }
};

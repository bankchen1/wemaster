import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 导入语言包
import enUS from '../locales/en-US';
import zhCN from '../locales/zh-CN';

const resources = {
  'en-US': {
    translation: enUS,
  },
  'zh-CN': {
    translation: zhCN,
  },
};

// 支持的语言列表
export const supportedLanguages = [
  {
    code: 'en-US',
    name: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  {
    code: 'zh-CN',
    name: '简体中文',
    flag: '🇨🇳',
    rtl: false,
  },
  // 可以添加更多语言支持
];

i18n
  // 加载和缓存翻译文件
  .use(Backend)
  // 检测用户语言
  .use(LanguageDetector)
  // 将 i18n 实例传递给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources,
    fallbackLng: 'en-US',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // 不需要转义
    },

    detection: {
      // 语言检测选项
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;

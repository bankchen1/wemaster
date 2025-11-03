import { createI18n } from 'vue-i18n';
import zhCN from './i18n/zh-CN.json';
import enUS from './i18n/en-US.json';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'en-US', // 回退语言
  messages
});

export default i18n;
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import { useI18n } from '@/hooks/useI18n';
import { AppRoutes } from '@/routes';
import { LoadingScreen } from '@/components/common/LoadingScreen';

// Ant Design 语言包映射
const antdLocales = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

export const App: React.FC = () => {
  const { getLocale } = useI18n();
  const currentLocale = getLocale();

  return (
    <ConfigProvider locale={antdLocales[currentLocale]}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
};

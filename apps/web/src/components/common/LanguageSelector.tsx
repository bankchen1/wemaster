import React from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useI18n } from '@/hooks/useI18n';
import { supportedLanguages } from '@/config/i18n';

export const LanguageSelector: React.FC = () => {
  const { getLocale, changeLanguage } = useI18n();
  const currentLocale = getLocale();

  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === currentLocale);
  };

  const menu = (
    <Menu>
      {supportedLanguages.map(language => (
        <Menu.Item
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={currentLocale === language.code ? 'ant-menu-item-selected' : ''}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
      <Button type="text" className="flex items-center">
        <GlobalOutlined className="mr-1" />
        <span className="mr-1">{getCurrentLanguage()?.flag}</span>
        <span>{getCurrentLanguage()?.name}</span>
      </Button>
    </Dropdown>
  );
};

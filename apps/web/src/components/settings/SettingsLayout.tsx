import React from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Settings,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SettingsTab {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const tabs: SettingsTab[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal information',
    icon: <User className="h-5 w-5" />,
    href: '/settings/profile',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Protect your account',
    icon: <Shield className="h-5 w-5" />,
    href: '/settings/security',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure your notification preferences',
    icon: <Bell className="h-5 w-5" />,
    href: '/settings/notifications',
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Manage your billing information and subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/settings/billing',
  },
  {
    id: 'api',
    title: 'API Keys',
    description: 'Manage your API keys',
    icon: <Key className="h-5 w-5" />,
    href: '/settings/api',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings/preferences',
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start px-4',
                      currentPath === tab.href
                        ? 'bg-muted'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => router.push(tab.href)}
                  >
                    <div className="flex items-center">
                      {tab.icon}
                      <div className="ml-3 text-left">
                        <div className="text-sm font-medium">
                          {tab.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-9">
          {children}
        </div>
      </div>
    </div>
  );
};

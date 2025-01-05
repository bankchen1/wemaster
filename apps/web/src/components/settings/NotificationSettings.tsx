import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  BookOpen,
  FileText,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  icon: React.ReactNode;
  category: 'courses' | 'assignments' | 'messages' | 'system';
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'course_updates',
    title: 'Course Updates',
    description: 'Get notified when a course is updated or new content is added',
    email: true,
    push: true,
    sms: false,
    icon: <BookOpen className="h-5 w-5" />,
    category: 'courses',
  },
  {
    id: 'course_announcements',
    title: 'Course Announcements',
    description: 'Receive important announcements from your tutors',
    email: true,
    push: true,
    sms: true,
    icon: <Bell className="h-5 w-5" />,
    category: 'courses',
  },
  {
    id: 'assignment_deadlines',
    title: 'Assignment Deadlines',
    description: 'Get reminded about upcoming assignment deadlines',
    email: true,
    push: true,
    sms: true,
    icon: <Calendar className="h-5 w-5" />,
    category: 'assignments',
  },
  {
    id: 'assignment_feedback',
    title: 'Assignment Feedback',
    description: 'Get notified when you receive feedback on your assignments',
    email: true,
    push: true,
    sms: false,
    icon: <FileText className="h-5 w-5" />,
    category: 'assignments',
  },
  {
    id: 'direct_messages',
    title: 'Direct Messages',
    description: 'Receive notifications for direct messages',
    email: false,
    push: true,
    sms: false,
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'messages',
  },
  {
    id: 'discussion_mentions',
    title: 'Discussion Mentions',
    description: 'Get notified when someone mentions you in a discussion',
    email: true,
    push: true,
    sms: false,
    icon: <MessageCircle className="h-5 w-5" />,
    category: 'messages',
  },
  {
    id: 'system_updates',
    title: 'System Updates',
    description: 'Important updates about the platform',
    email: true,
    push: true,
    sms: true,
    icon: <AlertCircle className="h-5 w-5" />,
    category: 'system',
  },
];

export const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [frequency, setFrequency] = useState('realtime');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (
    settingId: string,
    channel: 'email' | 'push' | 'sms',
    value: boolean
  ) => {
    try {
      // 调用 API 更新通知设置
      await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingId,
          channel,
          value,
        }),
      });

      setSettings(
        settings.map((setting) =>
          setting.id === settingId
            ? { ...setting, [channel]: value }
            : setting
        )
      );

      toast({
        title: 'Success',
        description: 'Notification settings updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    }
  };

  const handleFrequencyChange = async (value: string) => {
    try {
      setIsLoading(true);
      // 调用 API 更新通知频率
      await fetch('/api/user/notification-frequency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: value }),
      });

      setFrequency(value);
      toast({
        title: 'Success',
        description: 'Notification frequency updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification frequency',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'courses', title: 'Courses' },
    { id: 'assignments', title: 'Assignments' },
    { id: 'messages', title: 'Messages' },
    { id: 'system', title: 'System' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage how and when you want to be notified
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Hourly Digest</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle>{category.title}</CardTitle>
            <CardDescription>
              Manage notifications for {category.title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings
              .filter((setting) => setting.category === category.id)
              .map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    {setting.icon}
                    <div>
                      <p className="font-medium">{setting.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <Mail className="h-4 w-4 mb-1" />
                      <Switch
                        checked={setting.email}
                        onCheckedChange={(checked) =>
                          handleToggle(setting.id, 'email', checked)
                        }
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <Bell className="h-4 w-4 mb-1" />
                      <Switch
                        checked={setting.push}
                        onCheckedChange={(checked) =>
                          handleToggle(setting.id, 'push', checked)
                        }
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-4 w-4 mb-1" />
                      <Switch
                        checked={setting.sms}
                        onCheckedChange={(checked) =>
                          handleToggle(setting.id, 'sms', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Email Subscriptions</CardTitle>
          <CardDescription>
            Manage your email newsletter preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Newsletter</p>
              <p className="text-sm text-muted-foreground">
                Get weekly updates about new courses and features
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Product Updates</p>
              <p className="text-sm text-muted-foreground">
                Stay informed about platform improvements
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">
                Receive special offers and promotions
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

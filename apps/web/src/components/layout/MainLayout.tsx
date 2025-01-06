import React, { useEffect } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, notification } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  CalendarOutlined,
  MessageOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/userSlice';

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { unreadCount, notifications, connect } = useNotification();

  useEffect(() => {
    if (user) {
      connect(); // 连接WebSocket
    }
  }, [user]);

  const studentMenuItems = [
    {
      key: '/student/dashboard',
      icon: <HomeOutlined />,
      label: '仪表盘',
    },
    {
      key: '/student/courses',
      icon: <BookOutlined />,
      label: '我的课程',
    },
    {
      key: '/student/booking',
      icon: <CalendarOutlined />,
      label: '预约课程',
    },
    {
      key: '/message/chat',
      icon: <MessageOutlined />,
      label: '消息中心',
    },
  ];

  const tutorMenuItems = [
    {
      key: '/tutor/dashboard',
      icon: <HomeOutlined />,
      label: '仪表盘',
    },
    {
      key: '/tutor/courses',
      icon: <BookOutlined />,
      label: '课程管理',
    },
    {
      key: '/tutor/schedule',
      icon: <CalendarOutlined />,
      label: '日程管理',
    },
    {
      key: '/message/chat',
      icon: <MessageOutlined />,
      label: '消息中心',
    },
  ];

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => router.push(\`/\${user.role}/profile\`)}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" onClick={() => router.push('/settings')}>
        系统设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      {notifications.map((notif) => (
        <Menu.Item key={notif.id} onClick={() => router.push(notif.link)}>
          <div className="max-w-sm">
            <div className="font-medium">{notif.title}</div>
            <div className="text-sm text-gray-500 truncate">{notif.content}</div>
            <div className="text-xs text-gray-400">{notif.time}</div>
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item onClick={() => router.push('/notifications')}>
        查看全部通知
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold mr-8">WeMaster</div>
          <Menu mode="horizontal" selectedKeys={[router.pathname]}>
            <Menu.Item key="/">首页</Menu.Item>
            <Menu.Item key="/search">找老师</Menu.Item>
            <Menu.Item key="/subject/list">课程分类</Menu.Item>
          </Menu>
        </div>
        <div className="flex items-center space-x-4">
          <Dropdown overlay={notificationMenu} trigger={['click']}>
            <Badge count={unreadCount} className="cursor-pointer">
              <BellOutlined className="text-xl" />
            </Badge>
          </Dropdown>
          <Dropdown overlay={userMenu}>
            <div className="flex items-center cursor-pointer">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span className="ml-2">{user?.name}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="bg-white">
          <Menu
            mode="inline"
            selectedKeys={[router.pathname]}
            style={{ height: '100%' }}
            items={user?.role === 'student' ? studentMenuItems : tutorMenuItems}
            onClick={({ key }) => handleMenuClick(key as string)}
          />
        </Sider>
        <Layout className="p-6">
          <Content className="bg-white p-6 min-h-[280px]">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

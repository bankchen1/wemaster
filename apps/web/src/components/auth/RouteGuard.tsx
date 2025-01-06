import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

// 公开路由
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/',
  '/about',
  '/search',
  '/subject/list',
];

// 角色路由映射
const roleRoutes = {
  student: ['/student', '/course', '/message', '/payment'],
  tutor: ['/tutor', '/course', '/message', '/payment'],
  admin: ['/admin'],
};

export const RouteGuard = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 处理路由权限
    const handleRouting = () => {
      const path = router.pathname;

      // 如果是公开路由，直接通过
      if (publicRoutes.some(route => path.startsWith(route))) {
        return;
      }

      // 如果用户未登录，重定向到登录页
      if (!user && !loading) {
        router.push(\`/auth/login?redirect=\${encodeURIComponent(path)}\`);
        return;
      }

      // 如果用户已登录，检查路由权限
      if (user) {
        const allowedRoutes = roleRoutes[user.role] || [];
        const hasPermission = allowedRoutes.some(route => path.startsWith(route));

        if (!hasPermission) {
          // 如果没有权限，重定向到对应角色的首页
          router.push(\`/\${user.role}/dashboard\`);
        }
      }
    };

    handleRouting();
  }, [router.pathname, user, loading]);

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

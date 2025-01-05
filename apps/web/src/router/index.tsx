import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PrivateRoute } from './PrivateRoute';
import { RoleRoute } from './RoleRoute';

// 公共页面
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Values } from '../pages/Values';
import { BecomeTutor } from '../pages/BecomeTutor';
import { Search } from '../pages/Search';
import { TutorMatch } from '../pages/TutorMatch';

// 认证页面
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// 学生页面
import { StudentDashboard } from '../pages/student/Dashboard';
import { StudentProfile } from '../pages/student/Profile';
import { StudentCourses } from '../pages/student/Courses';
import { StudentLessons } from '../pages/student/Lessons';

// 导师页面
import { TutorDashboard } from '../pages/tutor/Dashboard';
import { TutorProfile } from '../pages/tutor/Profile';
import { TutorCourses } from '../pages/tutor/Courses';
import { TutorSchedule } from '../pages/tutor/Schedule';

// 直播课堂
import { LiveClassroom } from '../components/live/LiveClassroom';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公共路由 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="values" element={<Values />} />
          <Route path="become-tutor" element={<BecomeTutor />} />
          <Route path="search" element={<Search />} />
          <Route path="tutor-match" element={<TutorMatch />} />
          
          {/* 认证路由 */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />

          {/* 学生路由 */}
          <Route
            path="student/*"
            element={
              <RoleRoute role="student">
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="courses" element={<StudentCourses />} />
                  <Route path="lessons" element={<StudentLessons />} />
                </Routes>
              </RoleRoute>
            }
          />

          {/* 导师路由 */}
          <Route
            path="tutor/*"
            element={
              <RoleRoute role="tutor">
                <Routes>
                  <Route path="dashboard" element={<TutorDashboard />} />
                  <Route path="profile" element={<TutorProfile />} />
                  <Route path="courses" element={<TutorCourses />} />
                  <Route path="schedule" element={<TutorSchedule />} />
                </Routes>
              </RoleRoute>
            }
          />
        </Route>

        {/* 直播课堂（全屏） */}
        <Route
          path="live/:classId"
          element={
            <PrivateRoute>
              <LiveClassroom />
            </PrivateRoute>
          }
        />

        {/* 404重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

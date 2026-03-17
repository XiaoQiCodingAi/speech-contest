import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Users from './pages/Users';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import StudentEdit from './pages/StudentEdit';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import TeacherEdit from './pages/TeacherEdit';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import AuditLogs from './pages/AuditLogs';
import TeacherPermissions from './pages/TeacherPermissions';
import './App.css';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  // 如果指定了需要的角色，检查用户是否有权限
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route
              path="users"
              element={
                <PrivateRoute requiredRoles={['admin']}>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route
              path="students/edit/:id"
              element={
                <PrivateRoute requiredRoles={['admin', 'leader']}>
                  <StudentEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="teachers"
              element={
                <PrivateRoute requiredRoles={['admin', 'leader']}>
                  <Teachers />
                </PrivateRoute>
              }
            />
            <Route
              path="teachers/:id"
              element={
                <PrivateRoute requiredRoles={['admin', 'leader']}>
                  <TeacherDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="teachers/edit/:id"
              element={
                <PrivateRoute requiredRoles={['admin', 'leader']}>
                  <TeacherEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="classes"
              element={
                <PrivateRoute requiredRoles={['admin', 'leader']}>
                  <Classes />
                </PrivateRoute>
              }
            />
            <Route
              path="classes/:id"
              element={
                <PrivateRoute requiredRoles={['admin', 'leader']}>
                  <ClassDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="logs"
              element={
                <PrivateRoute requiredRoles={['admin']}>
                  <AuditLogs />
                </PrivateRoute>
              }
            />
            <Route
              path="permissions"
              element={
                <PrivateRoute requiredRoles={['admin']}>
                  <TeacherPermissions />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;

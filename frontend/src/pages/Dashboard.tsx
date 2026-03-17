import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme, Drawer } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  BookOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  MenuOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/auth.service';
import ChangePassword from '../components/ChangePassword';
import './Dashboard.css';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 断点：768px 以下为移动端
  const isMobile = window.innerWidth < 768;

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/dashboard/students',
      icon: <TeamOutlined />,
      label: '学生档案',
    },
    {
      key: '/dashboard/teachers',
      icon: <SolutionOutlined />,
      label: '教师档案',
      roles: ['admin', 'leader'],
    },
    {
      key: '/dashboard/classes',
      icon: <BookOutlined />,
      label: '班级管理',
      roles: ['admin', 'leader'],
    },
    {
      key: '/dashboard/users',
      icon: <UserOutlined />,
      label: '用户管理',
      roles: ['admin'],
    },
    {
      key: '/dashboard/permissions',
      icon: <SafetyOutlined />,
      label: '权限配置',
      roles: ['admin'],
    },
    {
      key: '/dashboard/logs',
      icon: <FileTextOutlined />,
      label: '操作日志',
      roles: ['admin'],
    },
  ];

  // 过滤菜单：无角色限制或有角色且用户角色匹配
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleUserMenuClick = (e: { key: string }) => {
    if (e.key === 'change-password') {
      setChangePasswordVisible(true);
    } else if (e.key === 'logout') {
      handleLogout();
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: '修改密码',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={filteredMenuItems}
      onClick={handleMenuClick}
    />
  );

  // 移动端底部导航
  const bottomNavItems = filteredMenuItems.slice(0, 4).concat([
    {
      key: 'more',
      icon: <MenuOutlined />,
      label: '更多',
      onClick: () => setDrawerVisible(true),
    },
  ]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端：左侧边栏 */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={200}
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
            background: '#001529',
          }}
        >
          <div className="logo">
            {collapsed ? '档' : '学校档案管理'}
          </div>
          {menuContent}
        </Sider>
      )}

      {/* 移动端：抽屉菜单 */}
      {isMobile && (
        <Drawer
          title="菜单"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={filteredMenuItems}
            onClick={handleMenuClick}
          />
        </Drawer>
      )}

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          {!isMobile ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
              <div style={{ marginRight: 24, display: 'flex', alignItems: 'center' }}>
                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                >
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                    <span>{user?.name || '用户'}</span>
                    <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                      ({user?.role === 'admin' ? '管理员' : user?.role === 'leader' ? '领导' : '教师'})
                    </span>
                  </div>
                </Dropdown>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>学校档案管理</span>
            </div>
          )}
        </Header>

        <Content
          style={{
            margin: isMobile ? '12px 8px 70px 8px' : '24px 16px',
            padding: isMobile ? 12 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>

        {/* 移动端底部导航 */}
        {isMobile && (
          <div className="mobile-bottom-nav">
            {bottomNavItems.map((item: any) => (
              <div
                key={item.key}
                className={`mobile-nav-item ${location.pathname === item.key ? 'active' : ''}`}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    navigate(item.key);
                  }
                }}
              >
                <div className="mobile-nav-icon">{item.icon}</div>
                <div className="mobile-nav-label">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </Layout>

      {/* 修改密码模态框 */}
      <ChangePassword
        visible={changePasswordVisible}
        onCancel={() => setChangePasswordVisible(false)}
      />
    </Layout>
  );
};

export default Dashboard;

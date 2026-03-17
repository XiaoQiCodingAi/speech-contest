import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { studentsService } from '../services/students.service';
import { teachersService } from '../services/teachers.service';
import { classesService } from '../services/classes.service';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: { total: 0, active: 0 },
    teachers: { total: 0, active: 0 },
    classes: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 添加超时处理
      const timeout = (promise: Promise<any>, ms: number) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), ms)
          )
        ]);
      };

      const [studentsStats, teachersStats, classesData] = await Promise.all([
        timeout(studentsService.getStats(), 5000).catch(() => ({ total: 0, active: 0 })),
        timeout(teachersService.getStats(), 5000).catch(() => ({ total: 0, active: 0 })),
        timeout(classesService.getAll({ pageSize: 1 }), 5000).catch(() => ({ total: 0 })),
      ]);

      setStats({
        students: studentsStats,
        teachers: teachersStats,
        classes: classesData.total,
      });
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统概览</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.students.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="教师总数"
              value={stats.teachers.total}
              prefix={<SolutionOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="班级总数"
              value={stats.classes}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃学生"
              value={stats.students.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Tabs,
  Tag,
  Spin,
  message,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { classesService } from '../services/classes.service';
import { filesService } from '../services/files.service';
import type { FileItem } from '../services/files.service';
import FileUpload from '../components/FileUpload';

interface ClassData {
  id: number;
  name: string;
  grade: string;
  year: number;
  description: string;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (id) {
      loadClass();
      loadFiles();
    }
  }, [id]);

  const loadClass = async () => {
    try {
      setLoading(true);
      const result = await classesService.getById(parseInt(id!));
      setClassData(result);
    } catch (error: any) {
      message.error('加载班级信息失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const result = await filesService.getFilesByEntity('class', parseInt(id!));
      setFiles(result);
    } catch (error) {
      console.error('加载文件失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!classData) {
    return <div>班级不存在</div>;
  }

  const tabItems = [
    {
      key: 'files',
      label: (
        <span>
          <FileOutlined />
          文件
        </span>
      ),
      children: (
        <FileUpload
          entityType="class"
          entityId={classData.id}
          files={files}
          onRefresh={loadFiles}
        />
      ),
    },
    {
      key: 'info',
      label: (
        <span>
          <TeamOutlined />
          信息
        </span>
      ),
      children: (
        <Card>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="班级名称">{classData.name}</Descriptions.Item>
            <Descriptions.Item label="年级">{classData.grade || '-'}</Descriptions.Item>
            <Descriptions.Item label="年份">{classData.year || '-'}</Descriptions.Item>
            <Descriptions.Item label="学生人数">{classData.studentCount || 0} 人</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={classData.isActive ? 'success' : 'error'}>
                {classData.isActive ? '启用' : '停用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{classData.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(classData.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(classData.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/classes')}>
            返回列表
          </Button>
        </Space>
        <Space>
          <Tag color={classData.isActive ? 'success' : 'error'}>
            {classData.isActive ? '启用' : '停用'}
          </Tag>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              // 跳转到班级编辑页面（可以复用 Classes 页面的编辑弹窗逻辑）
              message.info('请在班级列表页面编辑');
            }}
          >
            编辑
          </Button>
        </Space>
      </div>

      <Card title={`${classData.name}${classData.grade ? ` (${classData.grade})` : ''}`}>
        <Tabs defaultActiveKey="files" items={tabItems} />
      </Card>
    </div>
  );
};

export default ClassDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Spin,
  message,
  Space,
  Tabs,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, FileOutlined, UserOutlined } from '@ant-design/icons';
import { teachersService } from '../services/teachers.service';
import { filesService } from '../services/files.service';
import type { FileItem } from '../services/files.service';
import FileUpload from '../components/FileUpload';

interface Teacher {
  id: number;
  employeeNo: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  subject: string;
  status: string;
  joinDate: string;
  leaveDate: string;
  remarks: string;
  classes?: { id: number; name: string }[];
  creator?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (id) {
      loadTeacher();
      loadFiles();
    }
  }, [id]);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      const result = await teachersService.getById(parseInt(id!));
      setTeacher(result);
    } catch (error: any) {
      message.error('加载教师信息失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const result = await filesService.getFilesByEntity('teacher', parseInt(id!));
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

  if (!teacher) {
    return <div>教师不存在</div>;
  }

  const statusMap: Record<string, { color: string; text: string }> = {
    active: { color: 'success', text: '在职' },
    on_leave: { color: 'warning', text: '休假' },
    resigned: { color: 'error', text: '离职' },
  };

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
          entityType="teacher"
          entityId={teacher.id}
          files={files}
          onRefresh={loadFiles}
        />
      ),
    },
    {
      key: 'info',
      label: (
        <span>
          <UserOutlined />
          信息
        </span>
      ),
      children: (
        <Card>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="工号">{teacher.employeeNo}</Descriptions.Item>
            <Descriptions.Item label="姓名">{teacher.name}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {teacher.gender === 'male' ? '男' : teacher.gender === 'female' ? '女' : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">{teacher.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[teacher.status]?.color || 'default'}>
                {statusMap[teacher.status]?.text || teacher.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">{teacher.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="任教科目">{teacher.subject || '-'}</Descriptions.Item>
            <Descriptions.Item label="入职日期">
              {teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="离职日期">
              {teacher.leaveDate ? new Date(teacher.leaveDate).toLocaleDateString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="负责班级">
              {teacher.classes && teacher.classes.length > 0
                ? teacher.classes.map((c) => c.name).join('、')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {teacher.remarks || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建者">{teacher.creator?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(teacher.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(teacher.updatedAt).toLocaleString()}
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/teachers')}>
            返回列表
          </Button>
        </Space>
        <Space>
          <Tag color={statusMap[teacher.status]?.color || 'default'}>
            {statusMap[teacher.status]?.text || teacher.status}
          </Tag>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/teachers/edit/${id}`)}
          >
            编辑
          </Button>
        </Space>
      </div>

      <Card title={`${teacher.name} (${teacher.employeeNo})`}>
        <Tabs defaultActiveKey="files" items={tabItems} />
      </Card>
    </div>
  );
};

export default TeacherDetail;

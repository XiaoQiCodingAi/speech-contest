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
  UserOutlined,
} from '@ant-design/icons';
import { studentsService } from '../services/students.service';
import { filesService } from '../services/files.service';
import type { FileItem } from '../services/files.service';
import FileUpload from '../components/FileUpload';

interface Student {
  id: number;
  studentNo: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  parentPhone: string;
  address: string;
  remarks: string;
  isActive: boolean;
  classId: number;
  class: { id: number; name: string };
  creator?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (id) {
      loadStudent();
      loadFiles();
    }
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const result = await studentsService.getById(parseInt(id!));
      setStudent(result);
    } catch (error: any) {
      message.error('加载学生信息失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const result = await filesService.getFilesByEntity('student', parseInt(id!));
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

  if (!student) {
    return <div>学生不存在</div>;
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
          entityType="student"
          entityId={student.id}
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
            <Descriptions.Item label="学号">{student.studentNo}</Descriptions.Item>
            <Descriptions.Item label="姓名">{student.name}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {student.gender === 'male' ? '男' : student.gender === 'female' ? '女' : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="班级">{student.class?.name}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{student.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="家长电话">{student.parentPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="出生日期">
              {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={student.isActive ? 'success' : 'error'}>
                {student.isActive ? '在读' : '离校'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="家庭住址" span={2}>{student.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{student.remarks || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建者">{student.creator?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(student.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(student.updatedAt).toLocaleString()}
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/students')}>
            返回列表
          </Button>
        </Space>
        <Space>
          <Tag color={student.isActive ? 'success' : 'error'}>
            {student.isActive ? '在读' : '离校'}
          </Tag>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/students/edit/${id}`)}
          >
            编辑
          </Button>
        </Space>
      </div>

      <Card title={`${student.name} (${student.studentNo})`}>
        <Tabs defaultActiveKey="files" items={tabItems} />
      </Card>
    </div>
  );
};

export default StudentDetail;

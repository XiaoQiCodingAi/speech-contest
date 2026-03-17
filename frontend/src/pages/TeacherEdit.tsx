import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Spin,
  Space,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { teachersService } from '../services/teachers.service';
import { classesService } from '../services/classes.service';
import dayjs from 'dayjs';

interface ClassItem {
  id: number;
  name: string;
}

const TeacherEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const teacherData = await teachersService.getById(parseInt(id!));
      const classesData = await classesService.getAll();
      
      form.setFieldsValue({
        employeeNo: teacherData.employeeNo,
        name: teacherData.name,
        gender: teacherData.gender,
        phone: teacherData.phone,
        email: teacherData.email,
        subject: teacherData.subject,
        status: teacherData.status,
        joinDate: teacherData.joinDate ? dayjs(teacherData.joinDate) : null,
        leaveDate: teacherData.leaveDate ? dayjs(teacherData.leaveDate) : null,
        remarks: teacherData.remarks,
        classIds: teacherData.classes?.map((c: ClassItem) => c.id) || [],
      });
      setClasses(classesData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      const updateData = {
        ...values,
        joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : null,
        leaveDate: values.leaveDate ? values.leaveDate.format('YYYY-MM-DD') : null,
      };
      await teachersService.update(parseInt(id!), updateData);
      message.success('保存成功');
      navigate(`/dashboard/teachers/${id}`);
    } catch (error: any) {
      message.error(error.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/dashboard/teachers/${id}`)}>
            返回详情
          </Button>
        </Space>
      </div>

      <Card title="编辑教师信息">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="employeeNo" label="工号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="gender" label="性别">
            <Select allowClear>
              <Select.Option value="male">男</Select.Option>
              <Select.Option value="female">女</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input type="email" />
          </Form.Item>

          <Form.Item name="subject" label="任教科目">
            <Input />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="active">在职</Select.Option>
              <Select.Option value="on_leave">休假</Select.Option>
              <Select.Option value="resigned">离职</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="joinDate" label="入职日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="leaveDate" label="离职日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="classIds" label="负责班级">
            <Select mode="multiple" allowClear placeholder="请选择班级">
              {classes.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TeacherEdit;

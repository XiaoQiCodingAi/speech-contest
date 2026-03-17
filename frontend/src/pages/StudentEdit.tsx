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
import { studentsService } from '../services/students.service';
import { classesService } from '../services/classes.service';
import dayjs from 'dayjs';

interface ClassItem {
  id: number;
  name: string;
}

const StudentEdit: React.FC = () => {
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
      const studentData = await studentsService.getById(parseInt(id!));
      const classesData = await classesService.getAll();
      
      form.setFieldsValue({
        studentNo: studentData.studentNo,
        name: studentData.name,
        gender: studentData.gender,
        phone: studentData.phone,
        parentPhone: studentData.parentPhone,
        address: studentData.address,
        remarks: studentData.remarks,
        isActive: studentData.isActive,
        classId: studentData.classId,
        birthDate: studentData.birthDate ? dayjs(studentData.birthDate) : null,
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
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
      };
      await studentsService.update(parseInt(id!), updateData);
      message.success('保存成功');
      navigate(`/dashboard/students/${id}`);
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/dashboard/students/${id}`)}>
            返回详情
          </Button>
        </Space>
      </div>

      <Card title="编辑学生信息">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="studentNo" label="学号" rules={[{ required: true }]}>
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

          <Form.Item name="classId" label="班级">
            <Select allowClear placeholder="请选择班级">
              {classes.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>

          <Form.Item name="parentPhone" label="家长电话">
            <Input />
          </Form.Item>

          <Form.Item name="birthDate" label="出生日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="address" label="家庭住址">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="isActive" label="状态" valuePropName="checked">
            <Select>
              <Select.Option value={true}>在读</Select.Option>
              <Select.Option value={false}>离校</Select.Option>
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

export default StudentEdit;

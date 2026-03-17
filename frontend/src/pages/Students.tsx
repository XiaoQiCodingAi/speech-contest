import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  DatePicker,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { studentsService } from '../services/students.service';
import { classesService } from '../services/classes.service';

const { Option } = Select;
const { TextArea } = Input;

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
  createdAt: string;
}

interface Class {
  id: number;
  name: string;
}

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [classId, setClassId] = useState<number | undefined>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  // 获取当前用户信息
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';
  const isLeader = user?.role === 'leader';
  const canManage = isAdmin || isLeader;

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, keyword, classId]);

  const loadClasses = async () => {
    try {
      const result = await classesService.getAllSimple();
      setClasses(result);
    } catch (error) {
      console.error('加载班级失败');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await studentsService.getAll({
        page,
        pageSize,
        keyword: keyword || undefined,
        classId,
      });
      setData(result.data);
      setTotal(result.total);
    } catch (error: any) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Student) => {
    setEditingStudent(record);
    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate ? new Date(record.birthDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleView = (record: Student) => {
    navigate(`/dashboard/students/${record.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await studentsService.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        birthDate: values.birthDate?.format('YYYY-MM-DD'),
      };
      if (editingStudent) {
        await studentsService.update(editingStudent.id, submitData);
        message.success('更新成功');
      } else {
        await studentsService.create(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '学号',
      dataIndex: 'studentNo',
      key: 'studentNo',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Student) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {canManage && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {isAdmin && (
            <Popconfirm
              title="确定要删除此学生吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Input.Search
          placeholder="搜索学号、姓名或电话"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 250 }}
          enterButton
        />
        <Select
          placeholder="选择班级"
          value={classId}
          onChange={setClassId}
          allowClear
          style={{ width: 150 }}
        >
          {classes.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加学生
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 450 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title={editingStudent ? '编辑学生' : '添加学生'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentNo"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别">
              <Option value="male">男</Option>
              <Option value="female">女</Option>
            </Select>
          </Form.Item>
          <Form.Item name="birthDate" label="出生日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="classId"
            label="班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Select placeholder="请选择班级">
              {classes.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="parentPhone" label="家长电话">
            <Input placeholder="请输入家长电话" />
          </Form.Item>
          <Form.Item name="address" label="家庭住址">
            <Input placeholder="请输入家庭住址" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
          {editingStudent && (
            <Form.Item name="isActive" label="状态" valuePropName="checked">
              <Switch checkedChildren="在读" unCheckedChildren="离校" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Students;

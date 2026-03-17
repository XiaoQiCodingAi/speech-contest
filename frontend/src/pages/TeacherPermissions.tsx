import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Transfer,
  message,
  Tag,
  Space,
  Switch,
  Popconfirm,
  Card,
} from 'antd';
import { SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { permissionsService } from '../services/permissions.service';
import type { TeacherWithPermissions, TeacherPermissionItem } from '../services/permissions.service';
import { classesService } from '../services/classes.service';

const TeacherPermissions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherWithPermissions[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherWithPermissions | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentPermissions, setCurrentPermissions] = useState<TeacherPermissionItem[]>([]);

  useEffect(() => {
    loadData();
    loadClasses();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await permissionsService.getAllTeachers();
      setTeachers(result);
    } catch (error: any) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const result = await classesService.getAllSimple();
      setClasses(result);
    } catch (error) {
      console.error('加载班级失败');
    }
  };

  const handleConfig = (teacher: TeacherWithPermissions) => {
    setCurrentTeacher(teacher);
    setSelectedClassIds(teacher.permissions.map(p => p.classId));
    setModalVisible(true);
  };

  const handleViewDetail = async (teacher: TeacherWithPermissions) => {
    try {
      const result = await permissionsService.getTeacherPermissions(teacher.id);
      setCurrentPermissions(result);
      setCurrentTeacher(teacher);
      setDetailVisible(true);
    } catch (error: any) {
      message.error('加载权限详情失败');
    }
  };

  const handleSave = async () => {
    if (!currentTeacher) return;

    try {
      await permissionsService.setTeacherPermissions(
        currentTeacher.id,
        selectedClassIds,
        { canView: true, canEdit: false, canDelete: false },
      );
      message.success('配置成功');
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || '配置失败');
    }
  };

  const handleUpdatePermission = async (
    permissionId: number,
    field: 'canView' | 'canEdit' | 'canDelete',
    value: boolean,
  ) => {
    try {
      await permissionsService.updatePermission(permissionId, { [field]: value });
      message.success('更新成功');
      // 刷新详情
      if (currentTeacher) {
        const result = await permissionsService.getTeacherPermissions(currentTeacher.id);
        setCurrentPermissions(result);
      }
      loadData();
    } catch (error: any) {
      message.error('更新失败');
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    try {
      await permissionsService.removePermission(permissionId);
      message.success('删除成功');
      // 刷新详情
      if (currentTeacher) {
        const result = await permissionsService.getTeacherPermissions(currentTeacher.id);
        setCurrentPermissions(result);
      }
      loadData();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '教师姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '可访问班级数',
      key: 'classCount',
      width: 120,
      render: (_: any, record: TeacherWithPermissions) => (
        <Tag color="blue">{record.permissions.length} 个班级</Tag>
      ),
    },
    {
      title: '班级列表',
      key: 'classes',
      ellipsis: true,
      render: (_: any, record: TeacherWithPermissions) => (
        <Space wrap>
          {record.permissions.slice(0, 5).map((p, index) => (
            <Tag key={index}>{p.className}</Tag>
          ))}
          {record.permissions.length > 5 && (
            <Tag>+{record.permissions.length - 5}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: TeacherWithPermissions) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleConfig(record)}
          >
            配置权限
          </Button>
        </Space>
      ),
    },
  ];

  const transferDataSource = classes.map((c) => ({
    key: c.id.toString(),
    title: c.name,
  }));

  return (
    <div>
      <Card title="教师权限配置" style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, color: '#8c8c8c' }}>
          配置教师可以访问的班级范围。教师只能查看和管理被授权班级的学生信息。
        </p>
      </Card>

      <Table
        columns={columns}
        dataSource={teachers}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={`配置权限 - ${currentTeacher?.name}`}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#8c8c8c' }}>
            选择该教师可以访问的班级：
          </p>
        </div>
        <Transfer
          dataSource={transferDataSource}
          titles={['可选班级', '已授权班级']}
          targetKeys={selectedClassIds.map(String)}
          onChange={(keys) => setSelectedClassIds(keys.map(Number))}
          render={(item) => item.title}
          listStyle={{ width: 280, height: 400 }}
          showSearch
          filterOption={(input, item) =>
            item.title.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Modal>

      <Modal
        title={`权限详情 - ${currentTeacher?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={currentPermissions}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: '班级',
              dataIndex: 'className',
              key: 'className',
            },
            {
              title: '查看',
              dataIndex: 'canView',
              key: 'canView',
              width: 80,
              render: (value: boolean, record: TeacherPermissionItem) => (
                <Switch
                  checked={value}
                  size="small"
                  onChange={(checked) => handleUpdatePermission(record.id, 'canView', checked)}
                />
              ),
            },
            {
              title: '编辑',
              dataIndex: 'canEdit',
              key: 'canEdit',
              width: 80,
              render: (value: boolean, record: TeacherPermissionItem) => (
                <Switch
                  checked={value}
                  size="small"
                  onChange={(checked) => handleUpdatePermission(record.id, 'canEdit', checked)}
                />
              ),
            },
            {
              title: '删除',
              dataIndex: 'canDelete',
              key: 'canDelete',
              width: 80,
              render: (value: boolean, record: TeacherPermissionItem) => (
                <Switch
                  checked={value}
                  size="small"
                  onChange={(checked) => handleUpdatePermission(record.id, 'canDelete', checked)}
                />
              ),
            },
            {
              title: '授权人',
              dataIndex: 'grantedBy',
              key: 'grantedBy',
              width: 100,
            },
            {
              title: '操作',
              key: 'action',
              width: 80,
              render: (_: any, record: TeacherPermissionItem) => (
                <Popconfirm
                  title="确定要删除此权限吗？"
                  onConfirm={() => handleRemovePermission(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default TeacherPermissions;

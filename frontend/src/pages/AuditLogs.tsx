import React, { useEffect, useState } from 'react';
import {
  Table,
  Select,
  DatePicker,
  Tag,
  message,
  Descriptions,
  Modal,
  Button,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { auditLogsService } from '../services/audit-logs.service';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValue: any;
  newValue: any;
  description: string;
  ip: string;
  user: { id: number; username: string; name: string };
  createdAt: string;
}

const AuditLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [action, setAction] = useState<string | undefined>();
  const [entityType, setEntityType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadData();
  }, [page, pageSize, action, entityType, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, pageSize, action, entityType };
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const result = await auditLogsService.getAll(params);
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

  const handleView = (record: AuditLog) => {
    setCurrentLog(record);
    setDetailVisible(true);
  };

  const actionMap: Record<string, { color: string; text: string }> = {
    create: { color: 'success', text: '创建' },
    update: { color: 'warning', text: '更新' },
    delete: { color: 'error', text: '删除' },
    login: { color: 'blue', text: '登录' },
    logout: { color: 'default', text: '登出' },
  };

  const entityTypeMap: Record<string, string> = {
    User: '用户',
    Student: '学生',
    Teacher: '教师',
    Class: '班级',
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => {
        const config = actionMap[action] || { color: 'default', text: action };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '实体类型',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 100,
      render: (type: string) => entityTypeMap[type] || type,
    },
    {
      title: '实体ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 80,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: ['user', 'name'],
      key: 'userName',
      width: 100,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: AuditLog) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Select
          placeholder="选择操作类型"
          value={action}
          onChange={setAction}
          allowClear
          style={{ width: 120 }}
        >
          <Option value="create">创建</Option>
          <Option value="update">更新</Option>
          <Option value="delete">删除</Option>
          <Option value="login">登录</Option>
          <Option value="logout">登出</Option>
        </Select>
        <Select
          placeholder="选择实体类型"
          value={entityType}
          onChange={setEntityType}
          allowClear
          style={{ width: 120 }}
        >
          <Option value="User">用户</Option>
          <Option value="Student">学生</Option>
          <Option value="Teacher">教师</Option>
          <Option value="Class">班级</Option>
        </Select>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates as any)}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
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
        title="操作详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentLog && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="操作类型">
              {actionMap[currentLog.action]?.text || currentLog.action}
            </Descriptions.Item>
            <Descriptions.Item label="实体类型">
              {entityTypeMap[currentLog.entityType] || currentLog.entityType}
            </Descriptions.Item>
            <Descriptions.Item label="实体ID">
              {currentLog.entityId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">
              {currentLog.user?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="IP地址">
              {currentLog.ip}
            </Descriptions.Item>
            <Descriptions.Item label="操作时间">
              {new Date(currentLog.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {currentLog.description || '-'}
            </Descriptions.Item>
            {currentLog.oldValue && (
              <Descriptions.Item label="原值" span={2}>
                <pre style={{ margin: 0, maxHeight: 200, overflow: 'auto' }}>
                  {JSON.stringify(currentLog.oldValue, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {currentLog.newValue && (
              <Descriptions.Item label="新值" span={2}>
                <pre style={{ margin: 0, maxHeight: 200, overflow: 'auto' }}>
                  {JSON.stringify(currentLog.newValue, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;

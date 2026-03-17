import React, { useState, useEffect } from 'react';
import {
  Upload,
  Button,
  message,
  List,
  Image,
  Modal,
  Progress,
  Space,
  Typography,
  Input,
  Dropdown,
  Empty,
  TreeSelect,
} from 'antd';
import {
  UploadOutlined,
  FolderOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CloseOutlined,
  FolderAddOutlined,
  MoreOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { filesService } from '../services/files.service';
import { foldersService } from '../services/folders.service';
import type { Folder } from '../services/folders.service';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface FileUploadProps {
  entityType: 'student' | 'teacher';
  entityId: number;
  files: FileItem[];
  onRefresh: () => void;
  readonly?: boolean;
}

interface FileItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'image' | 'document' | 'other';
  folderId?: number | null;
  createdAt: string;
  uploader?: { id: number; name: string };
}

const FileUpload: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  files,
  onRefresh,
  readonly = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 文件夹相关状态
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // 移动相关状态
  const [moveVisible, setMoveVisible] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ type: 'file' | 'folder'; id: number } | null>(null);
  const [moveTargetFolder, setMoveTargetFolder] = useState<number | null>(null);

  useEffect(() => {
    loadFolders();
  }, [entityType, entityId]);

  const loadFolders = async () => {
    try {
      const result = await foldersService.getAll(entityType, entityId);
      setFolders(result);
    } catch (error) {
      console.error('加载文件夹失败');
    }
  };

  const handleUpload = async (file: File) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB');
      return false;
    }

    try {
      setUploading(true);
      setProgress(0);

      await filesService.upload({
        file,
        entityType,
        entityId,
        folderId: currentFolder?.id,
        onProgress: setProgress,
      });

      message.success(`文件 "${file.name}" 上传成功`);
      onRefresh();
    } catch (error: any) {
      console.error('上传失败:', error);
      message.error(error?.message || '上传失败');
    } finally {
      setUploading(false);
      setProgress(0);
    }

    return false;
  };

  const handleDelete = async (id: number) => {
    try {
      await filesService.delete(id);
      message.success('删除成功');
      setPreviewVisible(false);
      setPreviewFile(null);
      onRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.error('请输入文件夹名称');
      return;
    }

    try {
      await foldersService.create({
        name: newFolderName.trim(),
        entityType,
        entityId,
        parentId: currentFolder?.id,
      });
      message.success('文件夹创建成功');
      setCreateFolderVisible(false);
      setNewFolderName('');
      loadFolders();
    } catch (error) {
      message.error('创建文件夹失败');
    }
  };

  const handleRenameFolder = async (id: number, name: string) => {
    try {
      await foldersService.rename(id, name);
      message.success('重命名成功');
      setEditingFolder(null);
      loadFolders();
    } catch (error) {
      message.error('重命名失败');
    }
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      await foldersService.delete(id);
      message.success('文件夹已删除');
      if (currentFolder?.id === id) {
        setCurrentFolder(null);
        onRefresh();
      }
      loadFolders();
    } catch (error) {
      message.error('删除文件夹失败');
    }
  };

  const handleMove = async () => {
    if (!moveTarget) return;

    try {
      if (moveTarget.type === 'file') {
        await filesService.move(moveTarget.id, moveTargetFolder);
      } else {
        await foldersService.move(moveTarget.id, moveTargetFolder);
      }
      message.success('移动成功');
      setMoveVisible(false);
      setMoveTarget(null);
      setMoveTargetFolder(null);
      loadFolders();
      onRefresh();
    } catch (error) {
      message.error('移动失败');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImageOutlined style={{ fontSize: 18, color: '#1890ff' }} />;
      case 'document':
        return <FileTextOutlined style={{ fontSize: 18, color: '#52c41a' }} />;
      default:
        return <FileOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  // 过滤当前文件夹的文件
  const currentFiles = currentFolder
    ? files.filter((f) => f.folderId === currentFolder.id)
    : files.filter((f) => !f.folderId);

  // 过滤当前文件夹的子文件夹
  const currentFolders = currentFolder
    ? folders.filter((f) => f.parentId === currentFolder.id)
    : folders.filter((f) => !f.parentId);

  // 构建文件夹树用于移动选择
  const buildFolderTree = (parentId: number | null = null): any[] => {
    const items = folders.filter(f => f.parentId === parentId);
    return items.map(f => ({
      value: f.id,
      title: f.name,
      children: buildFolderTree(f.id),
    }));
  };

  // 文件夹选项（包含根目录）
  const folderTreeData = [
    { value: null, title: '根目录' },
    ...buildFolderTree(),
  ];

  const getFolderMenuItems = (folder: Folder): MenuProps['items'] => [
    {
      key: 'move',
      icon: <FolderOpenOutlined />,
      label: '移动到',
      onClick: () => {
        setMoveTarget({ type: 'folder', id: folder.id });
        setMoveTargetFolder(null);
        setMoveVisible(true);
      },
    },
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => setEditingFolder(folder),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '删除文件夹',
          content: '确定要删除此文件夹吗？文件夹内的文件将移至根目录。',
          okText: '确定',
          cancelText: '取消',
          onOk: () => handleDeleteFolder(folder.id),
        });
      },
    },
  ];

  const getFileMenuItems = (file: FileItem): MenuProps['items'] => [
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: '下载',
      onClick: () => {
        window.open(filesService.getDownloadUrl(file.id), '_blank');
      },
    },
    {
      key: 'move',
      icon: <FolderOpenOutlined />,
      label: '移动到',
      onClick: () => {
        setMoveTarget({ type: 'file', id: file.id });
        setMoveTargetFolder(currentFolder?.id || null);
        setMoveVisible(true);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '删除文件',
          content: `确定要删除 "${file.originalName}" 吗？`,
          okText: '确定',
          cancelText: '取消',
          onOk: () => handleDelete(file.id),
        });
      },
    },
  ];

  return (
    <div>
      {/* 工具栏 */}
      {!readonly && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {currentFolder && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                setCurrentFolder(null);
                onRefresh();
              }}
            >
              返回上级
            </Button>
          )}
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept="*/*"
            multiple
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              上传文件
            </Button>
          </Upload>
          <Button
            icon={<FolderAddOutlined />}
            onClick={() => setCreateFolderVisible(true)}
          >
            新建文件夹
          </Button>
          {uploading && (
            <Progress
              percent={progress}
              size="small"
              style={{ width: 100 }}
            />
          )}
        </div>
      )}

      {/* 当前路径 */}
      {currentFolder && (
        <div style={{ marginBottom: 12, color: '#666' }}>
          <FolderOutlined style={{ marginRight: 4 }} />
          {currentFolder.name}
        </div>
      )}

      {/* 文件夹列表 */}
      {currentFolders.length > 0 && (
        <List
          dataSource={currentFolders}
          renderItem={(folder) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '10px 0' }}
              onClick={() => {
                setCurrentFolder(folder);
                onRefresh();
              }}
            >
              <List.Item.Meta
                avatar={<FolderOutlined style={{ fontSize: 18, color: '#faad14' }} />}
                title={
                  editingFolder?.id === folder.id ? (
                    <Input
                      size="small"
                      defaultValue={folder.name}
                      autoFocus
                      onBlur={(e) => handleRenameFolder(folder.id, e.target.value)}
                      onPressEnter={(e) => {
                        handleRenameFolder(folder.id, (e.target as HTMLInputElement).value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: 150 }}
                    />
                  ) : (
                    <Text>{folder.name}</Text>
                  )
                }
              />
              {!readonly && (
                <Dropdown
                  menu={{ items: getFolderMenuItems(folder) }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              )}
            </List.Item>
          )}
        />
      )}

      {/* 文件列表 */}
      {currentFiles.length > 0 && (
        <List
          dataSource={currentFiles}
          renderItem={(file) => {
            const isImg = isImage(file.mimeType);
            const isPdf = file.mimeType === 'application/pdf';
            
            return (
              <List.Item
                onClick={() => {
                  if (isImg) {
                    // 图片打开预览弹窗
                    setPreviewFile(file);
                    setPreviewVisible(true);
                  } else if (isPdf) {
                    // PDF 在新标签页预览
                    window.open(filesService.getPreviewUrl(file.id), '_blank');
                  } else {
                    // 其他文件 - 弹出确认框
                    Modal.confirm({
                      title: '下载文件',
                      content: `确定要下载 "${file.originalName}" 吗？`,
                      okText: '下载',
                      cancelText: '取消',
                      onOk: () => {
                        window.open(filesService.getDownloadUrl(file.id), '_blank');
                      },
                    });
                  }
                }}
                style={{ cursor: 'pointer', padding: '10px 0' }}
              >
                <List.Item.Meta
                  avatar={
                    isImg ? (
                      <Image
                        src={filesService.getPreviewUrl(file.id)}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                        preview={false}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                    ) : (
                      getFileIcon(file.type)
                    )
                  }
                  title={
                    <Text ellipsis={{ tooltip: file.originalName }} style={{ maxWidth: '100%' }}>
                      {file.originalName}
                    </Text>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatFileSize(file.size)}
                    </Text>
                  }
                />
                <Dropdown
                  menu={{ items: readonly ? [
                    {
                      key: 'download',
                      icon: <DownloadOutlined />,
                      label: '下载',
                      onClick: () => {
                        window.open(filesService.getDownloadUrl(file.id), '_blank');
                      },
                    },
                  ] : getFileMenuItems(file) }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </List.Item>
            );
          }}
        />
      )}

      {/* 空状态 */}
      {currentFolders.length === 0 && currentFiles.length === 0 && (
        <Empty description="暂无文件" style={{ padding: 20 }} />
      )}

      {/* 创建文件夹弹窗 */}
      <Modal
        open={createFolderVisible}
        title="新建文件夹"
        onCancel={() => {
          setCreateFolderVisible(false);
          setNewFolderName('');
        }}
        onOk={handleCreateFolder}
        okText="创建"
        cancelText="取消"
      >
        <Input
          placeholder="请输入文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolder}
          autoFocus
        />
      </Modal>

      {/* 移动弹窗 */}
      <Modal
        open={moveVisible}
        title="移动到"
        onCancel={() => {
          setMoveVisible(false);
          setMoveTarget(null);
          setMoveTargetFolder(null);
        }}
        onOk={handleMove}
        okText="确定"
        cancelText="取消"
      >
        <TreeSelect
          style={{ width: '100%' }}
          value={moveTargetFolder}
          onChange={setMoveTargetFolder}
          treeData={folderTreeData}
          placeholder="选择目标文件夹"
          treeDefaultExpandAll
        />
      </Modal>

      {/* 文件预览弹窗 */}
      <Modal
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewFile(null);
        }}
        footer={null}
        closeIcon={<CloseOutlined />}
        width="90%"
        style={{ maxWidth: 600 }}
        centered
      >
        {previewFile && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 12, wordBreak: 'break-all' }}>
              {previewFile.originalName}
            </Text>

            {isImage(previewFile.mimeType) ? (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={filesService.getPreviewUrl(previewFile.id)}
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                  placeholder
                />
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: 40, textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>
                <FileOutlined style={{ fontSize: 48, color: '#999' }} />
                <div style={{ marginTop: 12, color: '#999' }}>
                  此文件类型不支持预览，请下载后查看
                </div>
              </div>
            )}

            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                大小：{formatFileSize(previewFile.size)}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                上传时间：{new Date(previewFile.createdAt).toLocaleString()}
              </Text>
              {previewFile.uploader && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  上传者：{previewFile.uploader.name}
                </Text>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FileUpload;

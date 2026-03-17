import { api } from './api';

export interface FileItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'image' | 'document' | 'other';
  entityType?: 'student' | 'teacher';
  entityId?: number;
  folderId?: number | null;
  description?: string;
  createdAt: string;
  uploader?: {
    id: number;
    name: string;
  };
}

export interface FileUploadParams {
  file: File;
  entityType?: 'student' | 'teacher';
  entityId?: number;
  folderId?: number;
  description?: string;
  onProgress?: (percent: number) => void;
}

export const filesService = {
  upload: async (params: FileUploadParams): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', params.file);
    
    if (params.entityType) {
      formData.append('entityType', params.entityType);
    }
    if (params.entityId) {
      formData.append('entityId', params.entityId.toString());
    }
    if (params.folderId) {
      formData.append('folderId', params.folderId.toString());
    }
    if (params.description) {
      formData.append('description', params.description);
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('未登录，请先登录');
    }

    const baseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    const response = await fetch(`${baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = '上传失败';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        console.error('无法解析错误响应');
      }
      throw new Error(errorMsg);
    }

    return response.json();
  },

  getFilesByEntity: async (
    entityType: 'student' | 'teacher',
    entityId: number,
    folderId?: number | null,
  ): Promise<FileItem[]> => {
    let url = `/files/entity/${entityType}/${entityId}`;
    if (folderId !== undefined && folderId !== null) {
      url += `?folderId=${folderId}`;
    }
    return api.get(url);
  },

  getAll: async (_params?: {
    page?: number;
    pageSize?: number;
    type?: 'image' | 'document' | 'other';
    entityType?: 'student' | 'teacher';
    entityId?: number;
  }): Promise<{ data: FileItem[]; total: number }> => {
    return api.get('/files');
  },

  getStats: async (): Promise<{
    total: number;
    totalSize: number;
    byType: Record<string, number>;
  }> => {
    return api.get('/files/stats');
  },

  getDownloadUrl: (id: number): string => {
    const token = localStorage.getItem('token');
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    return `${baseUrl}/files/download/${id}?token=${token}`;
  },

  getPreviewUrl: (id: number): string => {
    const token = localStorage.getItem('token');
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    return `${baseUrl}/files/preview/${id}?token=${token}`;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  move: async (id: number, folderId: number | null): Promise<FileItem> => {
    return api.post(`/files/${id}/move`, { folderId });
  },
};

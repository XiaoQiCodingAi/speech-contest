import { api } from './api';

export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  entityType: 'student' | 'teacher';
  entityId: number;
  createdAt: string;
  children?: Folder[];
}

export const foldersService = {
  create: async (params: {
    name: string;
    entityType: 'student' | 'teacher';
    entityId: number;
    parentId?: number;
  }): Promise<Folder> => {
    return api.post('/folders', params);
  },

  getAll: async (entityType: 'student' | 'teacher', entityId: number): Promise<Folder[]> => {
    return api.get(`/folders?entityType=${entityType}&entityId=${entityId}`);
  },

  getTree: async (entityType: 'student' | 'teacher', entityId: number): Promise<Folder[]> => {
    return api.get(`/folders/tree?entityType=${entityType}&entityId=${entityId}`);
  },

  rename: async (id: number, name: string): Promise<Folder> => {
    return api.put(`/folders/${id}`, { name });
  },

  move: async (id: number, parentId: number | null): Promise<Folder> => {
    return api.post(`/folders/${id}/move`, { parentId });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },
};

import { api } from './api';

export interface TeacherPermissionItem {
  id: number;
  classId: number;
  className: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  grantedBy?: string;
  createdAt: string;
}

export interface TeacherWithPermissions {
  id: number;
  name: string;
  username: string;
  permissions: {
    classId: number;
    className: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }[];
}

export const permissionsService = {
  getAllTeachers: async (): Promise<TeacherWithPermissions[]> => {
    const response = await api.get('/permissions/teachers');
    return response;
  },

  getTeacherPermissions: async (teacherId: number): Promise<TeacherPermissionItem[]> => {
    const response = await api.get(`/permissions/teachers/${teacherId}`);
    return response;
  },

  setTeacherPermissions: async (
    teacherId: number,
    classIds: number[],
    permissions?: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
  ): Promise<void> => {
    await api.post(`/permissions/teachers/${teacherId}`, {
      classIds,
      ...permissions,
    });
  },

  updatePermission: async (
    permissionId: number,
    updates: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
  ): Promise<void> => {
    await api.put(`/permissions/${permissionId}`, updates);
  },

  removePermission: async (permissionId: number): Promise<void> => {
    await api.delete(`/permissions/${permissionId}`);
  },

  checkPermission: async (
    teacherId: number,
    classId: number,
    action: 'view' | 'edit' | 'delete',
  ): Promise<boolean> => {
    const response = await api.get(`/permissions/check?teacherId=${teacherId}&classId=${classId}&action=${action}`);
    return response.hasPermission;
  },

  getAccessibleClasses: async (teacherId: number): Promise<{ id: number; name: string }[]> => {
    const response = await api.get(`/permissions/accessible-classes/${teacherId}`);
    return response;
  },
};

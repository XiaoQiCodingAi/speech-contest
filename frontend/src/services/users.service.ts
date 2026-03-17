import { api } from './api';

export const usersService = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    isActive?: boolean;
    keyword?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.role) query.set('role', params.role);
    if (params?.isActive !== undefined)
      query.set('isActive', params.isActive.toString());
    if (params?.keyword) query.set('keyword', params.keyword);
    return api.get(`/users?${query.toString()}`);
  },

  getOne: (id: number) => api.get(`/users/${id}`),

  create: (data: any) => api.post('/users', data),

  update: (id: number, data: any) => api.put(`/users/${id}`, data),

  delete: (id: number) => api.delete(`/users/${id}`),

  updatePassword: (id: number, oldPassword: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { oldPassword, newPassword }),

  resetPassword: (id: number, newPassword: string) =>
    api.put(`/users/${id}/reset-password`, { newPassword }),
};

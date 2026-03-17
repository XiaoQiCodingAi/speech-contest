import { api } from './api';

export const teachersService = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    department?: string;
    keyword?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.department) query.set('department', params.department);
    if (params?.keyword) query.set('keyword', params.keyword);
    return api.get(`/teachers?${query.toString()}`);
  },

  getOne: (id: number) => api.get(`/teachers/${id}`),
  
  getById: (id: number) => api.get(`/teachers/${id}`),

  create: (data: any) => api.post('/teachers', data),

  update: (id: number, data: any) => api.put(`/teachers/${id}`, data),

  delete: (id: number) => api.delete(`/teachers/${id}`),

  getStats: () => api.get('/teachers/stats'),
};

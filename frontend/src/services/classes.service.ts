import { api } from './api';

export const classesService = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    keyword?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.isActive !== undefined)
      query.set('isActive', params.isActive.toString());
    if (params?.keyword) query.set('keyword', params.keyword);
    return api.get(`/classes?${query.toString()}`);
  },

  getAllSimple: () => api.get('/classes/all'),

  getById: (id: number) => api.get(`/classes/${id}`),

  getOne: (id: number) => api.get(`/classes/${id}`),

  create: (data: any) => api.post('/classes', data),

  update: (id: number, data: any) => api.put(`/classes/${id}`, data),

  delete: (id: number) => api.delete(`/classes/${id}`),
};

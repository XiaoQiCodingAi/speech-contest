import { api } from './api';

export const studentsService = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    classId?: number;
    gender?: string;
    isActive?: boolean;
    keyword?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.classId) query.set('classId', params.classId.toString());
    if (params?.gender) query.set('gender', params.gender);
    if (params?.isActive !== undefined)
      query.set('isActive', params.isActive.toString());
    if (params?.keyword) query.set('keyword', params.keyword);
    return api.get(`/students?${query.toString()}`);
  },

  getOne: (id: number) => api.get(`/students/${id}`),
  
  getById: (id: number) => api.get(`/students/${id}`),

  create: (data: any) => api.post('/students', data),

  update: (id: number, data: any) => api.put(`/students/${id}`, data),

  delete: (id: number) => api.delete(`/students/${id}`),

  getStats: () => api.get('/students/stats'),

  exportPdf: async (id: number, studentName: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/students/${id}/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName}_档案_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

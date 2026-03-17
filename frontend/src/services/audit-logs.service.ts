import { api } from './api';

export const auditLogsService = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    userId?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.userId) query.set('userId', params.userId.toString());
    if (params?.action) query.set('action', params.action);
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    return api.get(`/audit-logs?${query.toString()}`);
  },

  getOne: (id: number) => api.get(`/audit-logs/${id}`),
};

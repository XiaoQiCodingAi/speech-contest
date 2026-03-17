import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    getAllTeachersWithPermissions(): Promise<import("./permissions.service").TeacherWithPermissions[]>;
    getTeacherPermissions(id: string): Promise<{
        id: number;
        classId: number;
        className: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        grantedBy: string;
        createdAt: Date;
    }[]>;
    setTeacherPermissions(id: string, body: {
        classIds: number[];
        canView?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }, req: any): Promise<import("../entities").TeacherPermission[]>;
    updatePermission(id: string, body: {
        canView?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }, req: any): Promise<import("../entities").TeacherPermission>;
    removePermission(id: string, req: any): Promise<{
        success: boolean;
    }>;
    checkPermission(teacherId: string, classId: string, action: 'view' | 'edit' | 'delete'): Promise<{
        hasPermission: boolean;
    }>;
    getAccessibleClasses(teacherId: string): Promise<import("../entities").Class[]>;
}

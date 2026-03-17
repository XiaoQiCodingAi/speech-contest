"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = __importStar(require("pdfkit"));
const fs = __importStar(require("fs"));
let PdfExportService = class PdfExportService {
    async exportStudentProfile(student, files) {
        return new Promise((resolve, reject) => {
            try {
                const PDFKit = PDFDocument.default || PDFDocument;
                const doc = new PDFKit({
                    size: 'A4',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50,
                    },
                });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                doc.fontSize(24).font('Helvetica-Bold');
                doc.text('学生档案', { align: 'center' });
                doc.moveDown(2);
                doc.fontSize(16).font('Helvetica-Bold');
                doc.text('基本信息', { underline: true });
                doc.moveDown(1);
                doc.fontSize(12).font('Helvetica');
                const infoData = [
                    ['学号', student.studentNo],
                    ['姓名', student.name],
                    ['性别', student.gender === 'male' ? '男' : student.gender === 'female' ? '女' : '-'],
                    ['班级', student.class?.name || '-'],
                    ['出生日期', student.birthDate ? new Date(student.birthDate).toLocaleDateString('zh-CN') : '-'],
                    ['联系电话', student.phone || '-'],
                    ['家长电话', student.parentPhone || '-'],
                    ['家庭住址', student.address || '-'],
                    ['状态', student.isActive ? '在读' : '离校'],
                    ['备注', student.remarks || '-'],
                    ['创建时间', new Date(student.createdAt).toLocaleString('zh-CN')],
                ];
                infoData.forEach(([label, value]) => {
                    doc.font('Helvetica-Bold').text(`${label}：`, { continued: true });
                    doc.font('Helvetica').text(value);
                    doc.moveDown(0.5);
                });
                if (files && files.length > 0) {
                    doc.moveDown(2);
                    doc.fontSize(16).font('Helvetica-Bold');
                    doc.text('相关文件', { underline: true });
                    doc.moveDown(1);
                    doc.fontSize(12).font('Helvetica');
                    files.forEach((file, index) => {
                        doc.text(`${index + 1}. ${file.originalName} (${this.formatFileSize(file.size)})`);
                        if (file.description) {
                            doc.fontSize(10).font('Helvetica-Oblique');
                            doc.text(`   描述：${file.description}`);
                            doc.fontSize(12).font('Helvetica');
                        }
                        doc.moveDown(0.5);
                    });
                }
                const imageFiles = files?.filter(f => f.mimeType.startsWith('image/')) || [];
                if (imageFiles.length > 0) {
                    doc.addPage();
                    doc.fontSize(16).font('Helvetica-Bold');
                    doc.text('附件图片', { underline: true });
                    doc.moveDown(2);
                    imageFiles.forEach((file, index) => {
                        if (fs.existsSync(file.path)) {
                            try {
                                if (doc.y > 500) {
                                    doc.addPage();
                                }
                                doc.fontSize(12).font('Helvetica');
                                doc.text(`${index + 1}. ${file.originalName}`);
                                doc.moveDown(0.5);
                                const img = doc.image(file.path, {
                                    fit: [450, 300],
                                    align: 'center',
                                });
                                doc.moveDown(2);
                            }
                            catch (err) {
                                console.error(`Failed to add image ${file.originalName}:`, err);
                            }
                        }
                    });
                }
                const pageCount = doc.bufferedPageRange().count;
                for (let i = 0; i < pageCount; i++) {
                    doc.switchToPage(i);
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`第 ${i + 1} 页 / 共 ${pageCount} 页`, doc.page.width - 100, doc.page.height - 30, { align: 'right' });
                    doc.text(`导出时间：${new Date().toLocaleString('zh-CN')}`, 50, doc.page.height - 30);
                }
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    formatFileSize(bytes) {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
};
exports.PdfExportService = PdfExportService;
exports.PdfExportService = PdfExportService = __decorate([
    (0, common_1.Injectable)()
], PdfExportService);
//# sourceMappingURL=pdf-export.service.js.map
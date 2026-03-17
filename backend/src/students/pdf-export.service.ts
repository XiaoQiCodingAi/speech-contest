import { Injectable } from '@nestjs/common';
import { Student } from '../entities/student.entity';
import { File } from '../entities/file.entity';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfExportService {
  async exportStudentProfile(
    student: Student,
    files: File[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // 创建 PDF 文档
        const PDFKit = (PDFDocument as any).default || PDFDocument;
        const doc = new PDFKit({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // 标题
        doc.fontSize(24).font('Helvetica-Bold');
        doc.text('学生档案', { align: 'center' });
        doc.moveDown(2);

        // 基本信息标题
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('基本信息', { underline: true });
        doc.moveDown(1);

        // 基本信息内容
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

        // 相关文件
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

        // 添加图片（如果有）
        const imageFiles = files?.filter(f => f.mimeType.startsWith('image/')) || [];
        if (imageFiles.length > 0) {
          doc.addPage();
          doc.fontSize(16).font('Helvetica-Bold');
          doc.text('附件图片', { underline: true });
          doc.moveDown(2);

          imageFiles.forEach((file, index) => {
            if (fs.existsSync(file.path)) {
              try {
                // 检查是否需要新页面
                if (doc.y > 500) {
                  doc.addPage();
                }

                doc.fontSize(12).font('Helvetica');
                doc.text(`${index + 1}. ${file.originalName}`);
                doc.moveDown(0.5);

                // 添加图片（限制大小）
                const img = doc.image(file.path, {
                  fit: [450, 300],
                  align: 'center',
                });
                doc.moveDown(2);
              } catch (err) {
                console.error(`Failed to add image ${file.originalName}:`, err);
              }
            }
          });
        }

        // 页脚
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(10).font('Helvetica');
          doc.text(
            `第 ${i + 1} 页 / 共 ${pageCount} 页`,
            doc.page.width - 100,
            doc.page.height - 30,
            { align: 'right' },
          );
          doc.text(
            `导出时间：${new Date().toLocaleString('zh-CN')}`,
            50,
            doc.page.height - 30,
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

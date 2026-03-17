# 文件上传问题排查和修复

## 📅 排查日期
2026-03-16

## 🔍 问题排查

### 后端测试结果
✅ **文件上传接口正常工作**
```bash
# 测试命令
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@test.jpg" \
  -F "entityType=teacher" \
  -F "entityId=3"

# 响应
HTTP/1.1 201 Created
{
  "id": 3,
  "filename": "1773674489790-mtca7sk6b.jpg",
  "originalName": "test-teacher.jpg",
  "mimeType": "image/jpeg",
  "size": 30,
  "type": "image",
  "createdAt": "2026-03-16T07:21:29.793Z"
}
```

### 已上传文件确认
```bash
ls -lh projects/school-archive/backend/uploads/
-rw-r--r-- 1 root root 10 Mar 16 22:27 1773671272068-yp54of96z.jpg
-rw-r--r-- 1 root root 10 Mar 16 22:28 1773671317102-alsi16kxz.jpg
-rw-r--r-- 1 root root 30 Mar 16 23:21 1773674489790-mtca7sk6b.jpg
```

---

## 🔧 前端优化

### 问题分析
1. **错误信息不够详细**：前端只显示"上传失败"，没有具体错误信息
2. **缺少调试日志**：无法知道上传过程中发生了什么
3. **URL 硬编码**：使用 `http://localhost:3000` 可能不适用于所有环境

### 优化措施

#### 1. 增强错误处理（FileUpload.tsx）
```typescript
try {
  console.log('=== 开始上传文件 ===');
  console.log('文件名:', file.name);
  console.log('文件大小:', (file.size / 1024).toFixed(2), 'KB');
  console.log('实体类型:', entityType);
  console.log('实体ID:', entityId);

  const result = await filesService.upload({...});
  
  console.log('上传成功:', result);
  message.success(`文件 "${file.name}" 上传成功`);
} catch (error: any) {
  console.error('上传失败:', error);
  const errorMsg = error?.message || error?.response?.data?.message || '上传失败，请重试';
  message.error(errorMsg);
}
```

#### 2. 优化服务层（files.service.ts）
```typescript
upload: async (params: FileUploadParams): Promise<FileItem> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('未登录，请先登录');
  }

  console.log('上传URL:', `${window.location.protocol}//${window.location.hostname}:3000/files/upload`);

  const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log('响应状态:', response.status, response.statusText);

  if (!response.ok) {
    let errorMsg = '上传失败';
    try {
      const error = await response.json();
      errorMsg = error.message || error.error || errorMsg;
      console.error('上传错误:', error);
    } catch (e) {
      console.error('无法解析错误响应');
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
```

---

## ✅ 修复内容

1. **详细的错误信息**
   - 显示具体的错误原因
   - 包含文件名在上传成功的提示中
   - 区分不同类型的错误（未登录、网络错误、服务器错误）

2. **完整的日志记录**
   - 上传前：记录文件信息、实体信息
   - 上传中：记录请求URL
   - 上传后：记录响应状态和结果
   - 错误时：记录详细错误信息

3. **动态URL配置**
   - 使用 `window.location.protocol` 和 `window.location.hostname`
   - 适应不同的部署环境
   - 不再硬编码 `http://localhost:3000`

---

## 🧪 测试步骤

1. **打开浏览器开发者工具**（F12）
2. **切换到 Console 标签页**
3. **尝试上传文件**
4. **查看控制台输出**：
   ```
   === 开始上传文件 ===
   文件名: test.jpg
   文件大小: 123.45 KB
   实体类型: teacher
   实体ID: 3
   上传URL: http://localhost:3000/files/upload
   响应状态: 201 Created
   上传成功: {id: 3, filename: "...", ...}
   ```

5. **如果失败，查看错误信息**：
   - 未登录：提示"未登录，请先登录"
   - 网络错误：显示具体的网络错误
   - 服务器错误：显示后端返回的错误信息

---

## 📝 用户操作指南

### 如果仍然上传失败，请检查：

1. **是否已登录**
   - 检查 localStorage 中是否有 token
   - 尝试重新登录

2. **查看浏览器控制台**
   - 打开 F12 开发者工具
   - 查看 Console 标签页的错误信息
   - 查看 Network 标签页的网络请求

3. **检查文件大小**
   - 确保文件小于 10MB
   - 支持的格式：图片、PDF、Word、Excel、PPT

4. **检查后端服务**
   - 确认后端服务正在运行
   - 检查后端日志是否有错误

---

## 🎯 预期效果

- ✅ 上传成功时显示明确的成功提示
- ✅ 上传失败时显示具体的错误原因
- ✅ 开发者可以在控制台看到完整的上传流程
- ✅ 便于快速定位问题

---

## 📞 如果问题依然存在

请提供以下信息：
1. 浏览器控制台的完整错误信息
2. 上传的文件名和大小
3. 在哪个页面尝试上传（学生/教师详情页）
4. 是否已登录，登录的用户角色

这些信息将帮助快速定位和解决问题。

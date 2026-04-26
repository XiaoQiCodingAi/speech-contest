const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002;

// 创建上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名: timestamp-random.xxx
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
    fileFilter: (req, file, cb) => {
        // 只允许图片
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('只支持上传图片文件 (jpg, png, gif, webp)'));
        }
    }
});

app.use(cors());
app.use(express.json());

// 上传单张图片
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

// 上传多张图片
app.post('/upload-multiple', upload.array('images', 20), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: '没有上传文件' });
    }
    const files = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename
    }));
    res.json({ files });
});

// 获取所有图片列表
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: '读取失败' });
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
        res.json(imageFiles.map(f => ({ filename: f, url: `/uploads/${f}` })));
    });
});

// 删除指定文件
app.delete('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: '文件不存在' });
    }
});

// 错误处理
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`口语交际比赛后端服务已启动: http://0.0.0.0:${PORT}`);
});

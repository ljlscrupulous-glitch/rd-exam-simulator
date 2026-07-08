# RD Exam Simulator - 注册营养师(RD)考试模拟系统

一个完整的注册营养师考试模拟系统，包含200道题目，支持单选题和多选题。

## 功能特性

- 📝 200道RD考试模拟题
- ⏱️ 实时计时功能
- 📊 实时成绩统计
- 💾 考试进度自动保存
- 🔍 题目筛选和搜索
- 📋 详细的答题报告
- 🎯 单选题和多选题支持

## 项目结构

```
rd-exam-simulator/
├── backend/                 # Python Flask后端
│   ├── app.py              # Flask应用主文件
│   ├── database.py         # 数据库初始化
│   ├── questions.py        # 题目数据
│   ├── requirements.txt    # Python依赖
│   └── exam.db            # SQLite数据库
├── frontend/               # 原生HTML前端
│   ├── index.html         # 主页面
│   ├── exam.html          # 考试页面
│   ├── result.html        # 成绩页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       ├── api.js         # API调用模块
│       ├── exam.js        # 考试逻辑
│       └── utils.js       # 工具函数
└── README.md
```

## 快速开始

### 后端启动

```bash
cd backend
pip install -r requirements.txt
python app.py
```

后端将运行在 `http://localhost:5000`

### 前端访问

打开浏览器访问 `frontend/index.html`

## API 接口

- `GET /api/questions` - 获取所有题目
- `GET /api/questions/<id>` - 获取单个题目
- `POST /api/exam/start` - 开始考试
- `POST /api/exam/submit` - 提交答案
- `GET /api/exam/result/<exam_id>` - 获取考试成绩

## 技术栈

- **后端**: Python + Flask
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **数据库**: SQLite3

## 许可证

MIT

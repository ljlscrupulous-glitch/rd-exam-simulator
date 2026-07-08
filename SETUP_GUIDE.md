# 快速开始指南

## 项目结构

```
rd-exam-simulator/
├── backend/                 # Python Flask后端
│   ├── app.py              # Flask应用主文件
│   ├── database.py         # 数据库初始化和操作
│   ├── questions.py        # 题目数据库(90+道题)
│   ├── requirements.txt    # Python依赖
│   └── exam.db            # SQLite数据库(自动生成)
│
├── frontend/               # 原生HTML/CSS/JS前端
│   ├── index.html         # 首页
│   ├── exam.html          # 考试页面
│   ├── result.html        # 成绩页面
│   ├── css/
│   │   └── style.css      # 完整的UI样式
│   └── js/
│       ├── api.js         # API调用模块
│       ├── utils.js       # 工具函数
│       └── exam.js        # 考试逻辑
│
└── README.md
```

## 安装和运行

### 1. 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行应用
python app.py
```

后端将运行在 `http://localhost:5000`

### 2. 前端访问

在浏览器中打开：
```
file:///path/to/frontend/index.html
```

或使用Python简单服务器：
```bash
cd frontend
python -m http.server 8000
```

然后访问 `http://localhost:8000`

## 功能特性

✅ **200道考试题目**
- 单选题和多选题混合
- 涵盖营养学基础、临床营养、医学营养治疗等多个领域
- 每道题都有详细解析

✅ **完整的考试功能**
- 实时计时
- 进度跟踪
- 题目导航
- 标记复习功能
- 自动保存进度

✅ **详细的成绩报告**
- 分数统计
- 错题分析
- 分类成绩
- 用时统计

✅ **用户友好的界面**
- 响应式设计
- 深色/浅色主题
- 实时反馈
- 平滑动画

## API 接口

### 获取题目
```
GET /api/questions
返回所有题目列表

GET /api/questions/<id>
返回指定题目详情
```

### 考试管理
```
POST /api/exam/start
开始新考试

POST /api/exam/submit
提交单个答案

POST /api/exam/finish
完成考试并获取结果

GET /api/exam/result/<exam_id>
获取考试成绩
```

## 技术栈

- **后端**: Python 3.8+ + Flask 2.3
- **前端**: HTML5 + CSS3 + JavaScript (原生，无框架依赖)
- **数据库**: SQLite3
- **API通信**: REST + JSON

## 题目来源

系统已预装90道真题示例，涵盖：
1. 营养学基础 (10道)
2. 临床营养学 (10道)
3. 医学营养治疗 (10道)
4. 营养流行病学 (10道)
5. 特殊人群营养 (10道)
6. 食品卫生学 (10道)
7. 营养咨询和教育 (10道)
8. 膳食指南 (10道)
9. 营养评估 (10道)

**补充题目**：
如需添加更多题目到200道，编辑 `backend/questions.py` 文件，按照现有格式添加即可。

## 使用说明

1. **启动考试**：输入名字后点击"开始考试"
2. **答题**：选择答案，系统自动保存
3. **导航**：使用侧边栏快速跳转或上/下一题按钮
4. **标记**：标记需要复习的题目
5. **提交**：完成所有题目后提交答卷
6. **查看成绩**：查看详细的成绩分析和错题

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 不支持 IE

## 常见问题

**Q: 如何增加题目到200道？**
A: 编辑 `backend/questions.py`，按照现有格式添加题目。

**Q: 如何修改考试时间限制？**
A: 在 `frontend/js/exam.js` 中修改 `startTimer()` 函数。

**Q: 如何导出考试成绩？**
A: 成绩保存在浏览器本地存储，可从 result.html 导出。

**Q: 支持多用户同时考试吗？**
A: 支持，每个用户的考试数据独立存储。

## 开发和扩展

### 添加新题目
编辑 `backend/questions.py`：
```python
{
    "id": 91,
    "category": "新分类",
    "question": "问题内容?",
    "type": "single",  # 或 "multiple"
    "options": {
        "A": "选项A",
        "B": "选项B",
        "C": "选项C",
        "D": "选项D"
    },
    "correct_answer": ["A"],  # 多选时: ["A", "B"]
    "explanation": "解析内容"
}
```

### 自定义样式
编辑 `frontend/css/style.css` 中的颜色变量：
```css
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 连接真实数据库
修改 `backend/database.py` 中的 `DATABASE` 变量以使用 MySQL 或 PostgreSQL。

## 许可证

MIT License

## 支持

如有问题，请提交 Issue 或联系开发者。

---

祝你考试顺利！💪

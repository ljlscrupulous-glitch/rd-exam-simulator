/* 考试逻辑模块 - 完全兼容新UI */

let examState = {
    examId: null,
    userId: null,
    currentQuestionIndex: 0,
    questions: [],
    answers: {},
    markedQuestions: new Set(),
    startTime: null,
    elapsedSeconds: 0,
    timerInterval: null
};

let allQuestions = [];

// 页面加载
window.addEventListener('load', async () => {
    await initExam();
});

/**
 * 初始化考试
 */
async function initExam() {
    try {
        showLoading();

        // 获取用户信息
        const userName = localStorage.getItem('userName') || '考生';
        document.getElementById('userGreeting').textContent = `欢迎，${userName}`;

        // 从本地存储检查是否恢复考试
        const savedExamId = localStorage.getItem('currentExamId');
        const savedState = savedExamId ? localStorage.getItem(`exam_state_${savedExamId}`) : null;

        if (savedState) {
            examState = JSON.parse(savedState);
        } else {
            // 创建新考试
            examState.userId = userName;
            const response = await ExamAPI.startExam(userName, 200);
            examState.examId = response;
            localStorage.setItem('currentExamId', examState.examId);
        }

        // 加载所有题目
        allQuestions = await ExamAPI.getAllQuestions();
        examState.questions = allQuestions;

        // 初始化答题记录
        if (Object.keys(examState.answers).length === 0) {
            allQuestions.forEach(q => {
                examState.answers[q.id] = null;
            });
        }

        // 记录开始时间
        if (!examState.startTime) {
            examState.startTime = Date.now();
        }

        // 初始化UI
        initializeUI();

        // 启动计时器
        startTimer();

        // 显示第一题
        displayQuestion(examState.currentQuestionIndex);

        hideLoading();
    } catch (error) {
        hideLoading();
        showAlert('初始化考试失败: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * 初始化UI
 */
function initializeUI() {
    // 创建题目导航
    const questionsGrid = document.getElementById('questionsGrid');
    if (questionsGrid) {
        questionsGrid.innerHTML = '';
        allQuestions.forEach((q, index) => {
            const btn = document.createElement('button');
            btn.className = 'question-btn';
            btn.textContent = index + 1;
            btn.onclick = () => goToQuestion(index);
            if (index === examState.currentQuestionIndex) {
                btn.classList.add('active');
            }
            if (examState.answers[q.id] !== null) {
                btn.classList.add('answered');
            }
            if (examState.markedQuestions.has(q.id)) {
                btn.classList.add('marked');
            }
            questionsGrid.appendChild(btn);
        });
    }

    // 更新统计信息
    updateStatistics();
}

/**
 * 启动计时器
 */
function startTimer() {
    if (examState.timerInterval) {
        clearInterval(examState.timerInterval);
    }

    examState.timerInterval = setInterval(() => {
        examState.elapsedSeconds = Math.floor((Date.now() - examState.startTime) / 1000);
        const timerEl = document.getElementById('examTimer');
        if (timerEl) {
            timerEl.textContent = formatTime(examState.elapsedSeconds);
        }
    }, 1000);
}

/**
 * 显示题目
 */
function displayQuestion(index) {
    if (index < 0 || index >= allQuestions.length) {
        return;
    }

    examState.currentQuestionIndex = index;
    const question = allQuestions[index];

    // 更新题目计数器
    const counterEl = document.getElementById('questionCounter');
    if (counterEl) {
        counterEl.textContent = `第 ${index + 1} / 200 题`;
    }

    // 更新题目分类和类型
    const categoryEl = document.getElementById('questionCategory');
    const typeEl = document.getElementById('questionType');
    if (categoryEl) categoryEl.textContent = question.category;
    if (typeEl) typeEl.textContent = question.type === 'single' ? '单选题' : '多选题';

    // 显示题目内容
    const contentEl = document.getElementById('questionContent');
    if (contentEl) {
        contentEl.textContent = question.question;
    }

    // 显示选项
    const optionsContainer = document.getElementById('optionsContainer');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';

        Object.entries(question.options).forEach(([key, value]) => {
            const option = document.createElement('div');
            option.className = 'option';
            
            const isSelected = examState.answers[question.id] && 
                (Array.isArray(examState.answers[question.id]) 
                    ? examState.answers[question.id].includes(key)
                    : examState.answers[question.id] === key);

            if (isSelected) {
                option.classList.add('selected');
            }

            option.innerHTML = `
                <div class="option-checkbox">
                    ${isSelected ? '✓' : ''}
                </div>
                <span class="option-label">${key}</span>
                <span class="option-text">${value}</span>
            `;

            option.onclick = () => selectOption(question.id, key, question.type);
            optionsContainer.appendChild(option);
        });
    }

    // 更新导航按钮
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === allQuestions.length - 1;

    // 更新题目导航按钮状态
    const questionBtns = document.querySelectorAll('.question-btn');
    questionBtns.forEach((btn, i) => {
        btn.classList.remove('active');
        if (i === index) {
            btn.classList.add('active');
        }
    });

    // 保存状态
    saveExamState();
}

/**
 * 选择选项
 */
function selectOption(questionId, optionKey, questionType) {
    if (questionType === 'single') {
        // 单选题：只能选一个
        examState.answers[questionId] = optionKey;
    } else {
        // 多选题：可以选多个
        if (!examState.answers[questionId]) {
            examState.answers[questionId] = [];
        }
        
        const answers = Array.isArray(examState.answers[questionId]) 
            ? examState.answers[questionId] 
            : [examState.answers[questionId]];

        if (answers.includes(optionKey)) {
            examState.answers[questionId] = answers.filter(a => a !== optionKey);
        } else {
            examState.answers[questionId] = [...answers, optionKey];
        }

        // 如果多选题没有选项，设为null
        if (examState.answers[questionId].length === 0) {
            examState.answers[questionId] = null;
        }
    }

    // 重新显示题目
    displayQuestion(examState.currentQuestionIndex);

    // 更新统计信息
    updateStatistics();

    // 保存状态
    saveExamState();
}

/**
 * 上一题
 */
function previousQuestion() {
    if (examState.currentQuestionIndex > 0) {
        displayQuestion(examState.currentQuestionIndex - 1);
    }
}

/**
 * 下一题
 */
function nextQuestion() {
    if (examState.currentQuestionIndex < allQuestions.length - 1) {
        displayQuestion(examState.currentQuestionIndex + 1);
    }
}

/**
 * 跳转到指定题目
 */
function goToQuestion(index) {
    displayQuestion(index);
}

/**
 * 标记/取消标记题目
 */
function toggleMarkQuestion() {
    const question = allQuestions[examState.currentQuestionIndex];
    if (examState.markedQuestions.has(question.id)) {
        examState.markedQuestions.delete(question.id);
    } else {
        examState.markedQuestions.add(question.id);
    }
    initializeUI();
    saveExamState();
}

/**
 * 更新统计信息
 */
function updateStatistics() {
    // 计算已答题数
    let answeredCount = 0;
    let correctCount = 0;

    allQuestions.forEach(q => {
        if (examState.answers[q.id] !== null) {
            answeredCount++;

            // 判断是否正确
            const userAnswer = examState.answers[q.id];
            const correctAnswer = q.correct_answer || [];
            
            let isCorrect = false;
            if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
            } else if (!Array.isArray(userAnswer) && !Array.isArray(correctAnswer)) {
                isCorrect = userAnswer === correctAnswer[0];
            }

            if (isCorrect) {
                correctCount++;
            }
        }
    });

    const unansweredCount = allQuestions.length - answeredCount;
    const progressPercent = (answeredCount / allQuestions.length) * 100;
    const scorePercent = (correctCount / allQuestions.length) * 100;

    // 更新UI
    const updateElement = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateElement('answeredCount', answeredCount);
    updateElement('unansweredCount', unansweredCount);
    updateElement('progressText', `${answeredCount}/200`);
    updateElement('scorePreview', scorePercent.toFixed(1) + '%');

    const progressFill = document.getElementById('progressBarFill');
    if (progressFill) {
        progressFill.style.width = progressPercent + '%';
    }
}

/**
 * 保存考试状态
 */
function saveExamState() {
    localStorage.setItem(`exam_state_${examState.examId}`, JSON.stringify(examState));
}

/**
 * 显示退出确认
 */
function showExitConfirm() {
    showModal('exitModal');
}

/**
 * 退出考试
 */
function exitExam() {
    closeModal('exitModal');
    localStorage.removeItem('currentExamId');
    localStorage.removeItem(`exam_state_${examState.examId}`);
    window.location.href = 'index.html';
}

/**
 * 完成考试
 */
async function finishExam() {
    // 检查是否有未答题目
    const unanswered = allQuestions.filter(q => examState.answers[q.id] === null);
    
    if (unanswered.length > 0) {
        // 显示提交确认对话框
        document.getElementById('submitWarning').textContent = `还有 ${unanswered.length} 道题目未作答，确定要提交吗？`;
        showModal('submitModal');
    } else {
        confirmSubmit();
    }
}

/**
 * 确认提交
 */
async function confirmSubmit() {
    closeModal('submitModal');
    
    try {
        showLoading();

        // 计算正确数
        let correctCount = 0;
        let wrongQuestions = [];

        allQuestions.forEach(q => {
            const userAnswer = examState.answers[q.id];
            const correctAnswer = q.correct_answer || [];
            
            let isCorrect = false;
            if (userAnswer !== null) {
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
                } else if (!Array.isArray(userAnswer) && !Array.isArray(correctAnswer)) {
                    isCorrect = userAnswer === correctAnswer[0];
                }

                if (isCorrect) {
                    correctCount++;
                } else {
                    wrongQuestions.push({
                        id: q.id,
                        question: q.question,
                        userAnswer: Array.isArray(userAnswer) ? userAnswer : [userAnswer],
                        correct: correctAnswer
                    });
                }
            }
        });

        const durationMinutes = Math.floor(examState.elapsedSeconds / 60);
        const score = (correctCount / allQuestions.length) * 100;

        // 保存结果
        const resultData = {
            examId: examState.examId,
            score: score,
            correctAnswers: correctCount,
            totalQuestions: allQuestions.length,
            duration: examState.elapsedSeconds,
            durationMinutes: durationMinutes,
            wrongQuestions: wrongQuestions
        };

        localStorage.setItem(`exam_result_${examState.examId}`, JSON.stringify(resultData));

        hideLoading();

        // 显示完成模态框
        const updateEl = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        
        updateEl('finalDuration', formatTime(examState.elapsedSeconds));
        updateEl('finalScore', score.toFixed(1));
        updateEl('finalCorrect', `${correctCount}/200`);
        updateEl('finalAccuracy', score.toFixed(1) + '%');

        showModal('completeModal');

    } catch (error) {
        hideLoading();
        showAlert('提交答卷失败: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * 查看成绩
 */
function viewResults() {
    closeModal('completeModal');
    localStorage.setItem(`current_result_id`, examState.examId);
    window.location.href = 'result.html';
}

/**
 * 返回首页
 */
function goHome() {
    closeModal('completeModal');
    localStorage.removeItem('currentExamId');
    localStorage.removeItem(`exam_state_${examState.examId}`);
    window.location.href = 'index.html';
}

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
from database import (
    init_db, populate_questions, get_all_questions, get_question,
    create_exam, save_answer, update_exam_result, get_exam_result
)

app = Flask(__name__)
CORS(app)

# 初始化数据库
init_db()
populate_questions()

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """获取所有题目"""
    try:
        questions = get_all_questions()
        # 不返回答案，只返回题目和选项
        response_questions = []
        for q in questions:
            response_questions.append({
                'id': q['id'],
                'category': q['category'],
                'question': q['question'],
                'type': q['type'],
                'options': q['options']
            })
        return jsonify({
            'success': True,
            'total': len(response_questions),
            'questions': response_questions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/questions/<int:question_id>', methods=['GET'])
def get_single_question(question_id):
    """获取单个题目"""
    try:
        question = get_question(question_id)
        if question:
            return jsonify({
                'success': True,
                'question': {
                    'id': question['id'],
                    'category': question['category'],
                    'question': question['question'],
                    'type': question['type'],
                    'options': question['options']
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': '题目不存在'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exam/start', methods=['POST'])
def start_exam():
    """开始考试"""
    try:
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        total_questions = data.get('total_questions', 200)
        
        exam_id = create_exam(user_id, total_questions)
        
        return jsonify({
            'success': True,
            'exam_id': exam_id,
            'message': '考试已开始'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exam/submit', methods=['POST'])
def submit_answer():
    """提交答案"""
    try:
        data = request.json
        exam_id = data.get('exam_id')
        question_id = data.get('question_id')
        user_answer = data.get('user_answer')  # 可能是单个答案或列表
        
        # 获取题目的正确答案
        question = get_question(question_id)
        if not question:
            return jsonify({
                'success': False,
                'error': '题目不存在'
            }), 404
        
        correct_answer = question['correct_answer']
        
        # 判断答案是否正确
        if isinstance(user_answer, list):
            # 多选题
            is_correct = set(user_answer) == set(correct_answer)
        else:
            # 单选题
            is_correct = user_answer in correct_answer
        
        # 保存答题
        save_answer(exam_id, question_id, user_answer, is_correct)
        
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'correct_answer': correct_answer,
            'explanation': question['explanation']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exam/finish', methods=['POST'])
def finish_exam():
    """完成考试"""
    try:
        data = request.json
        exam_id = data.get('exam_id')
        duration_minutes = data.get('duration_minutes', 0)
        correct_answers = data.get('correct_answers', 0)
        total_questions = data.get('total_questions', 200)
        
        # 计算分数
        score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        update_exam_result(exam_id, duration_minutes, correct_answers, score)
        
        return jsonify({
            'success': True,
            'exam_id': exam_id,
            'score': round(score, 2),
            'correct_answers': correct_answers,
            'total_questions': total_questions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exam/result/<int:exam_id>', methods=['GET'])
def get_result(exam_id):
    """获取考试成绩"""
    try:
        result = get_exam_result(exam_id)
        if result:
            return jsonify({
                'success': True,
                'result': result
            })
        else:
            return jsonify({
                'success': False,
                'error': '考试不存在'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'message': 'RD Exam Simulator API is running'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)

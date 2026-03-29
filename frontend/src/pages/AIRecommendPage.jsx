import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatWithAssistant } from '../services/api';

const REGISTRATION_TEMPLATE = `【一键报名信息】
姓名：
学号：
意向社团：
加入方式（参团/工作人员）：
意向岗位：
个人优势：
可投入时间：
联系方式：`;

function parseRegistrationText(text) {
  const normalized = text.replace(/：/g, ':');
  if (!normalized.includes('一键报名信息')) return null;

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const map = {};
  lines.forEach((line) => {
    const [rawKey, ...rest] = line.split(':');
    if (!rawKey || !rest.length) return;
    map[rawKey.trim()] = rest.join(':').trim();
  });

  const parsed = {
    name: map['姓名'] || '',
    studentId: map['学号'] || '',
    clubName: map['意向社团'] || '',
    mode: map['加入方式（参团/工作人员）'] || map['加入方式'] || '',
    targetRole: map['意向岗位'] || '',
    strength: map['个人优势'] || '',
    availability: map['可投入时间'] || '',
    contact: map['联系方式'] || ''
  };

  const required = ['name', 'studentId', 'clubName', 'mode', 'targetRole', 'contact'];
  const missing = required.filter((key) => !parsed[key]);

  return {
    parsed,
    missing
  };
}

function saveRegistrationFromAI(form) {
  const raw = localStorage.getItem('club_applications');
  const list = raw ? JSON.parse(raw) : [];
  const mode = form.mode.includes('工') ? '社团工作人员' : '兴趣参团';
  const entry = {
    clubId: `ai-${form.clubName}`,
    clubName: form.clubName,
    mode,
    targetRole: form.targetRole || (mode === '社团工作人员' ? '待确认岗位' : '普通成员'),
    status: '已提交',
    createdAt: new Date().toISOString(),
    fromAI: true,
    applicant: {
      name: form.name,
      studentId: form.studentId,
      strength: form.strength,
      availability: form.availability,
      contact: form.contact
    }
  };

  const next = [
    entry,
    ...list.filter((item) => !(item.clubName === entry.clubName && item.mode === entry.mode))
  ];
  localStorage.setItem('club_applications', JSON.stringify(next));
  window.dispatchEvent(new Event('club-progress-updated'));
  return entry;
}

export default function AIRecommendPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好，我是社团 AI 助手。你可以随便问我，比如“我适合什么社团”“报名流程怎么走”“怎么准备面试”。'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupNotice, setSignupNotice] = useState('');

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const registrationDraft = parseRegistrationText(text);

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setSignupNotice('');

    if (registrationDraft) {
      if (registrationDraft.missing.length) {
        const fieldNameMap = {
          name: '姓名',
          studentId: '学号',
          clubName: '意向社团',
          mode: '加入方式',
          targetRole: '意向岗位',
          contact: '联系方式'
        };
        const missingText = registrationDraft.missing.map((key) => fieldNameMap[key]).join('、');
        setMessages((prev) => [...prev, { role: 'assistant', content: `报名信息还不完整，请补充：${missingText}。` }]);
        return;
      }

      const saved = saveRegistrationFromAI(registrationDraft.parsed);
      const successMessage = `已帮你完成“一键报名”。\n社团：${saved.clubName}\n加入方式：${saved.mode}\n意向岗位：${saved.targetRole}\n你可以点击下方按钮查看报名进度。`;
      setMessages((prev) => [...prev, { role: 'assistant', content: successMessage }]);
      setSignupNotice(`已生成报名记录：${saved.clubName}（${saved.mode}）`);
      return;
    }

    setLoading(true);

    try {
      const history = nextMessages.slice(-10).map((item) => ({
        role: item.role,
        content: item.content
      }));
      const data = await chatWithAssistant(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || '我正在整理思路，请再问我一次。' }]);
    } catch (err) {
      setError(err.message || 'AI 助手暂时不可用');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAsk = (text) => {
    setInput(text);
  };

  const handleGuideAction = (action) => {
    if (action === 'interest') {
      setInput('请你先问我 3 个问题来了解我的兴趣爱好，然后根据回答推荐 3 个社团和适合的岗位。');
      return;
    }

    if (action === 'signup-template') {
      setInput(REGISTRATION_TEMPLATE);
      return;
    }

    if (action === 'intro') {
      setInput('我准备报名社团面试，请根据我的经历帮我写 60 秒自我介绍。');
    }
  };

  return (
    <section className="assistant-page">
      <div className="section-head">
        <h2>AI 助手</h2>
        <p>随时提问，获取社团选择、岗位建议和报名准备建议</p>
      </div>

      <div className="assistant-mini-options" role="group" aria-label="AI 引导选项">
        <button className="assistant-mini-chip" onClick={() => handleGuideAction('interest')}>告诉我你的兴趣爱好</button>
        <button className="assistant-mini-chip" onClick={() => handleGuideAction('signup-template')}>一键报名（自动填模板）</button>
        <button className="assistant-mini-chip" onClick={() => handleGuideAction('intro')}>生成面试自我介绍</button>
      </div>

      <div className="assistant-quick-actions">
        <button className="btn ghost" onClick={() => handleQuickAsk('我适合什么社团？')}>我适合什么社团？</button>
        <button className="btn ghost" onClick={() => handleQuickAsk('推荐我适合的社团工作')}>推荐我适合的社团工作</button>
        <button className="btn ghost" onClick={() => handleQuickAsk('报名时怎么写自我介绍？')}>报名时怎么写自我介绍？</button>
      </div>

      <div className="assistant-chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`assistant-message ${msg.role}`}>
            <span className="assistant-role">{msg.role === 'assistant' ? 'AI 助手' : '我'}</span>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading ? <p className="muted">AI 助手正在思考...</p> : null}
      </div>

      <div className="assistant-input-row">
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入你的问题；如需一键报名，可点击上方“一键报名（自动填模板）”并填写后发送"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="btn primary" onClick={handleSend} disabled={loading || !input.trim()}>
          发送
        </button>
      </div>

      {signupNotice ? (
        <div className="assistant-signup-notice">
          <p className="success">{signupNotice}</p>
          <button className="btn primary" onClick={() => navigate('/progress')}>查看报名进度</button>
        </div>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}

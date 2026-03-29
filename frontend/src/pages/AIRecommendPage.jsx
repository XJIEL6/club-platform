import { useState } from 'react';
import { chatWithAssistant } from '../services/api';

export default function AIRecommendPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好，我是社团 AI 助手。你可以随便问我，比如“我适合什么社团”“报名流程怎么走”“怎么准备面试”。'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError('');

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

  return (
    <section className="assistant-page">
      <div className="section-head">
        <h2>AI 助手</h2>
        <p>随时提问，获取社团选择、岗位建议和报名准备建议</p>
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
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入你的问题..."
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

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}

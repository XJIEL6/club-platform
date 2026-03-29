import { useState, useEffect } from 'react';
import { fetchMentorTalk, postMentorTalk } from '../services/api';

export default function MentorTalkPage() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 先从本地存储读取
    const raw = localStorage.getItem('mentor_talk_comments');
    if (raw) {
      try {
        setComments(JSON.parse(raw));
      } catch {}
    }

    // 再从后端尝试加载
    fetchMentorTalk()
      .then((data) => {
        if (data.comments && data.comments.length) {
          setComments(data.comments);
        }
      })
      .finally(() => setLoading(false));

    // 获取用户名
    const profile = localStorage.getItem('survey_profile');
    if (profile) {
      try {
        const p = JSON.parse(profile);
        setUserName(p.name || '匿名同学');
      } catch {}
    }
  }, []);

  const handleSubmit = () => {
    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const comment = {
        id: Date.now(),
        author: userName || '匿名同学',
        content: newComment,
        createdAt: new Date().toLocaleString('zh-CN')
      };
      const updated = [comment, ...comments];
      setComments(updated);
      localStorage.setItem('mentor_talk_comments', JSON.stringify(updated));
      setNewComment('');
      setSubmitting(false);

      // 尝试发送到后端（如果失败则忽略）
      postMentorTalk(userName || '匿名同学', newComment).catch(() => {});
    }, 300);
  };

  return (
    <section>
      <div className="section-head">
        <h2>学长学姐说</h2>
        <p>与大家交流社团加入建议、经验分享与真实看法</p>
      </div>

      <div className="step-card">
        <h4>发表评论</h4>
        <textarea
          rows={4}
          placeholder="分享你的想法、建议或问题..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '发布中...' : '发布评论'}
        </button>
      </div>

      {!comments.length ? (
        <div className="step-card">
          <p className="muted">暂时没有评论，成为第一个发言的人吧～</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <article className="comment-item" key={comment.id}>
              <div className="comment-header">
                <span className="author">{comment.author}</span>
                <span className="time">{comment.createdAt}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

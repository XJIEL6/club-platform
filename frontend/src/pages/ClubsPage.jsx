import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClubs } from '../services/api';

function ClubCard({ club, onOpen, isFavorited, onToggleFavorite }) {
  return (
    <article className="club-card">
      <div className="card-header">
        <h3>{club.name}</h3>
        <button
          className={`btn-heart ${isFavorited ? 'active' : ''}`}
          onClick={() => onToggleFavorite(club.id)}
          title={isFavorited ? '取消收藏' : '收藏社团'}
        >
          ❤️
        </button>
      </div>
      <p className="club-description">{club.description}</p>
      <div className="tag-wrap">
        {club.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>
      <button className="btn ghost" onClick={() => onOpen(club)}>查看详情</button>
    </article>
  );
}

function ClubDetailsModal({ open, club, onClose }) {
  const navigate = useNavigate();
  const [joinType, setJoinType] = useState('member');
  const [role, setRole] = useState('活动策划');
  const [message, setMessage] = useState('');

  if (!open || !club) return null;

  const hasSurvey = Boolean(localStorage.getItem('survey_user_id'));
  const staffRoles = ['活动策划', '运营宣传', '技术支持', '组织协调', '外联负责人'];

  const handleSignup = () => {
    if (!hasSurvey) {
      setMessage('请先完成报名问卷，再选择加入社团。');
      return;
    }

    const raw = localStorage.getItem('club_applications');
    const list = raw ? JSON.parse(raw) : [];
    const existing = list.find((item) => item.clubId === club.id);

    const entry = {
      clubId: club.id,
      clubName: club.name,
      mode: joinType === 'staff' ? '社团工作人员' : '兴趣参团',
      targetRole: joinType === 'staff' ? role : '普通成员',
      status: '已提交',
      createdAt: new Date().toISOString()
    };

    const next = existing ? list.map((item) => (item.clubId === club.id ? entry : item)) : [entry, ...list];
    localStorage.setItem('club_applications', JSON.stringify(next));
    window.dispatchEvent(new Event('club-progress-updated'));
    setMessage(joinType === 'staff' ? `报名成功，已提交工作人员意向岗位：${role}` : '参团报名成功，欢迎加入社团活动。');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3>{club.name}</h3>
        <p className="club-description">{club.description}</p>
        <div className="tag-wrap">
          {club.tags.map((tag) => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>
        <div className="club-section">
          <h4>过去活动</h4>
          <ul>
            {club.past_activities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="club-section">
          <h4>社团工作人员招募</h4>
          <p>{club.staff_requirements}</p>
        </div>
        <div className="club-section">
          <h4>兴趣成员可参与</h4>
          <ul>
            {club.interest_activities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {hasSurvey ? (
          <div className="club-section signup-panel">
            <h4>加入方式</h4>
            <label className="radio-inline">
              <input type="radio" checked={joinType === 'member'} onChange={() => setJoinType('member')} />
              参团（普通成员）
            </label>
            <label className="radio-inline">
              <input type="radio" checked={joinType === 'staff'} onChange={() => setJoinType('staff')} />
              加入社团工作（工作人员）
            </label>
            {joinType === 'staff' ? (
              <label>
                意向岗位
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {staffRoles.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : (
          <div className="club-section signup-panel">
            <p className="muted">你还没有填写问卷，请先完成报名问卷后再加入社团。</p>
            <button className="btn ghost" onClick={() => navigate('/questionnaire')}>去填写报名问卷</button>
          </div>
        )}

        {message ? <p className="success">{message}</p> : null}
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>关闭</button>
          <button className="btn primary" onClick={handleSignup}>立即报名</button>
        </div>
      </div>
    </div>
  );
}

export default function ClubsPage() {
  const [search, setSearch] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const raw = localStorage.getItem('favorite_clubs');
    const ids = raw ? JSON.parse(raw) : [];
    setFavorites(new Set(ids));
  }, []);

  const toggleFavorite = (clubId) => {
    const next = new Set(favorites);
    if (next.has(clubId)) {
      next.delete(clubId);
    } else {
      next.add(clubId);
    }
    setFavorites(next);
    localStorage.setItem('favorite_clubs', JSON.stringify([...next]));
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchClubs(search)
      .then((data) => {
        if (mounted) {
          setClubs(data.clubs || []);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || '加载失败');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search]);

  const total = useMemo(() => clubs.length, [clubs]);

  return (
    <section>
      <div className="section-head">
        <h2>所有社团</h2>
        <p>用关键词搜索社团名称、标签、活动和招新要求</p>
      </div>
      <input
        className="search-input"
        placeholder="搜索：摄影、编程、志愿服务、主持..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p className="meta-line">共找到 {total} 个社团</p>
      {loading ? <p>加载中...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <div className="club-grid">
        {clubs.map((club) => (
          <ClubCard
            key={club.id}
            club={club}
            onOpen={setSelectedClub}
            isFavorited={favorites.has(club.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
      <ClubDetailsModal
        open={Boolean(selectedClub)}
        club={selectedClub}
        onClose={() => setSelectedClub(null)}
      />
    </section>
  );
}

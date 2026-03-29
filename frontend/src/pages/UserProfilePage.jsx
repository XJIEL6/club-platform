import { useEffect, useState, useMemo } from 'react';
import { fetchClubs, fetchUserProfile } from '../services/api';

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从本地或后端获取用户信息
    const raw = localStorage.getItem('survey_profile');
    if (raw) {
      try {
        setProfile(JSON.parse(raw));
      } catch {}
    } else {
      fetchUserProfile().then((data) => {
        if (data.profile) setProfile(data.profile);
      });
    }

    const favRaw = localStorage.getItem('favorite_clubs');
    const favIds = favRaw ? JSON.parse(favRaw) : [];

    fetchClubs('')
      .then((data) => {
        const clubs = data.clubs || [];
        const favClubs = clubs.filter((c) => favIds.includes(c.id));
        setFavorites(favClubs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="section-head">
        <h2>个人中心</h2>
        <p>查看你的基本信息和收藏的社团</p>
      </div>

      {profile ? (
        <div className="step-card">
          <h3>你的基本信息</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">姓名</span>
              <span className="value">{profile.name}</span>
            </div>
            <div className="profile-item">
              <span className="label">学号</span>
              <span className="value">{profile.studentId}</span>
            </div>
            <div className="profile-item">
              <span className="label">院系</span>
              <span className="value">{profile.college}</span>
            </div>
            <div className="profile-item">
              <span className="label">年级</span>
              <span className="value">{profile.grade}</span>
            </div>
            <div className="profile-item">
              <span className="label">联系方式</span>
              <span className="value">{profile.contact}</span>
            </div>
            <div className="profile-item">
              <span className="label">兴趣标签</span>
              <span className="value">
                <div className="tag-wrap">
                  {profile.interests?.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="step-card">
          <p className="muted">你还没有填写报名问卷，无法展示个人信息。</p>
        </div>
      )}

      <div className="section-head" style={{ marginTop: '32px' }}>
        <h2>个人收藏</h2>
        <p>你收藏的社团</p>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : !favorites.length ? (
        <div className="step-card">
          <p className="muted">暂时没有收藏任何社团，去【所有社团】页面点击爱心即可收藏。</p>
        </div>
      ) : (
        <div className="club-grid">
          {favorites.map((club) => (
            <article className="club-card" key={club.id}>
              <h3>{club.name}</h3>
              <p className="club-description">{club.description}</p>
              <div className="tag-wrap">
                {club.tags.map((tag) => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
              <button className="btn ghost">已收藏 ❤️</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

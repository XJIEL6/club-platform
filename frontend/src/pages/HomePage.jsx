import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="home-shell">
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />
      <div className="home-hero">
        <div className="hero-content">
          <p className="hero-kicker">大学社团招新系统</p>
          <h1>点亮你的校园主线任务</h1>
          <p className="hero-subtitle">
            10 个场景卡片，3 幕沉浸体验，快速发现你适合的社团和社团工作。
          </p>
          <div className="hero-badges">
            <span>场景匹配</span>
            <span>盲盒揭晓</span>
            <span>岗位推荐</span>
          </div>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => navigate('/questionnaire')}>开始匹配兴趣</button>
            <button className="btn ghost" onClick={() => navigate('/clubs')}>先看看全部社团</button>
          </div>
        </div>

        <div className="hero-panel">
          <h3>你将获得</h3>
          <ul>
            <li>适配你风格的社团清单</li>
            <li>可直接报名的推荐岗位</li>
            <li>可修改并复用的报名档案</li>
            <li>AI 助手实时答疑与建议</li>
          </ul>
        </div>
      </div>
      <div className="home-strip">
        <p>现在开始，2-3 分钟即可完成完整匹配流程</p>
        <button className="btn ghost" onClick={() => navigate('/ai-recommend')}>先问问 AI 助手</button>
      </div>
    </section>
  );
}

import { useMemo } from 'react';

function formatTime(value) {
  try {
    return new Date(value).toLocaleString('zh-CN');
  } catch {
    return value;
  }
}

export default function RegistrationProgressPage() {
  const records = useMemo(() => {
    try {
      const raw = localStorage.getItem('club_applications');
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, []);

  return (
    <section>
      <div className="section-head">
        <h2>报名进度</h2>
        <p>查看你已提交的社团报名记录与当前状态</p>
      </div>
      {!records.length ? (
        <div className="step-card">
          <p className="muted">暂时没有报名记录，去社团详情里点“立即报名”即可生成进度。</p>
        </div>
      ) : (
        <div className="progress-list">
          {records.map((item) => (
            <article className="progress-item" key={`${item.clubId}-${item.mode}`}>
              <h3>{item.clubName}</h3>
              <p>加入方式：{item.mode}</p>
              <p>意向岗位：{item.targetRole}</p>
              <p>提交时间：{formatTime(item.createdAt)}</p>
              <p className="status-chip">状态：{item.status}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

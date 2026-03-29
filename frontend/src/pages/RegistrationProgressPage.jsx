import { useEffect, useState } from 'react';

function formatTime(value) {
  try {
    return new Date(value).toLocaleString('zh-CN');
  } catch {
    return value;
  }
}

export default function RegistrationProgressPage() {
  const [records, setRecords] = useState([]);

  const loadRecords = () => {
    try {
      const raw = localStorage.getItem('club_applications');
      const list = raw ? JSON.parse(raw) : [];
      setRecords(Array.isArray(list) ? list : []);
    } catch {
      setRecords([]);
    }
  };

  useEffect(() => {
    loadRecords();

    const onUpdated = () => loadRecords();
    window.addEventListener('club-progress-updated', onUpdated);
    window.addEventListener('storage', onUpdated);

    return () => {
      window.removeEventListener('club-progress-updated', onUpdated);
      window.removeEventListener('storage', onUpdated);
    };
  }, []);

  const handleCancel = (record) => {
    const shouldCancel = window.confirm(`确认取消报名：${record.clubName}？`);
    if (!shouldCancel) return;

    const next = records.filter(
      (item) => !(item.clubId === record.clubId && item.mode === record.mode && item.createdAt === record.createdAt)
    );
    localStorage.setItem('club_applications', JSON.stringify(next));
    setRecords(next);
    window.dispatchEvent(new Event('club-progress-updated'));
  };

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
            <article className="progress-item" key={`${item.clubId}-${item.mode}-${item.createdAt}`}>
              <h3>{item.clubName}</h3>
              <p>加入方式：{item.mode}</p>
              <p>意向岗位：{item.targetRole}</p>
              <p>提交时间：{formatTime(item.createdAt)}</p>
              <p className="status-chip">状态：{item.status}</p>
              <div className="progress-item-actions">
                <button className="btn ghost progress-cancel-btn" onClick={() => handleCancel(item)}>取消报名</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

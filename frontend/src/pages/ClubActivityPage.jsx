import { useState, useEffect } from 'react';
import { fetchActivities } from '../services/api';

export default function ClubActivityPage() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities()
      .then((data) => {
        setActivities(data.activities || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="section-head">
        <h2>社团动态</h2>
        <p>社团最近活动日历一览</p>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="timeline-container">
          {activities.map((item, idx) => (
            <div
              className="timeline-item"
              key={item.date}
              style={{ marginLeft: idx % 2 === 0 ? 0 : 'auto', marginRight: idx % 2 === 0 ? 'auto' : 0 }}
            >
              <div className="timeline-dot" />
              <div className="timeline-card" onClick={() => setSelectedActivity(item)}>
                <p className="timeline-date">{item.date}</p>
                <p className="timeline-activity">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedActivity && (
        <div className="modal-backdrop" onClick={() => setSelectedActivity(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedActivity.activity}</h3>
            <p><strong>活动时间：</strong>{selectedActivity.date}</p>
            <p className="muted">更多详情请关注社团公众号或咨询社团工作人员。</p>
            <div className="modal-actions">
              <button className="btn primary" onClick={() => setSelectedActivity(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

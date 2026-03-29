import { useEffect, useState } from 'react';
import { fetchSimilarUsers } from '../services/api';

export default function SimilarPeoplePage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSimilarUsers()
      .then((data) => {
        setList(data.users || []);
        setError('');
      })
      .catch((err) => setError(err.message || '获取失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="section-head">
        <h2>看看相似的人</h2>
        <p>完成问卷后，你可以在这里找到兴趣相近、活动偏好类似的同学</p>
      </div>
      {loading ? <p>加载中...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <div className="people-grid">
        {list.map((user) => (
          <article className="person-card" key={user.id}>
            <h3>{user.name}</h3>
            <p>{user.college} · {user.grade}</p>
            <p>相似度：{user.similarity}%</p>
            <div className="tag-wrap">
              {user.common_tags?.map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

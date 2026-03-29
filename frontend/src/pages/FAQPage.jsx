import { useState, useEffect } from 'react';
import { fetchFAQ } from '../services/api';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQ()
      .then((data) => {
        setFaqs(data.faqs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="section-head">
        <h2>常见问题</h2>
        <p>关于社团加入、学分、活动等常见疑问答解</p>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="faq-list">
          {faqs.map((item, idx) => (
            <article className="faq-item" key={idx}>
              <button
                className="faq-question"
                onClick={() => setActive(active === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <span className="faq-toggle">{active === idx ? '−' : '+'}</span>
              </button>
              {active === idx && <p className="faq-answer">{item.a}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


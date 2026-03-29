import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurvey, fetchPersonalityMatch } from '../services/api';

// 8个人格维度
const PERSONALITY_DIMENSIONS = {
  creativity: { label: '创造力', color: '#FF6B6B' },
  actionability: { label: '行动力', color: '#4ECDC4' },
  leadership: { label: '领导力', color: '#FFE66D' },
  sociability: { label: '社交力', color: '#95E1D3' },
  analytical: { label: '分析力', color: '#A8E6CF' },
  adaptability: { label: '适应力', color: '#FFD3B6' },
  resilience: { label: '抗压力', color: '#FFAAA5' },
  empathy: { label: '同理心', color: '#AA96DA' }
};

// 10个场景卡片，每个绑定2个维度
const SCENARIO_CARDS = [
  {
    id: 1,
    title: '举办一场创意文化节',
    description: '你被选中负责策划一场文化节，需要新颖的想法和执行力',
    dimensions: ['creativity', 'actionability'],
    emoji: '🎨'
  },
  {
    id: 2,
    title: '带领小组完成项目',
    description: '团队需要一个有魄力的人来统筹工作和分配任务',
    dimensions: ['leadership', 'actionability'],
    emoji: '👥'
  },
  {
    id: 3,
    title: '面对意外的变动',
    description: '计划突然改变，需要快速调整和灵活应对',
    dimensions: ['adaptability', 'resilience'],
    emoji: '🌪️'
  },
  {
    id: 4,
    title: '难以解决的问题',
    description: '遇到复杂问题，需要逻辑分析找到核心',
    dimensions: ['analytical', 'resilience'],
    emoji: '🔍'
  },
  {
    id: 5,
    title: '同学情绪低谷',
    description: '朋友遇到困难，需要你的理解和陪伴',
    dimensions: ['empathy', 'sociability'],
    emoji: '💬'
  },
  {
    id: 6,
    title: '大型校园活动',
    description: '需要你与各种人互动、协调和建立联系',
    dimensions: ['sociability', 'leadership'],
    emoji: '🎉'
  },
  {
    id: 7,
    title: '新兴技术学习',
    description: '学习最新的技术和工具，需要持续探索的热情',
    dimensions: ['creativity', 'analytical'],
    emoji: '💡'
  },
  {
    id: 8,
    title: '承诺与坚持',
    description: '长期目标需要你不怕困难、坚持到底',
    dimensions: ['resilience', 'actionability'],
    emoji: '🎯'
  },
  {
    id: 9,
    title: '立新潮流',
    description: '尝试新的理念，可能会获得关注和认可',
    dimensions: ['creativity', 'empathy'],
    emoji: '⭐'
  },
  {
    id: 10,
    title: '团队协作',
    description: '需要在团队中发挥自己的最大价值',
    dimensions: ['leadership', 'sociability'],
    emoji: '🤝'
  }
];

const HOBBY_QUESTIONS = [
  {
    id: 'hobby-1',
    type: 'hobby',
    title: '课余时间你更想做什么？',
    description: '选出你最愿意长期投入的一项',
    emoji: '🧭',
    options: [
      {
        label: '组织线下活动并带动大家参与',
        dimensions: ['leadership', 'sociability'],
        interest: '活动组织'
      },
      {
        label: '拍摄剪辑、做海报或内容创作',
        dimensions: ['creativity', 'actionability'],
        interest: '内容创作'
      },
      {
        label: '钻研技术工具，做小程序或数据分析',
        dimensions: ['analytical', 'creativity'],
        interest: '技术探索'
      }
    ]
  },
  {
    id: 'hobby-2',
    type: 'hobby',
    title: '你最享受哪种社团氛围？',
    description: '选一个你最有归属感的场景',
    emoji: '🌟',
    options: [
      {
        label: '大家分工明确，目标清晰，推进高效',
        dimensions: ['actionability', 'leadership'],
        interest: '项目执行'
      },
      {
        label: '彼此支持、氛围温暖、重视陪伴成长',
        dimensions: ['empathy', 'sociability'],
        interest: '互助陪伴'
      },
      {
        label: '持续尝试新想法，鼓励探索和挑战',
        dimensions: ['adaptability', 'resilience'],
        interest: '创新挑战'
      }
    ]
  },
  {
    id: 'hobby-3',
    type: 'hobby',
    title: '如果要选一个长期方向，你会更偏向？',
    description: '选择你最希望深耕的方向',
    emoji: '🚀',
    options: [
      {
        label: '对外沟通、联络资源、拓展合作',
        dimensions: ['sociability', 'adaptability'],
        interest: '外联沟通'
      },
      {
        label: '策划方案、统筹进度、推动落地',
        dimensions: ['leadership', 'actionability'],
        interest: '策划统筹'
      },
      {
        label: '观察需求、解决问题、优化细节',
        dimensions: ['analytical', 'resilience'],
        interest: '问题解决'
      }
    ]
  }
];

const INTEREST_CARD_QUESTIONS = [
  {
    id: 'interest-cards-1',
    type: 'interest-grid',
    title: '这些兴趣活动里，你最想参加哪些？',
    description: '可多选，至少选 1 项',
    emoji: '🃏',
    options: [
      { label: '桌游', dimensions: ['analytical', 'sociability'], interest: '桌游' },
      { label: '羽毛球', dimensions: ['actionability', 'resilience'], interest: '羽毛球' },
      { label: '天文', dimensions: ['analytical', 'adaptability'], interest: '天文' },
      { label: 'AI编程', dimensions: ['creativity', 'analytical'], interest: 'AI编程' },
      { label: '摄影外拍', dimensions: ['creativity', 'sociability'], interest: '摄影' },
      { label: '公益服务', dimensions: ['empathy', 'actionability'], interest: '公益志愿' }
    ]
  },
  {
    id: 'interest-cards-2',
    type: 'interest-grid',
    title: '你希望在社团中长期提升哪些方向？',
    description: '可多选，至少选 1 项',
    emoji: '🌌',
    options: [
      { label: '组织活动', dimensions: ['leadership', 'actionability'], interest: '组织协作' },
      { label: '演讲主持', dimensions: ['leadership', 'sociability'], interest: '主持' },
      { label: '视频剪辑', dimensions: ['creativity', 'actionability'], interest: '影视制作' },
      { label: '科研探索', dimensions: ['analytical', 'resilience'], interest: '学术科研' },
      { label: '音乐舞台', dimensions: ['sociability', 'creativity'], interest: '音乐演奏' },
      { label: '户外挑战', dimensions: ['adaptability', 'resilience'], interest: '户外探险' }
    ]
  }
];

const QUESTION_STEPS = [
  ...SCENARIO_CARDS.map((card) => ({ ...card, type: 'scenario' })),
  ...HOBBY_QUESTIONS,
  ...INTEREST_CARD_QUESTIONS
];

function refineClubsByInterests(clubs, interests) {
  if (!Array.isArray(clubs) || !clubs.length || !Array.isArray(interests) || !interests.length) {
    return clubs || [];
  }

  const keywordMap = {
    桌游: ['桌游', '策略', '辩论', '演讲'],
    羽毛球: ['羽毛球', '球类运动', '运动'],
    天文: ['天文', '科研', '探索', '学术'],
    AI编程: ['人工智能', '编程开发', '技术', '模型'],
    摄影: ['摄影', '影视', '视觉'],
    公益志愿: ['公益', '志愿', '服务'],
    组织协作: ['组织协作', '策划', '统筹'],
    主持: ['主持', '辩论', '演讲'],
    影视制作: ['影视制作', '剪辑', '内容'],
    学术科研: ['学术科研', '科研', '论文'],
    音乐演奏: ['音乐演奏', '舞台', '演出'],
    户外探险: ['户外探险', '户外', '挑战']
  };

  const selectedKeywords = interests
    .flatMap((interest) => keywordMap[interest] || [interest])
    .map((item) => String(item).toLowerCase());

  return [...clubs]
    .map((club) => {
      const blob = [
        club.name,
        club.description,
        ...(club.tags || []),
        ...(club.interest_activities || []),
        ...(club.past_activities || [])
      ].join(' ').toLowerCase();

      const interestScore = selectedKeywords.reduce((sum, keyword) => {
        return blob.includes(keyword) ? sum + 8 : sum;
      }, 0);

      const baseScore = Number(club.matchScore) || 0;
      return {
        ...club,
        matchScore: Math.min(99, baseScore + interestScore),
        interestScore
      };
    })
    .sort((a, b) => (b.matchScore + b.interestScore) - (a.matchScore + a.interestScore));
}

// 人格类型映射（根据维度组合）
const PERSONALITY_TYPES = {
  'innovator': { name: '创新者', desc: '富有创意和行动力，喜欢尝试新事物' },
  'leader': { name: '领导者', desc: '有决策能力和号召力，善于协调团队' },
  'analyst': { name: '分析家', desc: '逻辑严谨，善于问题解决' },
  'connector': { name: '连接者', desc: '善于社交，容易与人建立联系' },
  'builder': { name: '建造者', desc: '行动力强，能将想法变成现实' },
  'guardian': { name: '守护者', desc: '有韧性和同理心，注重稳定发展' },
  'explorer': { name: '探险家', desc: '好奇心强，适应力强，乐于挑战' },
  'harmonizer': { name: '和谐者', desc: '兼顾多方，善于平衡各种需求' }
};

export default function QuestionnairePage() {
  // 三幕流程：'cards' | 'unboxing' | 'result'
  const [stage, setStage] = useState('cards');
  const [currentCard, setCurrentCard] = useState(0);
  const [dimensions, setDimensions] = useState(Object.keys(PERSONALITY_DIMENSIONS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}));
  const [shaking, setShaking] = useState(false);
  const [unboxed, setUnboxed] = useState(false);
  const [personalityType, setPersonalityType] = useState('');
  const [form, setForm] = useState({
    name: '',
    studentId: '',
    contact: '',
    college: '',
    grade: '',
    interests: [],
    experience: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [matchedClubs, setMatchedClubs] = useState([]);
  const [selectedInterestCards, setSelectedInterestCards] = useState([]);
  const navigate = useNavigate();
  const currentStep = QUESTION_STEPS[currentCard];
  const maxDimensionScore = Math.max(1, ...Object.values(dimensions));

  const goToNextQuestion = () => {
    if (currentCard < QUESTION_STEPS.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      // 完成答题，进入盲盒幕
      setStage('unboxing');
    }
  };

  // 卡片应答
  const handleCardResponse = (isYes) => {
    if (isYes && currentStep?.type === 'scenario') {
      setDimensions(prev => ({
        ...prev,
        [currentStep.dimensions[0]]: prev[currentStep.dimensions[0]] + 1,
        [currentStep.dimensions[1]]: prev[currentStep.dimensions[1]] + 1
      }));
    }

    goToNextQuestion();
  };

  const handleHobbySelect = (option) => {
    setDimensions((prev) => ({
      ...prev,
      [option.dimensions[0]]: prev[option.dimensions[0]] + 1,
      [option.dimensions[1]]: prev[option.dimensions[1]] + 1
    }));

    setForm((prev) => ({
      ...prev,
      interests: Array.from(new Set([...prev.interests, option.interest]))
    }));

    goToNextQuestion();
  };

  const toggleInterestCard = (option) => {
    setSelectedInterestCards((prev) => {
      const exists = prev.some((item) => item.label === option.label);
      if (exists) {
        return prev.filter((item) => item.label !== option.label);
      }
      return [...prev, option];
    });
  };

  const confirmInterestCards = () => {
    if (!selectedInterestCards.length) return;

    const dimensionDelta = selectedInterestCards.reduce((acc, option) => {
      const next = { ...acc };
      option.dimensions.forEach((dim) => {
        next[dim] = (next[dim] || 0) + 1;
      });
      return next;
    }, {});

    setDimensions((prev) => {
      const merged = { ...prev };
      Object.entries(dimensionDelta).forEach(([dim, delta]) => {
        merged[dim] += delta;
      });
      return merged;
    });

    setForm((prev) => ({
      ...prev,
      interests: Array.from(new Set([
        ...prev.interests,
        ...selectedInterestCards.map((item) => item.interest)
      ]))
    }));

    setSelectedInterestCards([]);
    goToNextQuestion();
  };

  // 计算人格类型
  const calculatePersonality = () => {
    const sorted = Object.entries(dimensions).sort((a, b) => b[1] - a[1]);
    const topTwo = sorted.slice(0, 2).map(([key]) => key);
    
    const typeMap = {
      'creativity,actionability': 'innovator',
      'leadership,actionability': 'builder',
      'analytical,resilience': 'analyst',
      'empathy,sociability': 'connector',
      'creativity,analytical': 'explorer',
      'resilience,actionability': 'guardian',
      'leadership,sociability': 'harmonizer',
      'default': 'innovator'
    };

    const key = topTwo.sort().join(',');
    return typeMap[key] || typeMap['default'];
  };

  // 摇盒子动画
  const handleShakeBox = () => {
    setShaking(true);
    const type = calculatePersonality();
    setPersonalityType(type);

    fetchPersonalityMatch(type, dimensions)
      .then((res) => {
        const refined = refineClubsByInterests(res.matchedClubs || [], form.interests);
        setMatchedClubs(refined);
      })
      .catch((err) => {
        console.error('获取匹配社团失败:', err);
        setMatchedClubs([]);
      });

    setTimeout(() => {
      setShaking(false);
      setUnboxed(true);
    }, 600);
    setTimeout(() => setStage('result'), 1100);
  };

  // 提交最终信息
  const handleSubmit = async () => {
    const required = ['name', 'studentId', 'contact', 'college', 'grade'];
    if (required.some(field => !form[field].trim())) {
      alert('请完整填写基本信息');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        personalityType,
        dimensions
      };
      const res = await submitSurvey(payload);
      setUserId(res.user_id);
      localStorage.setItem('survey_user_id', res.user_id);
      localStorage.setItem('survey_profile', JSON.stringify(payload));
      
      setTimeout(() => navigate('/clubs'), 500);
    } catch (err) {
      alert('提交失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="matching-wrap">
      {/* 第一幕：场景卡片 */}
      {stage === 'cards' && (
        <div className="matching-stage cards-stage">
          <div className="stage-header">
            <h2>开始兴趣匹配</h2>
            <p>{QUESTION_STEPS.length} 道问题，认识你的性格特质与兴趣偏好</p>
            <div className="progress-dots">
              {QUESTION_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`dot ${idx === currentCard ? 'active' : ''} ${idx < currentCard ? 'done' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="cards-container">
            <div className="scenario-card">
              <div className="card-emoji">{currentStep.emoji}</div>
              <h3>{currentStep.title}</h3>
              <p>{currentStep.description}</p>
              {currentStep.type === 'scenario' ? (
                <div className="dimension-tags">
                  {currentStep.dimensions.map((dim) => (
                    <span key={dim} className="dim-tag" style={{ background: PERSONALITY_DIMENSIONS[dim].color }}>
                      {PERSONALITY_DIMENSIONS[dim].label}
                    </span>
                  ))}
                </div>
              ) : (
                currentStep.type === 'hobby' ? (
                  <div className="hobby-options">
                    {currentStep.options.map((option) => (
                      <button
                        key={option.label}
                        className="hobby-option-btn"
                        onClick={() => handleHobbySelect(option)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="interest-float-grid">
                      {currentStep.options.map((option, idx) => {
                        const selected = selectedInterestCards.some((item) => item.label === option.label);
                        return (
                          <button
                            key={option.label}
                            className={`interest-float-card ${selected ? 'selected' : ''}`}
                            style={{ '--idx': idx }}
                            onClick={() => toggleInterestCard(option)}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="interest-select-hint">已选 {selectedInterestCards.length} 项</p>
                  </>
                )
              )}
            </div>
          </div>

          {currentStep.type === 'scenario' ? (
            <div className="cards-actions">
              <button className="btn ghost large" onClick={() => handleCardResponse(false)}>
                不太符合 →
              </button>
              <button className="btn primary large" onClick={() => handleCardResponse(true)}>
                ← 很符合我
              </button>
            </div>
          ) : currentStep.type === 'interest-grid' ? (
            <div className="cards-actions">
              <button className="btn primary large" onClick={confirmInterestCards} disabled={!selectedInterestCards.length}>
                确认选择并下一题
              </button>
            </div>
          ) : null}

          <p className="stage-hint">
            {currentCard + 1} / {QUESTION_STEPS.length}
          </p>
        </div>
      )}

      {/* 第二幕：盲盒开箱 */}
      {stage === 'unboxing' && (
        <div className="matching-stage unboxing-stage">
          <div className="stage-header">
            <h2>准备好了吗？</h2>
            <p>准备好发现适合你的社团和社团工作了吗</p>
          </div>

          <div className={`blindbox-container ${shaking ? 'shaking' : ''} ${unboxed ? 'opened' : ''}`}>
            {!unboxed ? (
              <>
                <div className="blindbox">
                  <div className="blindbox-top" />
                  <div className="blindbox-bottom" />
                </div>
                <p className="blindbox-label">摇一摇开启惊喜</p>
              </>
            ) : (
              <div className="blindbox-result">
                <div className="sparkle">✨</div>
                <h1>{PERSONALITY_TYPES[personalityType].name}</h1>
                <p>{PERSONALITY_TYPES[personalityType].desc}</p>
              </div>
            )}
          </div>

          <div className="unboxing-actions">
            <button className="btn primary large" onClick={handleShakeBox} disabled={shaking || unboxed}>
              {shaking ? '匹配中...' : unboxed ? '已揭晓' : '🎁 摇一摇'}
            </button>
            <p className="hint">摇一摇后将自动揭晓匹配结果</p>
          </div>
        </div>
      )}

      {/* 第三幕：结果与迷你表单 */}
      {stage === 'result' && (
        <div className="matching-stage result-stage">
          <div className="stage-header">
            <h2>发现了什么？</h2>
            <p>这是最适合你的社团和工作</p>
          </div>

          <div className="result-card">
            <div className="personality-main">
              <h1>{PERSONALITY_TYPES[personalityType].name}</h1>
              <p className="personality-desc">{PERSONALITY_TYPES[personalityType].desc}</p>
            </div>

            <div className="dimensions-chart">
              <h3>你的维度分布</h3>
              <div className="chart-grid">
                {Object.entries(dimensions).map(([key, value]) => (
                  <div key={key} className="dimension-bar">
                    <div className="bar-label">{PERSONALITY_DIMENSIONS[key].label}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.round((value / maxDimensionScore) * 100)}%`,
                          background: PERSONALITY_DIMENSIONS[key].color
                        }}
                      />
                    </div>
                    <div className="bar-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {matchedClubs.length > 0 && (
            <div className="matched-clubs-section">
              <h3>为你推荐的社团</h3>
              <p className="section-hint">这些社团和工作特别适合你</p>
              <div className="matched-clubs-grid">
                {matchedClubs.map((club) => (
                  <div key={club.id} className="matched-club-card">
                    <h4>{club.name}</h4>
                    <p className="club-desc">{club.description}</p>
                    <div>
                      <div style={{ fontSize: '13px', color: '#5d6472', marginBottom: '8px', fontWeight: '600' }}>适合的工作</div>
                      <div className="suggested-roles">
                        {club.suggestedPositions && club.suggestedPositions.map((pos) => (
                          <span key={pos} className="role-badge">{pos}</span>
                        ))}
                      </div>
                    </div>
                    <div className="match-score">匹配度：{club.matchScore}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mini-form">
            <h3>再补充一点信息</h3>
            <p className="form-hint">这样社团就能更了解你，报名时会自动填充</p>

            <div className="form-grid">
              <label>
                姓名 *
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入真实姓名"
                />
              </label>
              <label>
                学号 *
                <input
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  placeholder="如 2024012345"
                />
              </label>
              <label>
                院系 *
                <input
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="如 人文学院"
                />
              </label>
              <label>
                联系方式 *
                <input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="手机号或微信号"
                />
              </label>
              <label>
                年级 *
                <input
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  placeholder="如 大一"
                />
              </label>
            </div>

            <label className="full-width">
              兴趣爱好和经历（选填）
              <textarea
                rows={4}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="描述你的兴趣爱好、相关经历、特长等，帮助社团更好地了解你"
              />
            </label>
          </div>

          <div className="result-actions">
            <button
              className="btn primary large"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '保存中...' : '保存信息，去报名'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

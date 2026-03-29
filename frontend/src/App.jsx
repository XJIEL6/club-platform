import { Link, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import ClubsPage from './pages/ClubsPage';
import SimilarPeoplePage from './pages/SimilarPeoplePage';
import AIRecommendPage from './pages/AIRecommendPage';
import RegistrationProgressPage from './pages/RegistrationProgressPage';
import UserProfilePage from './pages/UserProfilePage';
import ClubActivityPage from './pages/ClubActivityPage';
import MentorTalkPage from './pages/MentorTalkPage';
import FAQPage from './pages/FAQPage';

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">高校社团平台</div>
        <nav>
          <Link to="/">首页</Link>
          <Link to="/clubs">所有社团</Link>
          <Link to="/activity">社团动态</Link>
          <Link to="/progress">报名进度</Link>
          <Link to="/ai-recommend">AI助手</Link>
          <Link to="/mentortalk">学长学姐说</Link>
          <Link to="/similar">相似的人</Link>
          <Link to="/faq">常见问题</Link>
          <Link to="/profile">个人中心</Link>
        </nav>
      </header>
      <main className="page-main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/progress" element={<RegistrationProgressPage />} />
        <Route path="/activity" element={<ClubActivityPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/mentortalk" element={<MentorTalkPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/similar" element={<SimilarPeoplePage />} />
        <Route path="/ai-recommend" element={<AIRecommendPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

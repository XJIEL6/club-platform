const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || '请求失败');
  }

  return response.json();
}

export async function submitSurvey(payload) {
  return request('/surveys', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchClubs(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/clubs${query}`);
}

export async function fetchSimilarUsers(userId) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return request(`/similar-users${query}`);
}

export async function fetchAIRecommendation(userId) {
  return request('/ai-recommend', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  });
}

export async function fetchUserProfile() {
  return request('/user/profile').catch(() => ({ profile: null }));
}

export async function fetchActivities() {
  return request('/activities').catch(() => ({ activities: [] }));
}

export async function fetchMentorTalk() {
  return request('/mentor-talk').catch(() => ({ comments: [] }));
}

export async function postMentorTalk(author, content) {
  return request('/mentor-talk', {
    method: 'POST',
    body: JSON.stringify({ author, content })
  });
}

export async function fetchFAQ() {
  return request('/faq').catch(() => ({ faqs: [] }));
}

export async function fetchPersonalityMatch(personalityType, dimensions) {
  return request('/personality-match', {
    method: 'POST',
    body: JSON.stringify({ personalityType, dimensions })
  }).catch(() => ({ matchedClubs: [] }));
}

export async function chatWithAssistant(message, history = []) {
  return request('/assistant-chat', {
    method: 'POST',
    body: JSON.stringify({ message, history })
  });
}

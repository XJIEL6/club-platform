import os
import json

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from data.clubs import CLUBS
except ImportError:
    from backend.data.clubs import CLUBS

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def _rule_based_recommend(user):
    interests = set(user.get("interests", []))
    scored = []
    for club in CLUBS:
        overlap = interests.intersection(set(club.get("tags", [])))
        score = len(overlap)
        if user.get("role") in ["组织者", "传播者"] and "staff_requirements" in club:
            score += 1
        scored.append((score, overlap, club))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:3]

    recommendations = []
    for score, overlap, club in top:
        reason = "兴趣标签匹配" if overlap else "综合活动节奏和参与目标匹配"
        recommendations.append({
            "club_name": club["name"],
            "reason": f"{reason}，匹配标签：{', '.join(overlap) if overlap else '无明确重合，建议先体验公开活动'}"
        })

    return {
        "summary": "已基于你的兴趣、角色和时间安排生成推荐（规则引擎模式）。",
        "recommendations": recommendations
    }


def ai_recommend(user):
    if not OPENAI_API_KEY or OpenAI is None:
        return _rule_based_recommend(user)

    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = {
        "user": user,
        "clubs": CLUBS,
        "instruction": "根据用户信息推荐3个最合适社团，给出简短理由，返回JSON格式：{summary, recommendations:[{club_name, reason}]}"
    }

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=0.4,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "你是高校社团匹配助手。"},
            {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)}
        ]
    )

    content = response.choices[0].message.content
    return json.loads(content)

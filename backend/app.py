import os
from copy import deepcopy

from flask import Flask, jsonify, request

try:
    from flask_cors import CORS
except ImportError:
    CORS = None

try:
    from data.clubs import CLUBS
    from data.sample_users import SAMPLE_USERS
    from services.recommender import ai_recommend
    from services.storage import SurveyStorage
except ImportError:
    from backend.data.clubs import CLUBS
    from backend.data.sample_users import SAMPLE_USERS
    from backend.services.recommender import ai_recommend
    from backend.services.storage import SurveyStorage

app = Flask(__name__)
if CORS:
    CORS(app)
storage = SurveyStorage()


def _safe_lower_text(value):
    if value is None:
        return ""
    return str(value).lower()


def _club_match(club, term):
    if not term:
        return True
    blob = " ".join([
        club.get("name", ""),
        club.get("description", ""),
        " ".join(club.get("tags", [])),
        " ".join(club.get("past_activities", [])),
        club.get("staff_requirements", ""),
        " ".join(club.get("interest_activities", [])),
    ])
    return term in _safe_lower_text(blob)


def _compute_similarity(base_interests, target_interests):
    base = set(base_interests)
    target = set(target_interests)
    if not base and not target:
        return 0
    common = base.intersection(target)
    union = base.union(target)
    return int((len(common) / max(len(union), 1)) * 100)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "campus-club-backend"})


@app.get("/api/clubs")
def clubs():
    search = _safe_lower_text(request.args.get("search", "")).strip()
    data = [club for club in CLUBS if _club_match(club, search)]
    return jsonify({"clubs": data})


@app.post("/api/surveys")
def submit_survey():
    payload = request.get_json(silent=True) or {}
    required = ["name", "studentId", "contact", "college", "grade"]
    missing = [field for field in required if not payload.get(field)]

    if missing:
        return jsonify({"error": f"缺少必填字段: {', '.join(missing)}"}), 400

    record = storage.create_survey(payload)
    return jsonify({"user_id": record["id"], "survey": record})


@app.get("/api/similar-users")
def similar_users():
    user_id = request.args.get("user_id", "")
    surveys = storage.list_surveys()

    if user_id:
        source = next((item for item in surveys if item.get("id") == user_id), None)
    else:
        source = surveys[-1] if surveys else None

    source_interests = source.get("interests", []) if source else []
    users = []

    for person in SAMPLE_USERS:
        common = list(set(source_interests).intersection(set(person.get("interests", []))))
        users.append({
            "id": person["id"],
            "name": person["name"],
            "college": person["college"],
            "grade": person["grade"],
            "similarity": _compute_similarity(source_interests, person.get("interests", [])),
            "common_tags": common,
        })

    users.sort(key=lambda x: x["similarity"], reverse=True)
    return jsonify({"users": users})


@app.post("/api/ai-recommend")
def ai_recommend_route():
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id", "")
    surveys = storage.list_surveys()
    selected = next((item for item in surveys if item.get("id") == user_id), None)

    if selected is None and surveys:
        selected = surveys[-1]

    if selected is None:
        selected = {
            "name": "新同学",
            "interests": ["编程开发", "公益志愿"],
            "role": "探索者",
            "weeklyTime": "2-5小时（适度投入）"
        }

    result = ai_recommend(deepcopy(selected))
    return jsonify(result)


@app.get("/api/user/profile")
def user_profile():
    """获取最新提交的问卷作为用户个人信息"""
    surveys = storage.list_surveys()
    if not surveys:
        return jsonify({"profile": None}), 404
    latest = surveys[-1]
    return jsonify({"profile": latest})


@app.get("/api/activities")
def activities():
    """获取社团最近活动日历"""
    sample_activities = [
        {"date": "2025-04-15", "activity": "校园草地音乐节—星火音乐社专场"},
        {"date": "2025-05-02", "activity": "AI创新挑战赛启动仪式—AI创新实验社"},
        {"date": "2025-05-20", "activity": "校级新生杯辩论赛—纵横辩论与演讲社"},
        {"date": "2025-06-01", "activity": "青禾公益志愿—城市净滩行动"},
        {"date": "2025-06-10", "activity": "光影视觉社摄影展—校园四季影像展"},
        {"date": "2025-07-05", "activity": "跃动球类联盟—暑期友谊赛"}
    ]
    return jsonify({"activities": sample_activities})


@app.get("/api/mentor-talk")
def get_mentor_talk():
    """获取学长学姐说的评论列表"""
    try:
        comments = storage.client.table("mentor_talk").select("*").order("created_at", desc=True).execute().data if storage.client else []
    except:
        comments = []
    return jsonify({"comments": comments})


@app.post("/api/mentor-talk")
def post_mentor_talk():
    """发布新评论"""
    payload = request.get_json(silent=True) or {}
    author = payload.get("author", "匿名同学")
    content = payload.get("content", "")

    if not content:
        return jsonify({"error": "评论内容不能为空"}), 400

    comment = {
        "id": str(os.urandom(8)),
        "author": author,
        "content": content,
        "created_at": os.popen("date /t").read().strip() if os.name == 'nt' else __import__('subprocess').check_output(['date']).decode().strip()
    }

    if storage.client:
        try:
            storage.client.table("mentor_talk").insert(comment).execute()
        except:
            pass

    return jsonify(comment), 201


@app.get("/api/faq")
def faq():
    """获取常见问题列表"""
    faqs = [
        {"q": "加入社团是否有学分奖励？", "a": "根据学校规定，在社团任职工作人员（如社长、副社长、部长等）可获得相应学分。普通成员参加社团活动虽不直接获得学分，但可计入综合素质评价。具体学分计算请咨询教务处。"},
        {"q": "可以同时加入多个社团吗？", "a": "可以的。学校鼓励同学在时间允许的情况下参加多个社团。如果同时担任多个社团的工作人员，建议与各社团负责人沟通安排工作时间，避免冲突。"},
        {"q": "如何联系社团负责人？", "a": "在【所有社团】页面查看各社团详情，社团卡片中会展示联系方式。你也可以在【学长学姐说】区域提问，学长学姐会解答。"},
        {"q": "社团活动需要额外缴费吗？", "a": "大多数社团活动由学校拨款支持，不收费。部分社团如出游、外拍等可能需要成本分摊，会提前告知并由成员自愿参加。"},
        {"q": "我不确定自己适合哪个社团怎么办？", "a": "可以先完成【报名问卷】，系统会根据你的兴趣和时间安排推荐合适的社团。也可以先在【所有社团】浏览各社团信息，或到【学长学姐说】咨询学长学姐。"}
    ]
    return jsonify({"faqs": faqs})


@app.post("/api/personality-match")
def personality_match():
    """根据人格类型进行社团匹配"""
    payload = request.get_json(silent=True) or {}
    personality_type = payload.get("personalityType", "innovator")
    dimensions = payload.get("dimensions", {})
    
    # 人格类型与社团对应关系
    personality_club_mapping = {
        "innovator": ["AI创新实验社", "创意策划委员会"],      # 创新者 -> 创意和技术社团
        "leader": ["学生会", "纵横辩论与演讲社"],             # 领导者 -> 组织和竞技社团
        "analyst": ["AI创新实验室", "学术科研协会"],          # 分析家 -> 研究和思考社团
        "connector": ["星火音乐社", "国际交流协会"],          # 连接者 -> 艺术和社交社团
        "builder": ["创业创新社", "户外运动协会"],            # 建造者 -> 行动型社团
        "guardian": ["青禾公益志愿", "传统文化研究社"],       # 守护者 -> 稳定和奉献社团
        "explorer": ["摄影爱好者协会", "技术爱好者社群"],     # 探险家 -> 学习和探索社团
        "harmonizer": ["学生广播台", "文化交流中心"],         # 和谐者 -> 沟通和融合社团
    }
    
    matched_club_names = personality_club_mapping.get(personality_type, [])
    matched_clubs = [club for club in CLUBS if club["name"] in matched_club_names]
    
    # 如果没有精确匹配，返回top 3个社团
    if not matched_clubs:
        matched_clubs = CLUBS[:3]
    
    # 为每个社团添加匹配度和建议职位
    for club in matched_clubs:
        # 计算维度匹配度（简化版）
        club["matchScore"] = int((len(matched_clubs) / len(CLUBS)) * 100)
        
        # 根据人格类型建议职位
        position_suggestions = {
            "innovator": ["创意部长", "策划负责人", "新媒体运营"],
            "leader": ["社团主席", "副主席", "部长"],
            "analyst": ["数据分析人员", "研究员", "学术委员"],
            "connector": ["宣传负责人", "联络员", "主持人"],
            "builder": ["执行组长", "项目经理", "活动主办人"],
            "guardian": ["志愿者协调员", "秘书", "安全负责人"],
            "explorer": ["创新体验官", "研究助手", "体验官"],
            "harmonizer": ["秘书长", "协调员", "对外联络"],
        }
        club["suggestedPositions"] = position_suggestions.get(personality_type, ["成员"])
    
    return jsonify({
        "personalityType": personality_type,
        "matchedClubs": matched_clubs,
        "message": f"根据你的人格特质，{','.join(matched_club_names)}可能更适合你！"
    })


def _assistant_reply(message):
    text = _safe_lower_text(message)

    if any(k in text for k in ["报名", "流程", "怎么报"]):
        return "报名建议：先完成兴趣匹配并保存资料，再去“所有社团”点击“查看详情”提交报名。你可以先投 1-2 个最感兴趣社团，再根据进度页反馈调整。"

    if any(k in text for k in ["工作", "岗位", "职务"]):
        return "社团工作通常分为：策划执行、宣传运营、组织协调、技术支持、外联沟通。建议按你的优势选岗位：喜欢统筹选组织岗，喜欢创意选宣传策划岗，喜欢技术选开发/剪辑/数据岗。"

    if any(k in text for k in ["面试", "自我介绍", "准备"]):
        return "面试准备模板：1) 我是谁（专业/年级）2) 我做过什么（经历/项目）3) 我能贡献什么（技能与时间）4) 为什么想加入（具体到该社团活动）。保持 60-90 秒即可。"

    if any(k in text for k in ["推荐", "适合", "社团"]):
        names = [club.get("name", "") for club in CLUBS[:4] if club.get("name")]
        return f"你可以先重点了解这些社团：{ '、'.join(names) }。如果你告诉我你的兴趣（如摄影/编程/公益/运动），我可以进一步细化到具体岗位。"

    return "我可以帮你：推荐社团、分析适合岗位、优化报名自我介绍、准备面试问题。你可以直接说“我喜欢XX，时间每周X小时，推荐一下”。"


@app.post("/api/assistant-chat")
def assistant_chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "")
    if not str(message).strip():
        return jsonify({"error": "消息不能为空"}), 400

    reply = _assistant_reply(message)
    return jsonify({"reply": reply})


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

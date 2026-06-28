export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  xpReward: number;
  coinReward: number;
  recurrence: "DAILY" | "WEEKLY" | "ONCE";
  ageRange: string; // "6-10" | "10-15" | "6-15"
  tags: string[];
}

export const CATEGORIES = [
  { key: "STUDY", label: "📖 学习", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "READING", label: "📚 阅读", color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "CHORE", label: "🧹 家务", color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "HEALTH", label: "💪 健康", color: "text-green-600", bg: "bg-green-50" },
  { key: "HABIT", label: "⏰ 习惯", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "SKILL", label: "🎨 技能", color: "text-purple-600", bg: "bg-purple-50" },
  { key: "SOCIAL", label: "🤝 品德", color: "text-pink-600", bg: "bg-pink-50" },
  { key: "OUTDOOR", label: "🌳 户外", color: "text-teal-600", bg: "bg-teal-50" },
];

export const TEMPLATES: GoalTemplate[] = [
  // ===== 学习 =====
  {
    id: "study-01",
    title: "每日完成学校作业",
    description: "放学后主动完成当天所有作业，不拖拉",
    category: "STUDY", difficulty: "MEDIUM", xpReward: 20, coinReward: 3,
    recurrence: "DAILY", ageRange: "6-15", tags: ["小学生", "中学生", "作业"],
  },
  {
    id: "study-02",
    title: "考前复习计划",
    description: "制定并执行考前复习计划，每天复习一个科目",
    category: "STUDY", difficulty: "HARD", xpReward: 40, coinReward: 8,
    recurrence: "WEEKLY", ageRange: "10-15", tags: ["考试", "复习", "中学生"],
  },
  {
    id: "study-03",
    title: "预习明天课程",
    description: "每天花 15 分钟预习第二天要学的内容",
    category: "STUDY", difficulty: "MEDIUM", xpReward: 15, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-15", tags: ["预习", "学习习惯"],
  },
  {
    id: "study-04",
    title: "错题本整理",
    description: "把做错的题目抄到错题本上，并写出正确的解法",
    category: "STUDY", difficulty: "MEDIUM", xpReward: 25, coinReward: 5,
    recurrence: "WEEKLY", ageRange: "10-15", tags: ["错题", "复习"],
  },
  {
    id: "study-05",
    title: "期末考进前 10 名",
    description: "期末考试进入班级前 10 名（或进步 5 名以上）",
    category: "STUDY", difficulty: "HARD", xpReward: 80, coinReward: 20,
    recurrence: "ONCE", ageRange: "10-15", tags: ["考试", "大目标"],
  },
  {
    id: "study-06",
    title: "每天写 10 分钟字帖",
    description: "每天练习写字，提高书写工整度",
    category: "STUDY", difficulty: "EASY", xpReward: 10, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["小学生", "写字"],
  },
  {
    id: "study-07",
    title: "口算练习 100 题",
    description: "每天做 100 道口算题，提高计算速度和准确率",
    category: "STUDY", difficulty: "MEDIUM", xpReward: 15, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-10", tags: ["小学生", "数学", "口算"],
  },

  // ===== 阅读 =====
  {
    id: "read-01",
    title: "每天阅读 20 分钟",
    description: "每天坚持阅读课外书至少 20 分钟",
    category: "READING", difficulty: "EASY", xpReward: 15, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-15", tags: ["阅读习惯", "课外书"],
  },
  {
    id: "read-02",
    title: "每周读完一本书",
    description: "每周完整读完一本课外书，并简单说说读后感",
    category: "READING", difficulty: "MEDIUM", xpReward: 30, coinReward: 5,
    recurrence: "WEEKLY", ageRange: "10-15", tags: ["阅读", "读后感"],
  },
  {
    id: "read-03",
    title: "背诵一首古诗",
    description: "每周背诵一首新的古诗词，理解大意",
    category: "READING", difficulty: "EASY", xpReward: 12, coinReward: 2,
    recurrence: "WEEKLY", ageRange: "6-10", tags: ["古诗", "背诵", "小学生"],
  },
  {
    id: "read-04",
    title: "和爸妈分享书中故事",
    description: "把今天读到的好故事讲给爸爸妈妈听",
    category: "READING", difficulty: "EASY", xpReward: 10, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["小学生", "表达", "亲子"],
  },

  // ===== 家务 =====
  {
    id: "chore-01",
    title: "整理自己的房间",
    description: "把房间收拾整齐，被子叠好，书桌整理干净",
    category: "CHORE", difficulty: "EASY", xpReward: 10, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-15", tags: ["整理", "房间"],
  },
  {
    id: "chore-02",
    title: "帮忙洗碗",
    description: "饭后帮忙洗自己和家人的碗筷",
    category: "CHORE", difficulty: "MEDIUM", xpReward: 12, coinReward: 3,
    recurrence: "DAILY", ageRange: "10-15", tags: ["洗碗", "家务"],
  },
  {
    id: "chore-03",
    title: "帮忙倒垃圾",
    description: "每天早上出门时把家里的垃圾带下楼",
    category: "CHORE", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-15", tags: ["垃圾", "简单家务"],
  },
  {
    id: "chore-04",
    title: "为全家做一顿饭",
    description: "在家长指导下，为家人做一顿简单的饭",
    category: "CHORE", difficulty: "HARD", xpReward: 40, coinReward: 10,
    recurrence: "WEEKLY", ageRange: "10-15", tags: ["做饭", "独立"],
  },
  {
    id: "chore-05",
    title: "照顾家里的植物/宠物",
    description: "每天的浇水、喂食等，照顾好家里的植物或宠物",
    category: "CHORE", difficulty: "EASY", xpReward: 10, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-15", tags: ["宠物", "植物", "责任心"],
  },
  {
    id: "chore-06",
    title: "大扫除日",
    description: "周末和全家一起大扫除，负责打扫自己的区域",
    category: "CHORE", difficulty: "MEDIUM", xpReward: 25, coinReward: 5,
    recurrence: "WEEKLY", ageRange: "6-15", tags: ["大扫除", "周末"],
  },

  // ===== 健康 =====
  {
    id: "health-01",
    title: "每天运动 30 分钟",
    description: "每天坚持运动至少 30 分钟（跳绳、跑步、球类等）",
    category: "HEALTH", difficulty: "MEDIUM", xpReward: 20, coinReward: 3,
    recurrence: "DAILY", ageRange: "6-15", tags: ["运动", "健康"],
  },
  {
    id: "health-02",
    title: "早睡早起（10点前睡）",
    description: "每天晚上 10 点前上床睡觉，养成规律作息",
    category: "HEALTH", difficulty: "MEDIUM", xpReward: 15, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-15", tags: ["作息", "早睡"],
  },
  {
    id: "health-03",
    title: "每天喝 8 杯水",
    description: "每天喝足 8 杯水，不喝或少喝含糖饮料",
    category: "HEALTH", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-15", tags: ["喝水", "健康习惯"],
  },
  {
    id: "health-04",
    title: "跳绳打卡",
    description: "每天跳绳 500 个，锻炼身体协调性",
    category: "HEALTH", difficulty: "MEDIUM", xpReward: 15, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-10", tags: ["跳绳", "小学生", "运动"],
  },
  {
    id: "health-05",
    title: "一周不吃零食",
    description: "一周内不吃薯片、糖果等不健康零食",
    category: "HEALTH", difficulty: "HARD", xpReward: 30, coinReward: 8,
    recurrence: "WEEKLY", ageRange: "6-15", tags: ["零食", "自律"],
  },
  {
    id: "health-06",
    title: "减少屏幕时间",
    description: "每天使用手机/平板/电视不超过 1 小时",
    category: "HEALTH", difficulty: "HARD", xpReward: 25, coinReward: 5,
    recurrence: "DAILY", ageRange: "10-15", tags: ["屏幕", "手机", "自律"],
  },

  // ===== 习惯 =====
  {
    id: "habit-01",
    title: "自己穿衣服/系鞋带",
    description: "每天早上自己穿好衣服、系好鞋带",
    category: "HABIT", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["自理", "小学生"],
  },
  {
    id: "habit-02",
    title: "自己整理书包",
    description: "每天睡前把第二天要用的课本和文具准备好",
    category: "HABIT", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["自理", "书包", "小学生"],
  },
  {
    id: "habit-03",
    title: "早晚刷牙各 3 分钟",
    description: "每天早晚坚持刷牙 3 分钟，正确刷牙方法",
    category: "HABIT", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["刷牙", "卫生", "小学生"],
  },
  {
    id: "habit-04",
    title: "定时完成作业不拖拉",
    description: "放学后先做作业再玩，设定时间限制并遵守",
    category: "HABIT", difficulty: "MEDIUM", xpReward: 20, coinReward: 3,
    recurrence: "DAILY", ageRange: "6-15", tags: ["作业", "时间管理"],
  },
  {
    id: "habit-05",
    title: "每天记账/存零花钱",
    description: "记录每天的零花钱去向，培养理财意识",
    category: "HABIT", difficulty: "MEDIUM", xpReward: 15, coinReward: 2,
    recurrence: "DAILY", ageRange: "10-15", tags: ["理财", "记账"],
  },
  {
    id: "habit-06",
    title: "用完东西放回原处",
    description: "玩具、书本、文具用完之后放回原来的位置",
    category: "HABIT", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["收纳", "习惯"],
  },

  // ===== 技能 =====
  {
    id: "skill-01",
    title: "学做一道菜",
    description: "跟家长学习做一道简单的菜，掌握基本厨艺",
    category: "SKILL", difficulty: "MEDIUM", xpReward: 30, coinReward: 8,
    recurrence: "WEEKLY", ageRange: "10-15", tags: ["厨艺", "生活技能"],
  },
  {
    id: "skill-02",
    title: "学会系鞋带/打蝴蝶结",
    description: "独立学会系鞋带或者打漂亮的蝴蝶结",
    category: "SKILL", difficulty: "EASY", xpReward: 15, coinReward: 3,
    recurrence: "ONCE", ageRange: "6-10", tags: ["自理", "小学生"],
  },
  {
    id: "skill-03",
    title: "学习一个新技能",
    description: "学会一项新技能：游泳、骑自行车、轮滑等",
    category: "SKILL", difficulty: "HARD", xpReward: 50, coinReward: 15,
    recurrence: "ONCE", ageRange: "6-15", tags: ["新技能", "大目标"],
  },
  {
    id: "skill-04",
    title: "练习乐器 30 分钟",
    description: "每天坚持练习乐器至少 30 分钟",
    category: "SKILL", difficulty: "MEDIUM", xpReward: 20, coinReward: 3,
    recurrence: "DAILY", ageRange: "6-15", tags: ["乐器", "练习"],
  },
  {
    id: "skill-05",
    title: "学写一封信",
    description: "用手写信的形式，给家人或朋友写一封信",
    category: "SKILL", difficulty: "MEDIUM", xpReward: 20, coinReward: 5,
    recurrence: "ONCE", ageRange: "6-10", tags: ["写作", "表达"],
  },
  {
    id: "skill-06",
    title: "学会使用零花钱",
    description: "制定一个零花钱使用计划，学会合理消费",
    category: "SKILL", difficulty: "MEDIUM", xpReward: 25, coinReward: 5,
    recurrence: "ONCE", ageRange: "10-15", tags: ["理财", "零花钱"],
  },

  // ===== 品德 =====
  {
    id: "social-01",
    title: "主动帮助同学",
    description: "在学校主动帮助有困难的同学",
    category: "SOCIAL", difficulty: "MEDIUM", xpReward: 20, coinReward: 5,
    recurrence: "WEEKLY", ageRange: "6-15", tags: ["助人", "品德"],
  },
  {
    id: "social-02",
    title: "对家人说谢谢/我爱你",
    description: "每天对家人表达感谢或爱意",
    category: "SOCIAL", difficulty: "EASY", xpReward: 8, coinReward: 1,
    recurrence: "DAILY", ageRange: "6-10", tags: ["感恩", "表达"],
  },
  {
    id: "social-03",
    title: "和弟弟妹妹分享玩具",
    description: "主动和弟弟妹妹或其他小朋友分享玩具和零食",
    category: "SOCIAL", difficulty: "MEDIUM", xpReward: 12, coinReward: 2,
    recurrence: "DAILY", ageRange: "6-10", tags: ["分享", "兄弟姐妹"],
  },
  {
    id: "social-04",
    title: "参加一次志愿者活动",
    description: "参加社区或学校的志愿者活动（如探望老人、环保等）",
    category: "SOCIAL", difficulty: "HARD", xpReward: 50, coinReward: 15,
    recurrence: "ONCE", ageRange: "10-15", tags: ["志愿", "公益"],
  },
  {
    id: "social-05",
    title: "说真话/诚实不撒谎",
    description: "一周内做到诚实不撒谎，做错了主动承认",
    category: "SOCIAL", difficulty: "MEDIUM", xpReward: 20, coinReward: 5,
    recurrence: "WEEKLY", ageRange: "6-15", tags: ["诚实", "品德"],
  },

  // ===== 户外 =====
  {
    id: "outdoor-01",
    title: "周末去公园玩",
    description: "周末到户外公园活动，接触大自然",
    category: "OUTDOOR", difficulty: "EASY", xpReward: 15, coinReward: 3,
    recurrence: "WEEKLY", ageRange: "6-15", tags: ["户外", "公园"],
  },
  {
    id: "outdoor-02",
    title: "爬山/徒步",
    description: "和全家一起去爬山或徒步，享受户外运动",
    category: "OUTDOOR", difficulty: "MEDIUM", xpReward: 30, coinReward: 8,
    recurrence: "WEEKLY", ageRange: "10-15", tags: ["爬山", "徒步"],
  },
  {
    id: "outdoor-03",
    title: "观察记录自然",
    description: "在户外观察一种植物或昆虫，画下来或拍照记录",
    category: "OUTDOOR", difficulty: "EASY", xpReward: 15, coinReward: 3,
    recurrence: "WEEKLY", ageRange: "6-10", tags: ["自然", "观察"],
  },
  {
    id: "outdoor-04",
    title: "放风筝",
    description: "周末去郊外放风筝，享受户外时光",
    category: "OUTDOOR", difficulty: "EASY", xpReward: 12, coinReward: 2,
    recurrence: "ONCE", ageRange: "6-10", tags: ["户外", "风筝"],
  },
];

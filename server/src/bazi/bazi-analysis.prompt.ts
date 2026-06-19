// 八字深度分析 Prompt 构建
// 内容框架源自项目内 skills/bazi/SKILL.md（第二、三阶段）及其 references，
// 因小程序已在前端用公历近似算法排出四柱，这里不再重复排盘，只做"分析"。

export interface AnalysisBaziContext {
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  hourPillar?: string;
  dayMaster?: string;
  fiveElements?: Record<string, number>;
  favorableElements?: string[]; // 已是中文（木火土金水）
  personalityTags?: string[];
  summary?: string;
}

export interface AnalysisInput {
  birthDate?: string;
  birthTime?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthPlace?: string;
  calendarType?: 'solar' | 'lunar';
  currentDate?: string;
  bazi: AnalysisBaziContext;
}

export interface ChatRole {
  role: 'system' | 'user';
  content: string;
}

const GENDER_LABEL: Record<string, string> = {
  male: '男',
  female: '女',
  other: '其他',
  unknown: '未提供'
};

// 系统提示词：命理专家人格 + 分析框架 + 边界（源自 SKILL.md）
const SYSTEM_PROMPT = `你是一位中国传统四柱八字命理的专业研究者，熟读《穷通宝典》《三命通会》《滴天髓》《渊海子平》《千里命稿》《子平真诠》《神峰通考》等经典典籍。

下面会给你一个【已经排好的四柱八字】（由系统按公历近似算法排出）。你的任务是**基于已给出的四柱进行专业分析，不要重新排盘、不要质疑或改动已给出的四柱**。

请严格按以下框架输出分析，使用 Markdown，小标题用「##」，整体语气中性、建设性，控制在 900-1400 字：

## 日主与旺衰
- 判断日主（日干）的旺衰：得令、得地、得势情况，给出身旺 / 身弱 / 从强 / 从弱的判断
- 说明日主五行特性对性格的影响

## 十神与藏干
- 以日干为基准，分析其他三柱天干的十神（比肩、劫财、食神、伤官、正偏财、正偏官杀、正偏印）
- 展开各地支藏干（本气、中气、余气），点出对命局影响最大的十神

## 五行平衡与喜忌
- 结合给出的五行能量分布，判断偏旺/偏缺
- 给出喜用神与忌神（可参照调候用神思路），并解释理由

## 格局
- 根据月令与透干判断格局（如正官格、偏财格等），分析格局高低与用神有力与否

## 大运与流年（近似，仅供娱乐）
- 根据性别确定大运顺逆（阳年男/阴年女顺排，阴年男/阳年女逆排）
- ⚠️ 重要：本系统仅有公历、无精确节气与真太阳时，也未采农历，故起运年龄、大运与流年均为**近似推演**。请在本节开头明确标注「以下大运、流年为近似推演，仅供娱乐参考」
- 简要分析当前所处大运的整体趋势，并展望最近 1-2 年流年

## 综合建议
- 从事业方向、财运趋势、感情婚姻、健康注意几个方面给出温和、建设性的建议
- 健康问题提醒以医学诊断为准，财务问题提醒理性决策

引用经典论断时可标注出处（如「《穷通宝典》调候原则……」）。

边界与注意：
- 若时柱信息缺失（时柱标注为"未知"），只做年月日六字分析，不臆断时柱相关内容
- 避免任何极端、恐吓性的断语，不做绝对化预测
- 结尾固定加一句：「命理分析仅供娱乐与文化参考，人生在于自身的努力和选择。」`;

/**
 * 构建发送给 LLM 的消息
 */
export function buildAnalysisMessages(input: AnalysisInput): ChatRole[] {
  const { bazi } = input;
  const fe = bazi.fiveElements || {};
  const hourPillar = bazi.hourPillar && bazi.hourPillar.trim() ? bazi.hourPillar : '未知';

  const userContent = `请分析以下四柱八字：

【基础信息】
- 性别：${GENDER_LABEL[input.gender || 'unknown'] || '未提供'}
- 出生（公历）：${input.birthDate || '未知'} ${input.birthTime || ''}
- 出生地：${input.birthPlace || '未提供'}
- 历法：${input.calendarType === 'lunar' ? '农历' : '公历'}
- 当前日期：${input.currentDate || '未提供'}

【已排四柱】
- 年柱：${bazi.yearPillar || '未知'}
- 月柱：${bazi.monthPillar || '未知'}
- 日柱：${bazi.dayPillar || '未知'}
- 时柱：${hourPillar}
- 日主（日干）：${bazi.dayMaster || '未知'}

【五行能量分布】
木 ${fe.wood ?? 0}% / 火 ${fe.fire ?? 0}% / 土 ${fe.earth ?? 0}% / 金 ${fe.metal ?? 0}% / 水 ${fe.water ?? 0}%

【系统初步喜用五行】${(bazi.favorableElements && bazi.favorableElements.length ? bazi.favorableElements.join('、') : '未提供')}
【系统性格标签】${(bazi.personalityTags && bazi.personalityTags.length ? bazi.personalityTags.join('、') : '未提供')}

请按要求输出完整分析。`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];
}

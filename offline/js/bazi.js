/* bazi — offline, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  // ============== 基础常量表 ==============

  const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const STEM_TO_ELEMENT = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };

  const BRANCH_TO_ELEMENT = {
    '子': 'water', '丑': 'earth',
    '寅': 'wood', '卯': 'wood',
    '辰': 'earth', '巳': 'fire',
    '午': 'fire', '未': 'earth',
    '申': 'metal', '酉': 'metal',
    '戌': 'earth', '亥': 'water'
  };

  const BRANCH_HIDDEN_STEMS = {
    '子': { main: '癸' },
    '丑': { main: '己', middle: '癸', residual: '辛' },
    '寅': { main: '甲', middle: '丙', residual: '戊' },
    '卯': { main: '乙' },
    '辰': { main: '戊', middle: '乙', residual: '癸' },
    '巳': { main: '丙', middle: '庚', residual: '戊' },
    '午': { main: '丁', middle: '己' },
    '未': { main: '己', middle: '丁', residual: '乙' },
    '申': { main: '庚', middle: '壬', residual: '戊' },
    '酉': { main: '辛' },
    '戌': { main: '戊', middle: '辛', residual: '丁' },
    '亥': { main: '壬', middle: '甲' }
  };

  const ELEMENT_GENERATES = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
  };
  const ELEMENT_DESTROYS = {
    wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood'
  };

  const ELEMENT_PERSONALITY = {
    wood: ['创造力强', '仁慈', '正直', '进取', '有韧性', '富有同情心'],
    fire: ['热情', '表达力强', '乐观', '有感染力', '善于社交', '积极主动'],
    earth: ['稳重', '包容', '务实', '负责', '守信', '善于统筹'],
    metal: ['果断', '理性', '刚毅', '有原则', '追求完美', '善于决断'],
    water: ['智慧', '灵活', '深沉', '善于沟通', '洞察力强', '适应力强']
  };

  const ELEMENT_LABELS = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

  function getElementLabel(el) {
    return ELEMENT_LABELS[el] || el;
  }

  // 日上起时表（五鼠遁）
  const HOUR_STEM_TABLE = {
    '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
    '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
    '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
    '丁': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
    '戊': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    '己': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
    '庚': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
    '辛': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
    '壬': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
    '癸': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  };

  // 年上起月表（五虎遁月）
  const MONTH_STEM_TABLE = {
    '甲': ['丙', '丁', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
    '乙': ['戊', '己', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
    '丙': ['庚', '辛', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
    '丁': ['壬', '癸', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
    '戊': ['甲', '乙', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    '己': ['丙', '丁', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
    '庚': ['戊', '己', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
    '辛': ['庚', '辛', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
    '壬': ['壬', '癸', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
    '癸': ['甲', '乙', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  };

  // ============== 计算函数 ==============

  function isYangStem(stem) {
    return ['甲', '丙', '戊', '庚', '壬'].indexOf(stem) !== -1;
  }

  function getStemElement(stem) {
    return STEM_TO_ELEMENT[stem];
  }

  function getBranchElement(branch) {
    return BRANCH_TO_ELEMENT[branch];
  }

  function calculateTenGod(dayMaster, otherStem) {
    const dayElement = getStemElement(dayMaster);
    const otherElement = getStemElement(otherStem);
    const dayIsYang = isYangStem(dayMaster);
    const otherIsYang = isYangStem(otherStem);
    const sameYinYang = dayIsYang === otherIsYang;

    if (ELEMENT_GENERATES[otherElement] === dayElement) {
      return sameYinYang ? '偏印' : '正印';
    }
    if (ELEMENT_GENERATES[dayElement] === otherElement) {
      return sameYinYang ? '食神' : '伤官';
    }
    if (ELEMENT_DESTROYS[otherElement] === dayElement) {
      return sameYinYang ? '七杀' : '正官';
    }
    if (ELEMENT_DESTROYS[dayElement] === otherElement) {
      return sameYinYang ? '偏财' : '正财';
    }
    if (dayElement === otherElement) {
      return sameYinYang ? '比肩' : '劫财';
    }

    return '比肩';
  }

  function calculateYearPillar(year, month, day) {
    let actualYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
      actualYear = year - 1;
    }

    const offset = (actualYear - 4) % 60;
    const stemIndex = ((offset % 10) + 10) % 10;
    const branchIndex = ((offset % 12) + 12) % 12;

    return {
      heavenlyStem: HEAVENLY_STEMS[stemIndex],
      earthlyBranch: EARTHLY_BRANCHES[branchIndex],
      fullPillar: HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex]
    };
  }

  function calculateMonthPillar(_year, month, day, yearPillar) {
    const solarTerms = [
      { month: 1, day: 1, branchIndex: 1 },
      { month: 2, day: 4, branchIndex: 2 },
      { month: 3, day: 6, branchIndex: 3 },
      { month: 4, day: 5, branchIndex: 4 },
      { month: 5, day: 6, branchIndex: 5 },
      { month: 6, day: 6, branchIndex: 6 },
      { month: 7, day: 7, branchIndex: 7 },
      { month: 8, day: 8, branchIndex: 8 },
      { month: 9, day: 8, branchIndex: 9 },
      { month: 10, day: 8, branchIndex: 10 },
      { month: 11, day: 7, branchIndex: 11 },
      { month: 12, day: 7, branchIndex: 0 }
    ];

    let branchIndex = 1;
    for (let i = 0; i < solarTerms.length; i++) {
      const st = solarTerms[i];
      if (month > st.month) {
        branchIndex = st.branchIndex;
      } else if (month === st.month && day >= st.day) {
        branchIndex = st.branchIndex;
      }
    }

    const yearStem = yearPillar.heavenlyStem;
    const monthStem = MONTH_STEM_TABLE[yearStem][branchIndex];

    return {
      heavenlyStem: monthStem,
      earthlyBranch: EARTHLY_BRANCHES[branchIndex],
      fullPillar: monthStem + EARTHLY_BRANCHES[branchIndex]
    };
  }

  function calculateDayPillar(year, month, day) {
    const baseDate = new Date(Date.UTC(1900, 0, 1));
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

    const BASE_INDEX = 10;
    let ganZhiIndex = (daysDiff + BASE_INDEX) % 60;
    if (ganZhiIndex < 0) {
      ganZhiIndex += 60;
    }

    const stemIndex = ganZhiIndex % 10;
    const branchIndex = ganZhiIndex % 12;

    return {
      heavenlyStem: HEAVENLY_STEMS[stemIndex],
      earthlyBranch: EARTHLY_BRANCHES[branchIndex],
      fullPillar: HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex]
    };
  }

  function calculateHourPillar(dayPillar, hour) {
    let branchIndex = 0;
    if (hour >= 23 || hour < 1) branchIndex = 0;
    else if (hour >= 1 && hour < 3) branchIndex = 1;
    else if (hour >= 3 && hour < 5) branchIndex = 2;
    else if (hour >= 5 && hour < 7) branchIndex = 3;
    else if (hour >= 7 && hour < 9) branchIndex = 4;
    else if (hour >= 9 && hour < 11) branchIndex = 5;
    else if (hour >= 11 && hour < 13) branchIndex = 6;
    else if (hour >= 13 && hour < 15) branchIndex = 7;
    else if (hour >= 15 && hour < 17) branchIndex = 8;
    else if (hour >= 17 && hour < 19) branchIndex = 9;
    else if (hour >= 19 && hour < 21) branchIndex = 10;
    else if (hour >= 21 && hour < 23) branchIndex = 11;

    const dayStem = dayPillar.heavenlyStem;
    const hourStem = HOUR_STEM_TABLE[dayStem][branchIndex];

    return {
      heavenlyStem: hourStem,
      earthlyBranch: EARTHLY_BRANCHES[branchIndex],
      fullPillar: hourStem + EARTHLY_BRANCHES[branchIndex]
    };
  }

  function calculateFiveElements(yearPillar, monthPillar, dayPillar, hourPillar) {
    const elements = {
      wood: 0, fire: 0, earth: 0, metal: 0, water: 0
    };

    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];

    for (let i = 0; i < pillars.length; i++) {
      elements[getStemElement(pillars[i].heavenlyStem)] += 25;
    }

    for (let i = 0; i < pillars.length; i++) {
      const pillar = pillars[i];
      elements[getBranchElement(pillar.earthlyBranch)] += 15;

      const hidden = BRANCH_HIDDEN_STEMS[pillar.earthlyBranch];
      if (hidden.main) elements[getStemElement(hidden.main)] += 9;
      if (hidden.middle) elements[getStemElement(hidden.middle)] += 4.5;
      if (hidden.residual) elements[getStemElement(hidden.residual)] += 1.5;
    }

    const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
    const keys = ['wood', 'fire', 'earth', 'metal', 'water'];
    for (let i = 0; i < keys.length; i++) {
      elements[keys[i]] = Math.round((elements[keys[i]] / total) * 100);
    }

    return elements;
  }

  function analyzeDayMasterStrength(dayMaster, monthBranch, _otherBranches) {
    const dayElement = getStemElement(dayMaster);
    const monthElement = getBranchElement(monthBranch);

    if (dayElement === monthElement) {
      return { strength: '旺', description: '日主得令，气势旺盛' };
    }
    if (ELEMENT_GENERATES[dayElement] === monthElement) {
      return { strength: '相', description: '日主之子当令，气势次旺' };
    }
    if (ELEMENT_GENERATES[monthElement] === dayElement) {
      return { strength: '休', description: '日主之母当令，气势休养' };
    }
    if (ELEMENT_DESTROYS[dayElement] === monthElement) {
      return { strength: '囚', description: '日主所克当令，气势受困' };
    }
    if (ELEMENT_DESTROYS[monthElement] === dayElement) {
      return { strength: '死', description: '克日主者当令，气势最弱' };
    }

    return { strength: '旺', description: '无法判断' };
  }

  function determineFavorableElements(dayMaster, _fiveElements, dayMasterStrength) {
    const dayElement = getStemElement(dayMaster);

    if (dayMasterStrength === '旺' || dayMasterStrength === '相') {
      return [
        ELEMENT_DESTROYS[dayElement],
        ELEMENT_GENERATES[dayElement],
        ELEMENT_DESTROYS[ELEMENT_GENERATES[dayElement]]
      ];
    }
    return [
      ELEMENT_GENERATES[ELEMENT_DESTROYS[dayElement]],
      dayElement
    ];
  }

  function generatePersonalityTags(dayMaster, fiveElements) {
    const dayElement = getStemElement(dayMaster);
    const tags = [];

    const dayElementPersonality = ELEMENT_PERSONALITY[dayElement];
    if (dayElementPersonality) {
      tags.push.apply(tags, dayElementPersonality.slice(0, 2));
    }

    const sortedElements = Object.keys(fiveElements)
      .map(function (k) { return [k, fiveElements[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });

    if (sortedElements[0] && sortedElements[0][0] !== dayElement && sortedElements[0][1] > 25) {
      const topElementPersonality = ELEMENT_PERSONALITY[sortedElements[0][0]];
      if (topElementPersonality) {
        tags.push.apply(tags, topElementPersonality.slice(0, 1));
      }
    }

    return tags.slice(0, 5);
  }

  function generateBaziSummary(dayMaster, pillars, dayMasterStrength, favorableElements) {
    const dayElement = getStemElement(dayMaster);
    const favorableNames = favorableElements.map(function (e) {
      return ELEMENT_LABELS[e];
    }).join('、');

    return '你是一位' + dayMaster + '日主，五行属' + ELEMENT_LABELS[dayElement] + '。' +
      dayMasterStrength.description + '。你的心象盘宜亲近' + favorableNames +
      '之气，在生活中多接触这些元素有助于安顿心象。基础信息为：年' +
      pillars.year.heavenlyStem + pillars.year.earthlyBranch + '、月' +
      pillars.month.heavenlyStem + pillars.month.earthlyBranch + '、日' +
      pillars.day.heavenlyStem + pillars.day.earthlyBranch + '、时' +
      pillars.hour.heavenlyStem + pillars.hour.earthlyBranch + '。';
  }

  function computeMomentPillars(date) {
    if (!date) date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    const yp = calculateYearPillar(year, month, day);
    const mp = calculateMonthPillar(year, month, day, yp);
    const dp = calculateDayPillar(year, month, day);
    const hp = calculateHourPillar(dp, hour);

    return {
      yearPillar: yp.fullPillar,
      monthPillar: mp.fullPillar,
      dayPillar: dp.fullPillar,
      hourPillar: hp.fullPillar,
      dayMaster: dp.heavenlyStem,
      hourLabel: hp.earthlyBranch + '时'
    };
  }

  function generateBaziProfile(userProfile) {
    const parts = userProfile.birthDate.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const chartTime = X.resolveBirthTimeForChart(userProfile);
    const timeParts = chartTime.split(':').map(Number);
    const hour = timeParts[0];

    const yearPillar = calculateYearPillar(year, month, day);
    const monthPillar = calculateMonthPillar(year, month, day, yearPillar);
    const dayPillar = calculateDayPillar(year, month, day);
    const hourPillar = calculateHourPillar(dayPillar, hour);

    const dayMaster = dayPillar.heavenlyStem;

    const fiveElements = calculateFiveElements(yearPillar, monthPillar, dayPillar, hourPillar);

    const dayMasterStrength = analyzeDayMasterStrength(dayMaster, monthPillar.earthlyBranch, [
      yearPillar.earthlyBranch, dayPillar.earthlyBranch, hourPillar.earthlyBranch
    ]);

    const favorableElements = determineFavorableElements(dayMaster, fiveElements, dayMasterStrength.strength);

    const personalityTags = generatePersonalityTags(dayMaster, fiveElements);

    const summary = generateBaziSummary(dayMaster, {
      year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar
    }, dayMasterStrength, favorableElements);

    const nowIso = new Date().toISOString();

    return {
      id: 'bazi_' + Date.now(),
      userId: userProfile.id,
      yearPillar: yearPillar.heavenlyStem + yearPillar.earthlyBranch,
      monthPillar: monthPillar.heavenlyStem + monthPillar.earthlyBranch,
      dayPillar: dayPillar.heavenlyStem + dayPillar.earthlyBranch,
      hourPillar: hourPillar.heavenlyStem + hourPillar.earthlyBranch,
      dayMaster: dayMaster,
      fiveElements: {
        wood: fiveElements.wood,
        fire: fiveElements.fire,
        earth: fiveElements.earth,
        metal: fiveElements.metal,
        water: fiveElements.water
      },
      favorableElements: favorableElements,
      personalityTags: personalityTags,
      summary: summary,
      createdAt: nowIso,
      updatedAt: nowIso
    };
  }

  Object.assign(X, {
    generateBaziProfile: generateBaziProfile,
    computeMomentPillars: computeMomentPillars,
    HEAVENLY_STEMS: HEAVENLY_STEMS,
    EARTHLY_BRANCHES: EARTHLY_BRANCHES,
    getStemElement: getStemElement,
    getBranchElement: getBranchElement,
    ELEMENT_LABELS: ELEMENT_LABELS,
    getElementLabel: getElementLabel
  });
})(window.Xinxiang);

/* fortune — daily xinxiang generator, offline, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  var ELEMENT_LABELS = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水'
  };

  if (typeof X.getElementLabel !== 'function') {
    X.getElementLabel = function (element) {
      return ELEMENT_LABELS[element] || String(element);
    };
  }

  var ELEMENT_FORTUNE_TENDENCY = {
    wood: {
      positive: ['启新', '问学', '会友', '舒展', '亲木'],
      negative: ['争竞', '躁进', '强求']
    },
    fire: {
      positive: ['言志', '相聚', '显才', '暖人', '向阳'],
      negative: ['急怒', '轻诺', '耗神']
    },
    earth: {
      positive: ['归整', '固本', '务实', '守诺', '安居'],
      negative: ['滞守', '迟疑', '执旧']
    },
    metal: {
      positive: ['决断', '删繁', '立界', '循礼', '修身'],
      negative: ['苛察', '求全', '拒和']
    },
    water: {
      positive: ['静思', '应变', '通和', '纳新', '沉心'],
      negative: ['多虑', '散神', '内耗']
    }
  };

  var LUCKY_COLORS = {
    wood: ['竹青', '松绿', '缥碧', '艾绿'],
    fire: ['绛红', '朱砂', '胭脂', '茜色'],
    earth: ['赭黄', '秋香', '缃色', '黄栌'],
    metal: ['月白', '素银', '缟素', '霜色'],
    water: ['黛蓝', '靛青', '玄色', '黛色']
  };

  var LUCKY_DIRECTIONS = {
    wood: ['东方', '东南方'],
    fire: ['南方'],
    earth: ['中央', '东北方', '西南方'],
    metal: ['西方', '西北方'],
    water: ['北方']
  };

  var MOOD_KEYWORDS = [
    '静水流深', '心如止水', '风过无痕', '月明心澈', '云淡风轻',
    '气敛神藏', '潜龙在渊', '灵光乍现', '心起微澜', '舒卷自如'
  ];

  var CYBER_BLESSINGS_HIGH = [
    '心象清明，如月印千江。今日诸事顺势，且以从容之心承之。',
    '气数正盛，天地与你相和。所遇皆是良缘，安然受之，不必拘执。',
    '此日如春水初生，万物向荣。心中所念正悄然舒展，静待花开便是。'
  ];

  var CYBER_BLESSINGS_MEDIUM = [
    '今日气息平和，如静水深流。无需用力，顺其自然亦是修行。',
    '心象处于中和之境，宜沉心静养。守得云开，自有月明。',
    '不求圆满，但求安然。今日宜把心放宽，于平淡处见真味。'
  ];

  var CYBER_BLESSINGS_LOW = [
    '心象微澜，如风过竹林。此非坎坷，乃天地提醒你返照内心。',
    '今日气数内敛，正是闭门养神之时。守静以待，自能转圜。',
    '云遮月明本是常态，不必忧心。且安顿身心，静候云散月出。'
  ];

  function generateCyberBlessing(score, rand) {
    var pool;
    if (score >= 80) {
      pool = CYBER_BLESSINGS_HIGH;
    } else if (score >= 70) {
      pool = CYBER_BLESSINGS_MEDIUM;
    } else {
      pool = CYBER_BLESSINGS_LOW;
    }
    var pick = rand || Math.random;
    return pool[Math.floor(pick() * pool.length)];
  }

  function resolveTimeBranch(userProfile) {
    if (userProfile.unknownTime) return 'unknown';
    return userProfile.timeBranch || 'unknown';
  }

  function generateYi(bazi, rand) {
    var yi = [];
    (bazi.favorableElements || []).forEach(function (element) {
      var tendency = ELEMENT_FORTUNE_TENDENCY[element];
      if (tendency) {
        yi = yi.concat(X.seededPick(tendency.positive, 2, rand));
      }
    });
    yi.push('守正', '顺势');
    return yi.slice(0, 5);
  }

  function generateJi(bazi, rand) {
    var favorable = bazi.favorableElements || [];
    var ji = [];
    var elements = ['wood', 'fire', 'earth', 'metal', 'water'];
    var unfavorable = elements.filter(function (e) {
      return favorable.indexOf(e) < 0;
    }).slice(0, 2);

    unfavorable.forEach(function (element) {
      var tendency = ELEMENT_FORTUNE_TENDENCY[element];
      if (tendency) {
        ji = ji.concat(X.seededPick(tendency.negative, 1, rand));
      }
    });
    ji.push('神耗');
    return ji.slice(0, 3);
  }

  function generateLuckyColor(bazi, rand) {
    var element = (bazi.favorableElements && bazi.favorableElements[0]) || 'water';
    var colors = LUCKY_COLORS[element] || LUCKY_COLORS.water;
    return X.seededPickOne(colors, rand);
  }

  function generateLuckyNumber(bazi, rand) {
    var elementNumbers = {
      wood: [3, 8],
      fire: [2, 7],
      earth: [5, 6],
      metal: [4, 9],
      water: [1, 6]
    };
    var element = (bazi.favorableElements && bazi.favorableElements[0]) || 'water';
    var numbers = elementNumbers[element] || [1, 6];
    return X.seededPickOne(numbers, rand);
  }

  function generateLuckyDirection(bazi, rand) {
    var element = (bazi.favorableElements && bazi.favorableElements[0]) || 'water';
    var directions = LUCKY_DIRECTIONS[element] || LUCKY_DIRECTIONS.water;
    return X.seededPickOne(directions, rand);
  }

  function generateMoodKeyword(rand) {
    return X.seededPickOne(MOOD_KEYWORDS, rand);
  }

  function generateOverallScore(bazi, rand) {
    var values = bazi.fiveElements
      ? Object.keys(bazi.fiveElements).map(function (k) {
          return bazi.fiveElements[k];
        })
      : [20, 20, 20, 20, 20];
    var maxDiff = Math.max.apply(null, values) - Math.min.apply(null, values);
    var baseScore = 75 - maxDiff;
    var randomOffset = Math.floor(rand() * 10) - 5;
    return Math.max(60, Math.min(90, baseScore + randomOffset));
  }

  function generateSummary(bazi, score) {
    var element = (bazi.favorableElements && bazi.favorableElements[0]) || 'water';
    var elementNames = ELEMENT_LABELS;
    var trendWord = score >= 80 ? '舒展升腾' : score >= 70 ? '中和平稳' : '内敛微澜';
    var advice =
      (bazi.favorableElements || []).indexOf('water') >= 0
        ? '宜静思以养神'
        : '宜舒展以应时';
    return (
      (elementNames[element] || '水') +
      '气今日' +
      (score >= 75 ? '升' : '敛') +
      '，气数' +
      trendWord +
      '。' +
      advice +
      '，顺其势而不强求。'
    );
  }

  function generateActionSuggestion(bazi) {
    var suggestions = {
      wood: '晨起舒展四体，纳一口清气，任生意自生。',
      fire: '言语之前，先令心火沉一沉，话到温处自暖人。',
      earth: '择一事踏实做完，心自安稳，不必贪多。',
      metal: '删去一桩冗事，立一分清界，身心自轻。',
      water: '辟一段独处，静观思绪如水来去，不滞不留。'
    };
    var element = (bazi.favorableElements && bazi.favorableElements[0]) || 'water';
    return suggestions[element] || suggestions.water;
  }

  /**
   * 生成每日心象（同步）。!force 时优先读缓存。
   */
  function generateDailyFortune(bazi, userProfile, date, force) {
    if (!force) {
      var cached = X.getFortune(bazi.userId, date);
      if (cached) return cached;
    }

    var seed = X.buildDailySeed(userProfile, date);
    var rand = X.createSeededRandom(seed);

    var score = generateOverallScore(bazi, rand);
    var yi = generateYi(bazi, rand);
    var ji = generateJi(bazi, rand);

    var fortune = {
      id: 'fortune_' + seed,
      userId: bazi.userId,
      date: date,
      overallScore: score,
      moodKeyword: generateMoodKeyword(rand),
      summary: generateSummary(bazi, score),
      yi: yi,
      ji: ji,
      luckyColor: generateLuckyColor(bazi, rand),
      luckyNumber: generateLuckyNumber(bazi, rand),
      luckyDirection: generateLuckyDirection(bazi, rand),
      actionSuggestion: generateActionSuggestion(bazi),
      cyberBlessing: generateCyberBlessing(score, rand),
      createdAt: new Date().toISOString()
    };

    X.saveFortune(fortune);
    return fortune;
  }

  /**
   * 宜忌解释（同步，稳定 seed）
   */
  function explainYiJi(bazi, fortune, item, type, userProfile) {
    var seed = userProfile
      ? X.buildDailySeed(userProfile, fortune.date) + '_' + type + '_' + item
      : fortune.date + '_' + type + '_' + item;
    var rand = X.createSeededRandom(seed);

    var favorableLabel =
      bazi.favorableElements && bazi.favorableElements[0]
        ? X.getElementLabel(bazi.favorableElements[0])
        : '水';

    var templates = {
      yi: [
        '"' + item + '"与你的' + favorableLabel + '气相应。今日行此，如顺水行舟，不必用力，自有其势。且以平常心待之。',
        '日主' + bazi.dayMaster + '今日与"' + item + '"之气相和。非是定则，乃顺势之机。心有此念，便是时候。',
        '"' + item + '"可助今日气数趋于中和。不求圆满，但求安然；过程中的体察，便是所得。'
      ],
      ji: [
        '"' + item + '"今日恐耗你之气。非谓绝不可为，若不得不为，且留三分余地，莫要勉强。',
        '今日' + favorableLabel + '气不合"' + item + '"。若此事在心，不妨缓行，或换一思路，待气足再图。',
        '"' + item + '"与今日气数稍逆。若行之遇阻，不必忧心，此乃气之自调。歇一歇，另寻其法。'
      ]
    };

    var selected = templates[type] || templates.yi;
    return selected[Math.floor(rand() * selected.length)];
  }

  Object.assign(X, {
    generateCyberBlessing: generateCyberBlessing,
    generateDailyFortune: generateDailyFortune,
    explainYiJi: explainYiJi,
    resolveTimeBranch: resolveTimeBranch
  });
})(window.Xinxiang);

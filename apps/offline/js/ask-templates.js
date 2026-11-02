/* ask-templates — local template answers, offline, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  var DISCLAIMER = '所言皆为遗怀清心之趣，非关休咎，不作决断之凭。';

  var RISK_KEYWORDS = ['自杀', '自残', '杀人', '同归于尽', '结束生命', '不想活'];

  var SAFETY_TEXT =
    '听得出来，你现在很辛苦。请先停一停这个小工具，去找身边可信的人说说话；' +
    '若身边暂时无人，可拨打当地心理援助热线，或前往就近医院急诊。\n' +
    '你值得被好好对待。心象只作日常观察，无法替代专业支持。';

  var QUICK_ASKS = [
    { type: 'moment', label: '此刻之象', q: '此刻我的心象如何？' },
    { type: 'state', label: '内在状态', q: '我此刻的内在状态如何？' },
    { type: 'todo', label: '今日可做', q: '今日适合做些什么？' },
    { type: 'remind', label: '一句提醒', q: '给我一句今日提醒' }
  ];

  var TOPIC_DICT = [
    { keys: ['沟通', '说话', '表达', '聊天', '回复', '微信'], topic: '沟通' },
    { keys: ['推进', '工作', '事情', '项目', '任务', '决策'], topic: '推进' },
    { keys: ['不安', '焦虑', '紧张', '压力', '烦', '慌'], topic: '不安' },
    { keys: ['关系', '对方', '朋友', '家人', '恋人', '相处'], topic: '关系' },
    { keys: ['休息', '睡眠', '疲惫', '身体', '能量'], topic: '休养' },
    { keys: ['选择', '纠结', '要不要', '犹豫'], topic: '选择' }
  ];

  var IMAGE_BY_ELEMENT = {
    wood: [
      '如新芽破土，气息向上而柔软。',
      '像晨风过林，念头也跟着舒展。',
      '一缕青意升起，心有生长的余地。',
      '枝叶未成荫，却已指向开阔。',
      '草木知时，你也正被轻推着向前。',
      '青气未竞，宜养不宜催。',
      '新意初萌，不必急着定型。',
      '如春水漫堤，缓缓漫开即可。',
      '一寸生机，胜过百般勉强。',
      '木气在侧，心有可伸之处。'
    ],
    fire: [
      '如灯火初明，暖而不灼。',
      '心火微扬，宜照见，不宜燎原。',
      '一缕暖意升起，适合温柔相待。',
      '焰在掌心，足以照亮眼前一步。',
      '热意未散，先安住呼吸。',
      '如晚霞暂驻，明丽却不催促。',
      '火气宜敛，温处自有人近。',
      '光不必大，够看清此刻便好。',
      '热情在，却要留给值得之处。',
      '心如小灶，慢煨一事即可。'
    ],
    earth: [
      '如厚土承物，稳而能容。',
      '心有落点，脚步不必慌。',
      '尘埃落定处，自生安稳。',
      '像田垄一行，踏实便是风景。',
      '土气在怀，宜守一事成之。',
      '不求高远，先求可立之处。',
      '厚德载物，先载住今天的自己。',
      '根基未动，风过也无妨。',
      '一抔土暖，足够安顿心神。',
      '稳处生力，慢即是进。'
    ],
    metal: [
      '如霜刃出鞘，清而有界。',
      '金气清明，宜删繁就简。',
      '一念斩截，心自轻。',
      '如月白照夜，边界清晰。',
      '锋芒不必外露，收住即是力。',
      '金声初振，宜立一分规矩。',
      '去芜存菁，今日只留必要。',
      '冷而净，恰可照见真心。',
      '决断如一线，轻轻一画即可。',
      '金气在侧，心有可守之界。'
    ],
    water: [
      '如静水深流，外平内有势。',
      '水气回旋，念头来去皆可。',
      '一泓清澈，照见而未执。',
      '如夜雨润物，细而无声。',
      '水流就下，顺势即安。',
      '深而不浊，宜独处片刻。',
      '潮起潮落，心亦可起落。',
      '水善利万物，先善待自己。',
      '一滴入海，不必争其名。',
      '沉静处，自有回响。'
    ]
  };

  var OBSERVE_POOL = [
    '此刻不是要你立刻结论，而是允许自己停一下、看一眼。',
    '情绪若起伏，先当作风过竹林，不必急着定性。',
    '宜忌只是倾向的镜子，照见即可，不作枷锁。',
    '你不需要今天把一切安顿完，安顿呼吸也算。',
    '若有微澜，记一句：观而不执，痕亦可淡。',
    '心象有升敛，升时不骄，敛时不惧。',
    '把「必须做成」换成「可以试试」，肩会轻一些。',
    '对方与事情都在变化，你只需守住自己的节奏。',
    '不安常来自未说出口的期待，先点名它，就松一分。',
    '今日的中和，往往来自少做一件多余的事。',
    '若纠结，问自己：哪一步最小、又可撤回？',
    '关系里的温度，常常始于一句不催促的话。'
  ];

  var ACTION_POOL = [
    '喝一口温水，把肩膀放下来，再决定下一句要说什么。',
    '只推进一件能在三十分钟内收尾的小事。',
    '给重要的人一句清楚、简短、不带压力的消息。',
    '删掉或推迟一件今天本就勉强的安排。',
    '出门走十分钟，让目光落在远处一点。',
    '把待办写成三行，只圈出其中一行去做。',
    '独处五分钟，不看屏幕，只数呼吸。',
    '整理桌面一角，让空间先清净。',
    '把担心写下一句，然后合上，明天再看。',
    '选一个温和的时间窗口沟通，而非硬闯。',
    '先完成「开始」：打开文档写第一行即可。',
    '今晚早十分钟休息，把气留给明天。'
  ];

  var FREE_POOL = [
    '把目光收回呼吸之间，心念自然会安静几分。',
    '今日不必求全，一事安稳，便是收获。',
    '气有升敛，心可观照；观而不执，自生余白。',
    '若有微澜，且记：风过留痕，痕亦可淡。',
    '顺势非无为，乃择力所能及之处轻轻推进。',
    '宜忌只是镜子，照见倾向，不作枷锁。',
    '一句真诚，胜过十句圆满。',
    '先安住身体，再谈心意。',
    '边界清晰，关系才有温度。',
    '慢半拍，往往更准。',
    '把期待说小一点，行动就容易起来。',
    '你已经在观照了，这本身就是进展。'
  ];

  var TOPIC_OBSERVE = {
    沟通: [
      '沟通的关键不在说服，而在让对方感到被听见。',
      '话未出口前，先确认自己要的是连接还是正确。',
      '简短、清楚、留白，往往比完整更有效。'
    ],
    推进: [
      '推进怕的是摊大，不怕步子小。',
      '先定义「完成的样子」，行动才不散。',
      '今日能收尾的，比宏大的更有力量。'
    ],
    不安: [
      '不安常常是身体在提醒：节奏太快了。',
      '给情绪一个名字，它就会小一点。',
      '不安不是敌人，是请你减速的信使。'
    ],
    关系: [
      '关系里的用力，不如关系里的诚实。',
      '距离与亲密可以并存，关键在是否自愿。',
      '先照顾自己的边界，才有余力照顾对方。'
    ],
    休养: [
      '休养不是偷懒，是让气回来。',
      '身体先被善待，心才跟得上。',
      '休息的质量，决定明日的清明。'
    ],
    选择: [
      '选择困难时，先排除明显耗神的那条。',
      '可逆的小步，比不可逆的大赌更慈悲。',
      '问自己：哪条路更像自己，而不是更像别人期待。'
    ]
  };

  function withDisclaimer(text) {
    return text + '\n\n' + DISCLAIMER;
  }

  function hasRisk(question) {
    if (!question) return false;
    var q = String(question);
    for (var i = 0; i < RISK_KEYWORDS.length; i++) {
      if (q.indexOf(RISK_KEYWORDS[i]) >= 0) return true;
    }
    return false;
  }

  function detectTopic(question) {
    var q = String(question || '');
    for (var i = 0; i < TOPIC_DICT.length; i++) {
      var item = TOPIC_DICT[i];
      for (var j = 0; j < item.keys.length; j++) {
        if (q.indexOf(item.keys[j]) >= 0) return item.topic;
      }
    }
    return null;
  }

  function favElement(bazi) {
    return (
      (bazi && bazi.favorableElements && bazi.favorableElements[0]) || 'water'
    );
  }

  function elemLabel(bazi) {
    var el = favElement(bazi);
    return typeof X.getElementLabel === 'function'
      ? X.getElementLabel(el)
      : ({ wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }[el] || '水');
  }

  function dayMaster(bazi) {
    return (bazi && bazi.dayMaster) || '日主';
  }

  function yiList(fortune) {
    return (fortune && fortune.yi) || [];
  }

  function makeRand(profile, fortune, salt) {
    var seedBase =
      profile && typeof X.buildDailySeed === 'function' && fortune && fortune.date
        ? X.buildDailySeed(profile, fortune.date)
        : (fortune && fortune.date) || 'ask';
    var seed = seedBase + '_' + (salt || 'x');
    return typeof X.createSeededRandom === 'function'
      ? X.createSeededRandom(seed)
      : Math.random;
  }

  function pickOne(pool, rand) {
    if (!pool || !pool.length) return '';
    if (typeof X.seededPickOne === 'function') return X.seededPickOne(pool, rand);
    return pool[Math.floor(rand() * pool.length)];
  }

  function threePart(image, observe, action) {
    return (
      '【意象】' +
      image +
      '\n【观察】' +
      observe +
      '\n【一件小事】' +
      action
    );
  }

  function answerMoment(bazi, fortune, profile) {
    var rand = makeRand(profile, fortune, 'moment');
    var mood = (fortune && fortune.moodKeyword) || '云淡风轻';
    var el = favElement(bazi);
    var image =
      '今日心象名为「' +
      mood +
      '」。' +
      pickOne(IMAGE_BY_ELEMENT[el] || IMAGE_BY_ELEMENT.water, rand) +
      ' 日主' +
      dayMaster(bazi) +
      '在侧，观之即可。';
    var observe = pickOne(OBSERVE_POOL, rand);
    var action =
      (fortune && fortune.actionSuggestion) || pickOne(ACTION_POOL, rand);
    return threePart(image, observe, action);
  }

  function answerState(bazi, fortune, profile) {
    var rand = makeRand(profile, fortune, 'state');
    var fav = elemLabel(bazi);
    var yi = yiList(fortune).slice(0, 3).join('、') || '守正';
    var ji = ((fortune && fortune.ji) || []).slice(0, 2).join('、') || '神耗';
    var image =
      pickOne(IMAGE_BY_ELEMENT[favElement(bazi)] || IMAGE_BY_ELEMENT.water, rand) +
      ' 内在可见' +
      fav +
      '气为主轴。';
    var observe =
      '今日宜向「' +
      yi +
      '」轻轻靠拢，对「' +
      ji +
      '」多留余地。' +
      pickOne(OBSERVE_POOL, rand);
    var action = pickOne(ACTION_POOL, rand);
    return threePart(image, observe, action);
  }

  function answerTodo(bazi, fortune, profile) {
    var rand = makeRand(profile, fortune, 'todo');
    var yi = yiList(fortune).slice(0, 3);
    var image =
      '今日之象「' +
      ((fortune && fortune.moodKeyword) || '云淡风轻') +
      '」下，行动宜少而清。';
    var observe = yi.length
      ? '可靠近的方向：' + yi.join('、') + '。不必全做，择一即可。'
      : pickOne(OBSERVE_POOL, rand);
    var action =
      (fortune && fortune.actionSuggestion) || pickOne(ACTION_POOL, rand);
    return threePart(image, observe, action);
  }

  function answerRemind(bazi, fortune, profile) {
    var rand = makeRand(profile, fortune, 'remind');
    var blessing = (fortune && fortune.cyberBlessing) || pickOne(FREE_POOL, rand);
    var color = (fortune && fortune.luckyColor) || '';
    var bits = [];
    if (color) bits.push('色取' + color);
    if (fortune && fortune.luckyNumber != null) bits.push('数取' + fortune.luckyNumber);
    if (fortune && fortune.luckyDirection) bits.push('向取' + fortune.luckyDirection);
    var image = blessing;
    var observe = bits.length
      ? '今日可记：' + bits.join('，') + '。当作意象锚点，不必执实。'
      : pickOne(OBSERVE_POOL, rand);
    var action = '把这句提醒写在可见处，或默念一遍，再去做下一件小事。';
    return threePart(image, observe, action);
  }

  function answerFree(bazi, fortune, profile, question) {
    var rand = makeRand(profile, fortune, 'free_' + String(question || '').slice(0, 16));
    var topic = detectTopic(question);
    var mood = (fortune && fortune.moodKeyword) || '云淡风轻';
    var fav = elemLabel(bazi);
    var image =
      (topic
        ? '你问到「' + topic + '」。'
        : '关于「' + (question || '此刻所问') + '」，') +
      '以今日「' +
      mood +
      '」与' +
      fav +
      '气观之：' +
      pickOne(IMAGE_BY_ELEMENT[favElement(bazi)] || IMAGE_BY_ELEMENT.water, rand);
    var observePool = topic && TOPIC_OBSERVE[topic] ? TOPIC_OBSERVE[topic] : OBSERVE_POOL;
    var observe = pickOne(observePool, rand) + ' ' + pickOne(FREE_POOL, rand);
    var action = pickOne(ACTION_POOL, rand);
    return threePart(image, observe, action);
  }

  function answerAsk(opts) {
    opts = opts || {};
    var type = opts.type || 'free';
    var question = opts.question || '';
    var bazi = opts.bazi || {};
    var fortune = opts.fortune || {};
    var profile = opts.profile;

    if (hasRisk(question)) {
      return SAFETY_TEXT;
    }

    var body;
    switch (type) {
      case 'moment':
        body = answerMoment(bazi, fortune, profile);
        break;
      case 'state':
        body = answerState(bazi, fortune, profile);
        break;
      case 'todo':
        body = answerTodo(bazi, fortune, profile);
        break;
      case 'remind':
        body = answerRemind(bazi, fortune, profile);
        break;
      case 'free':
      default:
        body = answerFree(bazi, fortune, profile, question);
        break;
    }

    return withDisclaimer(body);
  }

  Object.assign(X, {
    QUICK_ASKS: QUICK_ASKS,
    answerAsk: answerAsk,
    ASK_DISCLAIMER: DISCLAIMER,
    detectAskTopic: detectTopic
  });
})(window.Xinxiang);

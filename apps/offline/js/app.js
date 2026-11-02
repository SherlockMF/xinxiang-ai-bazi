/* app — hash router + pages, offline, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  var root = document.getElementById('app');
  var toastEl = document.getElementById('toast');
  var tabbar = document.getElementById('tabbar');

  var TAB_ROUTES = {
    today: '#/today',
    ask: '#/ask',
    share: '#/share',
    me: '#/me'
  };

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function () {
      toastEl.classList.remove('show');
    }, 1800);
  }

  function navigate(hash) {
    if (location.hash === hash) {
      render();
      return;
    }
    location.hash = hash;
  }

  function route() {
    var h = (location.hash || '#/').replace(/^#/, '') || '/';
    if (h.charAt(0) !== '/') h = '/' + h;
    return h.split('?')[0];
  }

  function requireProfile() {
    return X.getActiveProfile();
  }

  function ensureFortune(profile) {
    var date = X.getTodayDateString();
    return X.generateDailyFortune(profile.bazi, profile, date, false);
  }

  function setTabVisible(show) {
    if (!tabbar) return;
    tabbar.classList.toggle('hidden', !show);
  }

  function setActiveTab(name) {
    if (!tabbar) return;
    var buttons = tabbar.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.classList.toggle('active', b.getAttribute('data-tab') === name);
    }
  }

  function el(html) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    return wrap.firstChild;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showModal(opts) {
    opts = opts || {};
    var mask = el(
      '<div class="modal-mask">' +
        '<div class="modal neu-raised">' +
        (opts.title ? '<div class="modal-title"></div>' : '') +
        '<p class="modal-body' +
        (opts.selectable ? ' selectable' : '') +
        '"></p>' +
        '<div class="modal-actions"></div>' +
        '</div></div>'
    );
    if (opts.title) mask.querySelector('.modal-title').textContent = opts.title;
    mask.querySelector('.modal-body').textContent = opts.body || '';
    var actions = mask.querySelector('.modal-actions');

    function close() {
      mask.remove();
    }

    if (opts.cancelText !== false) {
      var cancelBtn = el(
        '<button type="button" class="btn secondary">' +
          escapeHtml(opts.cancelText || '取消') +
          '</button>'
      );
      cancelBtn.onclick = close;
      actions.appendChild(cancelBtn);
    }

    var okBtn = el(
      '<button type="button" class="btn">' +
        escapeHtml(opts.confirmText || '知道了') +
        '</button>'
    );
    okBtn.onclick = function () {
      close();
      if (typeof opts.onConfirm === 'function') opts.onConfirm();
    };
    actions.appendChild(okBtn);

    mask.addEventListener('click', function (e) {
      if (e.target === mask && opts.cancelText !== false) close();
    });
    document.body.appendChild(mask);
  }

  function showExplain(text) {
    showModal({ title: '宜忌观想', body: text, cancelText: false, confirmText: '知道了' });
  }

  var GUIDE_STEPS = [
    {
      title: '心象是什么',
      body: '这是一份每日心象日签，用来自我观察与安顿情绪，不是算命，也不作决策依据。'
    },
    {
      title: '三步就够',
      body: '录入生辰 → 看今日签卡 → 想聊聊就去问心。签亭可珍藏，也可保存长图。'
    },
    {
      title: '数据在本机',
      body: '全部保存在你的浏览器本地，不联网、不上云。随时可在本心页清除。'
    }
  ];

  var guideShowing = false;

  function maybeShowGuide() {
    if (guideShowing) return;
    if (typeof X.isGuideDone === 'function' && X.isGuideDone()) return;

    // 清掉残留叠层（防止重复 render 挂两份）
    var stale = document.querySelectorAll('.guide-mask');
    for (var s = 0; s < stale.length; s++) stale[s].remove();

    guideShowing = true;
    var step = 0;
    var mask = el(
      '<div class="guide-mask"><div class="guide-card neu-raised">' +
        '<div class="guide-step" id="gStep"></div>' +
        '<div class="h2" id="gTitle"></div>' +
        '<p class="lead" id="gBody"></p>' +
        '<div class="guide-dots" id="gDots"></div>' +
        '<div class="btn-row">' +
        '<button type="button" class="btn secondary" id="gSkip">跳过</button>' +
        '<button type="button" class="btn" id="gNext">下一步</button>' +
        '</div></div></div>'
    );

    function paint() {
      var s = GUIDE_STEPS[step];
      mask.querySelector('#gStep').textContent = '引导 ' + (step + 1) + ' / ' + GUIDE_STEPS.length;
      mask.querySelector('#gTitle').textContent = s.title;
      mask.querySelector('#gBody').textContent = s.body;
      var dots = '';
      for (var i = 0; i < GUIDE_STEPS.length; i++) {
        dots += '<span class="' + (i === step ? 'on' : '') + '"></span>';
      }
      mask.querySelector('#gDots').innerHTML = dots;
      mask.querySelector('#gNext').textContent =
        step === GUIDE_STEPS.length - 1 ? '开始观心' : '下一步';
    }

    function finish() {
      guideShowing = false;
      if (typeof X.setGuideDone === 'function') X.setGuideDone();
      if (mask.parentNode) mask.remove();
    }

    mask.querySelector('#gSkip').onclick = finish;
    mask.querySelector('#gNext').onclick = function () {
      if (step >= GUIDE_STEPS.length - 1) {
        finish();
        return;
      }
      step += 1;
      paint();
    };
    document.body.appendChild(mask);
    paint();
  }

  function saveSignImage(fortune, profile) {
    try {
      if (typeof X.drawSignCard !== 'function') {
        toast('导出能力未加载');
        return;
      }
      var canvas = X.drawSignCard(fortune, profile);
      var dataUrl = canvas.toDataURL('image/png');
      var mask = el(
        '<div class="modal-mask"><div class="modal neu-raised" style="max-width:420px">' +
          '<div class="modal-title">签卡长图</div>' +
          '<p class="muted lead tip-copy">可长按图片保存到相册；若在小红书内，也可点「存到相册」。</p>' +
          '<img alt="签卡" class="sign-preview" />' +
          '<div class="modal-actions"></div></div></div>'
      );
      mask.querySelector('img').src = dataUrl;
      var actions = mask.querySelector('.modal-actions');
      var closeBtn = el('<button type="button" class="btn secondary">关闭</button>');
      closeBtn.onclick = function () {
        mask.remove();
      };
      actions.appendChild(closeBtn);

      var xhs = window.xhs && window.xhs.miniTool;
      if (xhs && typeof xhs.saveImageToPhotosAlbum === 'function') {
        var saveBtn = el('<button type="button" class="btn">存到相册</button>');
        saveBtn.onclick = function () {
          var p = Promise.resolve(dataUrl);
          if (typeof xhs.writeTempFile === 'function') {
            p = Promise.resolve(xhs.writeTempFile({ data: dataUrl })).then(function (res) {
              return (res && res.filePath) || dataUrl;
            });
          }
          p.then(function (filePath) {
            return xhs.saveImageToPhotosAlbum({ filePath: filePath });
          })
            .then(function () {
              toast('已保存到相册');
              mask.remove();
            })
            .catch(function () {
              toast('保存失败，请长按图片另存');
            });
        };
        actions.appendChild(saveBtn);
      }

      mask.addEventListener('click', function (e) {
        if (e.target === mask) mask.remove();
      });
      document.body.appendChild(mask);
    } catch (e) {
      toast('生成失败');
    }
  }

  function copyText(text) {
    text = String(text || '');
    if (!text) return;
    // 容器禁剪贴板 API：改为展示可选中文本，引导长按复制
    showModal({
      title: '今日一句',
      body: text,
      cancelText: false,
      confirmText: '我知道了',
      selectable: true
    });
  }

  function buildSignCardHtml(fortune, opts) {
    opts = opts || {};
    return (
      '<div class="sign-card neu-raised' +
      (opts.compact ? ' compact' : '') +
      '">' +
      '<div class="sign-date">' +
      escapeHtml(fortune.date || '') +
      '</div>' +
      '<div class="sign-mood">' +
      escapeHtml(fortune.moodKeyword || '') +
      '</div>' +
      '<p class="sign-blessing">' +
      escapeHtml(fortune.cyberBlessing || fortune.summary || '') +
      '</p>' +
      '<div class="sign-meta meta-grid">' +
      '<div><div class="lab">色</div><div class="val">' +
      escapeHtml(fortune.luckyColor || '—') +
      '</div></div>' +
      '<div><div class="lab">数</div><div class="val">' +
      escapeHtml(fortune.luckyNumber != null ? fortune.luckyNumber : '—') +
      '</div></div>' +
      '<div><div class="lab">向</div><div class="val">' +
      escapeHtml(fortune.luckyDirection || '—') +
      '</div></div>' +
      '</div>' +
      '<p class="sign-foot">心象 · 自我观察 · 非关休咎</p>' +
      '</div>'
    );
  }

  function quoteLine(fortune) {
    return (
      '【心象·' +
      (fortune.date || '') +
      '】' +
      (fortune.moodKeyword || '') +
      ' —— ' +
      (fortune.cyberBlessing || fortune.summary || '') +
      '（所言皆为遗怀清心之趣）'
    );
  }

  function hourOptionsHtml() {
    var opts = [];
    for (var h = 0; h < 24; h++) {
      var value = String(h).padStart(2, '0') + ':00';
      var selected = h === 12 ? ' selected' : '';
      opts.push(
        '<option value="' + value + '"' + selected + '>' + value + '</option>'
      );
    }
    return opts.join('');
  }

  /* ---------- pages ---------- */

  function renderWelcome() {
    setTabVisible(false);
    var profile = requireProfile();
    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<div class="brand-mark neu-raised"><p class="title">心 象</p></div>' +
        '<p class="center muted lead">每日心象日签 · 静观自心</p>' +
        '<p class="center quote">天地有大美而不言</p>' +
        '<p class="center pink lead">不是算命，是把心看清楚一点</p>' +
        '<button type="button" class="btn" id="go">' +
        (profile ? '叩问今日心象' : '录入生辰，开启观心') +
        '</button>' +
        '<p class="disclaimer center">所言皆为遗怀清心之趣 非关休咎，不作决断之凭</p>' +
        '</div>'
    );
    page.querySelector('#go').onclick = function () {
      navigate(profile ? '#/today' : '#/birth');
    };
    root.appendChild(page);
    maybeShowGuide();
  }

  function renderBirth() {
    setTabVisible(false);
    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<h1 class="h1">生辰录入</h1>' +
        '<p class="muted lead">仅存于本机，用于生成心象盘与今日日签。</p>' +
        '<div class="field"><label>称呼</label><div class="control neu-inset"><input id="nickname" placeholder="可叫我…" maxlength="20" /></div></div>' +
        '<div class="field"><label>公历生日</label><div class="control neu-inset"><input id="birthDate" type="date" /></div></div>' +
        '<label class="check"><input id="unknownTime" type="checkbox" checked /> 不知具体时间（按正午排盘，推荐）</label>' +
        '<div class="field" id="branchField" style="display:none"><label>出生时间（24小时制）</label><div class="control neu-inset"><select id="birthHour">' +
        hourOptionsHtml() +
        '</select></div></div>' +
        '<div class="field"><label>性别（可选）</label><div class="control neu-inset"><select id="gender"><option value="">不填</option><option value="female">女</option><option value="male">男</option><option value="other">其他</option></select></div></div>' +
        '<label class="check"><input id="privacy" type="checkbox" /> 我知悉内容仅供自我观察，不作决策依据</label>' +
        '<button type="button" class="btn" id="submit">生成心象盘</button>' +
        '<button type="button" class="btn secondary" id="back">返回</button>' +
        '</div>'
    );

    var unknown = page.querySelector('#unknownTime');
    var branchField = page.querySelector('#branchField');
    function syncBranch() {
      branchField.style.display = unknown.checked ? 'none' : 'block';
    }
    unknown.addEventListener('change', syncBranch);
    syncBranch();

    page.querySelector('#back').onclick = function () {
      navigate('#/');
    };

    page.querySelector('#submit').onclick = function () {
      var nickname = page.querySelector('#nickname').value.trim() || '观心人';
      var birthDate = page.querySelector('#birthDate').value;
      var unknownTime = unknown.checked;
      var birthHour = page.querySelector('#birthHour').value || '12:00';
      var gender = page.querySelector('#gender').value || '';
      var privacy = page.querySelector('#privacy').checked;

      if (!birthDate) {
        toast('请填写生日');
        return;
      }
      if (X.isFutureBirthDate(birthDate)) {
        toast('生日不能晚于今天');
        return;
      }
      if (!privacy) {
        toast('请先确认观察声明');
        return;
      }

      var birthTime = unknownTime ? undefined : birthHour;
      var id = 'u_' + Date.now();
      var profile = {
        id: id,
        nickname: nickname,
        birthDate: birthDate,
        birthTime: birthTime,
        unknownTime: unknownTime,
        timeBranch: unknownTime ? 'unknown' : X.timeToBranch(birthHour),
        gender: gender,
        privacyAccepted: true,
        privacyAcceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      profile.bazi = X.generateBaziProfile(profile);

      var list = X.loadProfiles().filter(function (p) {
        return p.id !== id;
      });
      list.unshift(profile);
      X.saveProfiles(list);
      X.setActiveId(id);

      toast('心象盘已成');
      navigate('#/bazi');
    };

    root.appendChild(page);
  }

  function renderBazi() {
    var profile = requireProfile();
    if (!profile || !profile.bazi) {
      navigate('#/birth');
      return;
    }
    setTabVisible(true);
    setActiveTab('me');
    var b = profile.bazi;
    var labels = X.ELEMENT_LABELS || { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    var order = ['wood', 'fire', 'earth', 'metal', 'water'];
    var bars = order
      .map(function (k) {
        var v = (b.fiveElements && b.fiveElements[k]) || 0;
        return (
          '<div class="bar-row"><span class="name">' +
          labels[k] +
          '</span><div class="bar-track"><div class="bar-fill" style="width:' +
          v +
          '%"></div></div><span class="muted">' +
          v +
          '</span></div>'
        );
      })
      .join('');
    var tags = (b.personalityTags || [])
      .map(function (t) {
        return '<span class="tag">' + escapeHtml(t) + '</span>';
      })
      .join('');
    var fav = (b.favorableElements || [])
      .map(function (e) {
        return labels[e] || e;
      })
      .join('、');

    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<h1 class="h1">心象盘</h1>' +
        '<p class="muted lead">' +
        escapeHtml(profile.nickname) +
        ' · 日主 ' +
        escapeHtml(b.dayMaster) +
        '</p>' +
        '<div class="card neu-raised-sm">' +
        '<div class="tags">' +
        tags +
        '</div>' +
        '<p class="lead">' +
        escapeHtml(b.summary || '') +
        '</p>' +
        '<p class="muted lead">宜亲近：' +
        escapeHtml(fav) +
        ' 之气，以安顿心象。</p>' +
        '</div>' +
        '<button type="button" class="btn secondary" id="toggleDetail">展开心象盘细节</button>' +
        '<div class="collapse-panel hidden-panel" id="detail">' +
        '<div class="pillars">' +
        '<div class="pillar neu-raised-sm"><div class="lab">年</div><div class="val">' +
        escapeHtml(b.yearPillar) +
        '</div></div>' +
        '<div class="pillar neu-raised-sm"><div class="lab">月</div><div class="val">' +
        escapeHtml(b.monthPillar) +
        '</div></div>' +
        '<div class="pillar neu-raised-sm"><div class="lab">日</div><div class="val">' +
        escapeHtml(b.dayPillar) +
        '</div></div>' +
        '<div class="pillar neu-raised-sm"><div class="lab">时</div><div class="val">' +
        escapeHtml(b.hourPillar) +
        '</div></div>' +
        '</div>' +
        '<div class="card neu-raised-sm"><div class="h2">五行分布</div><div class="bars">' +
        bars +
        '</div></div>' +
        '</div>' +
        '<button type="button" class="btn" id="toToday">查看今日心象</button>' +
        '<button type="button" class="btn secondary" id="reedit">重新录入</button>' +
        '</div>'
    );

    var detail = page.querySelector('#detail');
    var toggle = page.querySelector('#toggleDetail');
    toggle.onclick = function () {
      var open = detail.classList.contains('hidden-panel');
      detail.classList.toggle('hidden-panel', !open);
      toggle.textContent = open ? '收起心象盘细节' : '展开心象盘细节';
    };

    page.querySelector('#toToday').onclick = function () {
      navigate('#/today');
    };
    page.querySelector('#reedit').onclick = function () {
      navigate('#/birth');
    };
    root.appendChild(page);
  }

  function renderToday() {
    var profile = requireProfile();
    if (!profile || !profile.bazi) {
      navigate('#/birth');
      return;
    }
    setTabVisible(true);
    setActiveTab('today');
    var fortune = ensureFortune(profile);
    var streak = X.markTodayViewed(fortune.date);
    X.pushHistory({
      date: fortune.date,
      moodKeyword: fortune.moodKeyword,
      at: new Date().toISOString()
    });

    var viewed = X.hasViewedToday(fortune.date);
    var statusText = viewed
      ? '今日已观心 · 连续 ' + streak.streak + ' 日'
      : '叩问今日';

    var yi = (fortune.yi || [])
      .map(function (item) {
        return (
          '<span class="chip yi" data-type="yi" data-item="' +
          escapeHtml(item) +
          '">' +
          escapeHtml(item) +
          '</span>'
        );
      })
      .join('');
    var ji = (fortune.ji || [])
      .map(function (item) {
        return (
          '<span class="chip ji" data-type="ji" data-item="' +
          escapeHtml(item) +
          '">' +
          escapeHtml(item) +
          '</span>'
        );
      })
      .join('');

    var fav = X.isFavorite(fortune.id);

    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<div class="status-bar">' +
        escapeHtml(statusText) +
        '</div>' +
        buildSignCardHtml(fortune) +
        '<div class="yi-ji">' +
        '<div class="card neu-inset"><div class="h2 cyan">宜</div><div id="yi">' +
        yi +
        '</div></div>' +
        '<div class="card neu-inset"><div class="h2 pink">忌</div><div id="ji">' +
        ji +
        '</div></div>' +
        '</div>' +
        '<div class="card neu-raised-sm"><div class="h2">行止</div><p class="lead">' +
        escapeHtml(fortune.actionSuggestion || '') +
        '</p></div>' +
        '<div class="btn-row">' +
        '<button type="button" class="btn" id="copy">复制今日一句</button>' +
        '<button type="button" class="btn secondary' +
        (fav ? ' is-fav' : '') +
        '" id="fav">' +
        (fav ? '已珍藏' : '珍藏此签') +
        '</button>' +
        '</div>' +
        '<button type="button" class="btn secondary" id="saveImg">保存签卡长图</button>' +
        '<button type="button" class="btn secondary" id="ask">去问心</button>' +
        '<p class="disclaimer">所言皆为遗怀清心之趣，非关休咎，不作决断之凭。</p>' +
        '</div>'
    );

    page.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        showExplain(
          X.explainYiJi(
            profile.bazi,
            fortune,
            chip.getAttribute('data-item'),
            chip.getAttribute('data-type'),
            profile
          )
        );
      });
    });

    page.querySelector('#copy').onclick = function () {
      copyText(quoteLine(fortune));
      toast('请长按弹窗内文字复制');
    };

    var saveImgBtn = page.querySelector('#saveImg');
    if (saveImgBtn) {
      saveImgBtn.onclick = function () {
        saveSignImage(fortune, profile);
      };
    }

    page.querySelector('#fav').onclick = function () {
      X.toggleFavorite({
        id: fortune.id,
        date: fortune.date,
        moodKeyword: fortune.moodKeyword,
        cyberBlessing: fortune.cyberBlessing,
        summary: fortune.summary,
        luckyColor: fortune.luckyColor,
        luckyNumber: fortune.luckyNumber,
        luckyDirection: fortune.luckyDirection,
        savedAt: new Date().toISOString()
      });
      var nowFav = X.isFavorite(fortune.id);
      var btn = page.querySelector('#fav');
      btn.textContent = nowFav ? '已珍藏' : '珍藏此签';
      btn.classList.toggle('is-fav', nowFav);
      toast(nowFav ? '已珍藏' : '已取消珍藏');
    };

    page.querySelector('#ask').onclick = function () {
      navigate('#/ask');
    };

    root.appendChild(page);
  }

  function renderAsk() {
    var profile = requireProfile();
    if (!profile || !profile.bazi) {
      navigate('#/birth');
      return;
    }
    setTabVisible(true);
    setActiveTab('ask');
    var fortune = ensureFortune(profile);
    var quick = (X.QUICK_ASKS || [])
      .map(function (q) {
        return (
          '<button type="button" data-type="' +
          escapeHtml(q.type) +
          '" data-q="' +
          escapeHtml(q.q) +
          '">' +
          escapeHtml(q.label) +
          '</button>'
        );
      })
      .join('');

    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<h1 class="h1">问心</h1>' +
        '<p class="muted lead">本地模板应答，不联网、无大模型。</p>' +
        '<div class="quick-grid">' +
        quick +
        '</div>' +
        '<div class="field"><label>或写下此刻一问</label><div class="control neu-inset"><textarea id="q" rows="3" maxlength="200" placeholder="例如：今天沟通要注意什么？"></textarea></div></div>' +
        '<button type="button" class="btn" id="send">静观一答</button>' +
        '<div class="chat-box neu-inset" id="ans">点上方快捷问，或输入后静观。</div>' +
        '</div>'
    );

    function reply(type, question) {
      var text = X.answerAsk({
        type: type || 'free',
        question: question || '',
        bazi: profile.bazi,
        fortune: fortune,
        profile: profile
      });
      page.querySelector('#ans').textContent = text;
    }

    page.querySelector('.quick-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      reply(btn.getAttribute('data-type'), btn.getAttribute('data-q'));
    });

    page.querySelector('#send').onclick = function () {
      var q = page.querySelector('#q').value.trim();
      if (!q) {
        toast('先写下你的一问');
        return;
      }
      reply('free', q);
    };

    root.appendChild(page);
  }

  function renderShare() {
    var profile = requireProfile();
    if (!profile || !profile.bazi) {
      navigate('#/birth');
      return;
    }
    setTabVisible(true);
    setActiveTab('share');
    var fortune = ensureFortune(profile);
    var favs = X.getFavorites();
    var favHtml = favs.length
      ? favs
          .map(function (f) {
            return (
              '<div class="list-item neu-raised-sm"><div class="when">' +
              escapeHtml(f.date) +
              '</div><div class="h2 cyan">' +
              escapeHtml(f.moodKeyword) +
              '</div><p class="lead">' +
              escapeHtml(f.cyberBlessing || f.summary || '') +
              '</p><button type="button" class="btn secondary" data-id="' +
              escapeHtml(f.id) +
              '">取消珍藏</button></div>'
            );
          })
          .join('')
      : '<div class="empty-hint neu-inset">尚无珍藏。<br/>可在今日心象中点「珍藏此签」。</div>';

    var isFav = X.isFavorite(fortune.id);

    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<h1 class="h1">签亭</h1>' +
        buildSignCardHtml(fortune) +
        '<div class="btn-row">' +
        '<button type="button" class="btn" id="copy">复制今日一句</button>' +
        '<button type="button" class="btn secondary' +
        (isFav ? ' is-fav' : '') +
        '" id="fav">' +
        (isFav ? '已珍藏' : '珍藏今日签') +
        '</button>' +
        '</div>' +
        '<button type="button" class="btn secondary" id="saveImg">保存签卡长图</button>' +
        '<h2 class="h2" style="margin-top:24px">最近珍藏</h2>' +
        '<div id="list">' +
        favHtml +
        '</div>' +
        '</div>'
    );

    page.querySelector('#copy').onclick = function () {
      copyText(quoteLine(fortune));
      toast('请长按弹窗内文字复制');
    };

    page.querySelector('#saveImg').onclick = function () {
      saveSignImage(fortune, profile);
    };

    page.querySelector('#fav').onclick = function () {
      X.toggleFavorite({
        id: fortune.id,
        date: fortune.date,
        moodKeyword: fortune.moodKeyword,
        cyberBlessing: fortune.cyberBlessing,
        summary: fortune.summary,
        luckyColor: fortune.luckyColor,
        luckyNumber: fortune.luckyNumber,
        luckyDirection: fortune.luckyDirection,
        savedAt: new Date().toISOString()
      });
      toast(X.isFavorite(fortune.id) ? '已珍藏' : '已取消');
      renderShare();
    };

    page.querySelector('#list').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-id]');
      if (!btn) return;
      X.toggleFavorite({ id: btn.getAttribute('data-id') });
      toast('已取消珍藏');
      renderShare();
    });

    root.appendChild(page);
  }

  function renderMe() {
    var profile = requireProfile();
    setTabVisible(true);
    setActiveTab('me');
    var profiles = X.loadProfiles();
    if (!profiles.length) {
      root.innerHTML = '';
      var empty = el(
        '<div class="page fade-in"><h1 class="h1">本心</h1>' +
          '<div class="empty-hint neu-inset">尚未录入生辰。<br/>可先为自己或亲友建立一份心象档案。</div>' +
          '<button type="button" class="btn" id="go">去录入</button></div>'
      );
      empty.querySelector('#go').onclick = function () {
        navigate('#/birth');
      };
      root.appendChild(empty);
      return;
    }

    if (!profile || !profile.bazi) {
      profile = profiles[0];
      X.setActiveId(profile.id);
    }

    var today = X.getTodayDateString();
    var streak = X.getStreak();
    var note = X.getDailyNote(today);
    var history = X.getHistory().slice(0, 7);
    var histHtml = history.length
      ? history
          .map(function (h) {
            return (
              '<div class="list-item neu-inset"><span class="when">' +
              escapeHtml(h.date) +
              '</span> · <span class="cyan">' +
              escapeHtml(h.moodKeyword) +
              '</span></div>'
            );
          })
          .join('')
      : '<p class="muted">暂无观心记录</p>';

    var streakText =
      streak.streak > 0
        ? '连续观心 ' + streak.streak + ' 日'
        : '尚未开始连续观心';

    var activeId = X.getActiveId();
    var profileListHtml = profiles
      .map(function (p) {
        var active = p.id === activeId;
        return (
          '<div class="profile-item neu-raised-sm' +
          (active ? ' active' : '') +
          '" data-id="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="info"><div class="h2" style="margin:0">' +
          escapeHtml(p.nickname || '未命名') +
          (active ? ' · 当前' : '') +
          '</div><p class="muted lead" style="margin:4px 0 0">日主 ' +
          escapeHtml((p.bazi && p.bazi.dayMaster) || '—') +
          ' · ' +
          escapeHtml(p.birthDate || '') +
          '</p></div>' +
          '<div class="actions">' +
          (active
            ? ''
            : '<button type="button" class="mini" data-act="switch">切换</button>') +
          '<button type="button" class="mini danger" data-act="del">删除</button>' +
          '</div></div>'
        );
      })
      .join('');

    root.innerHTML = '';
    var page = el(
      '<div class="page fade-in">' +
        '<h1 class="h1">本心</h1>' +
        '<div class="streak-badge">' +
        escapeHtml(streakText) +
        '</div>' +
        '<div class="card neu-raised-sm">' +
        '<div class="h2">' +
        escapeHtml(profile.nickname) +
        '</div>' +
        '<p class="muted lead">日主 ' +
        escapeHtml(profile.bazi.dayMaster) +
        ' · ' +
        escapeHtml(profile.birthDate) +
        (profile.unknownTime ? ' · 时间未知' : '') +
        '</p>' +
        '<p class="lead">' +
        escapeHtml((profile.bazi.summary || '').slice(0, 80)) +
        (profile.bazi.summary && profile.bazi.summary.length > 80 ? '…' : '') +
        '</p>' +
        '</div>' +
        '<button type="button" class="btn secondary" id="bazi">查看心象盘</button>' +
        '<h2 class="h2" style="margin-top:20px">档案</h2>' +
        '<div id="profiles">' +
        profileListHtml +
        '</div>' +
        '<button type="button" class="btn secondary" id="addProfile">新增档案</button>' +
        '<div class="card neu-raised-sm" style="margin-top:16px">' +
        '<div class="h2">今日心约</div>' +
        '<p class="muted lead">给自己一句不超过八十字的轻提醒。</p>' +
        '<div class="field"><div class="control neu-inset"><input id="note" maxlength="80" placeholder="例如：今日只做一件小事" value="' +
        escapeHtml(note) +
        '" /></div></div>' +
        '<button type="button" class="btn" id="saveNote">保存心约</button>' +
        '</div>' +
        '<h2 class="h2" style="margin-top:20px">近七日</h2>' +
        histHtml +
        '<button type="button" class="btn danger" id="clear" style="margin-top:24px">清除本机数据</button>' +
        '<p class="disclaimer">数据仅存于本浏览器 localStorage，清除后不可恢复。</p>' +
        '</div>'
    );

    page.querySelector('#bazi').onclick = function () {
      navigate('#/bazi');
    };
    page.querySelector('#addProfile').onclick = function () {
      navigate('#/birth');
    };
    page.querySelector('#profiles').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-act]');
      var item = e.target.closest('.profile-item');
      if (!item) return;
      var id = item.getAttribute('data-id');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      if (act === 'switch') {
        X.setActiveId(id);
        toast('已切换档案');
        navigate('#/today');
        return;
      }
      if (act === 'del') {
        showModal({
          title: '删除档案',
          body: '删除后该档案的日签缓存仍可能留在本机，可稍后「清除本机数据」一并清理。',
          cancelText: '取消',
          confirmText: '删除',
          onConfirm: function () {
            X.deleteProfile(id);
            toast('已删除');
            renderMe();
          }
        });
      }
    });
    page.querySelector('#saveNote').onclick = function () {
      var v = page.querySelector('#note').value;
      X.setDailyNote(today, v);
      toast('心约已保存');
    };
    page.querySelector('#clear').onclick = function () {
      showModal({
        title: '清除本机数据',
        body: '将删除档案、日签、珍藏、连续观心与心约。此操作不可恢复。',
        cancelText: '再想想',
        confirmText: '确认清除',
        onConfirm: function () {
          X.clearAll();
          toast('已清除');
          navigate('#/');
        }
      });
    };

    root.appendChild(page);
  }

  function render() {
    var path = route();
    if (path === '/' || path === '/index') return renderWelcome();
    if (path === '/birth') return renderBirth();
    if (path === '/bazi') return renderBazi();
    if (path === '/today') return renderToday();
    if (path === '/ask') return renderAsk();
    if (path === '/share') return renderShare();
    if (path === '/me') return renderMe();
    navigate('#/');
  }

  if (tabbar) {
    tabbar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      var name = btn.getAttribute('data-tab');
      var profile = requireProfile();
      if (!profile && name !== 'me') {
        toast('请先录入生辰');
        navigate('#/birth');
        return;
      }
      navigate(TAB_ROUTES[name] || '#/today');
    });
  }

  window.addEventListener('hashchange', render);
  if (!location.hash || location.hash === '#') {
    // 仅改 hash，由 hashchange 触发一次 render，避免引导叠两层
    location.hash = '#/';
  } else {
    render();
  }
})(window.Xinxiang);

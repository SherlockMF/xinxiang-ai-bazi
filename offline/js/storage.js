/* storage — offline localStorage, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  var KEYS = {
    PROFILES: 'xinxiang_profiles',
    ACTIVE_ID: 'xinxiang_active_id',
    FAVORITES: 'xinxiang_favorites',
    HISTORY: 'xinxiang_history',
    STREAK: 'xinxiang_visit_streak',
    DAILY_NOTE: 'xinxiang_daily_note',
    GUIDE_DONE: 'xinxiang_guide_done'
  };

  function fortuneKey(userId, date) {
    return 'xinxiang_fortune_' + userId + '_' + date;
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null || raw === '') return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* quota / private mode */
    }
  }

  function loadProfiles() {
    var list = readJson(KEYS.PROFILES, []);
    return Array.isArray(list) ? list : [];
  }

  function saveProfiles(list) {
    writeJson(KEYS.PROFILES, Array.isArray(list) ? list : []);
  }

  function getActiveId() {
    return localStorage.getItem(KEYS.ACTIVE_ID) || null;
  }

  function setActiveId(id) {
    if (id == null || id === '') {
      localStorage.removeItem(KEYS.ACTIVE_ID);
      return;
    }
    localStorage.setItem(KEYS.ACTIVE_ID, String(id));
  }

  function getActiveProfile() {
    var id = getActiveId();
    if (!id) return null;
    var profiles = loadProfiles();
    for (var i = 0; i < profiles.length; i++) {
      if (profiles[i] && profiles[i].id === id) return profiles[i];
    }
    return null;
  }

  function getFortune(userId, date) {
    if (!userId || !date) return null;
    return readJson(fortuneKey(userId, date), null);
  }

  function saveFortune(fortune) {
    if (!fortune || !fortune.userId || !fortune.date) return;
    writeJson(fortuneKey(fortune.userId, fortune.date), fortune);
  }

  function getFavorites() {
    var list = readJson(KEYS.FAVORITES, []);
    return Array.isArray(list) ? list : [];
  }

  function saveFavorites(list) {
    writeJson(KEYS.FAVORITES, Array.isArray(list) ? list : []);
  }

  function isFavorite(id) {
    if (!id) return false;
    var list = getFavorites();
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return true;
    }
    return false;
  }

  function toggleFavorite(item) {
    if (!item || !item.id) return getFavorites();
    var list = getFavorites().slice();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === item.id) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift({
        id: item.id,
        date: item.date,
        moodKeyword: item.moodKeyword,
        cyberBlessing: item.cyberBlessing,
        summary: item.summary,
        luckyColor: item.luckyColor,
        luckyNumber: item.luckyNumber,
        luckyDirection: item.luckyDirection,
        savedAt: item.savedAt || new Date().toISOString()
      });
    }
    saveFavorites(list);
    return list;
  }

  function getHistory() {
    var list = readJson(KEYS.HISTORY, []);
    return Array.isArray(list) ? list : [];
  }

  function pushHistory(entry) {
    if (!entry) return getHistory();
    var list = getHistory().slice();
    var date = entry.date;
    if (date) {
      list = list.filter(function (h) {
        return !h || h.date !== date;
      });
    }
    list.unshift({
      date: entry.date,
      moodKeyword: entry.moodKeyword,
      at: entry.at || new Date().toISOString()
    });
    if (list.length > 30) list = list.slice(0, 30);
    writeJson(KEYS.HISTORY, list);
    return list;
  }

  function getStreak() {
    var data = readJson(KEYS.STREAK, null);
    if (!data || typeof data !== 'object') {
      return { lastDate: null, streak: 0 };
    }
    return {
      lastDate: data.lastDate || null,
      streak: Number(data.streak) || 0
    };
  }

  function saveStreak(data) {
    writeJson(KEYS.STREAK, {
      lastDate: data.lastDate || null,
      streak: Number(data.streak) || 0
    });
  }

  /** 同日多次不累加；连续自然日 +1，断档重置为 1 */
  function markTodayViewed(today) {
    today = today || (typeof X.getTodayDateString === 'function' ? X.getTodayDateString() : '');
    if (!today) return getStreak();
    var cur = getStreak();
    if (cur.lastDate === today) return cur;

    var nextStreak = 1;
    if (cur.lastDate) {
      var prev = new Date(cur.lastDate + 'T12:00:00');
      var now = new Date(today + 'T12:00:00');
      var diff = Math.round((now.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) nextStreak = (cur.streak || 0) + 1;
    }
    var next = { lastDate: today, streak: nextStreak };
    saveStreak(next);
    return next;
  }

  function hasViewedToday(today) {
    today = today || (typeof X.getTodayDateString === 'function' ? X.getTodayDateString() : '');
    var cur = getStreak();
    return !!(today && cur.lastDate === today);
  }

  function getDailyNote(date) {
    date = date || (typeof X.getTodayDateString === 'function' ? X.getTodayDateString() : '');
    var map = readJson(KEYS.DAILY_NOTE, {});
    if (!map || typeof map !== 'object') return '';
    return map[date] || '';
  }

  function setDailyNote(date, text) {
    date = date || (typeof X.getTodayDateString === 'function' ? X.getTodayDateString() : '');
    if (!date) return '';
    var map = readJson(KEYS.DAILY_NOTE, {});
    if (!map || typeof map !== 'object') map = {};
    var t = String(text || '').trim().slice(0, 80);
    if (!t) delete map[date];
    else map[date] = t;
    writeJson(KEYS.DAILY_NOTE, map);
    return t;
  }

  function isGuideDone() {
    return localStorage.getItem(KEYS.GUIDE_DONE) === '1';
  }

  function setGuideDone() {
    localStorage.setItem(KEYS.GUIDE_DONE, '1');
  }

  function deleteProfile(id) {
    if (!id) return loadProfiles();
    var list = loadProfiles().filter(function (p) {
      return p && p.id !== id;
    });
    saveProfiles(list);
    if (getActiveId() === id) {
      if (list.length) setActiveId(list[0].id);
      else setActiveId(null);
    }
    return list;
  }

  function clearAll() {
    try {
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (
          k === KEYS.PROFILES ||
          k === KEYS.ACTIVE_ID ||
          k === KEYS.FAVORITES ||
          k === KEYS.HISTORY ||
          k === KEYS.STREAK ||
          k === KEYS.DAILY_NOTE ||
          k === KEYS.GUIDE_DONE ||
          (k && k.indexOf('xinxiang_fortune_') === 0)
        ) {
          toRemove.push(k);
        }
      }
      for (var j = 0; j < toRemove.length; j++) {
        localStorage.removeItem(toRemove[j]);
      }
    } catch (e) {
      /* ignore */
    }
  }

  Object.assign(X, {
    STORAGE_KEYS: KEYS,
    loadProfiles: loadProfiles,
    saveProfiles: saveProfiles,
    getActiveId: getActiveId,
    setActiveId: setActiveId,
    getActiveProfile: getActiveProfile,
    deleteProfile: deleteProfile,
    getFortune: getFortune,
    saveFortune: saveFortune,
    getFavorites: getFavorites,
    saveFavorites: saveFavorites,
    toggleFavorite: toggleFavorite,
    isFavorite: isFavorite,
    getHistory: getHistory,
    pushHistory: pushHistory,
    getStreak: getStreak,
    markTodayViewed: markTodayViewed,
    hasViewedToday: hasViewedToday,
    getDailyNote: getDailyNote,
    setDailyNote: setDailyNote,
    isGuideDone: isGuideDone,
    setGuideDone: setGuideDone,
    clearAll: clearAll
  });
})(window.Xinxiang);

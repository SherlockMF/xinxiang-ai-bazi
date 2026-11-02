/* birth-utils — offline, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  const TIME_BRANCH_MAP = [
    { branch: '子时', startHour: 23, endHour: 0 },
    { branch: '丑时', startHour: 1, endHour: 2 },
    { branch: '寅时', startHour: 3, endHour: 4 },
    { branch: '卯时', startHour: 5, endHour: 6 },
    { branch: '辰时', startHour: 7, endHour: 8 },
    { branch: '巳时', startHour: 9, endHour: 10 },
    { branch: '午时', startHour: 11, endHour: 12 },
    { branch: '未时', startHour: 13, endHour: 14 },
    { branch: '申时', startHour: 15, endHour: 16 },
    { branch: '酉时', startHour: 17, endHour: 18 },
    { branch: '戌时', startHour: 19, endHour: 20 },
    { branch: '亥时', startHour: 21, endHour: 22 }
  ];

  function getTodayDateString() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  }

  function isFutureBirthDate(birthDate, today) {
    return birthDate > (today || getTodayDateString());
  }

  function timeToBranch(time) {
    const hour = Number(String(time).split(':')[0]);
    if (Number.isNaN(hour)) return 'unknown';
    if (hour === 23 || hour === 0) return '子时';
    for (const item of TIME_BRANCH_MAP) {
      if (item.branch === '子时') continue;
      if (hour >= item.startHour && hour <= item.endHour) return item.branch;
    }
    return 'unknown';
  }

  function resolveBirthTimeForChart(profile) {
    if (profile.unknownTime || !profile.birthTime) return '12:00';
    return profile.birthTime;
  }

  function buildDailySeed(profile, date) {
    const branch = profile.unknownTime ? 'unknown' : (profile.timeBranch || 'unknown');
    return `${profile.birthDate}_${branch}_${date}`;
  }

  function createSeededRandom(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6D2B79F5;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededPick(items, count, rand) {
    if (!items.length) return [];
    const indices = items.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = indices[i];
      indices[i] = indices[j];
      indices[j] = tmp;
    }
    return indices.slice(0, Math.min(count, items.length)).map((i) => items[i]);
  }

  function seededPickOne(items, rand) {
    return items[Math.floor(rand() * items.length)];
  }

  Object.assign(X, {
    TIME_BRANCH_MAP,
    getTodayDateString,
    isFutureBirthDate,
    timeToBranch,
    resolveBirthTimeForChart,
    buildDailySeed,
    createSeededRandom,
    seededPick,
    seededPickOne
  });
})(window.Xinxiang);

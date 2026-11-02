/* poster — canvas sign card export, offline, no network */
window.Xinxiang = window.Xinxiang || {};
(function (X) {
  var W = 750;
  var H = 1200;
  var BG = '#e8e3da';
  var TEXT = '#4a443b';
  var MUTED = '#968e7f';
  var CYAN = '#3f7a78';
  var PINK = '#a85761';

  function wrapText(ctx, text, maxWidth) {
    text = String(text || '');
    var lines = [];
    var line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '\n') {
        lines.push(line);
        line = '';
        continue;
      }
      var test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** @returns {HTMLCanvasElement} */
  function drawSignCard(fortune, profile) {
    fortune = fortune || {};
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // soft card panel
    ctx.save();
    ctx.shadowColor = 'rgba(195,188,174,0.55)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = BG;
    roundRect(ctx, 60, 80, W - 120, H - 200, 36);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = MUTED;
    ctx.font = '28px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fortune.date || '', W / 2, 160);

    ctx.fillStyle = CYAN;
    ctx.font = 'bold 72px "PingFang SC","Microsoft YaHei",sans-serif';
    var mood = fortune.moodKeyword || '心象';
    ctx.fillText(mood, W / 2, 280);

    ctx.fillStyle = TEXT;
    ctx.font = '34px "PingFang SC","Microsoft YaHei",sans-serif';
    var blessing = fortune.cyberBlessing || fortune.summary || '';
    var lines = wrapText(ctx, blessing, W - 200);
    var y = 360;
    for (var i = 0; i < Math.min(lines.length, 8); i++) {
      ctx.fillText(lines[i], W / 2, y);
      y += 52;
    }

    // meta row
    y = Math.max(y + 40, 780);
    ctx.strokeStyle = 'rgba(195,188,174,0.8)';
    ctx.beginPath();
    ctx.moveTo(140, y);
    ctx.lineTo(W - 140, y);
    ctx.stroke();

    y += 70;
    ctx.fillStyle = MUTED;
    ctx.font = '26px "PingFang SC","Microsoft YaHei",sans-serif';
    var cols = [
      { lab: '色', val: fortune.luckyColor || '—' },
      { lab: '数', val: fortune.luckyNumber != null ? String(fortune.luckyNumber) : '—' },
      { lab: '向', val: fortune.luckyDirection || '—' }
    ];
    var slot = (W - 200) / 3;
    for (var c = 0; c < cols.length; c++) {
      var cx = 100 + slot * c + slot / 2;
      ctx.fillStyle = MUTED;
      ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(cols[c].lab, cx, y);
      ctx.fillStyle = TEXT;
      ctx.font = 'bold 32px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(cols[c].val, cx, y + 48);
    }

    var name = profile && profile.nickname ? profile.nickname : '';
    ctx.fillStyle = PINK;
    ctx.font = '26px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(name ? '心象 · ' + name : '心象', W / 2, H - 90);

    ctx.fillStyle = MUTED;
    ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('自我观察 · 非关休咎', W / 2, H - 50);

    return canvas;
  }

  function exportSignCard(fortune, profile) {
    // 容器禁止 a[download]；仅返回 dataURL，由上层用 JSBridge 或长按保存
    var canvas = drawSignCard(fortune, profile);
    return canvas.toDataURL('image/png');
  }

  Object.assign(X, {
    drawSignCard: drawSignCard,
    exportSignCard: exportSignCard
  });
})(window.Xinxiang);

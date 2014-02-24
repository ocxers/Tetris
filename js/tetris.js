/**
 * Created by Administrator on 2/14/14.
 */

$(function () {
  var tetris = {
    Blocks: {   // 方块
      BI: ['0100010001000100', '0000111100000000'],
      BL: ['100100110', '001111000', '011001001', '111100000'],
      BJ: ['001001011', '111001000', '110100100', '100111000'],
      BO: ['110110'],
      BS: ['011110000', '100110010'],
      BZ: ['110011000', '010110100'],
      BT: ['010111000', '100110100', '111010000', '001011001']
    },
    Colors: ['color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6'],
    maxWidth: 12,  // 地图宽度
    maxHeight: 18, // 地图高度
    speed: 500,    // 下移速度，500毫秒
    oSpeed: 500,   // 原始速度
    sSpeed: 100,
    score: 0,
    currentBlock: null,  // 当前方块
    temp: null,          // 临时方块
    nextBlock: {         // 下一个方块
      cb: null,          // 方块类别
      pd: 0,             // 之前的方向
      d: 0,              // 方向
      x: 0,              // 左边距
      y: -1,             // 上边距
      color: 0           // 颜色编号
    },
    nextBlockContent: $('#nextblock'),
    timer: null,         // 定时器
    gameOver: $('.go'),          // 显示结果
    close: $('#close'),          // 关闭结果
    newGame: $('#newgame'),      // 新游戏
    showSpeed: $('#speed'),
    showScore: $('#score'),
    result: $('#result'),
    start: $('#start'),          // 开始/暂停游戏
    Initial: function () {  // 初始化游戏
      var that = this;

      // 随机生成下一个方块
      that.CreateNextBlock();
      // 初始化地图
      that.InitialMap();

      that.currentBlock = that.CloneBlock(that.nextBlock);
      that.temp = that.CloneBlock(that.currentBlock);

      // 设置方块
      // that.SetBlock();
      // 绑定键盘事件
      that.BindEvents();
      that.SetSpeed();
    },
    CreateNextBlock: function () {  // 随机生成下一个方块
      var that = this;
      $('#nextblock li').html('<span></span><span></span><span></span><span></span>');

      var blockNo = Math.floor(Math.random() * 100 % 7);
      var blockDirection = Math.floor(Math.random() * 100 % 4);
      var blockColor = Math.floor(Math.random() * 100 % 7);
      var ccb = null;
      switch (blockNo) {
        case 0:
          ccb = that.Blocks.BI;
          blockDirection = blockDirection % 2;
          break;
        case 1:
          ccb = that.Blocks.BL;
          break;
        case 2:
          ccb = that.Blocks.BJ;
          break;
        case 3:
          ccb = that.Blocks.BO;
          blockDirection = 0;        // 只有一个方向
          break;
        case 4:
          ccb = that.Blocks.BS;
          blockDirection = blockDirection % 2;
          break;
        case 5:
          ccb = that.Blocks.BZ;
          blockDirection = blockDirection % 2;
          break;
        default:
          ccb = that.Blocks.BT;
          break;
      }

      that.nextBlock.pd = blockDirection;
      that.nextBlock.d = blockDirection;
      that.nextBlock.color = blockColor;
      that.nextBlock.cb = ccb;

      var bs = that.nextBlock.cb[blockDirection].split('');
      var base = bs.length > 9 ? 4 : 3;

      that.nextBlock.x = base == 4 ? 4 : 5;

      for (var i = 0; i < bs.length; i++) {
        if (bs[i] == 1) {
          $('#nextblock ul li:eq(' + Math.floor(i / base) + ') span:eq(' + (i % base) + ')').addClass('nb ' + that.Colors[that.nextBlock.color]);
        }
      }
    },
    InitialMap: function () {  // 初始化/创建地图
      var that = this;
      $('.map').remove();

      $('body').append('<div class="map"><ul class="ulc"></ul></div>');

      var subMap = '';
      for (var i = 0; i < that.maxHeight; i++) {
        subMap += '<li>';
        for (var j = 0; j < that.maxWidth; j++) {
          subMap += '<span></span>';
        }
        subMap += '</li>';
      }
      $($('.ulc')[0]).append(subMap);
    },
    BindEvents: function () {  // 绑定事件
      var that = this;
      $(document).on('keydown', function (event) {
        if ((event.keyCode < 37 || event.keyCode > 40) && event.keyCode != 32) {
          return;
        }

        that.temp = that.CloneBlock(that.currentBlock);
        switch (event.keyCode) {
          case 32: // space  空格/按空格键,方块瞬间移到底部
            var isBottom = false;
            var cb = that.temp.cb[that.temp.d].split('');
            var base = cb.length > 9 ? 4 : 3;
            while (!isBottom) {
              for (var i = 0; i < cb.length; i++) {
                if (cb[i] == 1) {
                  var tempXLeft = that.temp.x + i % base;
                  var tempYTop = that.temp.y + 1 + Math.floor(i / base);

                  isBottom = isBottom || tempYTop >= that.maxHeight || $('.ulc li:eq(' + tempYTop + ') span:eq(' + tempXLeft + ')').hasClass('filled');
                }
              }
              if (!isBottom) {
                that.temp.y++;
              } else {
                isBottom = true;
              }
            }
            break;
          case 38: // top
            that.temp.d = (that.temp.d + 1) % that.currentBlock.cb.length;
            break;
          case 39: // right
            that.temp.x++;
            that.temp.pd = that.temp.d;
            break;
          case 40: // bottom
            that.temp.y++;
            that.temp.pd = that.temp.d;
            break;
          case 37: // 37 left
            that.temp.x--;
            that.temp.pd = that.temp.d;
        }

        that.DrawBlock();
      });

      that.close.on('click', function () {
        that.gameOver.fadeOut();
      });

      // 新游戏
      that.newGame.on('click', function () {
        that.newGame.blur();

        that.UnBindEvents();

        that.speed = that.oSpeed;

        that.score = 0;

        that.SetSpeed();

        that.ClearTimer();
        // 随机生成下一个方块
        that.CreateNextBlock();
        // 初始化地图
        that.InitialMap();

        that.start.html('Pause');
        // 设置方块
        that.SetBlock();
        // 绑定键盘事件
        that.BindEvents();
      });

      that.start.on('click', function () {
        that.start.blur();
        if ($(this).html() == 'Start') {
          $(this).html('Pause');
          that.StartTimer();
        } else {
          $(this).html('Start');
          that.ClearTimer();
        }
      });
    },
    SetSpeed: function () {
      var that = this;
      that.showSpeed.html('Speed:' + that.sSpeed);
      that.showScore.html('Score:' + that.score);
    },
    UnBindEvents: function () {  // 取消绑定事件
      var that = this;
      $(document).off('keydown');

      that.start.html('Start');
      that.start.off('click');
    },
    DrawBlock: function () {  // 画方块
      var that = this;
      var blockPosition = new Array();
      var cb = that.temp.cb[that.temp.d].split('');
      var base = cb.length > 9 ? 4 : 3;
      var isBottom = false;
      var isLeftRight = false;
      var isTop = false;
      var hasClass = false;
      for (var i = 0; i < cb.length; i++) {
        if (cb[i] == 1) {
          var tempXLeft = that.temp.x + i % base;
          var tempYTop = that.temp.y + Math.floor(i / base);

          isBottom = isBottom || tempYTop >= that.maxHeight || ($('.ulc li:eq(' + tempYTop + ') span:eq(' + tempXLeft + ')').hasClass('filled') && that.temp.y > that.currentBlock.y);
          hasClass = hasClass || $('.ulc li:eq(' + tempYTop + ') span:eq(' + tempXLeft + ')').hasClass('filled');

          isTop = isTop || tempYTop <= 0;

          isLeftRight = isLeftRight || tempXLeft < 0 || tempXLeft >= that.maxWidth;

          blockPosition.push([tempYTop, tempXLeft]);
        }
      }

      if (isBottom) {  // 判断方块是否已经到达底部,如果到达,则清除定时器.
        if (that.temp.d != that.temp.pd) {
          that.temp.d = that.temp.pd;
        } else {
          that.ClearTimer();
          if (isTop) {
            for (var i = 0; i < blockPosition.length; i++) {
              $('.ulc li:eq(' + blockPosition[i][0] + ') span:eq(' + blockPosition[i][1] + ')').addClass('tempBlock ' + that.Colors[that.currentBlock.color]);
            }

            that.result.html(that.showScore.html());
            that.gameOver.fadeIn();
            that.UnBindEvents();
          } else {
            that.SetBlock();
          }
        }
      } else if (hasClass) { //未到底部，但是碰到边上的方块
        if (that.temp.d != that.temp.pd) {
          that.temp.d = that.temp.pd;
        } else {
          that.temp.x = that.currentBlock.x;
        }
      } else if (isLeftRight) {
        that.temp = that.CloneBlock(that.currentBlock);
      } else {
        that.ClearCurrentBlock();
        that.currentBlock = that.CloneBlock(that.temp);

        for (var i = 0; i < blockPosition.length; i++) {
          $('.ulc li:eq(' + blockPosition[i][0] + ') span:eq(' + blockPosition[i][1] + ')').addClass('tempBlock ' + that.Colors[that.currentBlock.color]);
        }
      }
    },
    ClearCurrentBlock: function () {
      var that = this;
      $('.tempBlock').removeClass('tempBlock color-0 color-1 color-2 color-3 color-4 color-5 color-6');
    },
    DestroyLine: function () { //
      var that = this;
      var dlines = 0;
      $('.ulc li').each(function () {
        var self = this;
        var bs = that.maxWidth;
        $(self).find('span').each(function () {
          if ($(this).hasClass('filled')) {
            bs--;
          }
        });
        if (bs == 0) {
          that.ClearTimer();
          $(self).fadeOut(80, function () {
            $(self).fadeIn(80, function () {
              $(self).fadeOut(80, function () {
                $(self).fadeIn(80, function () {
                  $(self).fadeOut(80, function () {  // 销行时的闪烁效果
                    $(self).remove();
                    $(that.CreateLine()).insertBefore($('.ulc li:first-child'));
                    that.speed -= Math.floor(0.02 * that.speed); // 每销掉一行,速度快5%毫秒
                    that.sSpeed = that.oSpeed + 100 - that.speed;
                    that.score += (Math.floor(that.sSpeed / 100) + 1) * 100 * Math.pow(2, dlines);
                    that.SetSpeed();
                    that.StartTimer();
                    dlines++;
                  });
                });
              });
            });
          });
        }
      });
    },
    SetBlock: function () { // 到达底部或者碰到其他块的时候，需要固定方块
      var that = this;
      that.ClearTimer();
      $('.tempBlock').addClass('filled').removeClass('tempBlock');
      that.currentBlock = that.CloneBlock(that.nextBlock);
      that.temp = that.CloneBlock(that.currentBlock);
      that.StartTimer();
      that.CreateNextBlock();
      that.DestroyLine();
    },
    ClearTimer: function () {
      var that = this;
      clearInterval(that.timer);
    },
    StartTimer: function () {
      var that = this;
      clearInterval(that.timer);
      that.timer = setInterval(function () {
        that.temp.y++;
        that.DrawBlock();
      }, that.speed);
    },
    CloneBlock: function (from) { // 复制方块
      return $.extend(true, {}, from);
    },
    CreateLine: function () { // 销掉一行后,自动从上部再加入一行
      var that = this;
      var nl = '<li>';
      for (var i = 0; i < that.maxWidth; i++) {
        nl += '<span></span>';
      }
      nl += '</li>';
      return nl;
    }
  };

  tetris.Initial();
});

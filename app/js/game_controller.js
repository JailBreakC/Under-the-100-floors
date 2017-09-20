import './zepto-touch'

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(cb) {
  cb();
};

var GameController = function() {
  this.floorRate = [
    {
      name: 'normal',
      rate: 15,
    },
    {
      name: 'spring',
      rate: 15,
    },
    {
      name: 'weak',
      rate: 15,
    },
    {
      name: 'scroll-left',
      rate: 10,
    },
    {
      name: 'scroll-right',
      rate: 10,
    },
    {
      name: 'nail',
      rate: 35
    }
  ]

  this.fps = 60; //刷新频率
  this.speed = 50; // 卷轴初始速度
  this.maxSpeed = 350; // 卷轴最大速度
  this.gravity = 1000; // 重力加速度 px 每秒平方
  this.peopleVerticalSpeed = 200; // 人物横向移动速度
  this.animation = null;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.floorWidth = 0;
  this.floorHeight = 0;
  this.floorDeltaY = 50;
  this.floorScore = 1;
  this.blood = 12; // 人物血量
  this.$container = $('.container');
  this.$canvas = $('.game-canvas');
  this.$scroller = $('.scroller');
  this.$people = $('.people');
  this.peopleRotateZ = 0;
  this.peopleRotateDelta = 25; // 小球滚动角度
  this.peopleHeight = 0;
  this.peopleWidth = 0;
  this._t = 0; // 人物开始下落时间
  this._currentScrollerY = 0;
  this._currentPeopleY = 20;
  this._currentPeopleVertical = 0;
  this._floorScrollerY = 200;
  this._maxJumpDistance = 20;
  this._currentJumpDistance = 0;
  this._frameIndex = 0;
  this._v0 = 0; // 初始速度 px每秒

  this.checkFloorConfig();
}
  
GameController.prototype = {
  constructor: GameController,
  Events: [
    'gameover',
    'start',
    'rerun',
    'stop',
    'scoreupdate'
  ],
  // 事件机制，利用 Dom Event 来封装游戏状态事件
  on: function(event, fn) {
    if(this.Events.indexOf(event) === -1) {
      return
    }
    this.$container.on(event, fn);
  },
  //游戏结束
  gameover: function() {
    this.stop();
    setTimeout(function() {
      // 派发事件，以供外部调用
      this.$container.trigger('gameover');
      $('#game-ct').hide();
      $('.game-over').show();
    }.bind(this), 200);
  },
  checkFloorConfig: function() {
    var rangeArray = [0];
    var totalRate = 0;
    var config = this.floorRate;

    for(var i = 0; i < config.length; i++ ) {
      var _rate = config[i].rate;
      if(typeof _rate !== 'number') {
        throw new TypeError('rate type error');
      }
      totalRate += _rate;
      rangeArray.push(totalRate);
    }
    if(totalRate !== 100) {
      throw new RangeError('rate 加起来务必等于 100！');
    }

    this._floorRateArray = rangeArray;
  },
  getRandomFloor: function(rangeArray) {
    var dice = Math.random() * 100;
    for (var i = 0; i < rangeArray.length - 1; i++) {
      if (dice >= rangeArray[i] && dice < rangeArray[i + 1]) {
        return this.floorRate[i];
      }
    }
  },
  createFloorSpan: function() {
    //计算楼梯位置，200px 刚开始从距离顶部200px开始
    var _top = this._floorScrollerY += this.floorDeltaY,
      //楼梯横向位置随机出现
      _left = Math.random() * (this.canvasWidth - this.floorWidth);

    var floorConfig = this.getRandomFloor(this._floorRateArray);
    var floorElement = '<i class="floor '+ floorConfig.name + '"></i>';

    //随机新建楼梯，并添加到卷轴中去
    $(floorElement).css({
      top: _top,
      left: _left,
      width: this.floorWidth,
      height: this.floorHeight
    }).appendTo(this.$scroller);
  },
  removeFloorSpan: function() {
    $('.floor').eq(0).remove();
    this.floorScore++;
    this.updateScore();
  },
  updateBlood: function() {
    var $bloodEle = $('.blood i');
    for (var i = 0; i < $bloodEle.length; i++) {
      if (i < this.blood) {
        $bloodEle.eq(i).removeClass('lose');
      } else {
        $bloodEle.eq(i).addClass('lose');
      }
    }
  },
  updateScore: function() {
    this.$container.trigger('scoreupdate');
    $('.text-score').text(this.floorScore);    
  },
  loseBlood: function() {
    //当人物在平台上时，不重复扣血
    if (this.__onFloor) {
      return;
    }
    this.blood -= 4;
    //人变红
    this.$people.addClass('danger');
    setTimeout(function() {
      this.$people.removeClass('danger');
    }.bind(this), 1000);

    //背景闪烁
    $('#game-ct').addClass('danger')
    setTimeout(function() {
      $('#game-ct').removeClass('danger')
    }, 100);

    if (this.blood <= 0) {
      this.blood = 0;
      this.updateBlood();
      this.gameover();
      return;
    }
    this.updateBlood()
  },
  addBlood: function() {
    //当人物在平台上时，或者血量大于12，不重复加血
    if (this.__onFloor || this.blood >= 12) {
      return;
    }
    this.blood += 1;
    this.updateBlood()
  },
  floorNormal: function() {
    this.addBlood();
  },
  floorNail: function() {
    this.loseBlood();
  },
  floorWeak: function($floorEle) {
    this.addBlood();
    //短暂停留后，标记该元素可强行穿过
    setTimeout(function() {
      $floorEle.addClass('over');
      $floorEle[0].cross = true;
    }, 200);
  },
  floorScroll: function(direction) {
    this.addBlood();
    this.__floorScrollDirection = direction;
  },
  floorScrollEnd: function() {
    this.__floorScrollDirection = null;
  },
  floorSpring: function($floorEle) {
    this.__$currentJumpFloor = $floorEle;
    this.jumpStart();
    this.addBlood();
  },
  jumpStart: function() {
    this.__jumpMode = true;
    this.__$currentJumpFloor.addClass('up');
    setTimeout(function() {
      this.__$currentJumpFloor.removeClass('up');
    }.bind(this), 200);
  },
  jumpEnd: function(hitTop) {
    if (!this.__jumpMode) {
      return;
    }
    if (hitTop) {
      this.__$currentJumpFloor[0].cross = true;
    }
    //重置跳跃高度
    this._currentJumpDistance = 0;
    //解除跳跃
    this.__jumpMode = false;
  },
  people: function(fps) {
    // 每帧消耗时间 ms
    var dt = 1/fps;
    // 人物纵向每帧移动距离 △x = v0 * dt + (a * dt^2) / 2
    var _deltaPeopleY = this._v0 * dt + this.gravity * (dt) * (dt) / 2
    // 更新时间 t = t + dt;
    this._t += dt;
    // 更新速度 v = at;
    this._v0 = this.gravity * this._t;
    //卷轴纵向每帧移动距离
    var _deltaY = this.speed / fps;
    //人物横向每帧移动距离
    var _deltaPeopleVertical = this.peopleVerticalSpeed / fps;
    //缓存floor
    var $floor = $('.floor');
    //缓存offset
    var peopleOffset = this.$people.offset();

    //人物掉落屏幕下方，游戏结束
    if (peopleOffset.top > this.canvasHeight) {
      this.gameover();
      return
    }
    //碰撞检测
    for (var i = 0; i < $floor.length; i++) {
      //缓存offset
      var floorOffset = $floor.eq(i).offset();
      //人物与楼梯纵向距离
      var distanceGap = Math.abs(peopleOffset.top + this.peopleHeight - floorOffset.top);
      //当人物撞到顶部，掉血+掉落+打断跳跃
      if (peopleOffset.top <= _deltaPeopleY + _deltaY) {
        this._t = 0;
        this.__onFloor = false;
        this.jumpEnd(true);
        this.loseBlood();
        break;
      }
      //跳跃模式不进入检测
      if (!this.__jumpMode &&
        //元素不可直接穿过
        !$floor.eq(i)[0].cross &&
        //人物与楼梯纵向距离在一帧移动距离之内
        distanceGap <= _deltaPeopleY + _deltaY &&
        //人物横向距离不超过楼梯最左
        peopleOffset.left > floorOffset.left - this.peopleWidth &&
        //人物横向距离不超过楼梯最右
        peopleOffset.left < floorOffset.left + this.floorWidth) {
        //人物与楼梯偏差修正
        this._currentPeopleY = floorOffset.top - this.peopleHeight;
        //施加各类楼梯特殊属性
        if ($floor.eq(i).hasClass('normal')) {
          this.floorNormal();
        }
        if ($floor.eq(i).hasClass('nail')) {
          this.floorNail();
        }
        if ($floor.eq(i).hasClass('spring')) {
          this.floorSpring($floor.eq(i));
        }
        if ($floor.eq(i).hasClass('weak')) {
          this.floorWeak($floor.eq(i));
        }
        if ($floor.eq(i).hasClass('scroll-left')) {
          this.floorScroll('left');
        }
        if ($floor.eq(i).hasClass('scroll-right')) {
          this.floorScroll('right');
        }
        this._t = 0;
        this.__onFloor = true;
        break;
      }
      //当循环执行完毕，仍然没有发现碰撞，则表明人物不在平台上
      if (i === $floor.length - 1) {
        this.__onFloor = false;
      }
    }

    //人物向上跳起
    if (this.__jumpMode) {

      if (this._currentJumpDistance >= this._maxJumpDistance) {
        this.jumpEnd();
      } else {
        this._currentJumpDistance += _deltaPeopleY;
        //向上跳起效果要额外加上_deltaY，以匹配卷轴运动状态
        this._currentPeopleY -= _deltaPeopleY + _deltaY;
      }
    }

    //人物向下坠落 + 取消楼梯左右加速状态
    if (!this.__onFloor && !this.__jumpMode) {
      this.floorScrollEnd();
      this._currentPeopleY += _deltaPeopleY;
    }

    //横向运动预处理
    var __temp_deltaPeopleVertical = _deltaPeopleVertical;
    //处理人物向左运动
    if (this._peopleGoLeft) {
      if (this.__floorScrollDirection === 'left') {
        __temp_deltaPeopleVertical *= 1.5;
      }
      if (this.__floorScrollDirection === 'right') {
        __temp_deltaPeopleVertical *= 0.5;
      }

      if (this._currentPeopleVertical > 0) {
        this._currentPeopleVertical -= __temp_deltaPeopleVertical;
      }
    }
    //处理人物向右运动
    if (this._peopleGoRight) {
      if (this.__floorScrollDirection === 'left') {
        __temp_deltaPeopleVertical *= 0.5;
      }
      if (this.__floorScrollDirection === 'right') {
        __temp_deltaPeopleVertical *= 1.5;
      }

      if (this._currentPeopleVertical < this.canvasWidth - this.peopleWidth) {
        this._currentPeopleVertical += __temp_deltaPeopleVertical;
      }
    }
    //处理人物在滚动楼梯上的自动运动
    if (!this._peopleGoRight && !this._peopleGoLeft) {
      __temp_deltaPeopleVertical *= 0.5;
      if (this.__floorScrollDirection === 'left') {
        if (this._currentPeopleVertical > 0) {
          this._currentPeopleVertical -= __temp_deltaPeopleVertical;
        }

      }
      if (this.__floorScrollDirection === 'right') {
        if (this._currentPeopleVertical < this.canvasWidth - this.peopleWidth) {
          this._currentPeopleVertical += __temp_deltaPeopleVertical;
        }
      }
    }

    //更新人物视图
    this.peopleUpdateView();
  },
  //更新卷轴位置
  floorUpdateView: function() {
    if (Modernizr.csstransforms3d) {
      //设定卷轴位置, translate3d开启GPU加速
      this.$scroller.css({
        '-webkit-transform': 'translate3d(0, ' + this._currentScrollerY + 'px, 0)',
        '-ms-transform': 'translate3d(0, ' + this._currentScrollerY + 'px, 0)',
        'transform': 'translate3d(0, ' + this._currentScrollerY + 'px, 0)',
      });
    } else if (Modernizr.csstransforms) {
      //不支持translate3d 使用translateY
      this.$scroller.css({
        '-webkit-transform': 'translateY(' + this._currentScrollerY + 'px)',
        '-ms-transform': 'translateY(' + this._currentScrollerY + 'px)',
        'transform': 'translateY(' + this._currentScrollerY + 'px)',
      });
    } else {
      //还不支持，那就GG
      this.$scroller.css({
        'top': this._currentScrollerY + 'px',
      });
    }
  },
  //更新人物视图
  peopleUpdateView: function() {
    if (this.__onFloor) {
      if (this._peopleGoLeft) {
        this.peopleRotateZ -= this.peopleRotateDelta;
      }
      if (this._peopleGoRight) {
        this.peopleRotateZ += this.peopleRotateDelta;
      }
    }
    if (Modernizr.csstransforms3d) {
      //设定人物位置, translate3d开启GPU加速
      this.$people.css({
        '-webkit-transform': 'translate3d(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px ,0)',
        '-ms-transform': 'translate3d(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px ,0)',
        'transform': 'translate3d(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px ,0)',
      });
    } else if (Modernizr.csstransforms) {
      //不支持translate3d 使用translate
      this.$people.css({
        '-webkit-transform': 'translate(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px)',
        '-ms-transform': 'translate(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px)',
        'transform': 'translate(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px)',
      });
    } else {
      //还不支持，那就GG
      this.$people.css({
        'left': this._currentPeopleVertical + 'px',
        'top': this._currentPeopleY + 'px',
      });
    }
  },
  peopleUserController: function() {
    var _this = this;
    //监听按键按下，改变人物左右运动方向
    $(window).keydown(function(ev) {
      if (ev.key === 'ArrowRight') {
        _this._peopleGoRight = true;
        _this._peopleGoLeft = false; //预防按键同时按下的冲突情况 
        return;
      }
      if (ev.key === 'ArrowLeft') {
        _this._peopleGoRight = false; //预防按键同时按下的冲突情况
        _this._peopleGoLeft = true;
        return;
      }
      //按键弹起，取消该方向人物运动
    }).keyup(function(ev) {
      if (ev.key === 'ArrowRight') {
        _this._peopleGoRight = false;
        return;
      }
      if (ev.key === 'ArrowLeft') {
        _this._peopleGoLeft = false;
        return;
      }
    });

    $('.controller .left-ct').on('touchstart', function(ev) {
      _this._peopleGoRight = false; //预防按键同时按下的冲突情况 
      _this._peopleGoLeft = true;
      return false
    }).on('touchend', function(ev) {
      _this._peopleGoLeft = false;
    });

    $('.controller .right-ct').on('touchstart', function(ev) {
      _this._peopleGoRight = true;
      _this._peopleGoLeft = false; //预防按键同时按下的冲突情况
      return false
    }).on('touchend', function(ev) {
      _this._peopleGoRight = false;
    });

  },
  core: function(fps) {
    var _this = this,
      _deltaY = this.speed / fps, //卷轴纵向每帧移动距离
      $floor = $('.floor');

    //计算卷轴位置
    this._currentScrollerY -= _deltaY;

    //当卷轴超出一定长度之后，进行位置reset、缩减长度，防止Crash现象
    if (this._currentScrollerY <= -this.canvasHeight * 2) {
      //将卷轴滚动高度减小一屏
      this._currentScrollerY += this.canvasHeight;
      //将楼梯偏移高度减小一屏
      this._floorScrollerY -= this.canvasHeight;
      //重置现有楼梯位置
      for (var i = 0; i < $floor.length; i++) {
        $floor.eq(i).css({
          top: parseInt($('.floor').eq(i).css('top')) - this.canvasHeight
        })
      }
    }

    //更新卷轴位置
    this.floorUpdateView();

    //每个台阶移出视野则清除台阶，并且在底部增加一个新的台阶
    if ($floor.eq(0).offset().top <= -20) {
      this.createFloorSpan();
      this.removeFloorSpan();
    }

    //调用人物渲染
    this.people(fps);
    // 越来越high
    if (this.speed <= this.maxSpeed) {
      this.speed += 0.1;
    }

  },
  run: function(fps) {
    //不允许执行多个动画渲染函数（你想卡死么...
    if (this.animation) {
      console.error('Animation has aready in process, please do not run again!');
      return;
    }

    this._fps = fps = fps || 60;
    var looptime = 1000 / fps; //每帧间隔时间
    var _this = this;

    var runAnimation = function() {
      return setTimeout(function() {
        window.requestAnimationFrame(function() {
          _this.core(fps);
        });
        _this.animation = runAnimation();
      }, looptime);
    };
    //循环调用渲染函数，并把循环handle暴露出去，方便外部暂停动画
    return this.animation = runAnimation()
  },
  stop: function() {
    clearTimeout(this.animation); //暂停动画
    this.animation = undefined;
    this.$container.trigger('stop');
  },
  reRun: function() {
    this.$container.trigger('rerun');
    //重置参数
    $.extend(this, this.__paramBackup);
    //删掉现有楼梯
    $('.floor').remove();
    //重新初始化
    this.start();
  },
  backup: function() {
    //备份初始设置参数，用于游戏reset
    this.__paramBackup = {};
    for (var i in this) {
      if (typeof this[i] === 'number' || typeof this[i] === 'string') {
        this.__paramBackup[i] = this[i];
      }
    }
  },
  start: function() {
    var _this = this,
      floorLoop = 0;
    this.$container.trigger('start');
    // Modernizr.csstransforms3d = false;
    // Modernizr.csstransforms = false;
    //当视窗大小变动时，重新计算画布宽高
    this.canvasWidth = this.$canvas.width();
    this.canvasHeight = this.$canvas.height();
    this.floorDeltaY = this.canvasHeight / 11;
    this.floorWidth = this.canvasWidth / 5;
    this.floorHeight = this.floorWidth / 9;
    this.peopleHeight = parseInt(this.$people.css('height'));
    this.peopleWidth = parseInt(this.$people.css('width'));

    //人物位置预设
    this._currentPeopleVertical = this.canvasWidth / 2 + this.peopleWidth / 2;
    //备份初始参数
    this.backup();
    //初始化台阶
    while (floorLoop++ < 13) {
      this.createFloorSpan();
    }
    //初始化任务控制
    this.peopleUserController();
    //首次更新人物视图
    this.peopleUpdateView();
    //首次更新人物血量
    this.updateBlood();
    //首次更新楼层数
    this.updateScore();
    //以每秒60帧执行游戏动画
    this.run(this.fps);
  }
};

export default GameController;

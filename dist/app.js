/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _game_controller = __webpack_require__(2);

var _game_controller2 = _interopRequireDefault(_game_controller);

var _game_controller_canvas = __webpack_require__(4);

var _game_controller_canvas2 = _interopRequireDefault(_game_controller_canvas);

__webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tips = {
  fail: '弹簧梯子每次弹跳都会回血哦~',
  success: '恭喜你成为真男人！赶紧分享给小伙伴吧~'
};

var preloadImg = function preloadImg() {
  var imgList = ['/public/images/spring-up.png'];
  for (var i = 0; i < imgList.length; i++) {
    var _img = new Image();
    _img.src = imgList[i];
  }
};

$(function () {
  var gc;
  $('body').show();

  if (typeof _RENDERER !== 'undefined' && _RENDERER === 'canvas') {
    gc = new _game_controller_canvas2.default();
    setTimeout(function () {
      $('#start-game').trigger('click');
    });
  } else {
    gc = new _game_controller2.default();
  }

  gc.on('gameover', function (e) {
    $('#github-fork').show();
    $('title').text('老子' + gc.floorScore + '层! - 是男人就下100层');
    $('.text-score').text(gc.floorScore);

    if (gc.floorScore < 100) {
      $('.game-over .text-desc').text(tips.fail);
    } else {
      $('.game-over .text-desc').text(tips.success);
    }
    _czc.push(['_trackEvent', 'score', 'game', 'gameover', gc.floorScore]);
  });

  gc.on('start', function () {
    $('#github-fork').hide();
  });

  $('#start-game').on('click', function () {
    $('.game-intro').hide();
    $('#game-ct').show();
    gc.start();
  });

  $('#restart-game').on('click', function () {
    $('#game-ct').show();
    $('.game-over').hide();
    gc.reRun();
  });

  $('.share-btn').on('click', function () {
    alert('点击右上角分享给好友吧~');
  });

  preloadImg();
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(3);

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (cb) {
  cb();
};

var GameController = function GameController() {
  this.floorRate = [{
    name: 'normal',
    rate: 15
  }, {
    name: 'spring',
    rate: 15
  }, {
    name: 'weak',
    rate: 15
  }, {
    name: 'scroll-left',
    rate: 10
  }, {
    name: 'scroll-right',
    rate: 10
  }, {
    name: 'nail',
    rate: 35
  }];

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
};

GameController.prototype = {
  constructor: GameController,
  Events: ['gameover', 'start', 'rerun', 'stop', 'scoreupdate'],
  // 事件机制，利用 Dom Event 来封装游戏状态事件
  on: function on(event, fn) {
    if (this.Events.indexOf(event) === -1) {
      return;
    }
    this.$container.on(event, fn);
  },
  //游戏结束
  gameover: function gameover() {
    this.stop();
    setTimeout(function () {
      // 派发事件，以供外部调用
      this.$container.trigger('gameover');
      $('#game-ct').hide();
      $('.game-over').show();
    }.bind(this), 200);
  },
  checkFloorConfig: function checkFloorConfig() {
    var rangeArray = [0];
    var totalRate = 0;
    var config = this.floorRate;

    for (var i = 0; i < config.length; i++) {
      var _rate = config[i].rate;
      if (typeof _rate !== 'number') {
        throw new TypeError('rate type error');
      }
      totalRate += _rate;
      rangeArray.push(totalRate);
    }
    if (totalRate !== 100) {
      throw new RangeError('rate 加起来务必等于 100！');
    }

    this._floorRateArray = rangeArray;
  },
  getRandomFloor: function getRandomFloor(rangeArray) {
    var dice = Math.random() * 100;
    for (var i = 0; i < rangeArray.length - 1; i++) {
      if (dice >= rangeArray[i] && dice < rangeArray[i + 1]) {
        return this.floorRate[i];
      }
    }
  },
  createFloorSpan: function createFloorSpan() {
    //计算楼梯位置，200px 刚开始从距离顶部200px开始
    var _top = this._floorScrollerY += this.floorDeltaY,

    //楼梯横向位置随机出现
    _left = Math.random() * (this.canvasWidth - this.floorWidth);

    var floorConfig = this.getRandomFloor(this._floorRateArray);
    var floorElement = '<i class="floor ' + floorConfig.name + '"></i>';

    //随机新建楼梯，并添加到卷轴中去
    $(floorElement).css({
      top: _top,
      left: _left,
      width: this.floorWidth,
      height: this.floorHeight
    }).appendTo(this.$scroller);
  },
  removeFloorSpan: function removeFloorSpan() {
    $('.floor').eq(0).remove();
    this.floorScore++;
    this.updateScore();
  },
  updateBlood: function updateBlood() {
    var $bloodEle = $('.blood i');
    for (var i = 0; i < $bloodEle.length; i++) {
      if (i < this.blood) {
        $bloodEle.eq(i).removeClass('lose');
      } else {
        $bloodEle.eq(i).addClass('lose');
      }
    }
  },
  updateScore: function updateScore() {
    this.$container.trigger('scoreupdate');
    $('.text-score').text(this.floorScore);
  },
  loseBlood: function loseBlood() {
    //当人物在平台上时，不重复扣血
    if (this.__onFloor) {
      return;
    }
    this.blood -= 4;
    //人变红
    this.$people.addClass('danger');
    setTimeout(function () {
      this.$people.removeClass('danger');
    }.bind(this), 1000);

    //背景闪烁
    $('#game-ct').addClass('danger');
    setTimeout(function () {
      $('#game-ct').removeClass('danger');
    }, 100);

    if (this.blood <= 0) {
      this.blood = 0;
      this.updateBlood();
      this.gameover();
      return;
    }
    this.updateBlood();
  },
  addBlood: function addBlood() {
    //当人物在平台上时，或者血量大于12，不重复加血
    if (this.__onFloor || this.blood >= 12) {
      return;
    }
    this.blood += 1;
    this.updateBlood();
  },
  floorNormal: function floorNormal() {
    this.addBlood();
  },
  floorNail: function floorNail() {
    this.loseBlood();
  },
  floorWeak: function floorWeak($floorEle) {
    this.addBlood();
    //短暂停留后，标记该元素可强行穿过
    setTimeout(function () {
      $floorEle.addClass('over');
      $floorEle[0].cross = true;
    }, 200);
  },
  floorScroll: function floorScroll(direction) {
    this.addBlood();
    this.__floorScrollDirection = direction;
  },
  floorScrollEnd: function floorScrollEnd() {
    this.__floorScrollDirection = null;
  },
  floorSpring: function floorSpring($floorEle) {
    this.__$currentJumpFloor = $floorEle;
    this.jumpStart();
    this.addBlood();
  },
  jumpStart: function jumpStart() {
    this.__jumpMode = true;
    this.__$currentJumpFloor.addClass('up');
    setTimeout(function () {
      this.__$currentJumpFloor.removeClass('up');
    }.bind(this), 200);
  },
  jumpEnd: function jumpEnd(hitTop) {
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
  people: function people(fps) {
    // 每帧消耗时间 ms
    var dt = 1 / fps;
    // 人物纵向每帧移动距离 △x = v0 * dt + (a * dt^2) / 2
    var _deltaPeopleY = this._v0 * dt + this.gravity * dt * dt / 2;
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
      return;
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
  floorUpdateView: function floorUpdateView() {
    if (Modernizr.csstransforms3d) {
      //设定卷轴位置, translate3d开启GPU加速
      this.$scroller.css({
        '-webkit-transform': 'translate3d(0, ' + this._currentScrollerY + 'px, 0)',
        '-ms-transform': 'translate3d(0, ' + this._currentScrollerY + 'px, 0)',
        'transform': 'translate3d(0, ' + this._currentScrollerY + 'px, 0)'
      });
    } else if (Modernizr.csstransforms) {
      //不支持translate3d 使用translateY
      this.$scroller.css({
        '-webkit-transform': 'translateY(' + this._currentScrollerY + 'px)',
        '-ms-transform': 'translateY(' + this._currentScrollerY + 'px)',
        'transform': 'translateY(' + this._currentScrollerY + 'px)'
      });
    } else {
      //还不支持，那就GG
      this.$scroller.css({
        'top': this._currentScrollerY + 'px'
      });
    }
  },
  //更新人物视图
  peopleUpdateView: function peopleUpdateView() {
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
        'transform': 'translate3d(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px ,0)'
      });
    } else if (Modernizr.csstransforms) {
      //不支持translate3d 使用translate
      this.$people.css({
        '-webkit-transform': 'translate(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px)',
        '-ms-transform': 'translate(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px)',
        'transform': 'translate(' + this._currentPeopleVertical + 'px , ' + this._currentPeopleY + 'px)'
      });
    } else {
      //还不支持，那就GG
      this.$people.css({
        'left': this._currentPeopleVertical + 'px',
        'top': this._currentPeopleY + 'px'
      });
    }
  },
  peopleUserController: function peopleUserController() {
    var _this = this;
    //监听按键按下，改变人物左右运动方向
    $(window).keydown(function (ev) {
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
    }).keyup(function (ev) {
      if (ev.key === 'ArrowRight') {
        _this._peopleGoRight = false;
        return;
      }
      if (ev.key === 'ArrowLeft') {
        _this._peopleGoLeft = false;
        return;
      }
    });

    $('.controller .left-ct').on('touchstart', function (ev) {
      _this._peopleGoRight = false; //预防按键同时按下的冲突情况 
      _this._peopleGoLeft = true;
      return false;
    }).on('touchend', function (ev) {
      _this._peopleGoLeft = false;
    });

    $('.controller .right-ct').on('touchstart', function (ev) {
      _this._peopleGoRight = true;
      _this._peopleGoLeft = false; //预防按键同时按下的冲突情况
      return false;
    }).on('touchend', function (ev) {
      _this._peopleGoRight = false;
    });
  },
  core: function core(fps) {
    var _this = this,
        _deltaY = this.speed / fps,
        //卷轴纵向每帧移动距离
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
        });
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
  run: function run(fps) {
    //不允许执行多个动画渲染函数（你想卡死么...
    if (this.animation) {
      console.error('Animation has aready in process, please do not run again!');
      return;
    }

    this._fps = fps = fps || 60;
    var looptime = 1000 / fps; //每帧间隔时间
    var _this = this;

    var runAnimation = function runAnimation() {
      return setTimeout(function () {
        window.requestAnimationFrame(function () {
          _this.core(fps);
        });
        _this.animation = runAnimation();
      }, looptime);
    };
    //循环调用渲染函数，并把循环handle暴露出去，方便外部暂停动画
    return this.animation = runAnimation();
  },
  stop: function stop() {
    clearTimeout(this.animation); //暂停动画
    this.animation = undefined;
    this.$container.trigger('stop');
  },
  reRun: function reRun() {
    this.$container.trigger('rerun');
    //重置参数
    $.extend(this, this.__paramBackup);
    //删掉现有楼梯
    $('.floor').remove();
    //重新初始化
    this.start();
  },
  backup: function backup() {
    //备份初始设置参数，用于游戏reset
    this.__paramBackup = {};
    for (var i in this) {
      if (typeof this[i] === 'number' || typeof this[i] === 'string') {
        this.__paramBackup[i] = this[i];
      }
    }
  },
  start: function start() {
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

exports.default = GameController;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  var touch = {},
      touchTimeout,
      tapTimeout,
      swipeTimeout,
      longTapTimeout,
      longTapDelay = 750,
      gesture;

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? 'Left' : 'Right' : y1 - y2 > 0 ? 'Up' : 'Down';
  }

  function longTap() {
    longTapTimeout = null;
    if (touch.last) {
      touch.el.trigger('longTap');
      touch = {};
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout);
    longTapTimeout = null;
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout);
    if (tapTimeout) clearTimeout(tapTimeout);
    if (swipeTimeout) clearTimeout(swipeTimeout);
    if (longTapTimeout) clearTimeout(longTapTimeout);
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
    touch = {};
  }

  function isPrimaryTouch(event) {
    return (event.pointerType == 'touch' || event.pointerType == event.MSPOINTER_TYPE_TOUCH) && event.isPrimary;
  }

  function isPointerEventType(e, type) {
    return e.type == 'pointer' + type || e.type.toLowerCase() == 'mspointer' + type;
  }

  $(document).ready(function () {
    var now,
        delta,
        deltaX = 0,
        deltaY = 0,
        firstTouch,
        _isPointerType;

    if ('MSGesture' in window) {
      gesture = new MSGesture();
      gesture.target = document.body;
    }

    $(document).bind('MSGestureEnd', function (e) {
      var swipeDirectionFromVelocity = e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
      if (swipeDirectionFromVelocity) {
        touch.el.trigger('swipe');
        touch.el.trigger('swipe' + swipeDirectionFromVelocity);
      }
    }).on('touchstart MSPointerDown pointerdown', function (e) {
      if ((_isPointerType = isPointerEventType(e, 'down')) && !isPrimaryTouch(e)) return;
      firstTouch = _isPointerType ? e : e.touches[0];
      if (e.touches && e.touches.length === 1 && touch.x2) {
        // Clear out touch movement data if we have it sticking around
        // This can occur if touchcancel doesn't fire due to preventDefault, etc.
        touch.x2 = undefined;
        touch.y2 = undefined;
      }
      now = Date.now();
      delta = now - (touch.last || now);
      touch.el = $('tagName' in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);
      touchTimeout && clearTimeout(touchTimeout);
      touch.x1 = firstTouch.pageX;
      touch.y1 = firstTouch.pageY;
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
      touch.last = now;
      longTapTimeout = setTimeout(longTap, longTapDelay);
      // adds the current touch contact for IE gesture recognition
      if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
    }).on('touchmove MSPointerMove pointermove', function (e) {
      if ((_isPointerType = isPointerEventType(e, 'move')) && !isPrimaryTouch(e)) return;
      firstTouch = _isPointerType ? e : e.touches[0];
      cancelLongTap();
      touch.x2 = firstTouch.pageX;
      touch.y2 = firstTouch.pageY;

      deltaX += Math.abs(touch.x1 - touch.x2);
      deltaY += Math.abs(touch.y1 - touch.y2);
    }).on('touchend MSPointerUp pointerup', function (e) {
      if ((_isPointerType = isPointerEventType(e, 'up')) && !isPrimaryTouch(e)) return;
      cancelLongTap();

      // swipe
      if (touch.x2 && Math.abs(touch.x1 - touch.x2) > 30 || touch.y2 && Math.abs(touch.y1 - touch.y2) > 30) swipeTimeout = setTimeout(function () {
        if (touch.el) {
          touch.el.trigger('swipe');
          touch.el.trigger('swipe' + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2));
        }
        touch = {};
      }, 0);

      // normal tap
      else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function () {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap');
              event.cancelTouch = cancelAll;
              // [by paper] fix -> "TypeError: 'undefined' is not an object (evaluating 'touch.el.trigger'), when double tap
              if (touch.el) touch.el.trigger(event);

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap');
                touch = {};
              }

              // trigger single tap after 250ms of inactivity
              else {
                  touchTimeout = setTimeout(function () {
                    touchTimeout = null;
                    if (touch.el) touch.el.trigger('singleTap');
                    touch = {};
                  }, 250);
                }
            }, 0);
          } else {
            touch = {};
          }
      deltaX = deltaY = 0;
    })
    // when the browser window loses focus,
    // for example when a modal dialog is shown,
    // cancel all ongoing events
    .on('touchcancel MSPointerCancel pointercancel', cancelAll);

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll);
  });['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function (eventName) {
    $.fn[eventName] = function (callback) {
      return this.on(eventName, callback);
    };
  });
})(Zepto);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(3);

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (cb) {
  cb();
};

var GameController = function GameController() {
  this.floorRate = [{
    name: 'normal',
    rate: 15
  }, {
    name: 'spring',
    rate: 15
  }, {
    name: 'weak',
    rate: 15
  }, {
    name: 'scroll-left',
    rate: 10
  }, {
    name: 'scroll-right',
    rate: 10
  }, {
    name: 'nail',
    rate: 35
  }];

  this._floorpool = [];

  this.imgList = {
    springUp: '/public/images/spring-up.png',
    nail: '/public/images/nail.png',
    normal: '/public/images/normal.png',
    scrollLeft: '/public/images/scroll-left.png',
    scrollRight: '/public/images/scroll-right.png',
    springNormal: '/public/images/spring-normal.png',
    weakLeft: '/public/images/weak-left.png',
    weakRight: '/public/images/weak-right.png'
  };

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
  this.canvas = $('.game-canvas')[0];
  this.peopleRotateZ = 0;
  this.peopleRotateDelta = 25; // 小球滚动角度
  this.peopleHeight = 0;
  this.peopleWidth = 0;
  this._t = 0; // 人物开始下落时间
  this._currentScrollerY = 0;
  this._currentPeopleY = 20;
  this._currentPeopleX = 0;
  this._floorScrollerY = 200;
  this._maxJumpDistance = 20;
  this._currentJumpDistance = 0;
  this._frameIndex = 0;
  this._v0 = 0; // 初始速度 px每秒

  this.canvas.width = $('#game-ct').width();
  this.canvas.height = $('#game-ct').height();

  this.checkFloorConfig();
  this.loadImages();
};

GameController.prototype = {
  constructor: GameController,
  Events: ['gameover', 'start', 'rerun', 'stop', 'scoreupdate'],
  // 事件机制，利用 Dom Event 来封装游戏状态事件
  on: function on(event, fn) {
    if (this.Events.indexOf(event) === -1) {
      return;
    }
    this.$container.on(event, fn);
  },
  loadImages: function loadImages() {
    this.imgObj = {};
    for (var key in this.imgList) {
      var img = new Image();
      img.src = this.imgList[key];
      this.imgObj[key] = img;
    }
  },
  //游戏结束
  gameover: function gameover() {
    this.stop();
    setTimeout(function () {
      // 派发事件，以供外部调用
      this.$container.trigger('gameover');
      $('#game-ct').hide();
      $('.game-over').show();
    }.bind(this), 200);
  },
  checkFloorConfig: function checkFloorConfig() {
    var rangeArray = [0];
    var totalRate = 0;
    var config = this.floorRate;

    for (var i = 0; i < config.length; i++) {
      var _rate = config[i].rate;
      if (typeof _rate !== 'number') {
        throw new TypeError('rate type error');
      }
      totalRate += _rate;
      rangeArray.push(totalRate);
    }
    if (totalRate !== 100) {
      throw new RangeError('rate 加起来务必等于 100！');
    }

    this._floorRateArray = rangeArray;
  },
  getRandomFloor: function getRandomFloor(rangeArray) {
    var dice = Math.random() * 100;
    for (var i = 0; i < rangeArray.length - 1; i++) {
      if (dice >= rangeArray[i] && dice < rangeArray[i + 1]) {
        return this.floorRate[i];
      }
    }
  },
  createFloorSpan: function createFloorSpan(y) {
    //楼梯横向位置随机出现
    var x = Math.random() * (this.canvasWidth - this.floorWidth);

    var floorConfig = this.getRandomFloor(this._floorRateArray);
    var floorElement = {
      width: this.floorWidth,
      height: this.floorHeight,
      x: x,
      y: y,
      name: floorConfig.name
    };

    this._floorpool.push(floorElement);
  },
  drawFloor: function drawFloor() {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._floorpool.map(function (floor) {
      switch (floor.name) {
        case 'normal':
          var img = this.imgObj['normal'];
          this.ctx.drawImage(img, floor.x, floor.y, this.floorWidth, this.floorHeight);
          break;
        case 'spring':
          var img = this.imgObj['springNormal'];
          this.ctx.drawImage(img, floor.x, floor.y, this.floorWidth, this.floorHeight);
          break;
        case 'nail':
          var img = this.imgObj['nail'];
          var overRate = 32 / 140;
          var height = this.floorWidth * overRate;
          var deltaY = height - this.floorHeight;
          this.ctx.drawImage(img, floor.x, floor.y - deltaY, this.floorWidth, height);
          break;
        case 'scroll-left':
          var img = this.imgObj['scrollLeft'];
          this.ctx.drawImage(img, 0, 0, 140 * 1, 20, floor.x, floor.y, this.floorWidth, this.floorHeight);
          break;
        case 'scroll-right':
          var img = this.imgObj['scrollRight'];
          this.ctx.drawImage(img, 0, 0, 140 * 1, 20, floor.x, floor.y, this.floorWidth, this.floorHeight);
          break;
        case 'weak':
          var imgLeft = this.imgObj['weakLeft'];
          var imgRight = this.imgObj['weakRight'];
          var width = 144 / 140 * this.floorWidth / 2;
          this.ctx.drawImage(imgLeft, floor.x, floor.y, width, this.floorHeight);
          this.ctx.drawImage(imgRight, floor.x + this.floorWidth - width, floor.y, width, this.floorHeight);
          break;
      }
    }.bind(this));
  },
  initFloor: function initFloor() {
    var floorLoop = 0;
    var y = this._floorScrollerY;
    while (floorLoop++ < 13) {
      this.createFloorSpan(y);
      y += this.floorDeltaY;
    }
    this.drawFloor();
  },
  //更新楼梯位置
  floorUpdateView: function floorUpdateView(deltaY) {
    this._floorpool = this._floorpool.reduce(function (pre, cur) {
      // 顶部楼梯离开视野，删除楼梯
      if (cur.y - deltaY >= -this.floorHeight) {
        cur.y -= deltaY;
        pre.push(cur);
      } else {
        this.floorScore++;
        this.updateScore();
      }
      return pre;
    }.bind(this), []);
    // 增加新楼梯
    if (this._floorpool.length === 12) {
      var lastY = this._floorpool[11].y + this.floorDeltaY;
      this.createFloorSpan(lastY);
    }
    this.drawFloor();
  },
  updateBlood: function updateBlood() {
    var $bloodEle = $('.blood i');
    for (var i = 0; i < $bloodEle.length; i++) {
      if (i < this.blood) {
        $bloodEle.eq(i).removeClass('lose');
      } else {
        $bloodEle.eq(i).addClass('lose');
      }
    }
  },
  updateScore: function updateScore() {
    this.$container.trigger('scoreupdate');
    $('.text-score').text(this.floorScore);
  },
  loseBlood: function loseBlood() {
    //当人物在平台上时，不重复扣血
    if (this.__onFloor) {
      return;
    }
    this.blood -= 4;
    //人变红
    this.peopleDanger = true;
    setTimeout(function () {
      this.peopleDanger = false;
    }.bind(this), 1000);

    //背景闪烁
    $('#game-ct').addClass('danger');
    setTimeout(function () {
      $('#game-ct').removeClass('danger');
    }, 100);

    if (this.blood <= 0) {
      this.blood = 0;
      this.updateBlood();
      this.gameover();
      return;
    }
    this.updateBlood();
  },
  addBlood: function addBlood() {
    //当人物在平台上时，或者血量大于12，不重复加血
    if (this.__onFloor || this.blood >= 12) {
      return;
    }
    this.blood += 1;
    this.updateBlood();
  },
  floorNormal: function floorNormal() {
    this.addBlood();
  },
  floorNail: function floorNail() {
    this.loseBlood();
  },
  floorWeak: function floorWeak(floor) {
    this.addBlood();
    //短暂停留后，标记该元素可强行穿过
    setTimeout(function () {
      floor.over = true;
      floor.cross = true;
    }, 200);
  },
  floorScroll: function floorScroll(direction) {
    this.addBlood();
    this.__floorScrollDirection = direction;
  },
  floorScrollEnd: function floorScrollEnd() {
    this.__floorScrollDirection = null;
  },
  floorSpring: function floorSpring(floor) {
    this._currentJumpFloor = floor;
    this.jumpStart();
    this.addBlood();
  },
  jumpStart: function jumpStart() {
    this.__jumpMode = true;
    this._currentJumpFloor.up = true;
    setTimeout(function () {
      this._currentJumpFloor.up = false;
    }.bind(this), 200);
  },
  jumpEnd: function jumpEnd(hitTop) {
    if (!this.__jumpMode) {
      return;
    }
    if (hitTop) {
      this._currentJumpFloor.cross = true;
    }
    //重置跳跃高度
    this._currentJumpDistance = 0;
    //解除跳跃
    this.__jumpMode = false;
  },
  people: function people(fps) {
    // 每帧消耗时间 ms
    var dt = 1 / fps;
    // 人物纵向每帧移动距离 △x = v0 * dt + (a * dt^2) / 2
    var _deltaPeopleY = this._v0 * dt + this.gravity * dt * dt / 2;
    // 更新时间 t = t + dt;
    this._t += dt;
    // 更新速度 v = at;
    this._v0 = this.gravity * this._t;
    //卷轴纵向每帧移动距离
    var _deltaY = this.speed / fps;
    //人物横向每帧移动距离
    var _deltaPeopleVertical = this.peopleVerticalSpeed / fps;

    //人物掉落屏幕下方，游戏结束
    if (this._currentPeopleY > this.canvasHeight) {
      this.gameover();
      return;
    }
    //碰撞检测
    for (var index = 0; index < this._floorpool.length; index++) {
      var floor = this._floorpool[index];
      //人物与楼梯纵向距离
      var distanceGap = Math.abs(this._currentPeopleY + this.peopleHeight - floor.y);
      //当人物撞到顶部，掉血+掉落+打断跳跃
      if (this._currentPeopleY <= _deltaPeopleY + _deltaY) {
        this._t = 0;
        this.__onFloor = false;
        this.jumpEnd(true);
        this.loseBlood();
        break;
      }
      //跳跃模式不进入检测
      if (!this.__jumpMode &&
      //元素不可直接穿过
      !floor.cross &&
      //人物与楼梯纵向距离在一帧移动距离之内
      distanceGap <= _deltaPeopleY + _deltaY &&
      //人物横向距离不超过楼梯最左
      this._currentPeopleX > floor.x - this.peopleWidth &&
      //人物横向距离不超过楼梯最右
      this._currentPeopleX < floor.x + this.floorWidth) {
        //人物与楼梯偏差修正
        this._currentPeopleY = floor.y - this.peopleHeight;
        //施加各类楼梯特殊属性
        if (floor.name === 'normal') {
          this.floorNormal();
        }
        if (floor.name === 'nail') {
          this.floorNail();
        }
        if (floor.name === 'spring') {
          this.floorSpring(floor);
        }
        if (floor.name === 'weak') {
          this.floorWeak(floor);
        }
        if (floor.name === 'scroll-left') {
          this.floorScroll('left');
        }
        if (floor.name === 'scroll-right') {
          this.floorScroll('right');
        }
        this._t = 0;
        this.__onFloor = true;
        break;
      }
      //当循环执行完毕，仍然没有发现碰撞，则表明人物不在平台上
      if (index === this._floorpool.length - 1) {
        this.__onFloor = false;
      }
    };

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

      if (this._currentPeopleX > 0) {
        this._currentPeopleX -= __temp_deltaPeopleVertical;
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

      if (this._currentPeopleX < this.canvasWidth - this.peopleWidth) {
        this._currentPeopleX += __temp_deltaPeopleVertical;
      }
    }
    //处理人物在滚动楼梯上的自动运动
    if (!this._peopleGoRight && !this._peopleGoLeft) {
      __temp_deltaPeopleVertical *= 0.5;
      if (this.__floorScrollDirection === 'left') {
        if (this._currentPeopleX > 0) {
          this._currentPeopleX -= __temp_deltaPeopleVertical;
        }
      }
      if (this.__floorScrollDirection === 'right') {
        if (this._currentPeopleX < this.canvasWidth - this.peopleWidth) {
          this._currentPeopleX += __temp_deltaPeopleVertical;
        }
      }
    }

    //更新人物视图
    this.peopleUpdateView();
  },
  //更新人物视图
  peopleUpdateView: function peopleUpdateView() {
    if (this.__onFloor) {
      if (this._peopleGoLeft) {
        this.peopleRotateZ -= this.peopleRotateDelta;
      }
      if (this._peopleGoRight) {
        this.peopleRotateZ += this.peopleRotateDelta;
      }
    }

    ctx.beginPath();
    this.ctx.arc(this._currentPeopleX + this.peopleWidth / 2, this._currentPeopleY + this.peopleHeight / 2, parseInt(this.peopleWidth / 2), 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#00acff";
    this.ctx.fill();
  },
  peopleUserController: function peopleUserController() {
    var _this = this;
    //监听按键按下，改变人物左右运动方向
    $(window).keydown(function (ev) {
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
    }).keyup(function (ev) {
      if (ev.key === 'ArrowRight') {
        _this._peopleGoRight = false;
        return;
      }
      if (ev.key === 'ArrowLeft') {
        _this._peopleGoLeft = false;
        return;
      }
    });

    $('.controller .left-ct').on('touchstart', function (ev) {
      _this._peopleGoRight = false; //预防按键同时按下的冲突情况 
      _this._peopleGoLeft = true;
      return false;
    }).on('touchend', function (ev) {
      _this._peopleGoLeft = false;
    });

    $('.controller .right-ct').on('touchstart', function (ev) {
      _this._peopleGoRight = true;
      _this._peopleGoLeft = false; //预防按键同时按下的冲突情况
      return false;
    }).on('touchend', function (ev) {
      _this._peopleGoRight = false;
    });
  },
  core: function core(fps) {
    var _this = this,
        deltaY = this.speed / fps; //卷轴纵向每帧移动距离

    //更新楼梯位置
    this.floorUpdateView(deltaY);

    //调用人物渲染
    this.people(fps);
    // 越来越high
    if (this.speed <= this.maxSpeed) {
      this.speed += 0.1;
    }
  },
  run: function run(fps) {
    //不允许执行多个动画渲染函数（你想卡死么...
    if (this.animation) {
      console.error('Animation has aready in process, please do not run again!');
      return;
    }

    this._fps = fps = fps || 60;
    var looptime = 1000 / fps; //每帧间隔时间
    var _this = this;

    var runAnimation = function runAnimation() {
      return setTimeout(function () {
        window.requestAnimationFrame(function () {
          _this.core(fps);
        });
        _this.animation = runAnimation();
      }, looptime);
    };
    //循环调用渲染函数，并把循环handle暴露出去，方便外部暂停动画
    return this.animation = runAnimation();
  },
  stop: function stop() {
    clearTimeout(this.animation); //暂停动画
    this.animation = undefined;
    this.$container.trigger('stop');
  },
  reRun: function reRun() {
    this.$container.trigger('rerun');
    //重置参数
    $.extend(this, this.__paramBackup);
    //删掉现有楼梯
    this._floorpool = [];
    //重新初始化
    this.start();
  },
  backup: function backup() {
    //备份初始设置参数，用于游戏reset
    this.__paramBackup = {};
    for (var i in this) {
      if (typeof this[i] === 'number' || typeof this[i] === 'string') {
        this.__paramBackup[i] = this[i];
      }
    }
  },
  start: function start() {
    var _this2 = this;

    var _this = this;

    this.$container.trigger('start');
    // Modernizr.csstransforms3d = false;
    // Modernizr.csstransforms = false;
    //当视窗大小变动时，重新计算画布宽高
    this.canvas.width = $('#game-ct').width();
    this.canvas.height = $('#game-ct').height() - 170;
    window.ctx = this.ctx = this.canvas.getContext('2d');

    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.floorDeltaY = this.canvasHeight / 11;
    this.floorWidth = this.canvasWidth / 5;
    this.floorHeight = this.floorWidth / 7;
    this.peopleHeight = 15;
    this.peopleWidth = 15;

    //人物位置预设
    this._currentPeopleX = this.canvasWidth / 2 + this.peopleWidth / 2;
    //备份初始参数
    this.backup();
    //初始化台阶
    setTimeout(function () {
      _this2.initFloor();
      //初始化任务控制
      _this2.peopleUserController();
      //首次更新人物视图
      _this2.peopleUpdateView();
      // //首次更新人物血量
      _this2.updateBlood();
      //首次更新楼层数
      _this2.updateScore();
      // //以每秒60帧执行游戏动画
      _this2.run(_this2.fps);
    }, 100);
  }
};

exports.default = GameController;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(8)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/.0.28.7@css-loader/index.js!../../node_modules/.4.0.5@less-loader/dist/cjs.js!./style.less", function() {
			var newContent = require("!!../../node_modules/.0.28.7@css-loader/index.js!../../node_modules/.4.0.5@less-loader/dist/cjs.js!./style.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(7)(undefined);
// imports


// module
exports.push([module.i, "[title=\"站长统计\"] {\n  display: none!important;\n}\n* {\n  -webkit-tap-highlight-color: transparent;\n}\nhtml,\nbody {\n  position: relative;\n  height: 100%;\n}\nbody {\n  max-width: 500px;\n  margin: auto;\n  background: url('/public/images/bg.jpg') no-repeat center center;\n  background-size: cover;\n}\n#game-ct {\n  display: none;\n  height: 100%;\n  background: url('/public/images/bg-cover.png') no-repeat center center;\n  background-size: cover;\n  padding-bottom: 170px;\n  box-sizing: border-box;\n  position: relative;\n}\n#game-ct:after {\n  content: ' ';\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 14px;\n  width: 100%;\n  background: url('/public/images/top-nail.png') repeat-x left top;\n  background-size: auto 100%;\n}\n#game-ct:before {\n  content: ' ';\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  background-color: transparent;\n  pointer-events: none;\n  transition: background-color 0.1s ease;\n}\n#game-ct.danger:before {\n  background-color: rgba(255, 0, 0, 0.3);\n}\n.game-intro .index-text-img {\n  display: block;\n  width: 45%;\n  margin: 139px auto 0;\n}\n.game-intro .text-desc {\n  text-align: center;\n  color: #7179da;\n  margin-top: 50px;\n  font-size: 14px;\n}\n.bottom-btn-ct {\n  position: absolute;\n  width: 100%;\n  bottom: 67px;\n}\n.bottom-btn-ct .start-btn {\n  background: #ECFF00;\n  border-radius: 100px;\n  margin: 0 25px;\n  font-size: 18px;\n  color: #16142E;\n  height: 48px;\n  line-height: 48px;\n  text-align: center;\n  cursor: pointer;\n}\n.bottom-btn-ct .start-btn:active {\n  background: #bdcc00;\n  transform: translateY(3px);\n}\n.game-over {\n  text-align: center;\n  display: none;\n}\n.game-over .text-gameover {\n  margin-top: 103px;\n  font-family: 'Roboto Condensed';\n  font-size: 48px;\n  color: #3945E6;\n}\n.game-over .text-score-title {\n  font-family: 'Roboto Condensed';\n  margin-top: 30px;\n  font-size: 12px;\n  color: #4F5BFF;\n}\n.game-over .text-score {\n  font-family: 'Roboto Condensed';\n  font-size: 100px;\n  color: #FFFFFF;\n}\n.game-over .share-btn {\n  height: 64px;\n  width: 64px;\n  display: block;\n  cursor: pointer;\n  margin: auto;\n}\n.game-over .text-desc {\n  text-align: center;\n  color: #FFFFFF;\n  margin-top: 50px;\n  font-size: 14px;\n}\n.game-over .author {\n  position: absolute;\n  bottom: 16px;\n  font-size: 12px;\n  left: 0;\n  width: 100%;\n  color: #7179da;\n  text-decoration: none;\n}\n.container {\n  height: 100%;\n  overflow: hidden;\n  -webkit-user-select: none;\n  position: relative;\n}\n.container .controller .blood-ct {\n  margin: 10px 17px;\n}\n.container .controller .blood-ct .blood {\n  border: 1px solid #4955FF;\n  border-radius: 5px;\n  height: 6px;\n  position: relative;\n  overflow: hidden;\n}\n.container .controller .blood-ct .blood i {\n  float: left;\n  box-sizing: border-box;\n  width: 8.333333333%;\n  height: 100%;\n  border-right: 1px solid #4955FF;\n  background-color: #ECFD36;\n}\n.container .controller .blood-ct .blood i:last-child {\n  border-right: none;\n}\n.container .controller .blood-ct .blood i.lose {\n  background-color: red;\n  transition: opacity .3s ease .5s;\n  opacity: 0;\n}\n.container .controller .ctrl-ct {\n  width: 50%;\n  float: left;\n  overflow: auto;\n  position: relative;\n  z-index: 100;\n}\n.container .controller .ctrl-ct .item {\n  width: 64px;\n  height: 64px;\n  margin: 20px;\n  -webkit-user-select: none;\n  -webkit-touch-callout: none;\n  pointer-events: none;\n}\n.container .controller .ctrl-ct .item img {\n  width: 100%;\n  display: block;\n}\n.container .controller .ctrl-ct .item.left {\n  float: left;\n}\n.container .controller .ctrl-ct .item.right {\n  float: right;\n}\n.container .controller .score-ct {\n  position: absolute;\n  bottom: 58px;\n  width: 100%;\n  text-align: center;\n}\n.container .controller .score-ct .text-score {\n  font-family: 'Roboto Condensed';\n  font-size: 48px;\n  color: #FFFFFF;\n}\n.container .controller .score-ct .text-score-title {\n  font-family: 'Roboto Condensed';\n  font-size: 12px;\n  color: #4F5BFF;\n}\n.game-canvas {\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n  pointer-events: none;\n}\n.game-canvas.canvas {\n  height: auto;\n}\n.game-canvas .people {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  transform: translate3d(0, 0, 0);\n  background-color: #00acff;\n  overflow: hidden;\n}\n.game-canvas .people.danger {\n  background-color: red;\n}\n.game-canvas .scroller {\n  height: 1000px;\n  position: relative;\n}\n.game-canvas .scroller .floor {\n  position: absolute;\n  width: 90px;\n  height: 10px;\n}\n.game-canvas .scroller .floor.normal {\n  background: url('/public/images/normal.png') no-repeat center center;\n  background-size: 100% 100%;\n}\n.game-canvas .scroller .floor.weak {\n  transition: opacity .3s ease .3s, transform .3s ease;\n}\n.game-canvas .scroller .floor.weak:before {\n  content: ' ';\n  transition: transform .3s ease;\n  transform-origin: 0 0;\n  width: 52%;\n  height: 100%;\n  background: url('/public/images/weak-left.png') no-repeat center center;\n  background-size: 100% 100%;\n  left: 0;\n  top: 0;\n  position: absolute;\n}\n.game-canvas .scroller .floor.weak:after {\n  content: ' ';\n  transition: transform .3s ease;\n  transform-origin: 100% 0;\n  width: 52%;\n  height: 100%;\n  background: url('/public/images/weak-right.png') no-repeat center center;\n  background-size: 100% 100%;\n  right: 0;\n  top: 0;\n  position: absolute;\n}\n.game-canvas .scroller .floor.weak.over {\n  opacity: 0;\n}\n.game-canvas .scroller .floor.weak.over:before {\n  transform: rotateZ(35deg) translateX(5px);\n}\n.game-canvas .scroller .floor.weak.over:after {\n  transform: rotateZ(-20deg) translateX(-5px);\n}\n.game-canvas .scroller .floor.nail:after {\n  content: ' ';\n  background: url('/public/images/nail.png') no-repeat center center;\n  background-size: 100% 100%;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  width: 100%;\n  height: 200%;\n}\n.game-canvas .scroller .floor.scroll-left {\n  background-image: url('/public/images/scroll-left.png');\n  background-size: 400% 100%;\n  background-position: 100% top;\n  animation: bgScroolToLeft 0.5s step-end infinite;\n}\n.game-canvas .scroller .floor.scroll-right {\n  background-image: url('/public/images/scroll-right.png');\n  background-size: 400% 100%;\n  background-position: 0 top;\n  animation: bgScroolToRight 0.5s step-end infinite;\n}\n.game-canvas .scroller .floor.spring {\n  background-color: transparent;\n}\n.game-canvas .scroller .floor.spring:after {\n  content: ' ';\n  background: url('/public/images/spring-normal.png') no-repeat center center;\n  background-size: 100% 100%;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n}\n.game-canvas .scroller .floor.spring.up:after {\n  background: url('/public/images/spring-up.png') no-repeat center center;\n  background-size: 100% 100%;\n  height: 150%;\n}\n@keyframes bgShake {\n  0% {\n    background-color: #00acff;\n  }\n  25% {\n    background-color: red;\n  }\n  50% {\n    background-color: #00acff;\n  }\n  75% {\n    background-color: red;\n  }\n  100% {\n    background-color: #00acff;\n  }\n}\n@keyframes bloodLose {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes bgScroolToRight {\n  0% {\n    background-position: 0 top;\n  }\n  33% {\n    background-position: 33% top;\n  }\n  66.5% {\n    background-position: 66.5% top;\n  }\n  100% {\n    background-position: 100% top;\n  }\n}\n@keyframes bgScroolToLeft {\n  0% {\n    background-position: 100% top;\n  }\n  33% {\n    background-position: 66.5% top;\n  }\n  66.5% {\n    background-position: 33.5% top;\n  }\n  100% {\n    background-position: 0 top;\n  }\n}\n", ""]);

// exports


/***/ }),
/* 7 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(9);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 9 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);
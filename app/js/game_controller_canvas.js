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

  this._floorpool = []

  this.imgList = {
    springUp: '/public/images/spring-up.png',
    nail: '/public/images/nail.png',
    normal: '/public/images/normal.png',
    scrollLeft: '/public/images/scroll-left.png',
    scrollRight: '/public/images/scroll-right.png',
    springNormal: '/public/images/spring-normal.png',
    weakLeft: '/public/images/weak-left.png',
    weakRight: '/public/images/weak-right.png'
  }

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
  loadImages: function() {
    this.imgObj = {}
    for (var key in this.imgList) {
      var img = new Image();
      img.src = this.imgList[key];
      this.imgObj[key] = img;
    }
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
  createFloorSpan: function(y) {
    //楼梯横向位置随机出现
    var x = Math.random() * (this.canvasWidth - this.floorWidth);

    var floorConfig = this.getRandomFloor(this._floorRateArray);
    var floorElement = {
      width: this.floorWidth,
      height: this.floorHeight,
      x,
      y,
      name: floorConfig.name
    }

    this._floorpool.push(floorElement)
  },
  drawFloor: function() {
    ctx.clearRect(0,0, this.canvas.width, this.canvas.height); 
    this._floorpool.map(function(floor) {
      switch(floor.name) {
        case 'normal':
          var img = this.imgObj['normal']
          this.ctx.drawImage(img, floor.x, floor.y , this.floorWidth, this.floorHeight);
          break;
        case 'spring':
          var img = this.imgObj['springNormal']
          this.ctx.drawImage(img, floor.x, floor.y , this.floorWidth, this.floorHeight);
          break;
        case 'nail': 
          var img = this.imgObj['nail']
          var overRate = 32/140;
          var height = this.floorWidth * overRate;
          var deltaY = height - this.floorHeight;
          this.ctx.drawImage(img, floor.x, floor.y - deltaY , this.floorWidth, height);
          break;
        case 'scroll-left':   
          var img = this.imgObj['scrollLeft']
          this.ctx.drawImage(img, 0, 0, 140 * 1, 20, floor.x, floor.y, this.floorWidth, this.floorHeight);
          break;
        case 'scroll-right':
          var img = this.imgObj['scrollRight']
          this.ctx.drawImage(img, 0, 0, 140 * 1, 20, floor.x, floor.y, this.floorWidth, this.floorHeight);
          break;
        case 'weak':
          var imgLeft = this.imgObj['weakLeft'];
          var imgRight = this.imgObj['weakRight'];
          var width = 144 / 140 * this.floorWidth / 2;
          this.ctx.drawImage(imgLeft, floor.x, floor.y , width, this.floorHeight);
          this.ctx.drawImage(imgRight, floor.x + this.floorWidth - width, floor.y , width, this.floorHeight);
          break;
      }
    }.bind(this));
  },
  initFloor: function() {
    var floorLoop = 0;
    var y = this._floorScrollerY;
    while (floorLoop++ < 13) {
      this.createFloorSpan(y);
      y += this.floorDeltaY
    }
    this.drawFloor();
  },
  //更新楼梯位置
  floorUpdateView: function(deltaY) {
    this._floorpool = this._floorpool.reduce(function(pre, cur) {
      // 顶部楼梯离开视野，删除楼梯
      if ((cur.y - deltaY) >= -this.floorHeight) {
        cur.y -= deltaY;
        pre.push(cur);
      } else {
        this.floorScore++;
        this.updateScore();
      }
      return pre;
    }.bind(this), []);
    // 增加新楼梯
    if(this._floorpool.length === 12) {
      let lastY = this._floorpool[11].y + this.floorDeltaY;
      this.createFloorSpan(lastY);
    }
    this.drawFloor();
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
    this.peopleDanger = true;
    setTimeout(function() {
      this.peopleDanger = false;
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
  floorWeak: function(floor) {
    this.addBlood();
    //短暂停留后，标记该元素可强行穿过
    setTimeout(function() {
      floor.over = true;
      floor.cross = true;
    }, 200);
  },
  floorScroll: function(direction) {
    this.addBlood();
    this.__floorScrollDirection = direction;
  },
  floorScrollEnd: function() {
    this.__floorScrollDirection = null;
  },
  floorSpring: function(floor) {
    this._currentJumpFloor = floor;
    this.jumpStart();
    this.addBlood();
  },
  jumpStart: function() {
    this.__jumpMode = true;
    this._currentJumpFloor.up = true;
    setTimeout(function() {
      this._currentJumpFloor.up = false;
    }.bind(this), 200);
  },
  jumpEnd: function(hitTop) {
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

    //人物掉落屏幕下方，游戏结束
    if (this._currentPeopleY > this.canvasHeight) {
      this.gameover();
      return
    }
    //碰撞检测
    for(var index = 0; index < this._floorpool.length; index++) {
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
  peopleUpdateView: function() {
    if (this.__onFloor) {
      if (this._peopleGoLeft) {
        this.peopleRotateZ -= this.peopleRotateDelta;
      }
      if (this._peopleGoRight) {
        this.peopleRotateZ += this.peopleRotateDelta;
      }
    }

    ctx.beginPath();
    this.ctx.arc(
      this._currentPeopleX + this.peopleWidth / 2,
      this._currentPeopleY + this.peopleHeight / 2,
      parseInt(this.peopleWidth / 2),
      0,
      Math.PI * 2
    );
    ctx.closePath();    
    ctx.fillStyle = "#00acff";
    this.ctx.fill();
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
    this._floorpool = [];
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
    this.peopleHeight = 15
    this.peopleWidth = 15

    //人物位置预设
    this._currentPeopleX = this.canvasWidth / 2 + this.peopleWidth / 2;
    //备份初始参数
    this.backup();
    //初始化台阶
    setTimeout(() => {
      this.initFloor();
        //初始化任务控制
      this.peopleUserController();
      //首次更新人物视图
      this.peopleUpdateView();
      // //首次更新人物血量
      this.updateBlood();
      //首次更新楼层数
      this.updateScore();
      // //以每秒60帧执行游戏动画
      this.run(this.fps); 
    }, 100)
    
  }
};

export default GameController;

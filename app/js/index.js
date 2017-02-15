window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame  || window.mozRequestAnimationFrame || function(cb) {cb();};

var gameController = {
    _animation: null,
    _canvasWidth: 0,
    _canvasHeight: 0,
    _floorWidth: 0,
    _floorHeight: 0,
    _floorDeltaY: 50,
    // _floorAppearRate: [1, 1, 1, 1, 1, 1], //normal | spring | weak | scroll-left | scroll-right | nail
    _floorScore: 1,
    _speed: 50, //pixel per second
    _maxSpeed: 350,
    _blood: 12,
    _$canvas: $('.game-canvas'),
    _$scroller: $('.scroller'),
    _$people: $('.people'),
    _peopleSpeed: 180, //pixel per second
    _peopleRotateZ: 0,
    _peopleRotateDelta: 25, //deg
    _peopleVerticalSpeed: 200, //pixel per second
    _peopleHeight: 0,
    _peopleWidth: 0,
    __currentScrollerY: 0,
    __currentPeopleY: 20,
    __currentPeopleVertical: 0,
    __floorScrollerY: 200,
    __maxJumpDistance: 20,
    __currentJumpDistance: 0,
    __frameIndex: 0,
    //游戏结束
    gameover: function() {
        this.stop();
        setTimeout(function() {
            $('#game-ct').hide();
            $('.game-over').show();
        }.bind(this), 200);
        $('title').text('老子'+ this._floorScore +'层!-是男人就下100层');
        _czc.push(﻿['_trackEvent','score','game','gameover', this._floorScore]);
    },
    createFloorSpan: function() {
        //计算楼梯位置，200px 刚开始从距离顶部200px开始
        var _top = this.__floorScrollerY += this._floorDeltaY,
            //楼梯横向位置随机出现
            _left = Math.random() * (this._canvasWidth - this._floorWidth);
        //数组中【按比例】随机抽取一个index
        //参数是一个概率比例值数组，数字越大比例越高
        // var randomRate = function(arr) {
        //     var randomArr = [];
        //     for(var i = 0; i < arr.length; i++) {
        //         randomArr[i] = arr[i] * Math.random();
        //     }
        //     // console.log(randomArr);
        //     var biggestNumber = Math.max.apply(Math, randomArr);
        //     return randomArr.indexOf(biggestNumber);
        // };
        var floors = [
            '<i class="floor normal"></i>',
            '<i class="floor normal"></i>',
            '<i class="floor spring"></i>',
            '<i class="floor spring"></i>',
            '<i class="floor weak"></i>',
            '<i class="floor weak"></i>',
            '<i class="floor scroll-left"></i>',
            '<i class="floor scroll-right"></i>',
            '<i class="floor nail"></i>',
            '<i class="floor nail"></i>',
            '<i class="floor nail"></i>',
            '<i class="floor nail"></i>',
        ];
        //随机新建楼梯，并添加到卷轴中去
        $(floors[Math.floor(Math.random() * floors.length)]).css({
            top: _top,
            left: _left,
            width: this._floorWidth,
            height: this._floorHeight
        }).appendTo(this._$scroller);
    },
    removeFloorSpan: function() {
        $('.floor').eq(0).remove();
        this._floorScore++;
        this.updateScore();
    },
    updateBlood: function() {
        var $bloodEle = $('.blood i');
        for(var i = 0; i < $bloodEle.length; i++) {
            if(i < this._blood) {
                $bloodEle.eq(i).removeClass('lose');
            } else {
                $bloodEle.eq(i).addClass('lose');
            }
        }
    },
    updateScore: function() {
        $('.text-score').text(this._floorScore);
    },
    loseBlood: function() {
        //当人物在平台上时，不重复扣血
        if(this.__onFloor) {
            return;
        }
        this._blood -= 4;
        //人变红
        this._$people.addClass('danger');
        setTimeout(function() {
            this._$people.removeClass('danger');
        }.bind(this), 1000);

        //背景闪烁
        $('#game-ct').addClass('danger')
        setTimeout(function() {
            $('#game-ct').removeClass('danger')
        }, 100);

        if(this._blood <= 0) {
            this._blood = 0;
            this.updateBlood();
            this.gameover();
            return;
        }
        this.updateBlood()
    },
    addBlood: function() {
        //当人物在平台上时，或者血量大于12，不重复加血
        if(this.__onFloor || this._blood >= 12) {
            return;
        }
        this._blood += 1;
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
        //暂存人物速度
        this.__tempPeopleSpeed = this._peopleSpeed;
        //跳跃模式，人物速度降低
        this._peopleSpeed = this._peopleSpeed / 2;
    },
    jumpEnd: function(hitTop) {
        if(!this.__jumpMode) {
            return;
        }
        if(hitTop) {
            this.__$currentJumpFloor[0].cross = true;
        }
        //重置跳跃高度
        this.__currentJumpDistance = 0;
        //解除跳跃
        this.__jumpMode = false;
        //恢复人物速度
        this._peopleSpeed = this.__tempPeopleSpeed;
    },
    people: function(fps) {
        //人物纵向每帧移动距离
        var _deltaPeopleY = this._peopleSpeed / fps;
        //卷轴纵向每帧移动距离
        var _deltaY = this._speed / fps;
        //人物横向每帧移动距离
        var _deltaPeopleVertical = this._peopleVerticalSpeed / fps;
        //缓存floor
        var $floor = $('.floor');
        //缓存offset
        var peopleOffset = this._$people.offset();
        
        //人物掉落屏幕下方，游戏结束
        if(peopleOffset.top > this._canvasHeight) {
            this.gameover();
            return
        }
        //碰撞检测
        for(i = 0; i < $floor.length; i++) {
            //缓存offset
            var floorOffset = $floor.eq(i).offset();
            //人物与楼梯纵向距离
            var distanceGap = Math.abs(peopleOffset.top + this._peopleHeight - floorOffset.top);
            //当人物撞到顶部，掉血+掉落+打断跳跃
            if(peopleOffset.top <= _deltaPeopleY + _deltaY) {
                this.__onFloor = false;
                this.jumpEnd(true);
                this.loseBlood();
                break;
            }
                //跳跃模式不进入检测
            if( !this.__jumpMode &&
                //元素不可直接穿过
                !$floor.eq(i)[0].cross &&
                //人物与楼梯纵向距离在一帧移动距离之内
                distanceGap <= _deltaPeopleY + _deltaY && 
                //人物横向距离不超过楼梯最左
                peopleOffset.left > floorOffset.left - this._peopleWidth && 
                //人物横向距离不超过楼梯最右
                peopleOffset.left < floorOffset.left + this._floorWidth ) {
                //人物与楼梯偏差修正
                this.__currentPeopleY = floorOffset.top - this._peopleHeight;
                //施加各类楼梯特殊属性
                if($floor.eq(i).hasClass('normal')) {
                    this.floorNormal();
                }
                if($floor.eq(i).hasClass('nail')) {
                    this.floorNail();
                }
                if($floor.eq(i).hasClass('spring')) {
                    this.floorSpring($floor.eq(i));
                }
                if($floor.eq(i).hasClass('weak')) {
                    this.floorWeak($floor.eq(i));
                }
                if($floor.eq(i).hasClass('scroll-left')) {
                    this.floorScroll('left');
                }
                if($floor.eq(i).hasClass('scroll-right')) {
                    this.floorScroll('right');
                }
                this.__onFloor = true;
                break;
            }
            //当循环执行完毕，仍然没有发现碰撞，则表明人物不在平台上
            if(i == $floor.length - 1) {
                this.__onFloor = false;
            }
        }

        //人物向上跳起
        if(this.__jumpMode) {

            if(this.__currentJumpDistance >= this.__maxJumpDistance) {
                this.jumpEnd();
            } else {
                this.__currentJumpDistance += _deltaPeopleY;
                //向上跳起效果要额外加上_deltaY，以匹配卷轴运动状态
                this.__currentPeopleY -= _deltaPeopleY + _deltaY;
            }
        }

        //人物向下坠落 + 取消楼梯左右加速状态
        if(!this.__onFloor && !this.__jumpMode) {
            this.floorScrollEnd();
            this.__currentPeopleY += _deltaPeopleY;
        }

        //横向运动预处理
        var __temp_deltaPeopleVertical = _deltaPeopleVertical;
        //处理人物向左运动
        if(this._peopleGoLeft) {
            if(this.__floorScrollDirection == 'left') {
                __temp_deltaPeopleVertical *= 1.5;
            }
            if(this.__floorScrollDirection == 'right') {
                __temp_deltaPeopleVertical *= 0.5;
            }

            if (this.__currentPeopleVertical > 0) {
                this.__currentPeopleVertical -= __temp_deltaPeopleVertical;
            }
        }
        //处理人物向右运动
        if(this._peopleGoRight) {
            if(this.__floorScrollDirection == 'left') {
                __temp_deltaPeopleVertical *= 0.5;
            }
            if(this.__floorScrollDirection == 'right') {
                __temp_deltaPeopleVertical *= 1.5;
            }

            if (this.__currentPeopleVertical < this._canvasWidth - this._peopleWidth) {
                this.__currentPeopleVertical += __temp_deltaPeopleVertical;
            }
        }
        //处理人物在滚动楼梯上的自动运动
        if(!this._peopleGoRight && !this._peopleGoLeft) {
            __temp_deltaPeopleVertical *= 0.5;
            if(this.__floorScrollDirection == 'left') {
                if (this.__currentPeopleVertical > 0) {
                    this.__currentPeopleVertical -= __temp_deltaPeopleVertical;
                }
                
            }
            if(this.__floorScrollDirection == 'right') {
                if (this.__currentPeopleVertical < this._canvasWidth - this._peopleWidth) {
                    this.__currentPeopleVertical += __temp_deltaPeopleVertical;
                }
            }
        }

        //更新人物视图
        this.peopleUpdateView();
    },
    //更新卷轴位置
    floorUpdateView: function() {
        if(Modernizr.csstransforms3d) {
            //设定卷轴位置, translate3d开启GPU加速
            this._$scroller.css({
                '-webkit-transform': 'translate3d(0, '+ this.__currentScrollerY + 'px, 0)',
                    '-ms-transform': 'translate3d(0, '+ this.__currentScrollerY + 'px, 0)',
                        'transform': 'translate3d(0, '+ this.__currentScrollerY + 'px, 0)',
            });
        } else if(Modernizr.csstransforms) {
            //不支持translate3d 使用translateY
            this._$scroller.css({
                '-webkit-transform': 'translateY('+ this.__currentScrollerY + 'px)',
                    '-ms-transform': 'translateY('+ this.__currentScrollerY + 'px)',
                        'transform': 'translateY('+ this.__currentScrollerY + 'px)',
            });
        } else {
            //还不支持，那就GG
            this._$scroller.css({
                'top': this.__currentScrollerY + 'px',
            });
        }
    },
    //更新人物视图
    peopleUpdateView: function() {
        if(this.__onFloor) {
            if(this._peopleGoLeft) {
                this._peopleRotateZ -= this._peopleRotateDelta; 
            } 
            if(this._peopleGoRight) {
                this._peopleRotateZ += this._peopleRotateDelta; 
            }
        }
        if(Modernizr.csstransforms3d) {
            //设定人物位置, translate3d开启GPU加速
            this._$people.css({
                '-webkit-transform': 'translate3d(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px ,0)',
                    '-ms-transform': 'translate3d(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px ,0)',
                        'transform': 'translate3d(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px ,0)',
            });
        } else if(Modernizr.csstransforms) {
            //不支持translate3d 使用translate
            this._$people.css({
                '-webkit-transform': 'translate(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px)',
                    '-ms-transform': 'translate(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px)',
                        'transform': 'translate(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px)',
            });
        } else {
            //还不支持，那就GG
            this._$people.css({
                'left':  this.__currentPeopleVertical + 'px',
                'top': this.__currentPeopleY + 'px',
            });
        }
    },
    peopleUserController: function() {
        var _this = this;
        //监听按键按下，改变人物左右运动方向
        $(window).keydown(function(ev) {
            if(ev.key == 'ArrowRight') {
                _this._peopleGoRight = true;
                _this._peopleGoLeft = false;//预防按键同时按下的冲突情况 
                return;
            }
            if(ev.key == 'ArrowLeft') {
                _this._peopleGoRight = false;//预防按键同时按下的冲突情况
                _this._peopleGoLeft = true;
                return;
            }
        //按键弹起，取消该方向人物运动
        }).keyup(function(ev) {
            if(ev.key == 'ArrowRight') {
                _this._peopleGoRight = false;
                return;
            }
            if(ev.key == 'ArrowLeft') {
                _this._peopleGoLeft = false;
                return;
            }
        });

        $('.controller .left-ct').on('touchstart', function(ev) {
            _this._peopleGoRight = false;//预防按键同时按下的冲突情况 
            _this._peopleGoLeft = true;
            return false
        }).on('touchend', function(ev) {
            _this._peopleGoLeft = false;
        });

        $('.controller .right-ct').on('touchstart', function(ev) {
            _this._peopleGoRight = true;
            _this._peopleGoLeft = false;//预防按键同时按下的冲突情况
            return false
        }).on('touchend', function(ev) {
            _this._peopleGoRight = false;
        });

    },
    core: function(fps) {
        // console.log('i');
        var _this = this,
            _deltaY = this._speed / fps, //卷轴纵向每帧移动距离
            $floor = $('.floor');

        //计算卷轴位置
        this.__currentScrollerY -= _deltaY;

        //当卷轴超出一定长度之后，进行位置reset、缩减长度，防止Crash现象
        if(this.__currentScrollerY <= -this._canvasHeight * 2) {
            //将卷轴滚动高度减小一屏
            this.__currentScrollerY += this._canvasHeight;
            //将楼梯偏移高度减小一屏
            this.__floorScrollerY -= this._canvasHeight;
            //重置现有楼梯位置
            for(i = 0; i < $floor.length; i++) {
                $floor.eq(i).css({
                    top: parseInt($('.floor').eq(i).css('top')) - this._canvasHeight
                })
            }
        }

        //更新卷轴位置
        this.floorUpdateView();

        //每个台阶移出视野则清除台阶，并且在底部增加一个新的台阶
        if($floor.eq(0).offset().top <= -20) {
            this.createFloorSpan();
            this.removeFloorSpan();
        }

        //调用人物渲染
        this.people(fps);
        // 越来越high
        if(this._speed <= this._maxSpeed) {
            this._speed += 0.1;
        }

    },
    run: function(fps) {
        //不允许执行多个动画渲染函数（你想卡死么...
        if(this._animation) {
            console.error('Animation has aready in process, please do not run again!');
            return ;
        }

        this._fps = fps = fps || 60;
        var looptime = 1000 / fps, //每帧间隔时间
            _this = this;

        //循环调用渲染函数，并把循环handle暴露出去，方便外部暂停动画
        return this._animation = setInterval(function() {
            window.requestAnimationFrame(_this.core(fps));
        }, looptime);
    },
    stop: function() {
        clearInterval(this._animation);//暂停动画
        this._animation = undefined;
    },
    reRun: function() {
        console.log(this.__paramBackup._floorScore);
        //重置参数
        $.extend(this, this.__paramBackup);
        //删掉现有楼梯
        $('.floor').remove();
        //重新初始化
        this.init();
    },
    backup: function() {
        //备份初始设置参数，用于游戏reset
        this.__paramBackup = {};
        for(i in this) {
            if(typeof this[i] === 'number' || typeof this[i] === 'string') {
                this.__paramBackup[i] = this[i];
            }
        }
    },
    init: function() {
        var _this = this,
            floorLoop = 0;
        // Modernizr.csstransforms3d = false;
        // Modernizr.csstransforms = false;
        //当视窗大小变动时，重新计算画布宽高
        this._canvasWidth = this._$canvas.width();
        this._canvasHeight = this._$canvas.height();
        this._floorDeltaY = this._canvasHeight / 11;
        this._floorWidth = this._canvasWidth / 5;
        this._floorHeight = this._floorWidth / 9;
        this._peopleHeight = parseInt(this._$people.css('height'));
        this._peopleWidth = parseInt(this._$people.css('width'));

        //人物位置预设
        this.__currentPeopleVertical = this._canvasWidth/2 + this._peopleWidth/2;
        //备份初始参数
        this.backup();
        //初始化台阶
        while(floorLoop++ < 13) {
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
        this.run(60);
    }
};

$(function() {

    $('#start-game').on('click', function() {
        $('.game-intro').hide();
        $('#game-ct').show();
        gameController.init();
    });

    $('#restart-game').on('click', function() {
        $('#game-ct').show();
        $('.game-over').hide();
        gameController.reRun();
    })

    $('.share-btn').on('click', function() {
        alert('点击右上角分享给好友吧~');
    })

    var preloadImg = function() {
        var imgList = [
            '../../public/images/spring-up.png'
        ]
        for(var i = 0; i < imgList.length; i++) {
            var _img = new Image();
            _img.src = imgList[i];
        }
    }
    preloadImg();
});
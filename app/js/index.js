var gameController = {
    _animation: null,
    _canvasWidth: 0,
    _canvasHeight: 0,
    _floorWidth: $('.canvas').width() / 6,
    _floorDeltaY: 50,
    _floorScore: 1,
    _speed: 50, //pixel per second
    _$canvas: $('.canvas'),
    _$scroller: $('.scroller'),
    _$people: $('.people'),
    _peopleSpeed: 180, //pixel per second
    _peopleVerticalSpeed: 150, //pixel per second
    _peopleHeight: $('.people').height(),
    _peopleWidth: $('.people').width(),
    _scrollerHeight: $('.scroller').height(),
    __currentScrollerY: 0,
    __currentPeopleY: 0,
    __currentPeopleVertical: 0,
    __floorScrollerY: 200,
    __frameIndex: 0,
    createFloorSpan: function() {
        //计算楼梯位置，200px 刚开始从距离顶部200px开始
        var _top = this.__floorScrollerY += this._floorDeltaY,
            //楼梯横向位置随机出现
            _left = Math.random() * (this._canvasWidth - this._floorWidth);

        //新建楼梯，并添加到卷轴中去
        $('<i class="floor"></i>').css({
            top: _top,
            left: _left,
            width: this._floorWidth
        }).appendTo(this._$scroller);
    },
    removeFloorSpan: function() {
        $('.floor').eq(0).remove();
        this._floorScore++;
        $('.floor-count').text(this._floorScore)
    },
    people: function(fps) {
        //人物纵向每帧移动距离
        var _deltaPeopleY = this._peopleSpeed / fps;
        //人物横向每帧移动距离
        var _deltaPeopleVertical = this._peopleVerticalSpeed / fps;
        //缓存floor
        var $floor = $('.floor');
        //缓存offset
        var peopleOffset = this._$people.offset();
        if(peopleOffset.top > this._canvasHeight) {
            // alert('Game over!');
            this.stop();
            window.location.reload();
            return
        }
        //碰撞检测
        for(i = 0; i < $floor.length; i++) {
            //缓存offset
            var floorOffset = $floor.eq(i).offset();
            var distanceGap = Math.abs(peopleOffset.top + this._peopleHeight - floorOffset.top);
            if(peopleOffset.top <= 0) {
                this.__onFloor = false;
                break;
            }
            if( distanceGap <= 5 && 
                peopleOffset.left > floorOffset.left - this._peopleWidth && 
                peopleOffset.left < floorOffset.left + this._floorWidth ) {
                //人物与楼梯偏差修正，并立即更新视图
                this.__currentPeopleY = floorOffset.top - this._peopleHeight + 2;
                this._$people.css({
                    transform: 'translate3d(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px ,0)'
                });
                this.__onFloor = true;
                //卷轴纵向每帧移动距离
                _deltaY = this._speed / fps,
                //让人物随着楼梯共同向上移动
                this.__currentPeopleY -= _deltaY;
                break;
            }
            this.__onFloor = false;
        }
        if(!this.__onFloor) {
            //移动当前人物纵向位置
            this.__currentPeopleY += _deltaPeopleY;
        }
        
        //处理人物向左运动
        if(this._peopleGoLeft) {
            if (this.__currentPeopleVertical > 0) {
                this.__currentPeopleVertical -= _deltaPeopleVertical;
            }
        }

        //处理人物向右运动
        if(this._peopleGoRight) {
            if (this.__currentPeopleVertical < this._canvasWidth - this._peopleWidth) {
                this.__currentPeopleVertical += _deltaPeopleVertical;
            }
        }

        //设定人物位置, translate3d开启GPU加速，消除抖动
        this._$people.css({
            transform: 'translate3d(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px ,0)'
        });
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
        });;

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
            _deltaY = this._speed / fps; //卷轴纵向每帧移动距离

        //计算卷轴位置
        this.__currentScrollerY -= _deltaY;

        //位置reset
        if(this.__currentScrollerY <= -this._canvasHeight * 2) {
            this.__currentScrollerY += this._canvasHeight;
            this.__floorScrollerY -= this._canvasHeight;
            var $floor = $('.floor');
            for(i = 0; i < $floor.length; i++) {
                $floor.eq(i).css({
                    top: parseInt($('.floor').eq(i).css('top')) - this._canvasHeight
                })
            }
        }

        //使用3D变换来移动卷轴（启用GPU加速）
        this._$scroller.css({
            'transform': 'translate3d(0, '+ _this.__currentScrollerY + 'px, 0)',
        });

        //每个台阶移出视野则清除台阶，并且在底部增加一个新的台阶
        if($('.floor').eq(0).offset().top <= -20) {
            this.createFloorSpan();
            this.removeFloorSpan();
        }

        //调用人物渲染
        this.people(fps);
        // 越来越high
        if(this._speed <= 200) {
            this._speed += 0.1;
        }

    },
    run: function(fps) {
        //不允许执行多个动画渲染函数（你想卡死么...
        if(this._animation) {
            console.error('Animation has aready in process, please do not run again!');
            return ;
        }

        fps = fps || 60;
        var looptime = 1000 / fps, //每帧间隔时间
            _this = this;

        //循环调用渲染函数，并把循环handle暴露出去，方便外部暂停动画
        return this._animation = setInterval(function() {
            _this.core(fps);
        }, looptime);
    },
    stop: function() {
        clearInterval(this._animation);//暂停动画
    },
    init: function() {
        var _this = this,
            floorLoop = 0;

        //当视窗大小变动时，重新计算画布宽高
        $(window).resize(function() {
            _this._canvasWidth = _this._$canvas.width();
            _this._canvasHeight = _this._$canvas.height();
        });
        _this._canvasWidth = $('.canvas').width();
        _this._canvasHeight = _this._$canvas.height();

        //初始化台阶
        while(floorLoop++ < 13) {
            this.createFloorSpan();
        }

        //初始化任务控制
        this.peopleUserController();
        //人物位置预设
        this.__currentPeopleVertical = this._canvasWidth/2 + this._peopleWidth/2;
        this._$people.show();
        this._$people.css({
            transform: 'translate3d(' + this.__currentPeopleVertical + 'px , ' + this.__currentPeopleY + 'px ,0)'
        });
        //以每秒60帧执行游戏动画
        this.run(60);
    }
};

$(function() {
    gameController.init();
});
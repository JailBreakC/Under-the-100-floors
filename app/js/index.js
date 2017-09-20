import GameController from './game_controller';
import GameControllerCanvas from './game_controller_canvas';
import '../less/style.less';

var tips = {
  fail: '弹簧梯子每次弹跳都会回血哦~',
  success: '恭喜你成为真男人！赶紧分享给小伙伴吧~',
}

var preloadImg = function() {
  var imgList = [
    '/public/images/spring-up.png'
  ]
  for (var i = 0; i < imgList.length; i++) {
    var _img = new Image();
    _img.src = imgList[i];
  }
}

$(function() {
  var gc
  $('body').show();
  
  if(typeof _RENDERER !=='undefined' && _RENDERER === 'canvas') {
    gc = new GameControllerCanvas();
    setTimeout(function() {
      $('#start-game').trigger('click');      
    })
  } else {
    gc = new GameController();    
  }


  gc.on('gameover', function(e) {
    $('#github-fork').show();
    $('title').text('老子' + gc.floorScore + '层! - 是男人就下100层');
    $('.text-score').text(gc.floorScore);

    if(gc.floorScore < 100) {
      $('.game-over .text-desc').text(tips.fail);
    } else {
      $('.game-over .text-desc').text(tips.success);
    }
    _czc.push(['_trackEvent', 'score', 'game', 'gameover', gc.floorScore]);    
  });

  gc.on('start', function() {
    $('#github-fork').hide();    
  })

  $('#start-game').on('click', function() {
    $('.game-intro').hide();
    $('#game-ct').show();
    gc.start();
  });

  $('#restart-game').on('click', function() {
    $('#game-ct').show();
    $('.game-over').hide();
    gc.reRun();
  })

  $('.share-btn').on('click', function() {
    alert('点击右上角分享给好友吧~');
  })

  preloadImg();
});
import GameController from './game_controller';
import '../less/style.less';

$(function() {

  var gc = new GameController();

  $('body').show();

  gc.on('gameover', function(e) {
    $('#github-fork').show();
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

  var preloadImg = function() {
    var imgList = [
      '/public/images/spring-up.png'
    ]
    for (var i = 0; i < imgList.length; i++) {
      var _img = new Image();
      _img.src = imgList[i];
    }
  }
  preloadImg();
});
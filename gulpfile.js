var gulp  = require('gulp'),         //基础库
    minifycss = require('gulp-minify-css'),  //css压缩
    less = require('gulp-less'),        //less编译
    jshint = require('gulp-jshint'),      //js检查
    uglify = require('gulp-uglify'),     //js压缩
    rename = require('gulp-rename'),      //重命名
    concat = require('gulp-concat'),     //合并文件
    clean = require('gulp-clean'),       //清空文件夹
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    connect = require('gulp-connect'),     //webserver
    LessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix = new LessAutoprefix({ browsers: ['last 4 versions'] }),
    port = 8888,
    rootpath = '';

gulp.task('webserver', function() {
  connect.server({
    root: rootpath,
    port: port,
    livereload: true
  });
});

// HTML处理
var htmlSrc = './app/*.html',
    htmlDst = './build/';

var cssSrc = './app/less/**/*.less',
    cssDst = './app/css/',
    cssMinDst = './build/css/';

var jsSrc = './app/js/**/*.js',
    jsDst ='./build/js/';

gulp.task('html', function() {
  gulp.src(htmlSrc)
    .pipe(connect.reload())
    .pipe(gulp.dest(htmlDst))
});

var onError = function(err) {
    console.log(err);
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);
    this.emit('end');
};

// 样式处理
gulp.task('css', function () {

  gulp.src(cssSrc)
    .pipe(plumber({errorHandler: onError}))
    .pipe(less({ style: 'expanded', plugins: [autoprefix]}))
    .pipe(gulp.dest(cssDst))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(connect.reload())
    .pipe(gulp.dest(cssMinDst))
});

// js处理
gulp.task('js', function () {

  gulp.src(jsSrc)
    .pipe(rename({ suffix: '.min' }))
    .pipe(plumber({errorHandler: onError}))
    .pipe(uglify())
    .pipe(connect.reload())
    .pipe(gulp.dest(jsDst));
});

// 清空样式、js
gulp.task('clean', function() {
  gulp.src([cssDst, jsDst], {read: false})
    .pipe(clean());
});

// 重建任务 清空样式、js并重建 
gulp.task('rebuild', ['clean'], function(){
  gulp.start('html','css','js');
});

// 监听任务 运行语句 gulp watch
gulp.task('default',['webserver'], function(){
  // 监听html
  gulp.watch(htmlSrc, ['html'], function(event){
  })

  // 监听css
  gulp.watch(cssSrc, ['css'], function(){
  });

  // 监听js
  gulp.watch(jsSrc, ['js'], function(){
  });
});
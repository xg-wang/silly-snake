var gulp        = require('gulp')
var gutil       = require('gulp-util')
var source      = require('vinyl-source-stream')
var babelify    = require('babelify')
var watchify    = require('watchify')
var exorcist    = require('exorcist')
var browserify  = require('browserify')
var browserSync = require('browser-sync').create()
var assign      = require('lodash.assign')

var base = {
  src: 'src',
  dist: 'dist'
}

// add custom browserify options here
var customOpts = {
  entries: ['./src/js/index.js'],
  debug: true
}
var opts = assign({}, watchify.args, customOpts)
var bundler = watchify(browserify(opts))

// Babel transform
bundler.transform(babelify.configure({
  sourceMapRelative: base.src + '/js'
}))

// On updates recompile
bundler.on('update', bundle)

function bundle() {

  gutil.log('Compiling JS...')

  return bundler.bundle()
    .on('error', function (err) {
      gutil.log(err.message)
      browserSync.notify('Browserify Error!')
      this.emit('end')
    })
    .pipe(exorcist(base.dist + '/bundle.js.map'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(base.dist))
    .pipe(browserSync.stream({once: true}))
}

/**
 * Gulp task alias
 */
gulp.task('js', bundle)

gulp.task('html', function() {
  gulp.src('src/*.html')
    .pipe(gulp.dest(base.dist))
    .pipe(browserSync.stream());
})

gulp.task('css', function() {
  gulp.src(base.src + '/css/**/*.css')
    .pipe(gulp.dest(base.dist + '/css'))
    .pipe(browserSync.stream());
})

gulp.task('assets', function() {
  gulp.src(base.src + '/assets/*')
    .pipe(gulp.dest(base.dist + '/assets'))
    .pipe(browserSync.stream());
})

/**
 * First bundle, then serve from the ./dist directory
 */
gulp.task('default', ['js', 'html', 'css', 'assets'], function () {
  browserSync.init({
    server: base.dist
  })
  gulp.watch(`${base.src}/css`, ['css'])
  gulp.watch(`${base.src}/*.html`, ['html'])
  gulp.watch(`${base.src}/assets`, ['assets'])
})

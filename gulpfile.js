var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    react = require('gulp-react'),
    connect = require('gulp-connect'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify');

gulp.task('styles', function() {
    return gulp.src('src/css/*.*ss')
        .pipe(rename({extname: ".css"}))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload());
});

gulp.task('vendors', function() {
    gulp.src([
        'lib/jquery/dist/jquery.js',
        'lib/react/react-with-addons.js',
        'lib/react-bootstrap/react-bootstrap.js',
        'lib/moment/moment.js'])
        .pipe(gulp.dest('dist/vendor/js'));

    gulp.src([
        'lib/bootstrap/dist/css/*.css'])
        .pipe(gulp.dest('dist/vendor/css'))
        .pipe(connect.reload());
});

var onError = function (err) {  
  gutil.beep();
  console.log(err.message);
  notify(err.message);
};

gulp.task('scripts', function() {
    return gulp.src('src/js/**/*.js*')
        .pipe(plumber({
          errorHandler: onError
        }))
        .pipe(react({ harmony : true }))
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload());
});

gulp.task('images', function() {
    return gulp.src('src/img/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('dist/img'))
        .pipe(connect.reload());
});

gulp.task('html', function() {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return gulp.src(['dist/css', 'dist/js', 'dist'], {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    return gulp.start('html', 'styles', 'scripts', 'vendors', 'images');
});

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        livereload: false
    });
});

gulp.task('watch', ['connect'], function() {
    gulp.watch('src/css/**/*', ['styles']);
    gulp.watch('src/js/**/*', ['scripts']);
    gulp.watch('src/img/**/*', ['images']);
    gulp.watch('src/**/*.html', ['html']);

    gulp.start('default');
});


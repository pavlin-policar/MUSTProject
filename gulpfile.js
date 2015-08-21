var gulp = require('gulp');

var uglify      = require('gulp-uglify'),
    coffee      = require('gulp-coffee'),
    coffeelint  = require('gulp-coffeelint'),
    rename      = require('gulp-rename'),
    concat      = require('gulp-concat')
    gutil       = require('gulp-util');

gulp.task('coffee', function() {
    return gulp.src('script/**/*.coffee')
        .pipe(coffeelint())
        .pipe(coffeelint.reporter('coffeelint-stylish'))
        .pipe(coffee({ bare: true }))
        .on('error', gutil.log)
        .pipe(concat('jsxgen.js'))
        .pipe(gulp.dest('script/'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('script/'));
});

gulp.task('watch', function() {
    gulp.watch('script/**/*.coffee', ['coffee']);
});
const gulp = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const flatten = require('gulp-flatten');

const sources = ['styles/base/*.scss', 'styles/layouts/*.scss', 'styles/pages/*.scss', 'styles/sections/*.scss']

gulp.task('sass', function () {
  return gulp.src(sources)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(flatten())
    .pipe(gulp.dest('assets'))
});

gulp.task('watch', function () {
  gulp.watch('styles/**/*.scss', gulp.series('sass'))
})

const gulp = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const flatten = require('gulp-flatten');
const purgecss = require('gulp-purgecss')
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const cssnanoAdvanced = require('cssnano-preset-advanced')

const sources = ['styles/base/*.scss', 'styles/layouts/*.scss', 'styles/pages/*.scss', 'styles/sections/*.scss']

gulp.task('sass', function () {
  return gulp.src(sources)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(flatten())
    .pipe(gulp.dest('assets'))
});

gulp.task('sass-uncompressed', function () {
  return gulp.src(sources)
    .pipe(sass({}).on('error', sass.logError))
    .pipe(flatten())
    .pipe(gulp.dest('assets'))
});

gulp.task('watch', function () {
  gulp.watch('styles/**/*.scss', gulp.series('sass'))
})

gulp.task('clean', function () {
  return gulp.src(['assets/custom-theme.css', 'assets/custom.css', 'assets/custom-theme-3.css', 'assets/timber.css', 'assets/theme.css'])
    .pipe(purgecss({
      content: ['sections/**/*.liquid', 'snippets/**/*.liquid', 'layout/**/*.liquid', 'templates/**/*.liquid'],
      safelist: {
        standard: [],
        deep: [],
        greedy: [
          /weglot/,
          /shopify-section/,
          /spr/,
          /jdgm/,
          /template/,
          /gPreorder/,
          /vtl/,
          /vt/,
          /vitals/,
          /yotpo/,
          /plyr/,
          /gm/,
          /mfp/
        ]
      }
    }))
    .pipe(postcss([
      cssnano({
        preset: [cssnanoAdvanced, { autoprefixer: false, mergeIdents: false, reduceIdents: false, zindex: false }],
      }),
    ]))
    .pipe(gulp.dest('assets')).on('error', sass.logError)
});
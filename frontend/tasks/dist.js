const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const del = require('del');

const finalPath = './dist/final/';
const angularPath = './dist/angular/';

const scriptPaths = ['runtime', 'polyfills', 'main'].map(fileName => {
    return angularPath+fileName+'-es5.*.js'
});

gulp.task('styles', () => {
    return gulp.src(angularPath+'styles.*.css')
        .pipe(rename('styles.min.css'))
        .pipe(gulp.dest(finalPath));
});

gulp.task('scripts', () => {
    return gulp.src(scriptPaths)
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest(finalPath));
});

gulp.task('assets', () => {
    return gulp.src(angularPath+'assets/**/*')
        .pipe(gulp.dest(finalPath+'assets/'))
});

gulp.task('angularAssets', () => {
    return gulp.src([angularPath+'*.png', angularPath+'favicon.ico', angularPath+'3rdpartylicenses.txt'])
        .pipe(gulp.dest(finalPath+'assets/'))
});

gulp.task('clean', function () {
    return del([
        finalPath+'/*',
        finalPath+'**/*/',
        '!'+finalPath+'/index.html',
    ]);
});

gulp.task('sourcemaps', () => {
    return gulp.src(angularPath + '*-es5.*.map')
        .pipe(gulp.dest(finalPath));
});

gulp.task('removeOldSourcemaps', () => {
    return del([angularPath + '*.map']);
});

gulp.task('dist', gulp.series('clean', 'styles', 'scripts', 'assets', 'angularAssets', 'sourcemaps', 'removeOldSourcemaps'));

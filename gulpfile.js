var Gulp = require('gulp');
var Babel = require('gulp-babel');

Gulp.task('watch', function () {
    Gulp.watch('./src/**/*.*', Gulp.parallel(['js', 'other']));
});

Gulp.task('other', function () {
    return Gulp.src(['./src/**/*.*', '!./src/**/*.js'])
        .pipe(Gulp.dest('./dist'))
});

Gulp.task('js', function () {
    return Gulp.src('./src/**/*.js')
        .pipe(Babel())
        .pipe(Gulp.dest('./dist'))
});

Gulp.task('default', Gulp.parallel(['js', 'other', 'watch']));
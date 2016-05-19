var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

gulp.task('default', ['inject']);

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});


var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
gulp.task('inject', function() {

    gulp.src('./www/index.html')
        .pipe(inject(gulp.src(bowerFiles({
            paths: {
                bowerrc: '.bowerrc'
            }
        }), {
            read: false
        }), {
            name: 'bower',
            addRootSlash: false,
            ignorePath: 'www'
        }))
        .pipe(inject(gulp.src([
            './www/bundles/**/*.css',
            './www/bundles/**/*.js',
            './www/views/**/*.css',
            './www/views/**/*.js'
        ], {
            read: false
        }), {
            addRootSlash: false,
            ignorePath: 'www'
        }))
        .pipe(gulp.dest('./www'));

});

const
    gulp = require('gulp'),
    Url  = require('url'),
    browserSync = require('browser-sync').create('dev server'),
    proxy = require('http-proxy-middleware');
runSequence = require('run-sequence');

const mockRoutes = require('../mock').routes;

gulp.task('dev', function (cb) {
    runSequence('build', 'dev.server', 'dev.watch', cb);
});

gulp.task('dev.server', function () {
    /**
     * 监听文件的列表
     */
    const files = [
        './build/js/*.js',
        './build/img/',
        './build/css/*.css',
        './build/views/*.html'
    ];

    browserSync.init({
        open: "external",
        server: {
            baseDir: "./build",
            routes: {
                "/bower_components": "bower_components",
                "/js": "./build/js",
                "/css": "./build/css",
                "/img": "./build/img"
            },
            middleware: mockRoutes
        },
        files: files,
        startPath: "/views/index.html"
    })
});

gulp.task('dev.watch', function () {
    gulp.watch('./src/js/**/*.js', ['build.js']);
    gulp.watch('./src/css/**/*.scss', ['build.css']);
    gulp.watch('./src/images/**/*.{png,jpg,gif}', ['build.images']);
    gulp.watch('./src/views/*.html', ['build.html']);
});
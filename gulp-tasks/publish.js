const
    gulp        = require('gulp'),
    runSequence = require('run-sequence'),
    useref      = require('gulp-useref'),
    minifyCss   = require('gulp-cssnano'),
    minifyJs    = require('gulp-uglify'),
    gulpif      = require('gulp-if'),
    cdnify      = require('gulp-cdnify');

const CDN = {
    img: '//img.58cdn.com.cn/',
    css: '//c.58cdn.com.cn/',
    js: '//j1.58cdn.com.cn/'
};

gulp.task('publish', ['build'], function (cb) {
   runSequence('publish.useref', 'publish.cdn', 'publish.minify', cb);
});

/**
 * 根据html中的build注解合并静态资源
 */
gulp.task('publish.useref', function () {
    return gulp.src('./build/views/*.html', { base: './build' })
        .pipe(useref({
            searchPath: ['./build', '.']
        }))
        .pipe(gulp.dest('./dist'));
});

/**
 * 压缩静态资源
 */
gulp.task('publish.minify', function () {
    return gulp.src(['./dist/css/*.bundle.css', './dist/js/*.bundle.js'], { base : './dist' })
        .pipe(gulpif('*.js', minifyJs()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('./dist'));
});

/**
 * 替换静态资源中的路径
 */
gulp.task('publish.cdn', function () {
    let resultURL = '';

    return gulp.src(['./build/views/*.html', './build/css/*.css'], { base: './build' })
        .pipe(cdnify({
            rewriter: function (url) {
                const paths = url.split('/');
                const fileName = paths[paths.length - 1];
                if (/(\.css)$/.test(fileName)) {
                    resultURL = `${CDN.css}/${fileName}`;
                }
                else if (/(\.js)$/.test(fileName)) {
                    resultURL = `${CDN.js}/${fileName}`;
                }
                else if (/(\.(png|jpg|gif))$/.test(fileName)) {
                    resultURL = `${CDN.img}/${fileName}`;
                }

                return resultURL;
            }
        }))
        .pipe(gulp.dest('./dist'));
});
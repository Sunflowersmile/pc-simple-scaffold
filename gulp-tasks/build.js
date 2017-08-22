const
    gulp            = require('gulp'),
    sourcemaps      = require('gulp-sourcemaps'),
    fs              = require('fs'),
    path            = require('path'),

    sass            = require('gulp-sass'),
    postcss         = require('gulp-postcss'),
    autoprefixer    = require('autoprefixer'),
    sorting         = require('postcss-sorting'),

    rollup          = require('rollup').rollup,
    babel           = require('rollup-plugin-babel'),

    spritesmith     = require('gulp.spritesmith'),

    wiredep         = require('wiredep').stream,

    browserSync     = require('browser-sync').create('dev server'),

    merge           = require('merge-stream'),
    runSequence     = require('run-sequence');
/**
 * 1. 清理先前生成的编译后文件
 * 2. 编译js
 * 3. 编译css
 * 4. 处理图片资源
 * 5. 处理html资源
 * 6. 告诉gulp build任务完成
 */
gulp.task('build', function (cb) {
    runSequence('clean', ['build.js', 'build.css', 'build.images', 'build.html'], cb);
});
/**
 * 编译js,生成sourcemaps
 */
gulp.task('build.js', (function (){
    const SRC_PATH = './src/js/';
    const DEST_PATH = './build/js/';

    function readAllJsFromRootDir() {
        return new Promise(function (resolve, reject) {
            fs.readdir(SRC_PATH, function (err, files) {
                if (err) {
                    reject(err);
                }
                resolve(files.filter((filename) => /.*(\.js)$/.test(filename)));
            })
        });
    }

    function getJsInfos(names) {
        return new Promise(function (resolve, reject) {
            resolve(names.map(function (name) {
                return {
                    name: name,
                    path: SRC_PATH + name
                }
            }))
        });
    }

    function rollupAll(infos) {
        let promises = [];
        infos.forEach(function (info) {
            promises.push(
                rollup({
                    entry: info.path,
                    plugins: [
                        babel()
                    ]
                }).then((bundle) => {
                    return bundle.write({ //输出所有编译后的js
                        format: 'iife',
                        dest: DEST_PATH + info.name,
                        indent: true,
                        sourceMap: true
                    });
                })
            )
        });
        return Promise.all(promises);
    }

    return function () {
        return readAllJsFromRootDir()
            .then(getJsInfos)
            .then(rollupAll);
    }
}()));
/**
 * 1. 编译scss文件
 * 2. 生成sourcemaps
 * 3. 对编译好的css文件中的属性进行处理
 * 4. 将css文件复制到build文件夹下
 */
gulp.task('build.css', function () {
    return gulp.src('./src/css/*.scss', {base: './src'})
        .pipe(sass())            //编译sass
        .pipe(sourcemaps.init()) //生成源文件和便宜后文件的对应表
        .pipe(postcss([          //postcss处理css文件
            autoprefixer,        //添加前缀
            sorting()            //css属性排序
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build'));
});
/**
 * 处理图片
 */
gulp.task('build.images', function (cb) {
    runSequence(
        'build.images.copy',
        'build.images.sprite'
        , cb);
});
/**
 * 将除了sprite文件夹以外的图片复制到build文件夹下
 */
gulp.task('build.images.copy', function () {
    return gulp.src(['./src/img/*.{jpg,png,gif}', '!./src/img/sprite/*.{jpg,png,gif}'], {base: './src'})
        .pipe(gulp.dest('./build'));
});
/**
 * 制作雪碧图
 */
gulp.task('build.images.sprite', function () {
    const spriteData = gulp.src('./src/img/sprite/*.png')
        .pipe(spritesmith({
            imgName: 'img/sprite.png',
            cssName: 'css/sprite.css',
            padding: 5,
            algorithm: 'binary-tree'
        }));

    const imgStream = spriteData.img.pipe(gulp.dest('./build'));
    const cssStream = spriteData.css.pipe(gulp.dest('./build'));

    return merge(imgStream, cssStream);
});
/**
 * 处理html
 */
gulp.task('build.html', function (cb) {
    runSequence('build.html.bower-module-inject', cb);
});
/**
 * 将Bower组件注入到html中，并且将html源文件复制到build文件夹下
 */
gulp.task('build.html.bower-module-inject', function () {
    return gulp.src('./src/views/*.html')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('./build/views'));
});
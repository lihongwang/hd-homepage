var requirejs = require('gulp-requirejs'),
    path = require('path'),
    util = require('../utils'),
    appsPath = path.join(util.frontend, "src/apps/vhtml5/src/scripts/vme.es6/"),
    babel = require('gulp-babel'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    runSequence = require('run-sequence'),
    gulp = require('gulp'),
    del = require('del');
// gulp.task('es6-amd', ['clean-temp'], function() {
//     return gulp.src([appsPath + 'plugins.es6/**/*.js'])
//         .pipe(babel({ modules: "amd" }))
//         .pipe(gulp.dest(appsPath + "plugins"));
// });

// gulp.task('bundle-amd-clean', function() {
//     return del(['es5/amd']);
// });

// // gulp.task('amd-bundle', ['bundle-amd-clean', 'es6-amd'], function() {
// //     return requirejs({
// //             name: 'bootstrap',
// //             baseUrl: 'dest/temp',
// //             out: 'app.js'
// //         })
// //         .pipe(uglify())
// //         .pipe(gulp.dest("es5/amd"));
// // });

// // gulp.task('amd', ['amd-bundle']);
// gulp.task('amd', ['bundle-amd-clean', 'es6-amd']);
module.exports = function() {
    // return gulp.src([appsPath + 'plugins.es6/**/*.js'])
    //     .pipe(babel({ modules: "amd" }))
    //     .pipe(gulp.dest(appsPath + "plugins"));
    return gulp.src([appsPath + '**/*.js'])
        .pipe(babel({ modules: "amd" }))
        .pipe(gulp.dest(appsPath + "vme.new"));
};
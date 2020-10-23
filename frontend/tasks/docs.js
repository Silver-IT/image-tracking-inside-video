var typedoc = require("gulp-typedoc");
const gulp = require('gulp');

gulp.task("docs", function() {
	return gulp
	.src([
		"src/app/image-editor/image-editor.service.ts",
		"src/app/image-editor/objects/object-list.service.ts",
		"src/app/image-editor/canvas/active-object/active-object.service.ts",
	])
	.pipe(typedoc({
		module: "commonjs",
		target: "es5",
		out: "docs/",
		name: "pixie docs",
	    ignoreCompilerErrors: true,
	}));
});

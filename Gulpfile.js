var gulp = require("gulp"),
	sass = require("gulp-sass"),
	watchify = require("watchify"),
	source = require("vinyl-source-stream"),
	rename = require("gulp-rename"),
	express = require("express"),
	sfx = require("sfx"),
	notifier = new (require("node-notifier"));

/**
 * Create a static server.
 */
gulp.task("server", function() {
	var app = express();
	
	app.use(function(req, res, next) { 
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		console.log(" -> " + req.method + " " + req.url); next(); 
	});

	app.use(express.static(__dirname));
	app.listen(8001);
});

/**
 * Build the CSS.
 */
gulp.task("css", function() {
	gulp.src('./assets/style/*.scss')
		.pipe(sass())
		.on("error", function(err) {
			notifier.notify({
				message: "SASS",
				message: "Build error."
			});
			console.log(err.stack);
		})
		.on("end", function() {
			notifier.notify({
				title: "SASS",
				message: "Files built successfully."
			});
			
			sfx.funk();
		})
		.pipe(rename("bundle.css"))
		.pipe(gulp.dest('./assets/style'));
});

/*
 * Build the Javascript.
 */
gulp.task("browserify", function() {
	var bundler = watchify("./src/index.js");

	bundler.on("update", rebundle);

	function rebundle () {
		var bundle = bundler.bundle({ 
			debug: true 
		});

		bundle.on("end", function() {
			notifier.notify({
				title: "Browserify",
				message: "Files built successfully."
			})
		})

		bundle.on("error", function(err) {
			notifier.notify({
				title: "Browserify",
				message: "Parser error."
			});

			sfx.funk();
			console.log("\n" + err.stack);
		});

		bundle
			.pipe(source("bundle.js"))
			.pipe(gulp.dest("./"));
	}

	return rebundle();
});

/**
 * Build the app.
 */
gulp.task("build", ["browserify", "css"]);

/**
 * Watch for changes.
 */
gulp.task("watch", ["build", "server"], function() {
	gulp.watch("assets/style/*.scss", ["css"]);
});
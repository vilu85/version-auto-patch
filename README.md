![Version](https://img.shields.io/badge/version-1.2.3-blue.svg?cacheSeconds=2592000)
![Node.js](https://github.com/vilu85/version-auto-patch/actions/workflows/node.js.yml/badge.svg?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
# VersionAutoPatchPlugin

> Automatically patches the version number in specified package.json files

### 🏠 [Homepage](https://github.com/vilu85/version-auto-patch)

## Table of contents

- [VersionAutoPatchPlugin](#versionautopatchplugin)
		- [🏠 Homepage](#-homepage)
	- [Table of contents](#table-of-contents)
	- [Getting Started](#getting-started)
	- [Limitations](#limitations)
	- [Installation](#installation)
	- [Usage](#usage)
		- [Options](#options)
		- [Webpack plugin](#webpack-plugin)
		- [Task runners like Gulp and Grunt](#task-runners-like-gulp-and-grunt)
		- [Other methods](#other-methods)
		- [How to Use the cooldown Option](#how-to-use-the-cooldown-option)
	- [Running the tests](#running-the-tests)
	- [Issues](#issues)
	- [Contributing](#contributing)
	- [Versioning](#versioning)
	- [Authors](#authors)
	- [License](#license)

## Getting Started

The Version Auto Patch plugin is a tool that can be used to automatically increment the version number of your code after every build. This is especially useful during development, where you can run "npm watch" to watch for changes in your code and recompile automatically. The plugin can also be disabled during production builds to avoid unwanted version changes.

The plugin supports patching any version number that uses SemVer versioning. To use the plugin, you simply specify the path or paths to the package.json files that you want to patch, and the type of version update you want to make (major, minor, patch, prerelease, build). If you want to set the version to a specific value instead of incrementing it, you can also specify the version number.

Overall, this plugin helps to streamline your development process by automating version updates and reducing the risk of human error.

## Limitations

The Version Auto Patch plugin updates the numerical value found at the end of the version part that you have set to be updated. This means that any version number part that ends with a number can be patched using the plugin.

However, please note that currently the plugin cannot update the build number from a version number like "1.0.0+21AF26D3----117B344092BD" because the build number does not end with a numeric value.

Additionally, in order for the plugin to update a version number part, it must be present in the original version number. For instance, if the version number does not have a build part (e.g. "1.0.0-beta0.2"), the build number cannot be updated. Similarly, if the version number does not have a pre-release part, it cannot be updated either.

## Installation

```sh
npm install version-auto-patch
```

## Usage

### Options ###

VersionAutoPatchPlugin supports the following options, which can be passed as an object in the constructor:

**files**		-			A string or an array of strings indicating the file or files to be patched. By default, the package.json file will be patched.

**disabled** 	*optional*	A boolean value that, if set to true, disables the automatic version patching.

**version** 	*optional*	A string value that, if provided, will change the version to a specific value instead of incrementing the patch number.

**type**		*optional*	A string value that indicates the type of version increment to apply. Accepted values are *major*, *minor*, *patch*, *prerelease* or *build*. By default, the *patch* version will be incremented.

**cooldown**	*optional*	A numeric value that specifies the interval during which the version will not be updated (in milliseconds). This option is particularly useful for preventing unintended loops caused by "hot refresh" or "hot reload" behavior triggered by certain bundlers.

See example how to implement configuration from below.

### The Purpose of the cooldown Option ###
In certain scenarios, the VersionAutoPatchPlugin may encounter issues with updating the version number in the package.json file due to interactions with specific bundlers. Some bundlers or their configurations might initiate "hot refresh" or "hot reload" actions even when changes are made to the package.json file. As a result, the plugin can fall into a loop, continuously updating the version during these reloads, leading to unexpected behavior and potential conflicts.

The cooldown option offers a simple yet effective solution to this problem. By setting a cooldown period, the plugin will avoid updating the version within the specified interval after the previous update. During this cooldown period, any further version updates will be deferred, preventing unnecessary loops caused by bundler-related reloads.

For more information see [How to Use the cooldown Option](#how-to-use-the-cooldown-option).

### Webpack plugin ###

Example of how to automatically increase the patch version during development (`npm run watch` or other script watching changes) while disabling this behavior when compiling a production build with webpack:

To add the VersionAutoPatchPlugin to your webpack configuration, simply include it in your list of plugins. Here's an example:

```javascript
const VersionAutoPatchPlugin = require("version-auto-patch");
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	// ...
	plugins: [
		// other plugins...
		new VersionAutoPatchPlugin({
			files: ['package.json'],
			disabled: isProduction
		})
	]
}
```

In this example, the disabled option is set to true when the NODE_ENV environment variable is set to production. This prevents the plugin from increasing the version patch number when building a production version of your app.

You can also configure the VersionAutoPatchPlugin to increase the minor version by changing the plugin's options like this:

```javascript
const VersionAutoPatchPlugin = require("version-auto-patch");
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	// ...
	plugins: [
		// other plugins...
		new VersionAutoPatchPlugin({
			files: ['package.json'],
			type: isProduction ? 'patch' : 'minor'
		})
	]
}
```

### Task runners like Gulp and Grunt ###

To perform a version update with the same settings as in webpack, you can use the `updateVersion()` method provided by the VersionAutoPatchPlugin. This can be useful if you're using a task runner like Gulp or Grunt to build your project.

Here's an example implementation for Gulp:

```javascript
const gulp = require('gulp');
const VersionAutoPatchPlugin = require('version-auto-patch');

const versionPlugin = new VersionAutoPatchPlugin({
  files: "./package.json",
  type: "patch"
});

gulp.task('update-version', function (cb) {
  versionPlugin.updateVersion()
	.then(() => {
	  console.log('Version updated!');
	  cb();
	})
	.catch((err) => {
	  console.error('Error updating version:', err);
	  cb(err);
	});
});

```

In this example, we create a new instance of the VersionAutoPatchPlugin with the desired options, and define a Gulp task called `update-version`. When this task is run, it calls the `updateVersion()` method on the plugin instance, which updates the version and saves the changes to the `package.json` file. If the update is successful, the task prints a message to the console and calls the `cb` callback to signal that it has completed. If there's an error, it prints an error message and calls `cb` with the error.

Here is an example implementation for Gulp that demonstrates how to watch for changes in the code and update the build version accordingly:

```javascript
const gulp = require('gulp');
const VersionAutoPatchPlugin = require('version-auto-patch');
const versionPlugin = new VersionAutoPatchPlugin( {files: './package.json', type: 'build' });

gulp.task('update-buildversion', (cb) => {
	versionPlugin.updateVersion();
	cb();
});

gulp.task('watchChanges', function () {
	gulp.watch(
		['./src/*.js'],
		gulp.series(
			"update-buildversion"
		)
	)
});
```

In this example, we set up two Gulp tasks: `update-buildversion` and `watchChanges`.

The `update-buildversion` task updates the build version by calling the `updateVersion` method of the VersionAutoPatchPlugin instance.

The `watchChanges` task watches for changes in the _src_ directory using `gulp.watch` and triggers the `update-buildversion` task whenever a change is detected.

This way, whenever a change is made to the code, the build version will be automatically updated to reflect the changes, making it easier to track the version history of the software.

### Other methods ###

You can obtain the updated version string after running the task by calling the `getNewVersion()` method. This can be useful if you need to use the new version string in other parts of your code or in subsequent build steps.

```javascript
const newVersion = versionPlugin.getNewVersion();
```

### How to Use the cooldown Option ###

To make use of the cooldown option, simply provide a numeric value representing the cooldown duration in milliseconds when initializing the VersionAutoPatchPlugin. For example:

```javascript
const versionPlugin = new VersionAutoPatchPlugin({
  files: "./package.json",
  type: "patch",
  cooldown: 3000, // Set a cooldown of 3 seconds (3000 milliseconds).
});
```

## Running the tests

Jest test cases are included with this plugin to verify the increment of version numbers. To run the tests, simply install the Jest testing framework and execute the following command in your terminal:

```sh
npm run test
```

## Issues

Issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/vilu85/version-auto-patch/issues). You can also take a look at the [contributing guide](https://github.com/vilu85/version-auto-patch/blob/main/CONTRIBUTING.md).

## Contributing

Please read [CONTRIBUTING.md](https://github.com/vilu85/version-auto-patch/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/vilu85/version-auto-patch/tags).

## Authors

* **Ville Perkkio** - *Initial work* - [Website](https://github.com/vilu85) - [@vilu85](https://github.com/vilu85) - [@vilu85](https://gitlab.com/vilu85)

## License

Copyright © 2023 [Ville Perkkio](https://github.com/vilu85)

This project is [MIT](https://opensource.org/license/mit/) licensed.

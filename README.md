![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![Node.js](https://github.com/vilu85/version-auto-patch/actions/workflows/node.js.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Twitter: vilutex85](https://img.shields.io/twitter/follow/vilutex85.svg?style=social)](https://twitter.com/vilutex85)
# VersionAutoPatchPlugin

> Automatically patches the version number in specified package.json files

### 🏠 [Homepage](https://github.com/vilu85/version-auto-patch)

## Table of contents

- [Project Name](#version-auto-patch)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  	- [Usage](#usage)
		- [Options](#options)
		- [Webpack Plugin](#webpack-plugin)
		- [Task runners like Gulp and Grunt](#task-runners-like-gulp-and-grunt)
		- [Other methods](#other-methods)
    - [Running the tests](#running-the-tests)
  - [Issues](#issues)
  - [Contributing](#contributing)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

The Version Auto Patch plugin is a tool that can be used to automatically increment the version number of your code after every build. This is especially useful during development, where you can run "npm watch" to watch for changes in your code and recompile automatically. The plugin can also be disabled during production builds to avoid unwanted version changes.

The plugin supports patching any version number that uses SemVer versioning. To use the plugin, you simply specify the path or paths to the package.json files that you want to patch, and the type of version update you want to make (major, minor, or patch). If you want to set the version to a specific value instead of incrementing it, you can also specify the version number.

Overall, this plugin helps to streamline your development process by automating version updates and reducing the risk of human error.

## Installation

```sh
npm install version-auto-patch
```

```sh
npm install
```

## Usage

## Options

VersionAutoPatchPlugin supports the following options, which can be passed as an object in the constructor:

**files**	-	A string or an array of strings indicating the file or files to be patched. By default, the package.json file will be patched.

**disabled** 	*optional*	A boolean value that, if set to true, disables the automatic version patching.

**version** 	*optional*	A string value that, if provided, will change the version to a specific value instead of incrementing the patch number.

**type** 	*optional*	A string value that indicates the type of version increment to apply. Accepted values are major, minor, or patch. By default, the *patch* version will be incremented.

See example how to implement configuration from below.

### Webpack plugin ###

Example of how to automatically increase the patch version during development (`npm watch`) while disabling this behavior when compiling a production build with webpack:

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

### Other methods ###

You can obtain the updated version string after running the task by calling the `getNewVersion()` method. This can be useful if you need to use the new version string in other parts of your code or in subsequent build steps.

```javascript
const newVersion = versionPlugin.getNewVersion();
```

## Running the tests

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

* **Ville Perkkio** - *Initial work* - [Website](https://github.com/vilu85) - [@vilutex85](https://twitter.com/vilutex85) - [@vilu85](https://github.com/vilu85) - [@vilu85](https://linkedin.com/in/vilu85)

## License

Copyright © 2023 [Ville Perkkio](https://github.com/vilu85)

This project is [MIT](https://opensource.org/license/mit/) licensed.

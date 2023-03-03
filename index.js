const fs = require('fs');
const path = require('path');
const join = path.join;

/**
 * Copyright (c) 2023 Ville Perkkio
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @class VersionAutoPatchPlugin
 */
class VersionAutoPatchPlugin {
	/**
	 * Automatically patches the version number in specified package.json files.
	 *
	 * @constructor
	 *
	 * @param {object} options - Plugin options.
	 * @param {string|string[]} options.files - The path or array of paths to the package.json files to be patched.
	 * @param {boolean} [options.disabled=false] - If true, version patching is disabled.
	 * @param {string} [options.version] - If specified, the version will be set to this value instead of being incremented.
	 * @param {string} [options.type='patch'] - Specifies the type of version update: 'major', 'minor', 'patch', 'prerelease', 'build'.
	 */
	constructor(options) {
		const _options = {
			disabled: false || (options && options.disabled === true),
		};
		if (!_options.disabled) {
			this.files = options?.files || [];
			this.version = options?.version;
			this.type = options?.type ?? 'patch';
			this.newVersion = null;
			this.context = path.dirname(module.parent.filename);

			// allows for a single string entry
			if (
				typeof this.files === 'string' ||
				this.files instanceof String
			) {
				this.files = [options.files];
			}
		} else {
			this.files = [];
		}
	}

	bump(file, version) {
		try {
			const json = JSON.parse(fs.readFileSync(file).toString());
			const jsonVersion = json.version;
			const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:(-)((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:(\+)([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;
			const oldVersion = regex.exec(jsonVersion);
			const incrementType = ['major', 'minor', 'patch', 'separator', 'prerelease', 'separator', 'build'].indexOf(
				this.type.toLowerCase()
			);
			const substParts = ['$1', '$2', '$3', '$4', '$5', '$6', '$7'];
			if(incrementType <= 2) {
				substParts[incrementType] =
				parseInt(oldVersion[incrementType + 1]) + 1;
			} else {
				const patchPart = oldVersion[incrementType + 1];
				const numericStartOffset = patchPart.search(/\d+$/);
				// FIXME: The version doesn't increase as it should if the part begins with one or more zeros
				//			for example: "1.0.0-alpha+001" turns to "1.0.0-alpha+2" because patchedNumericPart
				//			is first converted from string to int "001" => 1.
				const patchedNumericPart = parseInt(patchPart.substring(numericStartOffset)) + 1;
				substParts[incrementType] = patchPart.substring(0, numericStartOffset) + patchedNumericPart;
			}

			const subst = version ?? substParts.slice(0,3).join('.') + substParts.slice(3,7).join('');
			this.newVersion = jsonVersion.replace(regex, subst);

			if (this.newVersion) {
				json.version = this.newVersion;
			} else {
				throw new Error('Version did not change.');
			}

			return json;
		} catch (/** @type {Error} */ error) {
			throw new Error(
				'Error: Failed to increase ' +
					this.type +
					' version number: ' +
					error.message
			);
		}
	}

	/**
	 * Updates package.json file(s) version.
	 * This is method can be used for updating the version if updater is not running in Webpack.
	 * New version can be get afterwards from `getNewVersion()`
	 *
	 * @throws {Error} Filesystem write error
	 *
	 * @memberof VersionAutoPatchPlugin
	 */
	async updateVersion() {
		this.files.forEach((e) => {
			const filepath =
				path.dirname(e) === '.' ? this.context : path.dirname(e);
			const filename = path.basename(e);
			const file = join(filepath, filename);
			const json = this.bump(file, this.version);
			fs.writeFile(file, JSON.stringify(json, null, 2), (err) => {
				if (err) throw err;
			});
		});
	}

	/**
	 * Returns a new version.
	 *
	 * @return {string|Error} new version string or Error if the version hasn't changed yet.
	 * @memberof VersionAutoPatchPlugin
	 */
	getNewVersion() {
		if (this.newVersion) {
			return this.newVersion;
		} else {
			throw new Error('Version is not changed yet.');
		}
	}

	/**
	 * A hook for Webpack compiler.
	 *
	 * @param {*} compiler webpack compiler
	 */
	apply(compiler) {
		if (this.files && this.files.length) {
			compiler.hooks.emit.tapAsync('done', (compilation, callback) => {
				this.updateVersion();
				if (callback) {
					callback();
				}
			});
		}
	}
}

module.exports = VersionAutoPatchPlugin;

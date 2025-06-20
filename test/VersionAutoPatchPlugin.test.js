/**
 * Copyright (c) 2023-2024 Ville Perkkio
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
 */
const fs = require('fs');
const path = require('path');
const join = path.join;

const mockFiles = {
	[join(__dirname, 'package.json')]: {
		version: '1.0.0',
	},
};

jest.mock('fs', () => {
	return {
		readFileSync: jest.fn().mockImplementation((file) => {
			return JSON.stringify(mockFiles[file]);
		}),
		writeFile: jest.fn().mockImplementation((file, data, cb) => {
			mockFiles[file] = JSON.parse(data);
			cb(null);
		}),
		writeFileSync: jest.fn().mockImplementation((file, data, cb) => {
			mockFiles[file] = JSON.parse(data);
			cb(null);
		}),
	};
});

const readFileSync = jest.fn().mockImplementation((file) => {
	return JSON.stringify(mockFiles[file]);
});

const writeJsonFile = jest.fn().mockImplementation((file, data) => {
	mockFiles[file] = data;
});

const VersionAutoPatchPlugin = require('../index');

describe('VersionAutoPatchPlugin', () => {
	afterEach(() => {
		mockFiles[join(__dirname, 'package.json')] = {
			version: '1.2.3',
		};
	});

	it('should increment the major version of package.json', async () => {
		// Increment the major version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [join(__dirname, 'package.json')],
			type: 'major',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const file = join(__dirname, 'package.json');
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(1);
		expect(json.version).toBe('2.0.0');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('2.0.0');
	});

	it('should increment the minor version of package.json', async () => {
		// Increment the minor version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [join(__dirname, 'package.json')],
			type: 'minor',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const file = join(__dirname, 'package.json');
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(2);
		expect(json.version).toBe('1.3.0');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.3.0');
	});

	it('should increment the patch version of package.json', async () => {
		// Increment the patch version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [join(__dirname, 'package.json')],
			type: 'patch',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const file = join(__dirname, 'package.json');
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(3);
		expect(json.version).toBe('1.2.4');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.2.4');
	});

	it('should increment the patch version of package.json when package.json is not set in config.', async () => {
		// Increment the patch version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			type: 'patch',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const file = join(__dirname, 'package.json');
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(4);
		expect(json.version).toBe('1.2.4');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.2.4');
	});

	it('should increment the build version of package.json for complex SemVer version numbers', async () => {
		// Set up the test by writing a package.json file with a complex SemVer version number
		const file = join(__dirname, 'package.json');
		const initialVersion = '1.0.0-alpha+001';
		const packageJson = {
			name: 'test-package',
			version: initialVersion,
			description: 'A test package for VersionAutoPatchPlugin',
			author: 'Jane Doe',
			main: 'index.js',
		};

		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'build',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);
		expect(fs.writeFile).toHaveBeenCalledTimes(5);
		expect(json.version).toBe('1.0.0-alpha+002');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.0-alpha+002');

		// Set up the test for the second complex SemVer version number
		packageJson.version = '1.0.0+20130313144700';
		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content2 = await readFileSync(file, 'utf8');
		const json2 = JSON.parse(content2);
		expect(fs.writeFile).toHaveBeenCalledTimes(6);
		expect(json2.version).toBe('1.0.0+20130313144701');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe(
			'1.0.0+20130313144701'
		);

		// Set up the test for the third complex SemVer version number
		packageJson.version = '1.0.0-beta+exp.sha.5114f85';
		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content3 = await readFileSync(file, 'utf8');
		const json3 = JSON.parse(content3);
		expect(fs.writeFile).toHaveBeenCalledTimes(7);
		expect(json3.version).toBe('1.0.0-beta+exp.sha.5114f86');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe(
			'1.0.0-beta+exp.sha.5114f86'
		);

		// Set up the test for the even more complex prerelease and build numbers
		packageJson.version = '1.0.0+21AF26D3----117B344092';
		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content4 = await readFileSync(file, 'utf8');
		const json4 = JSON.parse(content4);
		expect(fs.writeFile).toHaveBeenCalledTimes(8);
		expect(json4.version).toBe('1.0.0+21AF26D3----117B344093');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe(
			'1.0.0+21AF26D3----117B344093'
		);
	});

	it('should increment the prerelease version of package.json', async () => {
		// Set up the test by writing a package.json file with a prerelease version number
		const file = join(__dirname, 'package.json');
		const initialVersion = '1.0.0-alpha.1';
		const packageJson = {
			name: 'test-package',
			version: initialVersion,
			description: 'A test package for VersionAutoPatchPlugin',
			author: 'Jane Doe',
			main: 'index.js',
		};

		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'prerelease',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);
		expect(fs.writeFile).toHaveBeenCalledTimes(9);
		expect(json.version).toBe('1.0.0-alpha.2');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.0-alpha.2');

		// Set up the test for the version number with numeric prerelease
		packageJson.version = '1.0.0-0.3.7';
		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content3 = await readFileSync(file, 'utf8');
		const json3 = JSON.parse(content3);
		expect(fs.writeFile).toHaveBeenCalledTimes(10);
		expect(json3.version).toBe('1.0.0-0.3.8');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.0-0.3.8');

		// Set up the test for the version number with prerelease and build number
		packageJson.version = '1.0.0-x.7.z.92';
		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content2 = await readFileSync(file, 'utf8');
		const json2 = JSON.parse(content2);
		expect(fs.writeFile).toHaveBeenCalledTimes(11);
		expect(json2.version).toBe('1.0.0-x.7.z.93');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.0-x.7.z.93');
	});

	it('should remove the build version number of package.json when pre-release version changes', async () => {
		// Set up the test by writing a package.json file with a build version number
		const file = join(__dirname, 'package.json');
		const initialVersion = '1.0.0-alpha123+123';
		const packageJson = {
			name: 'test-package',
			version: initialVersion,
			description: 'A test package for VersionAutoPatchPlugin',
			author: 'John Doe',
			main: 'index.js',
		};

		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'prerelease',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);
		expect(fs.writeFile).toHaveBeenCalledTimes(12);
		expect(json.version).toBe('1.0.0-alpha124');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.0-alpha124');
	});

	it('should remove the pre-release and build version numbers of package.json when major/minor/patch changes', async () => {
		// Set up the test by writing a package.json file with a build version number
		const file = join(__dirname, 'package.json');
		const initialVersion = '1.0.0-alpha123+123';
		const packageJson = {
			name: 'test-package',
			version: initialVersion,
			description: 'A test package for VersionAutoPatchPlugin',
			author: 'John Doe',
			main: 'index.js',
		};

		await writeJsonFile(file, packageJson);

		// Increment the major version number using VersionAutoPatchPlugin
		let versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'major',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly and lower version numbers removed
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);
		expect(fs.writeFile).toHaveBeenCalledTimes(13);
		expect(json.version).toBe('2.0.0');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('2.0.0');

		// Reset test package.json file for the next test
		await writeJsonFile(file, packageJson);

		// Increment the minor version number using VersionAutoPatchPlugin
		versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'minor',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly and lower version numbers removed
		const content2 = await readFileSync(file, 'utf8');
		const json2 = JSON.parse(content2);
		expect(fs.writeFile).toHaveBeenCalledTimes(14);
		expect(json2.version).toBe('1.1.0');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.1.0');

		// Reset test package.json file for the next test
		await writeJsonFile(file, packageJson);

		// Increment the patch version number using VersionAutoPatchPlugin
		versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'patch',
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly and lower version numbers removed
		const content3 = await readFileSync(file, 'utf8');
		const json3 = JSON.parse(content3);
		expect(fs.writeFile).toHaveBeenCalledTimes(15);
		expect(json3.version).toBe('1.0.1');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.1');
	});

	it('should disable version patching', async () => {
		// Set up the test by writing a package.json file
		const file = join(__dirname, 'package.json');
		const initialVersion = '1.0.0';
		const packageJson = {
			name: 'test-package',
			version: initialVersion,
			description: 'A test package for VersionAutoPatchPlugin',
			author: 'Jane Doe',
			main: 'index.js',
		};

		await writeJsonFile(file, packageJson);

		// Attempt to increase the version number using VersionAutoPatchPlugin when the plugin is disabled
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['package.json'],
			type: 'patch',
			disabled: true,
		});

		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number has not been changed
		const content = readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(15);
		expect(json.version).toBe('1.0.0');
		expect(() => versionAutoPatchPlugin.getNewVersion()).toThrow(
			'Version is not changed yet.'
		);
	});

	it('should change the version to a specific version', async () => {
		// Change the version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['package.json'],
			type: 'patch',
			version: '2.0.0',
		});

		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const file = join(__dirname, 'package.json');
		const content = readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(16);
		expect(json.version).toBe('2.0.0');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('2.0.0');
	});

	it('should throw an error if the file does not exist', async () => {
		// Try increasing the version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['foo.json'],
			type: 'patch',
		});

		// Verify that the VersionAutoPatchPlugin throws an error
		await expect(versionAutoPatchPlugin.updateVersion()).rejects.toThrow(
			/Error: Failed to increase patch version number: .*?/
		);
	});

	it('should not increment the version of package.json during cooldown period', async () => {
		// Set up the test by writing a package.json file with a build version number
		const file = join(__dirname, 'package.json');
		const initialVersion = '1.0.0+beta1';
		const packageJson = {
			name: 'test-package',
			version: initialVersion,
			description: 'A test package',
			main: 'index.js',
		};

		await writeJsonFile(file, packageJson);

		// Increment the version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: [file],
			type: 'build',
			cooldown: 2000
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);
		expect(json.version).toBe('1.0.0+beta2');
		expect(versionAutoPatchPlugin.isCooldownActive()).toBe(true);

		// Attempt to increment version number again
		await versionAutoPatchPlugin.updateVersion();

		// Expect the version be the same because the cooldown was active
		expect(json.version).toBe('1.0.0+beta2');
	});

	it('should increment the patch version of package.json in the basePath', async () => {
		// Increment the patch version number using VersionAutoPatchPlugin
		const versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			type: 'patch',
			basePath: __dirname
		});
		await versionAutoPatchPlugin.updateVersion();

		// Verify that the version number was incremented correctly
		const file = join(__dirname, 'package.json');
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(18);
		expect(json.version).toBe('1.2.4');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.2.4');
	});
});

describe('VersionAutoPatchPlugin used as a webpack plugin', () => {
	let plugin;
	let mockCompiler;

	beforeEach(() => {
		plugin = new VersionAutoPatchPlugin({
			files: ['package.json'],
		});
		mockCompiler = {
			hooks: {
				emit: {
					tapAsync: jest.fn((eventName, callback) => {
						callback();
					}),
				},
			},
		};
	});

	afterEach(() => {
		mockFiles[join(__dirname, 'package.json')].version = '1.0.0';
	});

	describe('apply', () => {
		it('should call updateVersion when emit hook is triggered', (done) => {
			plugin.apply(mockCompiler);

			expect(mockCompiler.hooks.emit.tapAsync).toHaveBeenCalledWith(
				'done',
				expect.any(Function)
			);

			mockCompiler.hooks.emit.tapAsync.mock.calls[0][1](null, () => {
				expect(plugin.getNewVersion()).not.toBeNull();
				done();
			});
		});

		it('should not call updateVersion when files are not specified', () => {
			plugin = new VersionAutoPatchPlugin({ disabled: true });
			plugin.apply(mockCompiler);

			expect(mockCompiler.hooks.emit.tapAsync).not.toHaveBeenCalled();
		});
	});
});

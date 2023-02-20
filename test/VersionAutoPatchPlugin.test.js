const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

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
 */

const join = path.join;
const writeFile = promisify(fs.writeFile);

const mockFiles = {
	'package.json': {
		'version': '1.0.0',
	},
};

jest.mock('fs', () => {
	return {
	  readFileSync: jest.fn().mockImplementation((file, encoding) => {
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

const readFileSync = jest.fn().mockImplementation((file, encoding) => {
	return JSON.stringify(mockFiles[file]);
});

const VersionAutoPatchPlugin = require('../index');

describe('VersionAutoPatchPlugin', () => {
	let versionAutoPatchPlugin;
	beforeEach(() => {
		versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['package.json'],
			type: 'patch',
		});
	});

	afterEach(() => {
		mockFiles[join(__dirname, 'package.json')] = {
			'version': '1.0.0'
		};
	});

	it('should increment the patch version of package.json', async () => {
		await versionAutoPatchPlugin.updateVersion();

		const file = join(__dirname, 'package.json');
		const content = await readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(1);
		expect(json.version).toBe('1.0.1');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('1.0.1');
	});

	it('should disable version patching', async () => {
		versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['package.json'],
			type: 'patch',
			disabled: true,
		});

		await versionAutoPatchPlugin.updateVersion();

		const file = join(__dirname, 'package.json');
		const content = readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(1);
		expect(json.version).toBe('1.0.0');
		expect(() => versionAutoPatchPlugin.getNewVersion()).toThrowError('Version is not changed yet.');
	});

	it('should change the version to a specific version', async () => {
		versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['package.json'],
			type: 'patch',
			version: '2.0.0',
		});

		await versionAutoPatchPlugin.updateVersion();

		const file = join(__dirname, 'package.json');
		const content = readFileSync(file, 'utf8');
		const json = JSON.parse(content);

		expect(fs.writeFile).toHaveBeenCalledTimes(2);
		expect(json.version).toBe('2.0.0');
		expect(versionAutoPatchPlugin.getNewVersion()).toBe('2.0.0');
	});

	it('should throw an error if the file does not exist', async () => {
		versionAutoPatchPlugin = new VersionAutoPatchPlugin({
			files: ['foo.json'],
			type: 'patch',
		});

		await expect(versionAutoPatchPlugin.updateVersion()).rejects.toThrow(
			/Error: Failed to increase patch version number: .*?/
		);
	});
});

describe('VersionAutoPatchPlugin used as a webpack plugin', () => {
	let plugin;
	let mockCompiler;

	beforeEach(() => {
		plugin = new VersionAutoPatchPlugin({
			files: ['package.json']
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
		mockFiles['package.json'].version = '1.0.0';
	});

	describe('apply', () => {
		it('should call updateVersion when emit hook is triggered', (done) => {
			plugin.apply(mockCompiler);

			expect(mockCompiler.hooks.emit.tapAsync).toHaveBeenCalledWith('done', expect.any(Function));

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

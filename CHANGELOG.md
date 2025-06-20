## 1.3.1 (2025-06-20)

- Updated all development dependencies.

## 1.3.0 (2024-10-27)

- Added support for ESM modules.
- Added option to specify base path for file(s).
- Updated all development dependencies.

## 1.2.1 (2023-03-13)

- Fixed an issue where the "package.json" file was not being patched when not explicitly set in the configuration. The plugin now uses "package.json" as the default file if no other file or files have been specified in the configuration.
- Fixed an issue where lower version number parts did not reset when the upper number was increased by the plugin. For example, when increasing the minor version number, the patch number was not reset to zero, resulting in versions like 1.2.3 -> 1.3.3 instead of 1.3.0. This behavior has been corrected so that the patch number resets to zero when a higher version number part is incremented, ensuring that version numbers are correctly incremented according to SemVer rules.
- Fixed an issue where pre-release and/or build version numbers were not cleared when incrementing major, minor, or patch numbers, resulting in version numbers that did not conform to SemVer standards. For example, when incrementing the patch number of a version like 1.2.3-alpha123+123, the pre-release and build numbers would not be cleared, resulting in a non-compliant version number like 1.2.4-alpha123+123. This behavior has been corrected so that the pre-release and/or build numbers are cleared when the major, minor, or patch numbers are incremented, resulting in properly formatted version numbers that follow SemVer conventions.

## 1.2.0 (2023-03-05)

- Added option to update pre-release and build numbers.

## 1.1.0 (2023-02-23)

- Added capability to update any version that adheres to the SemVer standard.
- Removed the built-in modules of Node.js from the list of dependencies.
- Added configurations for ESlint, Prettier and EditorConfig.

## 1.0.0 (2023-02-20)

- Initial release

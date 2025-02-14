# memoryloupe

memoryloupe provides codelenses about gcc compiled executable symbol size and stack usage.

It is used to provide insight  next to the actual code.

It parses gcc generated files produced when compiling and linking executable with the following options:

- `-Wl,-Map=%.map` outputs `.map` file
- `-fstack-usage` outputs `.su` files

## Features

codelenses provide symbol info such as

- symbol code size
- discarded or used status
- function stack usage

## Requirements

Requires an extension that provides symbol information (Outline panel in the Explorer tab): [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) or [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)

## Usage

Open a C file, the codelenses should appear next to the symbols.

The extension activates, finds and parses `.map` and `.su` files witin the current workspace.

### Commands

- `memoryloupe: Select build directory` choose the location of the files to be parsed, if you have multiple build dirs.

### Settings

* `memoryloupe.buildDir`: Enable/disable this extension.

## Build

build the extension `.vsix` package
```shell
npm install
npm run vsix
```

## Roadmap

- codelens format configuration (templating) in configuration
- use quickpicks instead of filepicker for selecting build dir
- error handling and logging
- tests
- extension icon

## Known Issues

- duplicate symbols, not filtering by file: symbol information can be mismatched if there are multiple symbols with the same name, although this should not be possible
- not tested on c++ project, although the extension activates for cpp files, it could work
- only support utf-8 file encoding

## Release Notes

### 1.2.0

- fixed `Select build directory` command, there is now only one codelens
- added `buildDir` configuration, updated with `Select build directory`

### 1.1.0

- added `Select build directory` command

### 1.0.0

Initial release

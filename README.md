# MemoryLoupe

MemoryLoupe provides in-editor code size insights: codelenses about executable symbol size and stack usage.

![Sample code with symbol codelenses](https://raw.githubusercontent.com/plharraud/memoryloupe/dev/assets/symbol_codelenses.png)

It parses gcc generated files produced when compiling and linking executable with the following options:

- `-Wl,-Map=%.map` outputs `.map` file.
- `-fstack-usage` outputs `.su` files.
- `-ffunction-sections` and `-fdata-sections` separates symbols in their own section, enables garbage collection (using `-Wl,--gc-sections`), and produces usable data in .map file.

MemoryLoupe is available on the [Open VSX Registry](https://open-vsx.org/extension/plharraud/memoryloupe), [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=plharraud.memoryloupe) and in [Github releases](https://github.com/plharraud/memoryloupe/releases/latest).

## Features

codelenses provide symbol info such as

- Symbol code size, address and section
- Whether the symbol is discarded or not
- Function stack usage

## Requirements

Requires an extension that provides symbol information (`Outline` panel in the `Explorer` tab): [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) or [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd).

## Usage

Open a C file, the codelenses should appear next to the symbols.

The extension activates, finds and parses `.map` and `.su` files witin the current workspace.

### Commands

- `memoryloupe: Select build directory`: Set the location where the files should be searched.
- `memoryloupe: Toggle codelenses`: Enable/disable codelenses.

### Settings

- `memoryloupe.codeLensesEnabled`: Show codelenses next to symbols in editor.
- `memoryloupe.buildDir`: Directory to look for .map and .su files, also set by `Select build directory` command.
- `memoryloupe.lenseFormat`: Custom codelense format string. Specify optional prefix with `$[prefix]{value}`.

## Build

Build the extension `.vsix` package:
```shell
npm install
npm run vsix
```

## Todo

- alert if multiple .map found > button select or disable
- tree view
- use quickpicks instead of filepicker for selecting build dir
- error handling and logging
- tests
- extension icon

## Known Issues

- duplicate symbols, not filtering by file: symbol information can be mismatched if there are multiple symbols with the same name, although this should not be possible
- not tested on c++ project, although the extension activates for cpp files, it could work
- only tested with bare-metal arm-none-eabi projects
- only support utf-8 file encoding

## Other tools

### vscode extensions
- https://github.com/XibrenX/gcc-stack-usage
- https://github.com/nachstedt/vscode-stack-usage

### cli tools
- https://github.com/jedrzejboczar/elf-size-analyze
- https://github.com/PromyLOPh/linkermapviz
- https://os.mbed.com/docs/mbed-os/v6.16/debug-test/memap.html

### gui tools
- https://www.sikorskiy.net/info/prj/amap/index.html
- https://github.com/govind-mukundan/MapViewer

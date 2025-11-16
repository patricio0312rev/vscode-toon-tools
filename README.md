# TOON Tools for VS Code

Convert between JSON and TOON format with live preview. Perfect for LLM workflows.

## Features

- Convert JSON to TOON and vice versa (in-place or new file)
- Live preview panel with editable JSON and real-time TOON updates
- One-click copy buttons for both formats
- Table viewer for visualizing tabular data
- Size/token analyzer to compare format efficiency
- Minify and prettify commands for TOON files
- Syntax highlighting for TOON files
- Code folding support for nested structures
- Status bar with real-time file stats
- Works on selections or entire files
- Full context menu integration

## Installation

Install from the VS Code Marketplace or download the `.vsix` file.

## Usage

### Converting Files

**In-Place Conversion:**

1. Open a JSON or TOON file (or select text)
2. Open command palette → `TOON: JSON → TOON (replace)` or `TOON: TOON → JSON (replace)`
3. Or use Command Palette (Cmd/Ctrl+Shift+P)

**Convert to New File:**

1. Open a JSON or TOON file
2. Open command palette → `TOON: JSON → TOON (new file)` or `TOON: TOON → JSON (new file)`
3. A new file with the converted content will be created and opened

For example:

- `data.json` → creates `data.toon`
- `config.toon` → creates `config.json`

### Live Preview

1. Open any JSON or TOON file
2. Open command palette → `TOON: Open Live Preview`
3. A split view opens showing both formats side-by-side
4. **Edit the JSON** in the left pane and watch TOON update in real-time
5. **Click Copy** buttons to copy either format to clipboard

### Table Viewer

1. Open a JSON or TOON file with tabular data
2. Open command palette → `TOON: Open Table Viewer`
3. View your data formatted as interactive HTML tables
4. Perfect for exploring arrays of objects and nested data structures

### Analyze Size / Tokens

1. Open any JSON or TOON file
2. Open command palette → `TOON: Analyze Size / Tokens`
3. See a detailed comparison of:
   - File sizes (bytes)
   - Token counts (estimated)
   - Compression ratio
   - Efficiency gains

### Minify & Prettify

**Minify:**

1. Open a JSON or TOON file
2. Open command palette → `TOON: Minify`
3. Your file will be minified in-place
4. See how many bytes you saved!

**Prettify:**

1. Open a minified TOON file
2. Open command palette → `TOON: Prettify`
3. Your file will be formatted with proper indentation
4. Makes minified files readable again!

### Syntax Highlighting & Code Folding

- `.toon` files automatically get syntax highlighting
- Keys, values, arrays, and objects are color-coded
- Click fold/unfold arrows in the gutter to collapse sections
- Keyboard shortcuts: `Ctrl/Cmd + Shift + [` to fold, `]` to unfold

### Status Bar

- Open any `.toon` or `.json` file
- Check the bottom-right status bar for:
  - File size (bytes/KB/MB)
  - Estimated token count
  - Line count
- Updates in real-time as you edit!

## Examples

### Input JSON:

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}
```

### Output TOON:

```toon
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

### Minified TOON:

```toon
users[2]{id,name,role}:
1,Alice,admin
2,Bob,user
```

### Prettified TOON:

```toon
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

## Commands

| Command                        | Description                           |
| ------------------------------ | ------------------------------------- |
| `TOON: JSON → TOON (replace)`  | Convert JSON to TOON in current file  |
| `TOON: TOON → JSON (replace)`  | Convert TOON to JSON in current file  |
| `TOON: Minify (replace)`       | Minify TOON in current file           |
| `TOON: JSON → TOON (new file)` | Create new .toon file from JSON       |
| `TOON: TOON → JSON (new file)` | Create new .json file from TOON       |
| `TOON: Minify (new file)`      | Create new .min.toon file             |
| `TOON: Prettify`               | Format TOON with proper indentation   |
| `TOON: Open Live Preview`      | Open interactive preview panel        |
| `TOON: Open Table Viewer`      | View tabular data in formatted tables |
| `TOON: Analyze Size / Tokens`  | Compare JSON vs TOON efficiency       |

## What is TOON?

TOON is a human-readable data format optimized for LLM workflows. Learn more at [toon-format](https://github.com/toon-format).

## Requirements

- VS Code 1.75.0 or higher

## Known Issues

None yet! Report issues on [GitHub](https://github.com/patricio0312rev/vscode-toon-tools/issues).

## Release Notes

### 0.3.0

New features:

- Syntax highlighting for TOON files with color-coded keys, values, and structures
- Prettify command to format minified TOON with proper indentation
- Code folding support for collapsing/expanding nested structures
- Status bar widget showing real-time file size, token count, and line count
- Auto-closing brackets and quotes for TOON files
- Comment support with `#` for TOON files

Improvements:

- Better handling of minified TOON files in prettify and minify
- Enhanced language configuration for TOON
- Improved context menu organization

### 0.2.0

New features:

- Table Viewer for visualizing tabular data in HTML tables
- Size/Token Analyzer with visual comparison charts
- Minify command to optimize TOON files
- Copy buttons in live preview
- Editable JSON pane in live preview with real-time updates
- Improved context menu organization

### 0.1.0

Initial release:

- JSON ↔ TOON conversion (in-place and to new file)
- Interactive live preview with editable JSON panel
- Copy buttons for both formats
- Context menu integration

## License

MIT

---

**Enjoy!** 💜

Made with love by [Patricio Marroquin](https://www.patriciomarroquin.dev)

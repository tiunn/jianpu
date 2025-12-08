# Jianpu Editor (Web-based Numbered Musical Notation)

A simple, lightweight web tool for creating, editing, and printing Jianpu (numbered musical notation) scores.

## Features

- **Real-time Rendering**: Type your notation code and see the score update instantly.
- **Smart Layout**: Automatically organizes measures into rows.
- **Save & Load**: Save your work as `.json` project files and load them later.
- **Print / PDF Export**: Optimized print styles for high-quality PDF output (with correct beam rendering).
- **Zoom Control**: Adjust the size of the music notes (defaults to compact size).
- **Key Signature**: Select the musical key (e.g., `1=C`, `1=G`) from the dropdown.
- **Customizable**: Set Song Title, Beats per Bar, and Measures per Row.

## Usage Guide

### Basic Syntax
Type notes using numbers `1-7` and `0` for rests.

| Symbol | Description | Example |
| :--- | :--- | :--- |
| `1` - `7` | Musical Notes (Do - Ti) | `1 5 3` |
| `0` | Rest | `0` |
| `q` | **Quaver** (Eighth Note) - Prefix | `q1` (Single underline) |
| `s` | **Semiquaver** (Sixteenth Note) - Prefix | `s1` (Double underline) |
| `'` | **High Octave** - Suffix | `1'` (Dot above) |
| `,` | **Low Octave** - Suffix | `6,` (Dot below) |
| `-` | **Extension** (Quarter note duration) | `1-` |
| `.` | **Dotted Note** | `1.` |

### Measures and Bars
- **Bar Lines**: Use `/` or `|` to manually separate notes into measures.
- **New Lines**: Pressing `Enter` automatically starts a new measure.
- **Repeat Signs**: Use `|:` to start a repeat and `:|` to end it.
  - Example: `|: 1 2 3 4 :|`

### Lyrics / Text Blocks
Start a line with `##` to treat it as a lyrics or text line. Consecutive lines starting with `##` will be grouped together with tighter spacing.
```text
1 2 3 4
## This is verse 1
## The lyrics are here
5 6 7 8
```

### Example
```text
q1 q1 q5 q5 q6 q6 q5 -
q4 q4 q3 q3 q2 q2 1 -
|: 5 5 4 4 3 3 2 - :|
```

## How to Run
Simply open `index.html` in any modern web browser. No server required.

## Keyboard Shortcuts
- **Print**: Click the "Print / PDF" button or use `Cmd+P` / `Ctrl+P`.
- **Zoom**: Use the slider to scale the score size.

[English Version](#english-version)

# 簡譜編輯器 (Jianpu Editor)

一個簡單輕量的網頁工具，用於建立、編輯和列印簡譜。

## 功能特色

- **即時渲染**：輸入代碼即可即時預覽簡譜。
- **智慧排版**：自動將小節排列成行，並根據內容自動調整。
- **存檔與讀取**：可將作品存為 `.json` 專案檔，方便日後編輯。
- **列印 / PDF 匯出**：針對列印最佳化的樣式，可輸出高品質 PDF（修正了連音線的顯示）。
- **縮放控制**：透過滑桿調整簡譜的大小（預設為緊湊大小）。
- **調號選擇**：可從下拉選單選擇調號（如 `1=C`、`1=G`）。
- **歌詞與文字**：支援歌詞輸入，並自動調整行距與對齊。
- **自訂設定**：可設定曲名、每小節拍數及每行小節數。

## 使用指南

### 基本語法
使用數字 `1-7` 代表音符，`0` 代表休止符。

| 符號 | 說明 | 範例 |
| :--- | :--- | :--- |
| `1` - `7` | 音符 (Do - Ti) | `1 5 3` |
| `0` | 休止符 | `0` |
| `q` | **八分音符** (下方一條線) - 前綴 | `q1` |
| `s` | **十六分音符** (下方兩條線) - 前綴 | `s1` |
| `'` | **高八度** (上方一點) - 後綴 | `1'` |
| `,` | **低八度** (下方一點) - 後綴 | `6,` |
| `-` | **延音線** (延長一拍) | `1-` |
| `.` | **附點音符** | `1.` |

### 小節與小節線
- **小節線**：使用 `/` 或 `|` 手動分隔小節。
- **換行**：按 `Enter` 鍵會視為新的小節開始。
- **反覆記號**：使用 `|:` 開始反覆，`:|` 結束反覆。
  - 範例：`|: 1 2 3 4 :|`

### 歌詞 / 文字區塊
在行首加上 `##` 即可將該行視為歌詞或文字行。
- 連續的 `##` 行會被群組在一起，行距較緊密。
- **忽略空白行**：在歌詞行之間的空白行會被自動忽略，讓您可以自由排版而不影響顯示。
- **自動對齊**：歌詞行靠左對齊，且與樂譜保持適當間距。

範例：
```text
1 2 3 4
## 這是第一段歌詞
## 歌詞會靠左對齊
5 6 7 8
```

### 範例代碼
```text
q1 q1 q5 q5 q6 q6 q5 -
q4 q4 q3 q3 q2 q2 1 -
|: 5 5 4 4 3 3 2 - :|
```

## 如何執行
直接使用瀏覽器開啟 `index.html` 即可，無需安裝伺服器。

## 鍵盤快捷鍵
- **列印**：點擊按鈕或使用 `Cmd+P` / `Ctrl+P`。

---

<a id="english-version"></a>
# Jianpu Editor (Web-based Numbered Musical Notation)

A simple, lightweight web tool for creating, editing, and printing Jianpu (numbered musical notation) scores.

## Features

- **Real-time Rendering**: Type your notation code and see the score update instantly.
- **Smart Layout**: Automatically organizes measures into rows.
- **Save & Load**: Save your work as `.json` project files and load them later.
- **Print / PDF Export**: Optimized print styles for high-quality PDF output (with correct beam rendering).
- **Zoom Control**: Adjust the size of the music notes (defaults to compact size).
- **Key Signature**: Select the musical key (e.g., `1=C`, `1=G`) from the dropdown.
- **Lyrics Blocks**: Support for lyrics with smart spacing and grouping.
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
Start a line with `##` to treat it as a lyrics or text line. Recursive lines starting with `##` will be grouped together with tighter spacing.
- **Blank Lines**: Blank lines between lyrics lines are ignored.
- **Alignment**: Lyrics are left-aligned.

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

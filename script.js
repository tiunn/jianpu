document.addEventListener('DOMContentLoaded', () => {
    // --- Localization ---
    const translations = {
        en: {
            appTitle: "Jianpu Editor",
            appSubtitle: "Simple Numbered Musical Notation",
            helpBtn: "❓ Help",
            loadBtn: "📂 Load",
            saveBtn: "💾 Save",
            printBtn: "🖨️ Print / PDF",
            inputCode: "Input Code",
            songTitlePh: "Song Title",
            beatsLabel: "Beats:",
            measuresLabel: "Measures/Row:",
            zoomLabel: "Zoom:",
            zoomInBtn: "Zoom In",
            zoomOutBtn: "Zoom Out",
            keyLabel: "Key:",
            lyricistLabel: "Lyricist:",
            composerLabel: "Composer:",
            subtitleLabel: "Subtitle:",
            inputAreaPh: "Type notes here...",
            previewTitle: "Preview",
            defaultSongTitle: "Song Title",
            tooltipContent: `<strong>Syntax Guide</strong><br>
                        Notes: 1-7, 0 (rest)<br>
                        Rhythm: q (8th), s (16th)<br>
                        Octave: ' (high), , (low)<br>
                        Duration: - (extend), . (dot)<br>
                        Example: q1' s5, 3-`
        },
        zh: {
            appTitle: "簡譜編輯器",
            appSubtitle: "簡易數字樂譜編輯器",
            helpBtn: "❓ 使用說明",
            loadBtn: "📂 讀取",
            saveBtn: "💾 儲存",
            printBtn: "🖨️ 列印 / / PDF",
            inputCode: "輸入代碼",
            songTitlePh: "歌曲標題",
            beatsLabel: "拍號:",
            measuresLabel: "每行小節:",
            zoomLabel: "縮放:",
            zoomInBtn: "放大",
            zoomOutBtn: "縮小",
            keyLabel: "調號:",
            lyricistLabel: "作詞:",
            composerLabel: "作曲:",
            subtitleLabel: "附註:",
            inputAreaPh: "在此輸入音符...",
            previewTitle: "預覽",
            defaultSongTitle: "歌曲標題",
            tooltipContent: `<strong>語法指南</strong><br>
                        音符: 1-7, 0 (休止)<br>
                        節奏: q (八分), s (十六分)<br>
                        八度: ' (高), , (低)<br>
                        時值: - (延音), . (附點)<br>
                        範例: q1' s5, 3-`
        }
    };

    // Fix for "Simple Numbered..." if I want:
    translations.zh.appSubtitle = "簡易數字樂譜編輯器";

    const langEnBtn = document.getElementById('langEnBtn');
    const langZhBtn = document.getElementById('langZhBtn');

    function updateLanguage(lang) {
        const t = translations[lang];
        if (!t) return;

        // Button State
        if (lang === 'en') {
            langEnBtn.style.background = 'var(--accent-color)';
            langEnBtn.style.color = 'white';
            langZhBtn.style.background = 'white';
            langZhBtn.style.color = 'var(--text-color)';
        } else {
            langZhBtn.style.background = 'var(--accent-color)';
            langZhBtn.style.color = 'white';
            langEnBtn.style.background = 'white';
            langEnBtn.style.color = 'var(--text-color)';
        }

        // Text Content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.placeholder = t[key];
        });

        // HTML Content (Tooltip)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (t[key]) el.innerHTML = t[key];
        });

        // Smart Title Update: Only change if it's currently a default or empty
        const currentVal = titleInput.value.trim();
        const enDefault = translations.en.defaultSongTitle;
        const zhDefault = translations.zh.defaultSongTitle;

        if (!currentVal || currentVal === enDefault || currentVal === zhDefault) {
            titleInput.value = t.defaultSongTitle;
            render(); // Update preview immediately
        }
    }

    langEnBtn.addEventListener('click', () => updateLanguage('en'));
    langZhBtn.addEventListener('click', () => updateLanguage('zh'));

    // Set initial active state
    // updateLanguage('en'); // Moved to end of init

    // Initialize (Default to English)
    // Optional: Auto-detect
    // const userLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    // langSelect.value = userLang;
    // updateLanguage(userLang);


    const input = document.getElementById('inputArea');
    const score = document.getElementById('score');
    const printBtn = document.getElementById('printBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const helpBtn = document.getElementById('helpBtn');
    const loadFileInput = document.getElementById('loadFileInput');

    helpBtn.addEventListener('click', () => {
        window.open('https://github.com/tiunn/jianpu', '_blank');
    });

    const titleInput = document.getElementById('titleInput');
    const beatsPerBarInput = document.getElementById('beatsPerBar');
    const beatUnitInput = document.getElementById('beatUnit');
    const measuresPerRowInput = document.getElementById('measuresPerRow');
    // const zoomOutBtn = document.getElementById('zoomOut'); // Removed
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomInput = document.getElementById('zoomInput');

    let currentZoom = 7.4; // Default px

    const keySignatureInput = document.getElementById('keySignature');
    const lyricistInput = document.getElementById('lyricistInput');
    const composerInput = document.getElementById('composerInput');
    const subtitleInput = document.getElementById('subtitleInput');

    // Default title is set by init updateLanguage('en')

    const inputs = [input, titleInput, beatsPerBarInput, beatUnitInput, measuresPerRowInput, keySignatureInput, lyricistInput, composerInput, subtitleInput];
    inputs.forEach(el => el.addEventListener('input', debounce(render, 300))); // Debounce for performance

    // Zoom Logic
    function updateZoom(newVal, source) {
        let val = parseFloat(newVal);
        if (isNaN(val)) val = 7.4;

        // Clamp logic
        val = Math.max(5, Math.min(50, val)); // Clamp to min/max
        currentZoom = val;

        score.style.fontSize = `${currentZoom}px`;

        // Sync Controls
        if (source !== zoomSlider) {
            zoomSlider.value = currentZoom;
        }
        if (source !== zoomInput) {
            zoomInput.value = currentZoom.toFixed(1);
        }
    }

    // Slider Listener
    zoomSlider.addEventListener('input', (e) => {
        updateZoom(e.target.value, zoomSlider);
    });

    // Number Input Listener
    zoomInput.addEventListener('input', (e) => {
        updateZoom(e.target.value, zoomInput);
    });

    // Number Input Change (to force formatting on blur/enter)
    zoomInput.addEventListener('change', (e) => {
        updateZoom(e.target.value, null); // Pass null to force update of input
    });

    // Initial Sync
    updateZoom(currentZoom, null);

    // Key Signature Listener - Instant update (change event is safer for select)
    keySignatureInput.addEventListener('change', render);

    printBtn.addEventListener('click', () => window.print());

    // --- Save Logic ---
    saveBtn.addEventListener('click', async () => {
        const projectData = {
            title: titleInput.value,
            lyricist: lyricistInput.value,
            composer: composerInput.value,
            subtitle: subtitleInput.value,
            beatsPerBar: beatsPerBarInput.value,
            beatUnit: beatUnitInput.value,
            measuresPerRow: measuresPerRowInput.value,
            fontSize: currentZoom, // Save Zoom Level
            keySignature: keySignatureInput.value, // Save Key
            content: input.value
        };

        const jsonStr = JSON.stringify(projectData, null, 2);
        // Use title as filename if available, else default. Allow Unicode.
        // Replace typical illegal filename chars: < > : " / \ | ? *
        let rawTitle = titleInput.value.trim() || 'jianpu_score';
        const safeTitle = rawTitle.replace(/[<>:"/\\|?*]/g, '_');
        const defaultName = `${safeTitle}.json`;

        try {
            // Try Native File System API -> Opens "Save As" dialog
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: defaultName,
                    types: [{
                        description: 'Jianpu Project File',
                        accept: { 'application/json': ['.json'] }
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(jsonStr);
                await writable.close();
            } else {
                throw new Error('Not supported');
            }
        } catch (err) {
            // If API not supported OR failed (e.g. user canceled or not secure context), fallback
            if (err.name === 'AbortError') return; // User canceled picker

            // Fallback: Ask for filename
            let fileName = prompt("Enter file name to save:", defaultName);
            if (!fileName) return; // User canceled prompt
            if (!fileName.toLowerCase().endsWith('.json')) fileName += '.json';

            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    // --- Load Logic ---
    loadBtn.addEventListener('click', () => {
        loadFileInput.click();
    });

    loadFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);

                // Populate fields
                if (projectData.title !== undefined) titleInput.value = projectData.title;
                if (projectData.lyricist !== undefined) lyricistInput.value = projectData.lyricist;
                if (projectData.composer !== undefined) composerInput.value = projectData.composer;
                if (projectData.subtitle !== undefined) subtitleInput.value = projectData.subtitle;
                if (projectData.beatsPerBar !== undefined) beatsPerBarInput.value = projectData.beatsPerBar;
                if (projectData.beatUnit !== undefined) beatUnitInput.value = projectData.beatUnit;
                if (projectData.measuresPerRow !== undefined) measuresPerRowInput.value = projectData.measuresPerRow;
                if (projectData.fontSize !== undefined) {
                    currentZoom = parseFloat(projectData.fontSize) || 16;
                    updateZoom(currentZoom);
                }
                if (projectData.keySignature !== undefined) keySignatureInput.value = projectData.keySignature;
                if (projectData.content !== undefined) input.value = projectData.content;

                // Render
                render();

                // Clear input so same file can be loaded again if needed
                loadFileInput.value = '';

            } catch (err) {
                alert('Error loading file: Invalid JSON');
                console.error(err);
            }
        };
        reader.readAsText(file);
    });

    // Resize observer to re-scale when window size changes
    const resizeObserver = new ResizeObserver(entries => {
        render(); // Re-run render to adjustment scale
    });
    resizeObserver.observe(score.parentElement); // Observe the paper element

    // Initial render
    render();

    // Set initial active state after all elements are defined
    updateLanguage('zh');

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function render() {
        score.innerHTML = '';

        const titleText = titleInput.value.trim();
        // Render Title
        if (titleText) {
            const titleEl = document.createElement('div');
            titleEl.className = 'score-title';
            titleEl.textContent = titleText;
            score.appendChild(titleEl);
            document.title = titleText;
        } else {
            document.title = 'Jianpu Editor';
        }

        const beatsPerBar = parseFloat(beatsPerBarInput.value) || 4;
        const beatUnit = parseFloat(beatUnitInput.value) || 4;
        const keySig = keySignatureInput.value || 'C';
        const measuresPerRow = parseInt(measuresPerRowInput.value) || 4;

        // Reset font size to measure normally first
        score.style.fontSize = '16px';

        // Check if there is content in the editor
        if (!input.value.trim()) {
            // 6. Apply Zoom (Still apply so title size is correct?)
            // Actually title size depends on zoom? Yes.
            score.style.fontSize = `${currentZoom}px`;
            return;
        }

        // 1. Meta Row (Time Sig + Creators)
        const metaRow = document.createElement('div');
        metaRow.className = 'meta-row';

        // Left: Time Signature
        const timeSigEl = document.createElement('div');
        timeSigEl.className = 'time-signature';
        timeSigEl.textContent = `1=${keySig} ${beatsPerBar}/${beatUnit}`;
        metaRow.appendChild(timeSigEl);

        // Right: Creators (Lyricist, Composer)
        const lyricist = lyricistInput.value.trim();
        const composer = composerInput.value.trim();

        if (lyricist || composer) {
            const creatorsEl = document.createElement('div');
            creatorsEl.className = 'creators-info';

            if (lyricist) {
                const lEl = document.createElement('div');
                lEl.textContent = `作詞: ${lyricist}`;
                creatorsEl.appendChild(lEl);
            }
            if (composer) {
                const cEl = document.createElement('div');
                cEl.textContent = `作曲: ${composer}`;
                creatorsEl.appendChild(cEl);
            }
            metaRow.appendChild(creatorsEl);
        }

        score.appendChild(metaRow);

        // Subtitle (Below Meta Row)
        const subtitle = subtitleInput.value.trim();
        if (subtitle) {
            const subEl = document.createElement('div');
            subEl.className = 'score-subtitle';
            subEl.textContent = subtitle;
            score.appendChild(subEl);
        }

        // 3. Render Measures (Pass 1)
        // ... (existing line processing)

        // 2. Parse Input Stream
        const lines = input.value.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Preprocess slurs: Ensure ~> (start) has space after, and <~ (end) has space before
            // This handles cases like q3~><~q4 -> q3~> <~q4 -> split correctly
            // REVERTED: We now handle this in the tokenizer regex directly to preserve beaming.
            // line = line.replace(/~>/g, '~> ');
            // line = line.replace(/<~/g, ' <~');

            if (trimmed.startsWith('##')) {
                // If we hit a lyrics line that wasn't consumed by a previous music line, ignore it or warn?
                // For now, just continue, as we expect Music then Lyrics.
                continue;
            } else {
                // Music line found
                // Check next lines for lyrics
                let lyricLines = [];
                let offset = 1;
                while (i + offset < lines.length) {
                    const nextLine = lines[i + offset].trim();
                    if (nextLine.startsWith('##')) {
                        const lLine = nextLine.substring(2).trim();
                        // Parse tokens
                        const tokens = lLine.split(/\s+/).filter(t => t.length > 0);
                        lyricLines.push(tokens);
                        offset++;
                    } else {
                        break;
                    }
                }
                // Skip the consumed lyric lines in the main loop
                i += (offset - 1);

                renderMusicSection(score, line, { beatsPerBar, measuresPerRow, beatsPerBar }, lyricLines);
            }
        }

        // 6. Apply Zoom (Now handled by state, but re-applying acts as safe-guard or init)
        score.style.fontSize = `${currentZoom}px`;

        // Draw Slurs after DOM is fully constructed
        drawSlurs();
    } // End of render

    // Observer to ensure slurs redraw when layout changes (e.g. wrapper size change)
    const scoreResizeObserver = new ResizeObserver(() => {
        // Debounce or just call?
        // simple requestAnimationFrame to throttle
        requestAnimationFrame(drawSlurs);
    });
    scoreResizeObserver.observe(score);

    function drawSlurs() {
        // Use double requestAnimationFrame to ensure DOM layout and reflow is settled
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                _drawSlursInternal();
            });
        });
    }

    function _drawSlursInternal() {
        // Remove existing layer
        const existing = score.querySelector('.slur-layer');
        if (existing) existing.remove();

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'slur-layer');

        // Ensure SVG covers the entire scrollable area of the score
        // We use Math.max to handle cases where content might be smaller than container
        svg.style.width = Math.max(score.scrollWidth, score.clientWidth) + 'px';
        svg.style.height = Math.max(score.scrollHeight, score.clientHeight) + 'px';

        score.style.position = 'relative';
        score.appendChild(svg);

        // Find all NOTE groups (individual notes now carry the flags)
        // This supports slurs within a beamed group
        const noteGroups = Array.from(score.querySelectorAll('.note-group'));

        // Score Rect for relative coords
        const scoreRect = score.getBoundingClientRect();

        let pendingSlurs = []; // Stack of {x, y, systemRowEl}

        noteGroups.forEach(el => {
            const isStart = el.dataset.slurStart === 'true';
            const isEnd = el.dataset.slurEnd === 'true';

            if (isStart) {
                // Get coords
                // Note-group contains .note-content.
                // We can query selector, or just use the el itself if we positioned logic relative to note-group?
                // Logic uses .note-content inside.
                const contentEl = el.querySelector('.note-content');
                if (!contentEl) return;

                const rect = contentEl.getBoundingClientRect();
                // Top center of the note number
                const x = rect.left + rect.width / 2 - scoreRect.left;

                // Position start point:
                // Move Y higher: -1.5 * currentZoom (Restored as requested)
                const y = rect.top - scoreRect.top - (currentZoom * 1.5);

                // Track system row to detect cross-line
                const systemRow = el.closest('.system-row');

                pendingSlurs.push({ x, y, systemRow });
            }

            if (isEnd) {
                if (pendingSlurs.length === 0) return; // Unmatched end

                const start = pendingSlurs.pop();

                // Get end coords
                const rect = el.querySelector('.note-content').getBoundingClientRect();
                const x = rect.left + rect.width / 2 - scoreRect.left;
                const y = rect.top - scoreRect.top - (currentZoom * 1.5);

                const endSystemRow = el.closest('.system-row');

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('class', 'slur-path');

                if (start.systemRow === endSystemRow) {
                    // Same line
                    const midX = (start.x + x) / 2;
                    // Distance factor
                    const dist = Math.abs(x - start.x);

                    // Increased curvature
                    // Min height: zoom * 0.6. Max height: zoom * 2.0.
                    // Factor: dist * 0.25
                    let archHeight = Math.min(currentZoom * 2.0, dist * 0.25);
                    archHeight = Math.max(currentZoom * 0.6, archHeight);

                    const cpY = Math.min(start.y, y) - archHeight;

                    // Create filled path with variable width
                    const thinWidth = currentZoom * 0.08;
                    const thickWidth = currentZoom * 0.25;

                    const upperD = `M ${start.x} ${start.y - thinWidth} Q ${midX} ${cpY - thickWidth} ${x} ${y - thinWidth}`;
                    const lowerD = `L ${x} ${y + thinWidth} Q ${midX} ${cpY + thickWidth} ${start.x} ${start.y + thinWidth} Z`;

                    path.setAttribute('d', upperD + ' ' + lowerD);
                    path.setAttribute('fill', '#333');
                    path.setAttribute('stroke', 'none');
                    svg.appendChild(path);
                } else {
                    // Cross line
                    const startRowRect = start.systemRow ? start.systemRow.getBoundingClientRect() : null;
                    const relRightX = startRowRect ? (startRowRect.right - scoreRect.left) : (scoreRect.width);

                    const thinWidth = currentZoom * 0.08;
                    const thickWidth = currentZoom * 0.20;

                    // Curve 1 (Start -> Right)
                    const startEndX = relRightX - 10;
                    // Raise the end point at the system break to look like a half-arch
                    const startEndY = start.y - (currentZoom * 1.0);
                    const startMidX = (start.x + startEndX) / 2;
                    const startCpY = start.y - (currentZoom * 1.5); // Higher control point

                    const upperD1 = `M ${start.x} ${start.y - thinWidth} Q ${startMidX} ${startCpY - thickWidth} ${startEndX} ${startEndY - thinWidth}`;
                    const lowerD1 = `L ${startEndX} ${startEndY + thinWidth} Q ${startMidX} ${startCpY + thickWidth} ${start.x} ${start.y + thinWidth} Z`;

                    const path1 = path.cloneNode();
                    path1.setAttribute('d', upperD1 + ' ' + lowerD1);
                    path1.setAttribute('fill', '#333');
                    path1.setAttribute('stroke', 'none');
                    svg.appendChild(path1);

                    // Curve 2 (Left -> End)
                    const endRowRect = endSystemRow ? endSystemRow.getBoundingClientRect() : null;
                    const relLeftX = endRowRect ? (endRowRect.left - scoreRect.left) : 0;

                    const endStartX = relLeftX + 10;
                    // Start high at the system break
                    const endStartY = y - (currentZoom * 1.0);
                    const endMidX = (endStartX + x) / 2;
                    const endCpY = y - (currentZoom * 1.5); // Higher control point

                    const upperD2 = `M ${endStartX} ${endStartY - thinWidth} Q ${endMidX} ${endCpY - thickWidth} ${x} ${y - thinWidth}`;
                    const lowerD2 = `L ${x} ${y + thinWidth} Q ${endMidX} ${endCpY + thickWidth} ${endStartX} ${endStartY + thinWidth} Z`;

                    const path2 = path.cloneNode();
                    path2.setAttribute('d', upperD2 + ' ' + lowerD2);
                    path2.setAttribute('fill', '#333');
                    path2.setAttribute('stroke', 'none');
                    svg.appendChild(path2);
                }
            }
        });
    }

    function renderMusicSection(container, text, config, lyricLines) {
        const { beatsPerBar, measuresPerRow } = config;

        // 2. Parse Input into Measures
        // Delimiters: |:, :|, |, /, or newline.
        const tokensAndDelims = text.split(/(\|:|:\||\||\/|\n+)/);

        const measures = [];
        let currentMeasure = { content: [], startBar: 'normal', endBar: 'normal' };

        const finalizeMeasure = (endBarType) => {
            if (currentMeasure.content.length > 0 || currentMeasure.isExplicitEmpty) {
                let totalDuration = 0;
                let debugInfo = [];
                currentMeasure.content.forEach(item => {
                    if (item.type === 'group') {
                        item.data.notes.forEach(n => {
                            totalDuration += n.duration;
                            debugInfo.push(`${n.body}(${n.duration})`);
                        });
                    } else if (item.type === 'dash') {
                        totalDuration += 1;
                        debugInfo.push('-(1)');
                    }
                });

                const isValid = Math.abs(totalDuration - beatsPerBar) < 0.01;

                measures.push({
                    content: currentMeasure.content,
                    isValid: isValid,
                    duration: totalDuration,
                    debugStr: debugInfo.join(', '),
                    startBar: currentMeasure.startBar || 'normal',
                    endBar: endBarType || 'normal'
                });
            }
        };

        tokensAndDelims.forEach(token => {
            const isDelimiter = token.match(/^(\|:|:\||\||\/|\n+)$/);

            if (isDelimiter) {
                let prevEndType = 'normal';
                let nextStartType = 'normal';
                const d = token.trim();

                if (d === '|:') {
                    prevEndType = 'normal';
                    nextStartType = 'repeat-start';
                } else if (d === ':|') {
                    prevEndType = 'repeat-end';
                    nextStartType = 'normal';
                } else {
                    prevEndType = 'normal';
                    nextStartType = 'normal';
                }

                if (currentMeasure.content.length > 0) {
                    finalizeMeasure(prevEndType);
                    currentMeasure = { content: [], startBar: nextStartType, endBar: 'normal' };
                } else {
                    currentMeasure.startBar = nextStartType;
                }

            } else {
                const t = token.trim();
                if (!t) return;

                const contentTokens = t.split(/\s+/);
                contentTokens.forEach(ct => {
                    if (!ct) return;
                    const group = parseTokenToNotes(ct);
                    if (group.notes.length > 0) {
                        // Assign Lyrics from each line
                        let extractedLyrics = [];
                        if (lyricLines && lyricLines.length > 0) {
                            extractedLyrics = lyricLines.map(queue => {
                                return (queue && queue.length > 0) ? queue.shift() : null;
                            });
                        }
                        // Only add if there are actual lyrics
                        const hasLyrics = extractedLyrics.some(l => l !== null);
                        currentMeasure.content.push({ type: 'group', data: group, lyrics: hasLyrics ? extractedLyrics : null });
                    } else if (ct.match(/^-+$/)) {
                        for (let i = 0; i < ct.length; i++) {
                            currentMeasure.content.push({ type: 'dash' });
                        }
                    }
                });
            }
        });

        if (currentMeasure.content.length > 0) {
            finalizeMeasure('normal');
        }

        // 3. Chunk Measures into Rows
        const rows = [];
        for (let i = 0; i < measures.length; i += measuresPerRow) {
            rows.push(measures.slice(i, i + measuresPerRow));
        }

        // 4. Render Rows
        rows.forEach(rowMeasures => {
            const rowEl = document.createElement('div');
            rowEl.className = 'system-row';

            const needed = measuresPerRow - rowMeasures.length;

            rowMeasures.forEach(mObj => {
                const measureEl = document.createElement('div');
                measureEl.className = 'measure';

                const measureInner = document.createElement('div');
                measureInner.className = 'measure-inner';

                if (!mObj.isValid) {
                    measureInner.classList.add('measure-error');
                }

                if (mObj.startBar === 'repeat-start') {
                    measureEl.classList.add('repeat-start');
                }
                if (mObj.endBar === 'repeat-end') {
                    measureEl.classList.add('repeat-end');
                }

                measureInner.title = `Beats: ${mObj.duration} / ${beatsPerBar}\nNotes: ${mObj.debugStr}`;
                renderMeasureContent(measureInner, mObj.content);
                measureEl.appendChild(measureInner);
                rowEl.appendChild(measureEl);
            });

            for (let k = 0; k < needed; k++) {
                const filler = document.createElement('div');
                filler.className = 'measure';
                rowEl.appendChild(filler);
            }

            container.appendChild(rowEl);
        });
    }

    function renderMeasureContent(container, items) {
        items.forEach(item => {
            if (item.type === 'group') {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'beam-group';

                // Attributes are now on individual notes (created in createNoteElement)

                // Render Group logic
                item.data.notes.forEach(note => {
                    const noteEl = createNoteElement(note);
                    groupContainer.appendChild(noteEl);
                });

                // Add beams
                addBeams(groupContainer, item.data.notes);

                // Add Lyrics
                if (item.lyrics && item.lyrics.length > 0) {
                    const lyricContainer = document.createElement('div');
                    lyricContainer.className = 'lyric-container';

                    item.lyrics.forEach(text => {
                        const rowEl = document.createElement('div');
                        rowEl.className = 'lyric-row';

                        // Handle '--' token -> Treat as empty (hide)
                        const displayContent = (text === '--') ? null : text;

                        // Use non-breaking space for empty/null lyrics to preserve height vertical alignment
                        rowEl.textContent = displayContent || '\u00A0';
                        lyricContainer.appendChild(rowEl);
                    });

                    groupContainer.appendChild(lyricContainer);
                }

                container.appendChild(groupContainer);

            } else if (item.type === 'dash') {
                container.appendChild(createDashElement());
            }
        });
    }

    // Reuse parsing logic
    function parseTokenToNotes(token) {
        // Parse token into notes. Token can be a beamed group "q1q2".
        // New Syntax support: ~> is suffix, <~ is prefix.
        // Regex needs to capture these attached to specific notes.
        // Group 1: Slur End Prefix (<~)
        // Group 2: Rhythm (prefix q/s)
        // Group 3: Accidental (# or b)
        // Group 4: Note Body (0-7)
        // Group 5: Suffixes (octaves ' or , or dotted .)
        // Group 6: Slur Start Suffix (~>)

        const noteRegex = /((?:<~)?)([qs]*)([#b]?)([0-7])(['+,+\.]*)((?:~>)?)/g;

        const matches = [...token.matchAll(noteRegex)];

        // Validation: verify if we consumed the important parts
        // Simple check: if token contains ~ but no ~> or <~ matched, or if we have leftovers
        // Actually, just checking if the reconstructed string matches token is safer?
        // Or check if input token had ~ that wasn't matched.
        let matchedSlurs = 0;

        const notes = matches.map(m => {
            const slurEndStr = m[1]; // <~
            const prefix = m[2];
            const accidental = m[3];
            const body = m[4];
            const suffix = m[5];
            const slurStartStr = m[6]; // ~>

            if (slurEndStr) matchedSlurs++;
            if (slurStartStr) matchedSlurs++;

            let duration = 1;
            let lines = 0;
            if (prefix.includes('s')) { duration = 0.25; lines = 2; }
            else if (prefix.includes('q')) { duration = 0.5; lines = 1; }
            if (suffix.includes('.')) duration *= 1.5;

            return {
                char: body,
                accidental,
                lines,
                suffixes: suffix,
                duration,
                isError: false, // Will verify globally
                slurStart: !!slurStartStr,
                slurEnd: !!slurEndStr
            };
        });

        // Error Checking
        // Count total ~ in original token
        const totalTildes = (token.match(/~/g) || []).length;
        // Each <~ or ~> consumes 1 tilde.
        if (matchedSlurs < totalTildes) {
            // Unmatched tildes exist!
            // Mark all notes in this token as error? Or just the first?
            // Mark all for visibility.
            notes.forEach(n => n.isError = true);

            // If no notes matched but tildes exist (e.g. "~"), create placeholder
            if (notes.length === 0) {
                notes.push({ char: '?', lines: 0, suffixes: '', duration: 1, isError: true, slurStart: false, slurEnd: false });
            }
        }

        // Return flattened notes.
        // The return object structure expected by `parseLine` logic needs to be checked.
        // Originally returned { notes, slurStart, slurEnd }.
        // But now slur info is IN the notes.
        // We can return null/false for the top level flags since they are unused or we remove reliance on them.

        return { notes, slurStart: false, slurEnd: false }; // Deprecated top-level flags
    }

    function createNoteElement(note) {
        const container = document.createElement('div');
        container.className = 'note-group';

        // Attach slur attributes specific to this note
        if (note.slurStart) container.dataset.slurStart = 'true';
        if (note.slurEnd) container.dataset.slurEnd = 'true';

        const content = document.createElement('div');
        content.className = 'note-content';
        if (note.isError) {
            content.classList.add('error-syntax');
        }
        content.textContent = note.char;

        if (note.accidental) {
            const acc = document.createElement('span');
            acc.className = 'accidental';
            if (note.accidental === '#') {
                acc.textContent = '♯';
                acc.classList.add('sharp');
            } else {
                acc.textContent = '♭';
                acc.classList.add('flat');
            }
            content.appendChild(acc);
        }

        let highCount = (note.suffixes.match(/'/g) || []).length;
        let lowCount = (note.suffixes.match(/,/g) || []).length;

        if (highCount > 0) {
            const dotContainer = document.createElement('div');
            dotContainer.className = 'dot-above';
            for (let i = 0; i < highCount; i++) {
                const d = document.createElement('div');
                d.textContent = '.';
                dotContainer.appendChild(d);
            }
            content.appendChild(dotContainer);
        }
        if (lowCount > 0) {
            const dotContainer = document.createElement('div');
            dotContainer.className = 'dot-below';
            for (let i = 0; i < lowCount; i++) {
                const d = document.createElement('div');
                d.textContent = '.';
                dotContainer.appendChild(d);
            }
            content.appendChild(dotContainer);
        }

        if (note.suffixes.includes('.')) {
            const augDot = document.createElement('span');
            augDot.className = 'augmentation-dot';
            augDot.textContent = '•';
            content.appendChild(augDot);
        }

        container.appendChild(content);
        return container;
    }

    function createDashElement() {
        const container = document.createElement('div');
        container.className = 'dash-container';
        const content = document.createElement('div');
        content.className = 'note-content dash';
        content.textContent = '-';
        container.appendChild(content);
        return container;
    }

    function addBeams(container, notes) {
        const maxLevel = 2;
        // Logic same as before
        for (let level = 1; level <= maxLevel; level++) {
            let start = -1;
            for (let i = 0; i <= notes.length; i++) {
                const needsLine = (i < notes.length) && (notes[i].lines >= level);
                if (needsLine) {
                    if (start === -1) start = i;
                } else {
                    if (start !== -1) {
                        createBeam(container, start, i - 1, level);
                        start = -1;
                    }
                }
            }
        }
    }

    function createBeam(container, startIndex, endIndex, level) {
        const beam = document.createElement('div');
        beam.className = `beam-line level-${level}`;
        // Using em units now for auto-scaling
        const unit = 2.2; // Match CSS .note-group width (2.2em)
        beam.style.left = `${startIndex * unit}em`;
        beam.style.width = `${(endIndex - startIndex + 1) * unit}em`;
        container.appendChild(beam);
    }
});

/* Draggable UI Logic */
const gutter = document.getElementById('gutter');
const previewPane = document.getElementById('previewPane'); // Target Preview Pane height
const container = document.querySelector('.container');
let isResizing = false;

gutter.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'row-resize';
    e.preventDefault(); // Prevent text selection
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    // Calculate new height relative to container top
    const containerRect = container.getBoundingClientRect();
    const newHeight = e.clientY - containerRect.top;

    // Limits (min 100px, max container height - 100px)
    if (newHeight > 100 && newHeight < containerRect.height - 100) {
        previewPane.style.height = `${newHeight}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        // ResizeObserver automatically handles content adjustments
    }
});

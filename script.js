document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('inputArea');
    const score = document.getElementById('score');
    const printBtn = document.getElementById('printBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const loadFileInput = document.getElementById('loadFileInput');

    const titleInput = document.getElementById('titleInput');
    const beatsPerBarInput = document.getElementById('beatsPerBar');
    const beatUnitInput = document.getElementById('beatUnit');
    const measuresPerRowInput = document.getElementById('measuresPerRow');
    const scaleSlider = document.getElementById('scaleSlider');
    const keySignatureInput = document.getElementById('keySignature');

    const inputs = [input, titleInput, beatsPerBarInput, beatUnitInput, measuresPerRowInput, keySignatureInput];
    inputs.forEach(el => el.addEventListener('input', debounce(render, 300))); // Debounce for performance

    // Zoom Slider Listener - Instant update
    scaleSlider.addEventListener('input', () => {
        score.style.fontSize = `${scaleSlider.value}px`;
    });

    // Key Signature Listener - Instant update (change event is safer for select)
    keySignatureInput.addEventListener('change', render);

    printBtn.addEventListener('click', () => window.print());

    // --- Save Logic ---
    saveBtn.addEventListener('click', async () => {
        const projectData = {
            title: titleInput.value,
            beatsPerBar: beatsPerBarInput.value,
            beatUnit: beatUnitInput.value,
            measuresPerRow: measuresPerRowInput.value,
            fontSize: scaleSlider.value, // Save Zoom Level
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
                if (projectData.beatsPerBar !== undefined) beatsPerBarInput.value = projectData.beatsPerBar;
                if (projectData.beatUnit !== undefined) beatUnitInput.value = projectData.beatUnit;
                if (projectData.measuresPerRow !== undefined) measuresPerRowInput.value = projectData.measuresPerRow;
                if (projectData.fontSize !== undefined) {
                    scaleSlider.value = projectData.fontSize;
                    score.style.fontSize = `${projectData.fontSize}px`;
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

        const text = input.value;
        // Clean text: replace newlines with spaces to treat as continuous stream
        // User wants "consistent measures per line", so input line breaks shouldn't force new system lines.
        // We will reflow the whole thing.
        const fullText = text.replace(/\n/g, ' ');

        const beatsPerBar = parseFloat(beatsPerBarInput.value) || 4;
        const beatUnit = parseFloat(beatUnitInput.value) || 4;
        const keySig = keySignatureInput.value || 'C';
        const measuresPerRow = parseInt(measuresPerRowInput.value) || 4;

        // Reset font size to measure normally first
        score.style.fontSize = '16px';

        // 1. Show Time Signature
        const timeSigEl = document.createElement('div');
        timeSigEl.className = 'time-signature-row';
        timeSigEl.textContent = `1=${keySig} ${beatsPerBar}/${beatUnit}`;
        score.appendChild(timeSigEl);

        // 2. Parse Input into Measures
        // Delimiters: |:, :|, |, /, or newline.
        // We use a capturing group to keep the delimiters in the result array.
        // regex: split by ( |: OR :| OR | OR / OR newline sequence )
        // Note: \|: matches |:, :\| matches :|, \| matches |, \/ matches /, \n+ matches newlines.
        const tokensAndDelims = text.split(/(\|:|:\||\||\/|\n+)/);

        const measures = [];
        let currentMeasure = { content: [], startBar: 'normal', endBar: 'normal' };
        let pendingStartBar = 'normal'; // To carry over from previous delimiter

        // Helper to finalize current measure and prepare next
        const finalizeMeasure = (endBarType) => {
            // Only push if it has content OR if it's explicitly explicitly empty but has bars (e.g. | |)
            // But usually empty strings between delimiters are artifacts.
            // Let's filter empty text tokens unless they are "real" empty measures?
            // Simplest: If logic hits a delimiter, it closes the current measure context.

            // If this measure has content, check validity and push
            if (currentMeasure.content.length > 0 || currentMeasure.isExplicitEmpty) {
                // Calculate duration
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

        // Loop through tokens
        tokensAndDelims.forEach(token => {
            // Check if it is a delimiter (captured by split)
            // Delimiters: |:, :|, |, /, or newline sequence.
            const isDelimiter = token.match(/^(\|:|:\||\||\/|\n+)$/);

            if (isDelimiter) {
                // It's a delimiter.
                // It ends the previous measure (if any) and sets up the next.

                let prevEndType = 'normal';
                let nextStartType = 'normal';
                const d = token.trim(); // May be empty if newline

                if (d === '|:') {
                    prevEndType = 'normal';
                    nextStartType = 'repeat-start';
                } else if (d === ':|') {
                    prevEndType = 'repeat-end';
                    nextStartType = 'normal';
                } else {
                    // Regular bar (| or / or newline)
                    prevEndType = 'normal';
                    nextStartType = 'normal';
                }

                // If we have accumulation, close it
                if (currentMeasure.content.length > 0) {
                    finalizeMeasure(prevEndType);
                    // Start new measure
                    currentMeasure = { content: [], startBar: nextStartType, endBar: 'normal' };
                } else {
                    // Start of piece or sequential delimiters
                    currentMeasure.startBar = nextStartType;
                }

            } else {
                // It's content (notes) or whitespace
                const t = token.trim();
                if (!t) return; // Skip pure whitespace (that isn't a newline delimiter)

                // Parse notes in this chunk
                const contentTokens = t.split(/\s+/);
                contentTokens.forEach(ct => {
                    if (!ct) return;
                    const group = parseTokenToNotes(ct);
                    if (group.notes.length > 0) {
                        currentMeasure.content.push({ type: 'group', data: group });
                    } else if (ct.match(/^-+$/)) {
                        for (let i = 0; i < ct.length; i++) {
                            currentMeasure.content.push({ type: 'dash' });
                        }
                    }
                });
            }
        });

        // Finalize last measure if exists
        if (currentMeasure.content.length > 0) {
            finalizeMeasure('normal'); // End of piece
        }

        // 3. Chunk Measures into Rows (Grid Layout)
        const rows = [];
        for (let i = 0; i < measures.length; i += measuresPerRow) {
            rows.push(measures.slice(i, i + measuresPerRow));
        }

        // 4. Render Rows
        rows.forEach(rowMeasures => {
            const rowEl = document.createElement('div');
            rowEl.className = 'system-row';

            // Pad row if last row has fewer measures?
            const needed = measuresPerRow - rowMeasures.length;

            rowMeasures.forEach(mObj => {
                const measureEl = document.createElement('div');
                measureEl.className = 'measure';

                const measureInner = document.createElement('div');
                measureInner.className = 'measure-inner';

                // Add error class if invalid
                if (!mObj.isValid) {
                    measureInner.classList.add('measure-error');
                }

                // Add Repeat Sign Classes
                if (mObj.startBar === 'repeat-start') {
                    measureEl.classList.add('repeat-start');
                }
                if (mObj.endBar === 'repeat-end') {
                    measureEl.classList.add('repeat-end');
                }

                // Add Diagnostic Tooltip
                measureInner.title = `Beats: ${mObj.duration} / ${beatsPerBar}\nNotes: ${mObj.debugStr}`;

                renderMeasureContent(measureInner, mObj.content);

                measureEl.appendChild(measureInner);
                rowEl.appendChild(measureEl);
            });

            // Fillers
            for (let k = 0; k < needed; k++) {
                const filler = document.createElement('div');
                filler.className = 'measure';
                // Empty
                // filler.style.borderRight = "none"; // Option: hide bar lines for empty?
                // Usually blank measures in score still have lines.
                rowEl.appendChild(filler);
            }

            score.appendChild(rowEl);
        });

        // 6. Apply Zoom from Slider
        const fontSize = parseInt(scaleSlider.value) || 7;
        score.style.fontSize = `${fontSize}px`;
    }

    function renderMeasureContent(container, items) {
        items.forEach(item => {
            if (item.type === 'group') {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'beam-group';

                // Render Group logic
                item.data.notes.forEach(note => {
                    const noteEl = createNoteElement(note);
                    groupContainer.appendChild(noteEl);
                });

                // Add beams
                addBeams(groupContainer, item.data.notes);
                container.appendChild(groupContainer);

            } else if (item.type === 'dash') {
                container.appendChild(createDashElement());
            }
        });
    }

    // Reuse parsing logic
    function parseTokenToNotes(token) {
        // Regex global match
        // Group 1: Rhythm (prefix q/s)
        // Group 2: Accidental (# or b) - NEW
        // Group 3: Note Body (0-7)
        // Group 4: Suffixes (octaves ' or , or dotted .)
        const noteRegex = /([qs]*)([#b]?)([0-7])(['+,+\.]*)/g;
        const matches = [...token.matchAll(noteRegex)];

        const notes = matches.map(m => {
            const prefix = m[1];
            const accidental = m[2]; // Captured accidental
            const body = m[3];
            const suffix = m[4];

            let duration = 1;
            let lines = 0;
            if (prefix.includes('s')) { duration = 0.25; lines = 2; }
            else if (prefix.includes('q')) { duration = 0.5; lines = 1; }
            if (suffix.includes('.')) duration *= 1.5;

            return { body, accidental, lines, suffixes: suffix, duration };
        });
        return { notes };
    }

    function createNoteElement(note) {
        const container = document.createElement('div');
        container.className = 'note-group';

        const content = document.createElement('div');
        content.className = 'note-content';
        content.textContent = note.body;

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
const editorPane = document.getElementById('editorPane');
const container = document.querySelector('.container');
let isResizing = false;

gutter.addEventListener('mousedown', (e) => {
    isResizing = true;
    // Add class to body to keep cursor consistent
    document.body.style.cursor = 'col-resize';
    e.preventDefault(); // Prevent text selection
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    // Calculate new width relative to container
    const containerRect = container.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;

    // Limits (min 200px, max container width - 200px)
    if (newWidth > 200 && newWidth < containerRect.width - 200) {
        editorPane.style.width = `${newWidth}px`;
        // Since editorPane has width set, and previewPane is flex:1, layout adjusts automatically.
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        // Trigger resize observer to update font scale if needed
        // The ResizeObserver on .paper (or .score parent) should handle this automatically!
    }
});

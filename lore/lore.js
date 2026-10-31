/*
 * lore.js
 * The lore / character info popup (the "lore" button from js/buttons.js, app.html only).
 * Data: lore/data/v<version>.xml, images: lore/img/v<version>/.
 * <character slot image json isLazyAhhCanvasRender color> with <name> <gender> <age> <sound> <description> <lyrics>
 * isLazyAhhCanvasRender="true" draws the first frame of a sprite sheet (image + json) instead of a plain image;
 * <canvasX>/<canvasY> (optional) nudge that drawing (CSS lengths: "10px", "-5%"), large screens only.
 */

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('lore-overlay');
    let loadError = false;
    let openBtn = document.querySelector('#home-bt-lore .hitzone');

    let img, nameEl, infoEl, soundEl, descEl, prev, next, counterEl, layoutEl;

    let data = [];
    let index = 0;

    async function loadXML() {
        try {
            const res = await fetch(`./lore/data/v${appVersion}.xml`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            const xml = new DOMParser().parseFromString(text, 'text/xml');

            xml.querySelectorAll('category').forEach(cat => {
                const type = cat.getAttribute('type');
                const color = cat.getAttribute('color');

                cat.querySelectorAll('character').forEach(char => {
                    data.push({
                        category: type,
                        color: char.getAttribute('color') || color || '#000000',
                        id: char.getAttribute('id'),
                        slot: char.getAttribute('slot'),
                        image: char.getAttribute('image'),
                        json: char.getAttribute('json'),
                        lazyCanvas: char.getAttribute('isLazyAhhCanvasRender') === 'true',
                        canvasX: char.querySelector('canvasX')?.textContent,
                        canvasY: char.querySelector('canvasY')?.textContent,
                        name: char.querySelector('name')?.textContent || 'Unknown',
                        gender: char.querySelector('gender')?.textContent || 'Unknown',
                        age: char.querySelector('age')?.textContent || 'Unknown',
                        sound: char.querySelector('sound')?.textContent || 'Unknown',
                        desc: char.querySelector('description')?.textContent || '',
                        lyrics: char.querySelector('lyrics')?.textContent.trim() || ''
                    });
                });
            });

            if (data.length > 0 && overlay && !overlay.classList.contains('hidden')) {
                showCharacter(index);
            }

            loadError = false;
        } catch (e) {
            loadError = true;
            console.warn('Failed to load lore XML:', e.message);
        }
    }

    function loadImage(src) {
        return new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = src;
        });
    }

    function showCharacter(i) {
        const c = data[i];
        if (!c) return;

        if (!img) img = document.getElementById('lore-image');
        if (!nameEl) nameEl = document.getElementById('lore-name');
        if (!infoEl) infoEl = document.getElementById('lore-info');
        if (!soundEl) soundEl = document.getElementById('lore-sound');
        if (!descEl) descEl = document.getElementById('lore-description');

        if (img) {
            img.src = `./lore/img/v${appVersion}/${c.image}`;
            img.alt = c.name;
        }
        if (nameEl) nameEl.textContent = `${c.slot} - ${c.name}`;
        if (counterEl) counterEl.textContent = `${i + 1} / ${data.length}`;
        if (infoEl) infoEl.textContent = `Gender: ${c.gender} | Age: ${c.age}`;
        if (soundEl) soundEl.textContent = `Sound: ${c.sound}`;
        if (descEl) descEl.textContent = c.desc;

        const existingLyrics = document.getElementById('lore-lyrics');
        if (existingLyrics) {
            existingLyrics.remove();
        }

        if (descEl) {
            descEl.style.display = (!c.desc || c.desc.trim().length === 0) ? 'none' : 'block';
        }

        const existingToggle = document.querySelector('.lore-lyrics-toggle');
        if (existingToggle) existingToggle.remove();

        if (c.lyrics && c.lyrics.trim().length > 0 && descEl) {
            const lyricsWrap = document.createElement('div');
            lyricsWrap.id = 'lore-lyrics';
            lyricsWrap.setAttribute('aria-live', 'polite');
            lyricsWrap.className = 'lore-lyrics-hidden';

            const lines = c.lyrics.split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

            lyricsWrap.innerHTML = lines.map(line => {
                const escaped = line
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                return `<div class="lore-lyric-line">${escaped}</div>`;
            }).join('');

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'lore-lyrics-toggle';
            toggle.textContent = 'Show lyrics';
            toggle.setAttribute('aria-expanded', 'false');

            descEl.insertAdjacentElement('afterend', toggle);
            toggle.insertAdjacentElement('afterend', lyricsWrap);

            toggle.addEventListener('click', () => {
                const open = lyricsWrap.classList.toggle('visible');
                if (open) {
                    lyricsWrap.classList.remove('lore-lyrics-hidden');
                    toggle.textContent = 'Hide lyrics';
                    toggle.setAttribute('aria-expanded', 'true');
                    requestAnimationFrame(() => { lyricsWrap.scrollTop = 0; });
                } else {
                    lyricsWrap.classList.add('lore-lyrics-hidden');
                    toggle.textContent = 'Show lyrics';
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        const normalize = v =>
            v && v !== "#000000" && v !== "000000" ? v : null;

        const raw =
            normalize(c?.color) ||
            normalize(versions?.[`v${appVersion}`]?.animearray?.[i]?.color) ||
            normalize(app?.animearray?.[i]?.color);

        if (nameEl) {
            nameEl.style.color = raw
                ? raw.startsWith("#") ? raw : `#${raw}`
                : "#808080";
        }

        const canvas = document.querySelector(
            '.box-popup#pop-dialog #lore-canvas'
        );

        if (canvas) canvas.style.display = 'none';
        if (img) img.style.display = 'inline';

        if (c.lazyCanvas === true && c.json && canvas) {
            img.style.display = 'none';
            canvas.style.display = 'block';

            const nudge = (c.canvasX || c.canvasY) && !window.matchMedia('(max-width: 600px), (max-height: 560px)').matches;
            canvas.style.transform = nudge ? `translate(${c.canvasX || 0}, ${c.canvasY ? `calc(-1 * ${c.canvasY})` : 0})` : '';

            renderLazyCanvas(c, canvas);
        }
    }

    let _loreBacElem = null;
    let _loreBacHandler = null;

    async function renderLazyCanvas(c, canvas) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        let json, sprite;
        try {
            json = await fetch(`./lore/img/v${appVersion}/${c.json}`).then(r => r.json());
            sprite = await loadImage(`./lore/img/v${appVersion}/${c.image}`);
        } catch (e) {
            console.warn('Lore: could not draw the sprite of', c.name, e);
            return;
        }
        if (data[index] !== c) return;

        const logicalW = Number(json.width) || 164;
        const logicalH = Number(json.height) || 380;
        const gap = Number(json.gap) || 0;
        const HD_SCALE = 2;

        canvas.width = logicalW * HD_SCALE;
        canvas.height = logicalH * HD_SCALE;
        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
        canvas.style.setProperty('--lore-canvas-h', (logicalH / 1.2) + 'px');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            sprite,
            gap * 2, 0,
            canvas.width, canvas.height,
            0, 0,
            canvas.width, canvas.height
        );
    }

    function openOverlay() {
        const errorHtml = `<div style="padding: 20px; text-align: center;"><p style="color: red;">Failed to load lore data.<br>Please make sure the file "lore/data/v${appVersion}.xml" exists and is formatted correctly.</p></div>`;
        const html = document.getElementById('lore-popup').innerHTML;

        boxDialog.open((loadError || data.length === 0) ? errorHtml : html, "", [], [], true, false, "lore");

        const dialogText = document.querySelector('.box-popup#pop-dialog .pop .text');
        if (!dialogText) return;

        img = dialogText.querySelector('#lore-image');
        nameEl = dialogText.querySelector('#lore-name');
        infoEl = dialogText.querySelector('#lore-info');
        soundEl = dialogText.querySelector('#lore-sound');
        descEl = dialogText.querySelector('#lore-description');
        prev = dialogText.querySelector('#prev-btn');
        next = dialogText.querySelector('#next-btn');
        counterEl = dialogText.querySelector('#lore-counter');
        layoutEl = dialogText.querySelector('.lore-layout');

        next?.addEventListener('click', () => go(1));
        prev?.addEventListener('click', () => go(-1));
        dialogText.querySelector('#lore-close')?.addEventListener('click', closeOverlay);
        if (layoutEl) addSwipe(layoutEl);

        const dialogRoot = document.querySelector('.box-popup#pop-dialog');
        if (dialogRoot) {
            const bac = dialogRoot.querySelector('.bac');
            if (bac) {
                _loreBacElem = bac;
                _loreBacHandler = () => closeOverlay();
                bac.addEventListener('click', _loreBacHandler);
            }
        }

        showCharacter(index);
    }

    function go(step) {
        if (data.length === 0) return;
        index = (index + step + data.length) % data.length;
        if (layoutEl) {
            layoutEl.classList.add('lore-switching');
            setTimeout(() => {
                showCharacter(index);
                layoutEl.querySelector('.lore-body')?.scrollTo(0, 0);
                layoutEl.classList.remove('lore-switching');
            }, 90);
        } else {
            showCharacter(index);
        }
    }

    function addSwipe(el) {
        let startX = null, startY = 0, startT = 0;
        el.addEventListener('pointerdown', e => {
            if (e.target.closest('button')) return;
            startX = e.clientX; startY = e.clientY; startT = Date.now();
        });
        const end = e => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            startX = null;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - startT < 800) {
                go(dx < 0 ? 1 : -1);
            }
        };
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', () => { startX = null; });
    }

    function isOpen() {
        return !!document.querySelector('.box-popup#pop-dialog.show[data-name="lore"]');
    }

    document.addEventListener('keydown', e => {
        if (!isOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    function closeOverlay() {
        try {
            if (_loreBacElem && _loreBacHandler) {
                _loreBacElem.removeEventListener('click', _loreBacHandler);
                _loreBacElem = null;
                _loreBacHandler = null;
            }
        } catch (e) { }

        try { boxDialog.close(); } catch (e) { }
    }

    if (openBtn) {
        openBtn.addEventListener('click', openOverlay);
    } else if (typeof waitForElement === 'function') {
        waitForElement('#home-bt-lore .hitzone', el => {
            openBtn = el;
            openBtn.addEventListener('click', openOverlay);
        });
    }

    loadXML();
});

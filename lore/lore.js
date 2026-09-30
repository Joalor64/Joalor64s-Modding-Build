let loadError = false;

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('lore-overlay');
    let openBtn = document.querySelector('#home-bt-lore .hitzone');

    let img, nameEl, infoEl, soundEl, descEl, prev, next;

    let data = [];
    let index = 0;

    async function loadXML() {
        try {
            const res = await fetch(`./lore/data/v${appVersion}.xml`);
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

            if (data.length > 0 && !overlay.classList.contains('hidden')) {
                showCharacter(index);
            }

            loadError = false;
        } catch (e) {
            loadError = true;
            console.error('Failed to load lore XML:', e);
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

        if (img) img.src = `./lore/img/v${appVersion}/${c.image}`;
        if (nameEl) nameEl.textContent = `${c.slot} - ${c.name}`;
        if (infoEl) infoEl.textContent = `Gender: ${c.gender} | Age: ${c.age}`;
        if (soundEl) soundEl.textContent = `Sound: ${c.sound}`;
        if (descEl) descEl.textContent = c.desc;

        const existingLyrics = document.getElementById('lore-lyrics');
        if (existingLyrics) {
            existingLyrics.remove();
        }

        if (!c.desc || c.desc.trim().length === 0) {
            descEl.style.display = 'none';
        } else {
            descEl.style.display = 'block';
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

        nameEl.style.color = raw
            ? raw.startsWith("#") ? raw : `#${raw}`
            : "#808080";

        console.log("color picked:", nameEl.style.color);

        const canvas = document.querySelector(
            '.box-popup#pop-dialog #lore-canvas'
        );

        if (canvas) canvas.style.display = 'none';
        if (img) img.style.display = 'inline';

        if (c.lazyCanvas === true && c.json && canvas) {
            img.style.display = 'none';
            canvas.style.display = 'block';

            c.canvasX ? canvas.style.marginLeft = c.canvasX : canvas.style.marginLeft = '23%';
            c.canvasY ? canvas.style.marginBottom = c.canvasY : canvas.style.marginBottom = '-37px';

            renderLazyCanvas(c, canvas);
        }
    }

    let _loreBacElem = null;
    let _loreBacHandler = null;

    async function renderLazyCanvas(c, canvas) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const json = await fetch(`./lore/img/v${appVersion}/${c.json}`).then(r => r.json());
        const sprite = await loadImage(`./lore/img/v${appVersion}/${c.image}`);

        const logicalW = Number(json.width) || 164;
        const logicalH = Number(json.height) || 380;
        const gap = Number(json.gap) || 0;
        const HD_SCALE = 2;

        canvas.width = logicalW * HD_SCALE;
        canvas.height = logicalH * HD_SCALE;

        canvas.style.width = logicalW + 'px';
        canvas.style.height = logicalH + 'px';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            sprite,
            gap * 2, 0,
            canvas.width, canvas.height,
            0, 0,
            canvas.width / 1.2, canvas.height / 1.2
        );

        console.log("lazy canvas render (correct scale):", c.name);
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

        next?.addEventListener('click', () => {
            if (data.length === 0) return;
            index = (index + 1) % data.length;
            showCharacter(index);
        });

        prev?.addEventListener('click', () => {
            if (data.length === 0) return;
            index = (index - 1 + data.length) % data.length;
            showCharacter(index);
        });

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
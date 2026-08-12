/**
 * CloudSystem - neat little cloud generator thingy
 * Author: Joalor64
 * Example Usage:
 *   CloudSystem.init({ count: 8, color: '#ffccaa', minDuration: 10, maxDuration: 25 });
 *   CloudSystem.addCloud({ scale: 1.5, top: 15, color: '#fff', duration: 12 });
 */
const CloudSystem = (function () {
    const container = document.getElementById('clouds');
    if (!container) return {};

    const defaults = {
        count: 5,
        minDuration: 15,
        maxDuration: 30,
        minScale: 0.4,
        maxScale: 1.2,
        minOpacity: 0.4,
        maxOpacity: 0.9,
        color: '#ffffff',
        minTop: 5,
        maxTop: 40,
        direction: 'left'
    };

    let config = { ...defaults };
    let clouds = [];

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function makeCloud(opts = {}) {
        const el = document.createElement('div');
        el.className = 'cloud';

        const duration = opts.duration || rand(config.minDuration, config.maxDuration);
        const scale = opts.scale || rand(config.minScale, config.maxScale);
        const opacity = opts.opacity || rand(config.minOpacity, config.maxOpacity);
        const top = opts.top || rand(config.minTop, config.maxTop);
        const color = opts.color || config.color;
        const delay = (opts.delay !== undefined) ? opts.delay : rand(-duration, 0);
        const dir = opts.direction || config.direction;

        el.style.setProperty('--cloud-duration', `${duration}s`);
        el.style.setProperty('--cloud-scale', scale);
        el.style.setProperty('--cloud-opacity', opacity);
        el.style.setProperty('--cloud-top', `${top}%`);
        el.style.setProperty('--cloud-color', color);
        el.style.setProperty('--cloud-delay', `${delay}s`);
        el.style.setProperty('--cloud-direction', dir === 'right' ? 'reverse' : 'normal');

        return el;
    }

    function init(userConfig = {}) {
        config = { ...defaults, ...userConfig };
        removeAll();
        for (let i = 0; i < config.count; i++) {
            addCloud();
        }
    }

    function addCloud(opts = {}) {
        const c = makeCloud(opts);
        container.appendChild(c);
        clouds.push(c);
        return c;
    }

    function removeAll() {
        clouds.forEach(c => c.remove());
        clouds = [];
    }

    function removeCloud(el) {
        const i = clouds.indexOf(el);
        if (i > -1) {
            el.remove();
            clouds.splice(i, 1);
        }
    }

    function updateConfig(newCfg) {
        config = { ...config, ...newCfg };
    }

    return {
        init,
        addCloud,
        removeAll,
        removeCloud,
        updateConfig,
        getClouds: () => clouds,
        get config() { return config; },

        setFluffy(enabled) {
            container.classList.toggle('fluffy', enabled);
        },
        get isFluffy() {
            return container.classList.contains('fluffy');
        }
    };
})();
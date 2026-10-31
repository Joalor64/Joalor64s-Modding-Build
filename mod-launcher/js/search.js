/*
 * mod-launcher/js/search.js
 * The search box under the search button; filters the cards as you type.
 */

const SearchDropdown = (() => {
    let dropdown = null;
    let input = null;
    let clearBtn = null;
    let open = false;

    function build() {
        dropdown = document.createElement("div");
        dropdown.className = "search-dropdown";
        dropdown.innerHTML = `
            <div class="search-dropdown-inner">
                <svg><use href="#ic-search"></use></svg>
                <input type="text" class="search-input" placeholder="${I18n.t("pop.searchHint")}" autocomplete="off" spellcheck="false">
                <button class="search-clear" aria-label="Clear">×</button>
            </div>
        `;
        document.body.appendChild(dropdown);

        input = dropdown.querySelector(".search-input");
        clearBtn = dropdown.querySelector(".search-clear");

        input.addEventListener("input", () => {
            const val = input.value;
            clearBtn.style.opacity = val ? "1" : "0";
            if (val.trim() === "") Mods.restoreAll();
            else Mods.search(val);
        });

        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.style.opacity = "0";
            Mods.restoreAll();
            input.focus();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { e.stopPropagation(); hide(); }
        });

        document.addEventListener("click", onDocClick);
    }

    function onDocClick(e) {
        if (!open) return;
        if (!dropdown.contains(e.target) && !e.target.closest("#btn-search")) {
            hide();
        }
    }

    function position() {
        const btn = $("#btn-search");
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        dropdown.style.left = `${rect.left + rect.width / 2}px`;
        dropdown.style.top = `${rect.bottom + 10}px`;
    }

    function show() {
        if (!dropdown) build();
        position();
        input.value = "";
        clearBtn.style.opacity = "0";
        dropdown.classList.add("show");
        open = true;
        requestAnimationFrame(() => input.focus());
    }

    function hide() {
        if (!dropdown) return;
        dropdown.classList.remove("show");
        open = false;
    }

    function toggle() {
        open ? hide() : show();
    }

    return { show, hide, toggle, get isOpen() { return open; } };
})();

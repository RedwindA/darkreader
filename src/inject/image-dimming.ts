const STYLE_ID = 'dark-reader-image-style';

let currentCSS: string | null = null;
let observer: MutationObserver | null = null;
let isObservingHead = false;

function isDarkReaderLocked() {
    return document.querySelector('meta[name="darkreader-lock"]') != null;
}

function sync() {
    if (currentCSS === null) {
        return;
    }
    if (isDarkReaderLocked()) {
        removeImageDimming();
        return;
    }
    const head = document.head;
    if (!head) {
        return;
    }
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
        style.classList.add('darkreader');
        // Not applied when printing
        style.media = 'screen';
        // Placed first, so that its anonymous layer has the lowest priority
        head.insertBefore(style, head.firstChild);
    }
    if (style.textContent !== currentCSS) {
        style.textContent = currentCSS;
    }
    if (!isObservingHead) {
        // Watch for a lock and for the style being removed by the page
        observer!.disconnect();
        observer!.observe(head, {childList: true, subtree: true});
        isObservingHead = true;
    }
}

// Only adds a stylesheet: no "data-darkreader-mode" attribute or other changes, as the site's own colors are kept
export function applyImageDimming(css: string): void {
    if (!css) {
        removeImageDimming();
        return;
    }
    currentCSS = css;
    if (!observer) {
        observer = new MutationObserver(sync);
        // Wait for the head to be created
        observer.observe(document.documentElement, {childList: true});
        isObservingHead = false;
    }
    sync();
}

export function removeImageDimming(): void {
    currentCSS = null;
    observer?.disconnect();
    observer = null;
    isObservingHead = false;
    document.getElementById(STYLE_ID)?.remove();
}

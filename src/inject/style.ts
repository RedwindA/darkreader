import {createNodeAsap, removeNode} from './utils/dom';

function createOrUpdateStyleElement(id: string, css: string, prepend: boolean, onCreate?: () => void): void {
    createNodeAsap({
        selectNode: () => document.getElementById(id)!,
        createNode: (target) => {
            onCreate?.();
            const style = document.createElement('style');
            style.id = id;
            style.classList.add('darkreader');
            style.type = 'text/css';
            style.textContent = css;
            target.insertBefore(style, prepend ? target.firstChild : null);
        },
        updateNode: (existing) => {
            if (css.replace(/^\s+/gm, '') !== existing.textContent!.replace(/^\s+/gm, '')) {
                existing.textContent = css;
            }
        },
        selectTarget: () => document.head,
        createTarget: () => {
            const head = document.createElement('head');
            document.documentElement.insertBefore(head, document.documentElement.firstElementChild);
            return head;
        },
        isTargetMutation: (mutation) => mutation.target.nodeName.toLowerCase() === 'head',
    });
}

export function createOrUpdateStyle(css: string, type: string): void {
    createOrUpdateStyleElement('dark-reader-style', css, false, () => document.documentElement.setAttribute('data-darkreader-mode', type));
}

export function removeStyle(): void {
    removeNode(document.getElementById('dark-reader-style'));
    document.documentElement.removeAttribute('data-darkreader-mode');
}

// Placed first, so that its anonymous layer has the lowest priority.
// No "data-darkreader-mode" attribute, as the site's own colors are kept.
export function createOrUpdateImageStyle(css: string): void {
    createOrUpdateStyleElement('dark-reader-image-style', css, true);
}

export function removeImageStyle(): void {
    removeNode(document.getElementById('dark-reader-image-style'));
}

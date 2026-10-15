import './support/polyfills';
import {DEFAULT_THEME} from '../../src/defaults';
import {collectCSS} from '../../src/inject/dynamic-theme/css-collection';
import {getImageBrightnessStyle} from '../../src/inject/image-brightness';
import {applyImageDimming, removeImageDimming} from '../../src/inject/image-dimming';
import {multiline, timeout} from './support/test-utils';

describe('IMAGE BRIGHTNESS', () => {
    let container: HTMLElement;
    let style: HTMLStyleElement;

    // Inside describe, as top-level hooks run for every spec in every file
    beforeEach(() => {
        container = document.body;
        container.innerHTML = '';
        style = document.createElement('style');
        document.head.append(style);
    });

    afterEach(() => {
        container.innerHTML = '';
        style.remove();
    });

    it('should not add a style at full image brightness', () => {
        expect(getImageBrightnessStyle(DEFAULT_THEME, [], 'example.com')).toBe('');
    });

    it('should dim only content images on sites with known containers', () => {
        container.innerHTML = multiline(
            '<img class="avatar">',
            '<div data-testid="tweetPhoto">',
            '    <div class="media" style="background-image: url(data:image/gif;base64,R0lGODlhAQABAAAAACw=); filter: brightness(1)"></div>',
            '    <img class="media-img">',
            '</div>',
        );
        style.textContent = getImageBrightnessStyle({...DEFAULT_THEME, imageBrightness: 70}, [], 'x.com');
        expect(getComputedStyle(container.querySelector('.avatar')!).filter).toBe('none');
        expect(getComputedStyle(container.querySelector('.media-img')!).filter).toBe('brightness(0.7)');
        expect(getComputedStyle(container.querySelector('.media')!).boxShadow).toMatch(/^rgba\(0, 0, 0, 0\.3\) 0px 0px 0px \d+px inset$/);

        style.textContent = getImageBrightnessStyle({...DEFAULT_THEME, imageBrightness: 70}, [], 'example.com');
        expect(getComputedStyle(container.querySelector('.avatar')!).filter).toBe('brightness(0.7)');
    });

    it('should add the image style for screen only and include it in exported CSS', async () => {
        applyImageDimming(getImageBrightnessStyle({...DEFAULT_THEME, imageBrightness: 70}, [], 'example.com'));
        const imageStyle = document.getElementById('dark-reader-image-style') as HTMLStyleElement;
        expect(imageStyle.media).toBe('screen');
        expect(imageStyle.parentElement).toBe(document.head);
        expect(document.documentElement.hasAttribute('data-darkreader-mode')).toBe(false);
        expect(await collectCSS()).toContain('brightness(70%)');
        removeImageDimming();
        expect(document.getElementById('dark-reader-image-style')).toBe(null);
    });

    it('should respect darkreader-lock', async () => {
        const css = getImageBrightnessStyle({...DEFAULT_THEME, imageBrightness: 70}, [], 'example.com');
        const lock = document.createElement('meta');
        lock.name = 'darkreader-lock';

        document.head.append(lock);
        applyImageDimming(css);
        expect(document.getElementById('dark-reader-image-style')).toBe(null);
        lock.remove();

        applyImageDimming(css);
        expect(document.getElementById('dark-reader-image-style')).not.toBe(null);
        document.head.append(lock);
        await timeout(0);
        expect(document.getElementById('dark-reader-image-style')).toBe(null);
        lock.remove();
        removeImageDimming();
    });

    it('should not add the image style after removal while waiting for head', async () => {
        const head = document.head;
        head.remove();
        applyImageDimming(getImageBrightnessStyle({...DEFAULT_THEME, imageBrightness: 70}, [], 'example.com'));
        removeImageDimming();
        document.documentElement.prepend(head);
        await timeout(0);
        expect(document.getElementById('dark-reader-image-style')).toBe(null);

        head.remove();
        applyImageDimming(getImageBrightnessStyle({...DEFAULT_THEME, imageBrightness: 70}, [], 'example.com'));
        document.documentElement.prepend(head);
        await timeout(0);
        expect(document.getElementById('dark-reader-image-style')?.parentElement).toBe(head);
        removeImageDimming();
    });
});

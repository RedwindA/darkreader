import './support/polyfills';
import {DEFAULT_THEME} from '../../src/defaults';
import {getImageBrightnessStyle} from '../../src/inject/image-brightness';
import {multiline} from './support/test-utils';

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
});

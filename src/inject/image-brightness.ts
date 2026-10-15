import type {Theme} from '../definitions';
import {isLayerRuleSupported} from '../utils/platform';

// Sites where only content images are dimmed, not avatars, icons etc.
const contentImageContainers: Record<string, string> = {
    'x.com': [
        '[data-testid="tweetPhoto"]',
        '[data-testid="videoPlayer"]',
        '[data-testid="card.layoutLarge.media"]',
        '[data-testid="card.layoutSmall.media"]',
    ].join(', '),
};

export function getImageBrightnessStyle(theme: Theme, invertSelectors: string[], host: string): string {
    if (!(theme.imageBrightness < 100)) {
        return '';
    }

    const container = contentImageContainers[host];
    const scope = container ? `:where(${container}) ` : '';
    // Empty elements with an inline background image are image boxes (e.g. x.com media and avatars),
    // non-empty ones and form controls (always :empty) are skipped to avoid dimming their content.
    const bgImageBox = '[style*="background"][style*="url("]:empty:not(input, textarea, select)';
    // Not "backdrop-filter" or a URL containing "filter"
    const inlineFilter = ':is([style^="filter"], [style*=" filter"], [style*=";filter"])';
    // Forgiving :is() so that an unsupported fix selector doesn't drop the rule
    const validInvertSelectors = invertSelectors.filter(Boolean);
    const notInverted = validInvertSelectors.length > 0 ? `:not(:is(${validInvertSelectors.join(', ')}))` : '';

    // Lowest priority, so that page filters (including layered ones) and inversion fixes take precedence
    const lines = [
        `${scope}:where(img, ${bgImageBox}) {`,
        `    filter: brightness(${theme.imageBrightness}%);`,
        '}',
        // An inline filter (e.g. x.com media has "filter: brightness(1)") overrides the one above,
        // so such boxes are dimmed with a black overlay instead, which also keeps the page's own filter.
        // Inverted elements are skipped, as the overlay would be inverted too.
        `${scope}:where(${bgImageBox}${inlineFilter}${notInverted}) {`,
        `    box-shadow: inset 0 0 0 100vmax rgba(0, 0, 0, ${(100 - theme.imageBrightness) / 100});`,
        '}',
    ];
    if (isLayerRuleSupported) {
        lines.unshift('@layer {');
        lines.push('}');
    }
    return lines.join('\n');
}

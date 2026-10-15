import UserStorage from '../../../src/background/user-storage';
import {DEFAULT_SETTINGS, DEFAULT_THEME} from '../../../src/defaults';
import type {Theme, UserSettings} from '../../../src/definitions';

test('Fill theme defaults for settings from older versions', () => {
    UserStorage.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

    const {imageBrightness, ...legacyTheme} = DEFAULT_THEME;
    UserStorage.set({
        theme: {...legacyTheme, brightness: 120} as Theme,
        presets: [{id: 'p1', name: 'P1', urls: ['a.com'], theme: {...legacyTheme} as Theme}],
        customThemes: [{url: ['b.com'], theme: {...legacyTheme} as Theme}],
    } as Partial<UserSettings>);

    expect(UserStorage.settings.theme).toEqual({...DEFAULT_THEME, brightness: 120});
    expect(UserStorage.settings.presets[0].theme.imageBrightness).toBe(imageBrightness);
    expect(UserStorage.settings.customThemes[0].theme.imageBrightness).toBe(imageBrightness);
});

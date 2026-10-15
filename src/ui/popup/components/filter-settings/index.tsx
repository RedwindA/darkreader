import {m} from 'malevic';

import type {ExtWrapper, Theme} from '../../../../definitions';
import {ThemeEngine} from '../../../../generators/theme-engines';
import {getLocalMessage} from '../../../../utils/locales';
import {isURLInList} from '../../../../utils/url';
import {UpDown} from '../../../controls';
import CustomSettingsToggle from '../custom-settings-toggle';

import ModeToggle from './mode-toggle';

export default function FilterSettings({data, actions}: ExtWrapper, ...children: Malevic.Child[]) {
    const custom = data.settings.customThemes.find(({url}) => isURLInList(data.activeTab.url, url));
    const theme = custom ? custom.theme : data.settings.theme;

    function setConfig(config: Partial<Theme>) {
        if (custom) {
            custom.theme = {...custom.theme, ...config};
            actions.changeSettings({customThemes: data.settings.customThemes});
        } else {
            actions.setTheme(config);
        }
    }

    const brightness = (
        <UpDown
            value={theme.brightness}
            min={50}
            max={150}
            step={5}
            default={100}
            name={getLocalMessage('brightness')}
            onChange={(value) => setConfig({brightness: value})}
        />
    );

    const imageBrightness = theme.engine === ThemeEngine.dynamicTheme ? (
        <UpDown
            value={theme.imageBrightness}
            min={10}
            max={100}
            step={5}
            default={100}
            name={getLocalMessage('image_brightness')}
            onChange={(value) => setConfig({imageBrightness: value})}
        />
    ) : null;

    const contrast = (
        <UpDown
            value={theme.contrast}
            min={50}
            max={150}
            step={5}
            default={100}
            name={getLocalMessage('contrast')}
            onChange={(value) => setConfig({contrast: value})}
        />
    );

    const grayscale = (
        <UpDown
            value={theme.grayscale}
            min={0}
            max={100}
            step={5}
            default={0}
            name={getLocalMessage('grayscale')}
            onChange={(value) => setConfig({grayscale: value})}
        />
    );

    const sepia = (
        <UpDown
            value={theme.sepia}
            min={0}
            max={100}
            step={5}
            default={0}
            name={getLocalMessage('sepia')}
            onChange={(value) => setConfig({sepia: value})}
        />
    );

    return (
        <section class="filter-settings">
            <ModeToggle mode={theme.mode} onChange={(mode) => setConfig({mode})} />
            {brightness}
            {imageBrightness}
            {contrast}
            {sepia}
            {grayscale}
            <CustomSettingsToggle data={data} actions={actions} />
            <div class="filter-settings__content">
                {...children}
            </div>
        </section>
    );
}

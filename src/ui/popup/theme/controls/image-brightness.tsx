import {m} from 'malevic';

import {getLocalMessage} from '../../../../utils/locales';
import {Slider} from '../../../controls';

import {formatPercent} from './format';
import ThemeControl from './theme-control';

export default function ImageBrightness(props: {value: number; onChange: (v: number) => void}) {
    return (
        <ThemeControl label={getLocalMessage('image_brightness')}>
            <Slider
                value={props.value}
                min={10}
                max={100}
                step={1}
                formatValue={formatPercent}
                onChange={props.onChange}
            />
        </ThemeControl>
    );
}

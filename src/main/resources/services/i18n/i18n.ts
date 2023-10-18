import {getPhrases} from '/lib/xp/i18n';
import {getLocales} from '/lib/xp/admin';

export function get() {
    const locales = getLocales();
    const body = getPhrases(locales, ['i18n/common']);
    const phrases = getPhrases(locales, ['i18n/phrases']);
    for (let key in phrases) { body[key] = phrases[key]; }
    return {
        status: 200,
        contentType: 'application/json',
        body
    };
}

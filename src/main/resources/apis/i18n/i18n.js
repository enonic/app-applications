var i18n = require('/lib/xp/i18n');

exports.get = function (req) {

    return {
        status: 200,
        contentType: 'application/json',
        body: getPhrases(req.locales)
    }
};

var getPhrases = function(locales) {
    var bundle = i18n.getPhrases(locales, ['i18n/common']);
    var phrases = i18n.getPhrases(locales, ['i18n/phrases']);

    for (var key in phrases) { bundle[key] = phrases[key] }

    return bundle;
};

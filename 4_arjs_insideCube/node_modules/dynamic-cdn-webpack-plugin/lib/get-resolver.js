'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getResolver;
function getResolver() {
    var resolver = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'module-to-cdn';

    if (typeof resolver === 'function') {
        return resolver;
    }

    return require(resolver);
}
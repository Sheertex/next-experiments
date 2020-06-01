"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABTestingContextConsumer = exports.ABTestingContextProvider = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const utils_1 = require("../utils");
const router_1 = require("next/router");
const defaultABTestingContext = {};
const ABTestingContext = react_1.default.createContext(defaultABTestingContext);
function getABTestContext(payload) {
    const searchParams = new URLSearchParams(payload);
    const result = {};
    // can't call reduce on searchParams, that's why using forEach
    searchParams.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}
function getABTestContextFromPath(path) {
    const idx = path.indexOf(utils_1.AB_TEST_PAYLOAD_PREFIX);
    if (idx === -1) {
        return {};
    }
    // removing possible trailing slash
    const normalizedPath = path.replace(/\/$/, '');
    // we should exclude possible query string from payload
    const queryIdx = path.indexOf('?');
    let endIdx = normalizedPath.length;
    if (queryIdx !== -1) {
        endIdx = queryIdx;
    }
    const testPayload = normalizedPath.slice(idx + utils_1.AB_TEST_PAYLOAD_PREFIX.length, endIdx);
    return getABTestContext(decodeURIComponent(testPayload));
}
function ABTestingContextProvider({ children, permutationsPayload, }) {
    const router = router_1.useRouter();
    const abTestingContext = permutationsPayload
        ? getABTestContext(permutationsPayload)
        : getABTestContextFromPath(router.asPath);
    return (react_1.default.createElement(ABTestingContext.Provider, { value: abTestingContext }, children));
}
exports.ABTestingContextProvider = ABTestingContextProvider;
const ABTestingContextConsumer = ABTestingContext.Consumer;
exports.ABTestingContextConsumer = ABTestingContextConsumer;
//# sourceMappingURL=index.js.map
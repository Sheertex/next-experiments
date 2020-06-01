"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticProps = exports.withPermutedStaticProps = exports.withPermutationContext = exports.permuteStaticPaths = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const utils_1 = require("../abTestingInfra/utils");
const permutations_1 = require("../abTestingInfra/permutations");
const ABTestingContext_1 = require("../abTestingInfra/ABTestingContext");
// TODO: maybe we should remove async from this func? It did not perform internally any async actions
function permuteStaticPaths(paths) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return permutations_1.getPermutatedPaths(paths);
    });
}
exports.permuteStaticPaths = permuteStaticPaths;
exports.withPermutationContext = (Component) => (props) => {
    const permutationsPayload = props[utils_1.AB_TEST_PAYLOAD_KEY];
    delete props[utils_1.AB_TEST_PAYLOAD_KEY];
    return (react_1.default.createElement(ABTestingContext_1.ABTestingContextProvider, { permutationsPayload: permutationsPayload },
        react_1.default.createElement(Component, Object.assign({}, props))));
};
exports.withPermutedStaticProps = (getStaticProps) => {
    return (context) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        let payload;
        if (!!context && !!context.params) {
            const { result, permutationsPayload } = permutations_1.stripPermutationsPayload(context.params);
            context.params = result;
            payload = permutationsPayload;
        }
        const props = getStaticProps
            ? yield getStaticProps(context)
            : { props: {} };
        if (payload) {
            props.props[utils_1.AB_TEST_PAYLOAD_KEY] = payload;
        }
        return props;
    });
};
// This is handy wrapper to export getStaticProps right from the page, using export {getStaticProps} from ...
exports.getStaticProps = exports.withPermutedStaticProps();
//# sourceMappingURL=page.js.map
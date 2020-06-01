"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const utils_1 = require("../utils");
const ExperimentContext_1 = tslib_1.__importDefault(require("../ExperimentContext"));
const emitter_1 = require("../emitter");
function Variant(props) {
    const { name, children } = props;
    utils_1.assertNameIsValid(name);
    if (typeof children === 'function') {
        return (react_1.default.createElement(ExperimentContext_1.default.Consumer, null, (experimentName) => {
            const winFunction = () => emitter_1.recordWin(experimentName, name);
            return children(winFunction);
        }));
    }
    if (react_1.default.isValidElement(children)) {
        return children;
    }
    return react_1.default.createElement("span", null, children);
}
Variant.displayName = 'Variant';
exports.default = Variant;
//# sourceMappingURL=index.js.map
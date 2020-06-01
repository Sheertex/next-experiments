"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const utils_1 = require("../utils");
const ABTestingContext_1 = require("../ABTestingContext");
const prop_types_1 = tslib_1.__importDefault(require("prop-types"));
const emitter_1 = require("../emitter");
const ExperimentContext_1 = tslib_1.__importDefault(require("../ExperimentContext"));
let Experiment = /** @class */ (() => {
    class Experiment extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.variants = Experiment.filterVariants(props.children);
            this.variantName = "undefined";
        }
        componentDidMount() {
            const { name, triggerPlay } = this.props;
            if (typeof window === "undefined") {
                return;
            }
            if (!!triggerPlay && typeof triggerPlay === "function") {
                Promise.resolve(triggerPlay())
                    .then(() => emitter_1.recordPlay(name, this.variantName))
                    .catch((err) => console.error(`triggerPlay hook throw an error. Error: ${err.toString()}`));
                return;
            }
            emitter_1.recordPlay(name, this.variantName);
        }
        static filterVariants(children) {
            const variants = {};
            react_1.default.Children.forEach(children, (element) => {
                if (!react_1.default.isValidElement(element) ||
                    element.type.displayName !== "Variant") {
                    throw new Error("Experiment children must be components of type Variant.");
                }
                variants[element.props.name] = element;
            });
            if (Object.keys(variants).length === 0) {
                throw new Error("Experiment has no Variants");
            }
            return variants;
        }
        getVariantToDisplay(payload) {
            const { name, defaultVariantName } = this.props;
            const selectedVariantName = payload[name];
            if (!selectedVariantName) {
                this.variantName = defaultVariantName;
                return this.variants[this.variantName];
            }
            if (!this.variants[selectedVariantName]) {
                // TODO: it's too chatty, maybe we should disable it
                console.error(`Can't find "${selectedVariantName}" variant in experiment "${name}", will use default variant "${defaultVariantName}"`);
                this.variantName = defaultVariantName;
                return this.variants[this.variantName];
            }
            this.variantName = selectedVariantName;
            return this.variants[selectedVariantName];
        }
        render() {
            const { name, defaultVariantName } = this.props;
            utils_1.assertNameIsValid(name);
            utils_1.assertNameIsValid(defaultVariantName);
            if (!this.variants[defaultVariantName]) {
                throw new Error(`Variant with the name "${defaultVariantName}" is not found. Maybe you made a typo in defaultVariantName?`);
            }
            return (react_1.default.createElement(ABTestingContext_1.ABTestingContextConsumer, null, (payload) => (react_1.default.createElement(ExperimentContext_1.default.Provider, { value: name }, this.getVariantToDisplay(payload)))));
        }
    }
    Experiment.propTypes = {
        name: prop_types_1.default.string.isRequired,
        defaultVariantName: prop_types_1.default.string.isRequired,
        children: prop_types_1.default.node.isRequired,
        triggerPlay: prop_types_1.default.oneOfType([prop_types_1.default.func, prop_types_1.default.object]),
    };
    return Experiment;
})();
exports.default = Experiment;
//# sourceMappingURL=index.js.map
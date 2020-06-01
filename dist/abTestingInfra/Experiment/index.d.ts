import React from "react";
import PropTypes from "prop-types";
import { ABTestingPayload, Variants } from "../types";
declare class Experiment extends React.Component {
    static propTypes: {
        name: PropTypes.Validator<string>;
        defaultVariantName: PropTypes.Validator<string>;
        children: PropTypes.Validator<PropTypes.ReactNodeLike>;
        triggerPlay: PropTypes.Requireable<object>;
    };
    props: {
        name: string;
        defaultVariantName: string;
        triggerPlay?: (() => void) | Promise<void>;
        children: React.ReactNode;
    };
    variants: Variants;
    variantName: string;
    constructor(props: any);
    componentDidMount(): void;
    static filterVariants(children: React.ReactNode): Variants;
    getVariantToDisplay(payload: ABTestingPayload): React.ReactNode;
    render(): React.ReactNode;
}
export default Experiment;

import React from "react";
import { assertNameIsValid } from "../utils";
import { ABTestingContextConsumer } from "../ABTestingContext";
import PropTypes from "prop-types";
import { recordPlay } from "../emitter";
import { ABTestingPayload, VariantProps, Variants } from "../types";
import ExperimentContext from "../ExperimentContext";

class Experiment extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    defaultVariantName: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    triggerPlay: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  };

  props: {
    name: string;
    defaultVariantName: string;
    triggerPlay?: (() => void) | Promise<void>;
    children: React.ReactNode;
  };

  variants: Variants;
  variantName: string;

  constructor(props) {
    super(props);

    this.variants = Experiment.filterVariants(props.children);
    this.variantName = "undefined";
  }

  componentDidMount(): void {
    const { name, triggerPlay } = this.props;

    if (typeof window === "undefined") {
      return;
    }

    if (!!triggerPlay && typeof triggerPlay === "function") {
      Promise.resolve(triggerPlay())
        .then(() => recordPlay(name, this.variantName))
        .catch((err) =>
          console.error(
            `triggerPlay hook throw an error. Error: ${err.toString()}`
          )
        );

      return;
    }

    recordPlay(name, this.variantName);
  }

  static filterVariants(children: React.ReactNode): Variants {
    const variants: Variants = {};

    React.Children.forEach(
      children as React.Component[],
      (element: React.Component) => {
        if (
          !React.isValidElement(element) ||
          (element.type as React.SFC).displayName !== "Variant"
        ) {
          throw new Error(
            "Experiment children must be components of type Variant."
          );
        }

        variants[(element.props as VariantProps).name] = element;
      }
    );

    if (Object.keys(variants).length === 0) {
      throw new Error("Experiment has no Variants");
    }

    return variants;
  }

  getVariantToDisplay(payload: ABTestingPayload): React.ReactNode {
    const { name, defaultVariantName } = this.props;

    const selectedVariantName = payload[name];

    if (!selectedVariantName) {
      this.variantName = defaultVariantName;

      return this.variants[this.variantName];
    }

    if (!this.variants[selectedVariantName]) {
      // TODO: it's too chatty, maybe we should disable it
      console.error(
        `Can't find "${selectedVariantName}" variant in experiment "${name}", will use default variant "${defaultVariantName}"`
      );

      this.variantName = defaultVariantName;

      return this.variants[this.variantName];
    }

    this.variantName = selectedVariantName;

    return this.variants[selectedVariantName];
  }

  render(): React.ReactNode {
    const { name, defaultVariantName } = this.props;

    assertNameIsValid(name);
    assertNameIsValid(defaultVariantName);

    if (!this.variants[defaultVariantName]) {
      throw new Error(
        `Variant with the name "${defaultVariantName}" is not found. Maybe you made a typo in defaultVariantName?`
      );
    }

    return (
      <ABTestingContextConsumer>
        {(payload) => (
          <ExperimentContext.Provider value={name}>
            {this.getVariantToDisplay(payload)}
          </ExperimentContext.Provider>
        )}
      </ABTestingContextConsumer>
    );
  }
}

export default Experiment;

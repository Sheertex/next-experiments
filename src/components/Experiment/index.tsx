import React, {
  ReactNode,
  Component,
  Children,
  isValidElement,
  SFC,
  useEffect,
  useContext,
} from 'react';
import { assertNameIsValid } from '../utils';
import ABTestingContext from '../ABTestingContext';
import { recordPlay } from '../../events';
import { ABTestingPayload, VariantProps, Variants } from '../../types';
import ExperimentContext from '../ExperimentContext';

type Props = {
  name: string;
  defaultVariantName: string;
  children: ReactNode;
  triggerPlay?: (() => void) | Promise<void>;
};

type PropsWithContext = {
  name: string;
  defaultVariantName: string;
  triggerPlay?: (() => void) | Promise<void>;
  payload: ABTestingPayload;
  variants: Variants;
};

function getVariantsFromChildren(children: ReactNode): Variants {
  const variants: Variants = {};

  Children.forEach(children as Component[], (element: Component) => {
    if (
      !isValidElement(element) ||
      (element.type as SFC).displayName !== 'Variant'
    ) {
      throw new Error(
        'Experiment children must be components of type Variant.',
      );
    }

    variants[(element.props as VariantProps).name] = element;
  });

  if (Object.keys(variants).length === 0) {
    throw new Error('Experiment has no Variants');
  }

  return variants;
}

function assertDefaultVariantExists(
  variants: Variants,
  defaultVariantName: string,
): void {
  if (!variants[defaultVariantName]) {
    throw new Error(
      `Variant with the name "${defaultVariantName}" is not found. Maybe you made a typo in defaultVariantName?`,
    );
  }
}

function getVariantToDisplay(
  variants: Variants,
  name: string,
  defaultVariantName: string,
  payload: ABTestingPayload,
): ReactNode {
  const selectedVariantName = payload[name];

  return selectedVariantName && variants[selectedVariantName]
    ? variants[selectedVariantName]
    : variants[defaultVariantName];
}

function ExperimentWithContext({
  payload,
  variants,
  name: experimentName,
  defaultVariantName,
  triggerPlay,
}: PropsWithContext): JSX.Element {
  const displayedVariant = getVariantToDisplay(
    variants,
    experimentName,
    defaultVariantName,
    payload,
  );

  const { name: variantName } = (displayedVariant as Component)
    .props as VariantProps;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!!triggerPlay && typeof triggerPlay === 'function') {
      Promise.resolve(triggerPlay())
        .then(() => recordPlay(experimentName, variantName))
        .catch((err) =>
          console.error(
            `triggerPlay hook throw an error. Error: ${err.toString()}`,
          ),
        );

      return;
    }

    recordPlay(experimentName, variantName);
  }, []);

  return (
    <ExperimentContext.Provider value={experimentName}>
      {displayedVariant}
    </ExperimentContext.Provider>
  );
}

export default function Experiment(props: Props): ReactNode {
  const { name: experimentName, defaultVariantName, children } = props;

  assertNameIsValid(experimentName);
  assertNameIsValid(defaultVariantName);

  const variants = getVariantsFromChildren(children);

  assertDefaultVariantExists(variants, defaultVariantName);

  const payload = useContext(ABTestingContext);

  return (
    <ExperimentWithContext {...props} payload={payload} variants={variants} />
  );
}

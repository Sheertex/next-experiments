import React, { isValidElement } from 'react';
import { assertNameIsValid } from '../utils';
import ExperimentContext from '../ExperimentContext';
import { VariantProps } from '../types';
import { recordWin } from '../emitter';

function Variant(props: VariantProps): JSX.Element {
  const { name, children } = props;

  assertNameIsValid(name);

  if (typeof children === 'function') {
    return (
      <ExperimentContext.Consumer>
        {(experimentName) => {
          const winFunction = (): void => recordWin(experimentName, name);

          return children(winFunction);
        }}
      </ExperimentContext.Consumer>
    );
  }

  if (isValidElement(children)) {
    return children;
  }

  return <span>{children}</span>;
}

Variant.displayName = 'Variant';

export default Variant;

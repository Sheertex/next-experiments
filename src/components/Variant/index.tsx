import React, { isValidElement, useContext } from 'react';
import { assertNameIsValid } from '../utils';
import ExperimentContext from '../ExperimentContext';
import { VariantProps } from '../../types';
import { recordWin } from '../../events';

function Variant(props: VariantProps): JSX.Element {
  const { name, children } = props;

  assertNameIsValid(name);

  const experimentName = useContext(ExperimentContext);

  if (typeof children === 'function') {
    const winFunction = (): void => recordWin(experimentName, name);

    return children(winFunction);
  }

  if (isValidElement(children)) {
    return children;
  }

  return <span>{children}</span>;
}

Variant.displayName = 'Variant';

export default Variant;

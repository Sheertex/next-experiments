import React, { ReactNode } from 'react';
import { Variant, Experiment } from '../../../index';

const TestComponent = (): ReactNode => (
  <div>
    <Experiment name="" defaultVariantName="variantA">
      <Variant name="variant">Variant</Variant>
    </Experiment>
  </div>
);

export default TestComponent;

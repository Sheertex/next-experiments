import React, { ReactNode } from 'react';
import { Variant, Experiment } from '../../../index';

const TestComponent = (): ReactNode => (
  <div>
    <Experiment name="experiment" defaultVariantName="variantA">
      <div>
        <Variant name="variant">Variant</Variant>
      </div>
    </Experiment>
  </div>
);

export default TestComponent;

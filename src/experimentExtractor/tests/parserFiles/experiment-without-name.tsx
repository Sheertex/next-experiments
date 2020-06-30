import React, { ReactNode } from 'react';
import { Variant, Experiment } from '../../../abTestingInfra';

const TestComponent = (): ReactNode => (
  <div>
    {/*
  // @ts-ignore */}
    <Experiment defaultVariantName="variantA">
      <Variant name="variant">Variant</Variant>
    </Experiment>
  </div>
);

export default TestComponent;

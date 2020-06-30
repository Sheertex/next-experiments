import React, { ReactNode } from 'react';
import { Experiment } from '../../../abTestingInfra';

const TestComponent = (): ReactNode => (
  <div>
    <Experiment name="experiment" defaultVariantName="variantA" />
  </div>
);

export default TestComponent;

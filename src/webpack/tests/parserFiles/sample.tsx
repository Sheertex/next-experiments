import React, { ReactNode } from 'react';
import { Variant, Experiment } from '../../../index';

const TestComponent = (): ReactNode => (
  <Experiment name="experiment" defaultVariantName="variantA">
    <Variant name="variantA">A</Variant>
    <Variant name="variantB">B</Variant>
  </Experiment>
);

export default TestComponent;

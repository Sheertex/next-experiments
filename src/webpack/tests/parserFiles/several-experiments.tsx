import React, { ReactNode } from 'react';
import { Variant, Experiment } from '../../../index';

const TestComponent = (): ReactNode => (
  <div>
    <div id="componentA">
      <Experiment name="experimentA" defaultVariantName="variantA">
        <Variant name="variantA">A</Variant>
        <Variant name="variantB">B</Variant>
      </Experiment>
    </div>
    <div id="componentB">
      <Experiment name="experimentB" defaultVariantName="variantA">
        <Variant name="variantA">A</Variant>
        <Variant name="variantB">B</Variant>
      </Experiment>
    </div>
  </div>
);

export default TestComponent;

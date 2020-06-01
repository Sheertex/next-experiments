import React from "react";
import { Variant, Experiment } from "../../../abTestingInfra";

const TestComponent = () => (
  <div>
    {/* 
  // @ts-ignore */}
    <Experiment defaultVariantName="variantA">
      <Variant name="variant">Variant</Variant>
    </Experiment>
  </div>
);

export default TestComponent;

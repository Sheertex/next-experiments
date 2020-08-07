import React from "react";
import { Experiment, Variant } from "next-experiments";

export default () => (
  <div>
    Selected variant of text experiment is{" "}
    <strong>
      <Experiment name="text-experiment" defaultVariantName="a">
        <Variant name="a">Variant A</Variant>
        <Variant name="b">Variant B</Variant>
      </Experiment>
    </strong>
  </div>
);

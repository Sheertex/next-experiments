import React from "react";
import { Experiment, Variant } from "next-experiments";

export default () => (
  <div>
    Selected variant of color experiment is{" "}
    <strong>
      <Experiment name="color-experiment" defaultVariantName="red">
        <Variant name="red">
          <span style={{ backgroundColor: "red" }}>RED</span>
        </Variant>
        <Variant name="green">
          <span style={{ backgroundColor: "green" }}>GREEN</span>
        </Variant>
        <Variant name="yellow">
          <span style={{ backgroundColor: "yellow" }}>YELLOW</span>
        </Variant>
      </Experiment>
    </strong>
  </div>
);

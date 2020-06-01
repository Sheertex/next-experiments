import React from "react";
import { Experiment, Variant } from "next-experiments";

export default () => (
  <div>
    <p>Click on the button below and check results in the browser console</p>
    <div>
      <Experiment
        name="button-experiment"
        defaultVariantName="a"
        triggerPlay={() => {
          console.log(
            "Play of this experiment will be delayed for 3 seconds"
          );
          return new Promise((resolve) => setTimeout(() => {
            console.log('Ding-dong! We can call play() for this experiment')
            resolve()
          }, 3000));
        }}
      >
        <Variant name="a">
          {(win) => <button onClick={() => win()}>Variant A</button>}
        </Variant>
        <Variant name="b">
          {(win) => <button onClick={() => win()}>Variant B</button>}
        </Variant>
        <Variant name="c">
          {(win) => <button onClick={() => win()}>Variant C</button>}
        </Variant>
      </Experiment>
    </div>
  </div>
);

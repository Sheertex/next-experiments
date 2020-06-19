# next-experiments

Next-experiments is an attempt to add A/B testing infrastructure to the Next.js

**Warning: The project is in the alpha stage, consider reviewing source code of the project before using it in the production**

## Getting Started

### Demo

Check out samples folder to get a basic concepts of next-experiments

### How to add A/B testing to your next.js site

#### Prerequsistes

1. Install library `yarn add next-experiments`
1. Install fork of `next.js` that supports A/B tests. `yarn add @sheertex/next`   
1. Change your `next.config.js` to add `ExperimentExtractorPlugin` and fix for `fs` modules

   ```js
   const ExperimentExtractorPlugin = require("next-experiments/dist/experimentExtractor");

   let config = {
     distDir: "./dist",
     target: "serverless",
     webpack(config, { dev, isServer }) {
       if (!dev && isServer) {
         config.plugins.push(new ExperimentExtractorPlugin());
       }

       // Fixes npm packages that depend on `fs-extra` module
       if (!isServer) {
         config.node = {
           fs: "empty",
         };
       }

       return config;
     },
   };
   ```

#### Adding A/B testing to the page

1. Create React component (.jsx or .tsx) with the desired experiment

   ```js
   import React from "react";
   import { Experiment, Variant } from "next-experiments";

   export default () => (
     <div>
       Selected variant of text experiment is
       <strong>
         <Experiment name="text-experiment" defaultVariantName="a">
           <Variant name="a">Variant A</Variant>
           <Variant name="b">Variant B</Variant>
         </Experiment>
       </strong>
     </div>
   );
   ```

1. Add A/B testing infrastructure to the page

   1. Add export `export { permuteStaticPaths, getStaticProps } from "next-experiments"` to the page you want to test
   1. Wrap component with `withPermutationContext` wrapper function
   1. Use created on the first step component with experiment somewhere in the page

   ```js
   import TextExperiment from "../components/TextExperiment";

   export { permuteStaticPaths, getStaticProps } from "next-experiments";

   import { withPermutationContext } from "next-experiments";

   export default withPermutationContext(() => {
     return (
       <>
         <h1>Welcome to A/B Testing for next.js</h1>
         <TextExperiment />
       </>
     );
   });
   ```

1. Run `next dev` and check that next.js has started sucessfully and shows your page with the default variant of experiment
1. Run `next build` and check that `experiments.json` file is created and it is not empty
1. Run `next export` to generate static html files

### Advanced usage

#### A/B testing events

You can send A/B experiments events to your favorite analytics tool by subscribing to the EMIT_PLAY and EMIT_WIN hooks.

Place the code listed below somewhere in the \_app.js file of your next.js project. 

```js
import { emitter,  EXPERIMENT_PLAYED, EXPERIMENT_WON } from "next-experiments";

if (typeof window !== "undefined") {
  emitter.on(EXPERIMENT_PLAYED, ({ experimentName, variantName }) => {
    console.log(
      `Playing "${variantName}" variant of "${experimentName}" experiment`
    );
  });

  emitter.on(EXPERIMENT_WON, ({ experimentName, variantName }) => {
    console.log(
      `"${variantName}" variant is won in "${experimentName}" experiment`
    );
  });
}
```

__What is play event?__

Play event is emitted when component with the Experiment did mount. It is useful when you want to understand what variant of experiment your user actually saw. You can delay triggering of play event by passing `triggerPlay` prop to the Experiment component.

```js
<Experiment
  name="experiment"
  defaultVariantName="a"
  triggerPlay={() => {
    console.log("Play of this experiment will be delayed for 3 seconds");
    return new Promise((resolve) =>
      setTimeout(() => {
        console.log("Ding-dong! We can call play() for this experiment");
        resolve();
      }, 3000)
    );
  }}
>
  ...
</Experiment>
```

__What is win event?__

Win event is passed to the Variant component children. It's useful when you want to track what variant of experiment leads to user action.

```js
 <Experiment
        name="experiment"
        defaultVariantName="a"        
      >
        <Variant name="a">
          {(win) => <button onClick={() => win()}>Variant A</button>}
        </Variant>
        ...        
      </Experiment>
```

#### Further Reading

For advanced usage examples refer to the sample project


## Contribution

### How to publish new version to npm?

1. Run `yarn run test:unit`
1. Bump version in `package.json`
1. Run `npm publish`
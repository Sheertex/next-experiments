# next-experiments

Next-experiments is an attempt to add A/B testing infrastructure to the Next.js

⚠️ **Warning: The project is in the alpha stage, consider reviewing source code of the project before using it in the production**

## Getting Started

### Quickstart

> ⚠️ **For the time being, you must use our next.js fork ([link](https://github.com/Sheertex/next.js)), which adds permuteStaticPaths support**

1. Install library `yarn add next-experiments`
1. Install fork of `next.js` that supports A/B tests.

   1. In your `package.json` file replace `"next": "<your_version_of_next>"` with `"next": "https://registry.npmjs.org/@sheertex/next/-/next-9.4.5-canary.14.tgz"`
   1. Remove `node_modules` folder
   1. Run `yarn install`

1. Change your `next.config.js` to add `ExperimentExtractorPlugin` and fix for `fs` modules

   ```js
   const { default: ExperimentExtractorPlugin } = require("next-experiments/dist/experimentExtractor");

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

1. Once you implement the `permuteStaticPaths` and `getStaticProps` hooks, `next-experiments` will be able to statically compile separate files for every possible <Experiment> + <Variant> combination on your page:

```js
import { Experiment, Variant, withPermutationContext } from "next-experiments";
export { permuteStaticPaths, getStaticProps } from "next-experiments";

export default withPermutationContext(() => {
  return (
    <>
      <h1>Welcome to A/B Testing for next.js</h1>
      <Experiment name="text-experiment" defaultVariantName="a">
        <Variant name="a">Variant A</Variant>
        <Variant name="b">Variant B</Variant>
      </Experiment>
    </>
  );
});
```

This works for both static and dynamic page paths. When you next statically compile the site, variants will be rendered to your out directory:

```
next build
next export
```

### Demo

Check out samples folder to get a basic concepts of next-experiments

### Events

#### A/B testing events

You can send A/B experiments events to your favorite analytics tool by subscribing to the EMIT_PLAY and EMIT_WIN hooks.

Place the code listed below somewhere in the \_app.js file of your next.js project.

```js
import { emitter, EXPERIMENT_PLAYED, EXPERIMENT_WON } from "next-experiments";

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

**What is play event?**

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

**What is win event?**

Win event is passed to the Variant component children. It's useful when you want to track what variant of experiment leads to user action.

```js
<Experiment name="experiment" defaultVariantName="a">
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

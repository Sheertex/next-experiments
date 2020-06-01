# next-experiments

Next-experiments is an attempt to add A/B testing infrastructure to the Next.js

__Warning: The project is in the alpha stage, consider reviewing source code of the project before using it in the production__

## Getting Started

### Demo

Check out samples folder to get a basic concepts of next-experiments

### How to add A/B testing to your next.js site

#### Prerequsistes

1. Install library `yarn add Sheertex/next-experiments#canary`
1. Install fork of `next.js` that supports A/B tests. [Link](https://github.com/Sheertex/next.js/tree/ABTesting)
    1. Review next.js development documentation to make it run with your project. ([Running your own app with locally compiled version of Next.js](https://github.com/Sheertex/next.js/blob/ABTesting/contributing.md#running-your-own-app-with-locally-compiled-version-of-nextjs))
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
    ````

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
    1. Add export `export { permuteStaticPaths, getStaticProps } from "next-experiments/utils/page"` to the page you want to test
    1. Wrap component with `withPermutationContext` wrapper function
    1. Use created on the first step component with experiment somewhere in the page    
    ```js
    import TextExperiment from "../components/TextExperiment";

    export {
    permuteStaticPaths,
    getStaticProps,
    } from "next-experiments/dist/utils/page";

    import { withPermutationContext } from "next-experiments/dist/utils/page";

    export default withPermutationContext(() => {
    return (
        <>
            <h1>Welcome to A/B Testing for next.js</h1>
            <TextExperiment />
        </>
    );
    });

    ```

1. Run `next dev` and check that next.js started sucessfully and shows your page with the default variant of experiment
1. Run `next build` and check that `experiments.json` file is created and is not empty
1. Run `next export` to generate html files

### Advanced usage

For advanced usage examples refer to the sample project
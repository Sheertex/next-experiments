# Next A/B Testing

This example shows how to add A/B tests to the next.js site.

## How to use

### Prerequsistes

1. Clone the latest version of next.js fork with the A/B testing. [Github](https://github.com/Sheertex/next.js/tree/ABTesting)
1. Run `yarn` in the cloned directory
1. Run `yarn dev` 
1. Run `yarn types` in a separate terminal

For a more detailed instructions visit [Next.js Contributing guide](https://github.com/vercel/next.js/blob/canary/contributing.md)

### Run the sample

1. In the `package.json` of sample project replace: 
    ```
    "next": "path_to_fork",
    ```

    with 

    ```
    "next": "file:<local-path-to-cloned-nextjs-repo>/packages/next",
    ```

    _Note: if you on windows use double backslashes, for example `"next": "C:\\next.js\\packages\\next"`_

1. In the sample project root directory run

    ```yarn```

    If you have any problems installing forked version of next.js, please review next.js development documentation ([Running your own app with locally compiled version of Next.js](https://github.com/Sheertex/next.js/blob/ABTesting/contributing.md#running-your-own-app-with-locally-compiled-version-of-nextjs))

1. Export project to static files with project run ```yarn build && yarn export && yarn serve```

1. Navigate to http://localhost:8080 and explore statically generated pages with A/B experiments
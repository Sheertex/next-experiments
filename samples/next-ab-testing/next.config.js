const ExperimentExtractorPlugin = require("next-experiments/experimentExtractor");

let config = {
  exportTrailingSlash: true,
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

module.exports = config;

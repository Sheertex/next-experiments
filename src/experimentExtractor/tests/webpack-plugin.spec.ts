import assert from 'assert';
import { beforeEach, describe, it, after } from 'mocha';
import path from 'path';
import webpack from 'webpack';
import ExtractExperimentsPlugin from '../index';
import fs from 'fs-extra';

const resultFilePath = path.resolve(__dirname, 'tmp', 'experiments.json');

const getWebpackConfig = (entryFilePath, entryName = 'index'): object => {
  const entry = {};

  entry[entryName] = path.resolve(__dirname, 'webpackFiles', ...entryFilePath);

  return {
    target: 'node',
    mode: 'production',
    entry: entry,
    resolve: {
      extensions: ['.jsx', '.tsx', '.ts', '.js'],
    },
    output: {
      libraryTarget: 'commonjs',
      filename: '[name]/index.js',
      path: path.resolve(__dirname, 'tmp'),
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?/,
          include: path.resolve(__dirname, '..', '..'),
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: { reportFiles: ['src/**/*.{ts,tsx}', '!**.spec.ts'] },
          },
        },
      ],
    },
    plugins: [
      new ExtractExperimentsPlugin({
        resultFilePath: resultFilePath,
        isDebug: false,
        libraryName: 'abTestingInfra',
      }),
    ],
  };
};

const runWebpack = async (
  entryFilePath,
  entryName = undefined,
): Promise<void> =>
  new Promise((resolve, reject) => {
    webpack(getWebpackConfig(entryFilePath, entryName), (err, stats) => {
      if (err) {
        reject(err);
      } else if (stats.hasErrors()) {
        reject(stats.toString());
      }

      resolve();
    });
  });

describe('experimentExtractor/webpack-plugin', function () {
  describe('#ExperimentExtractorPlugin', function () {
    beforeEach(() => {
      fs.emptyDirSync(path.resolve(__dirname, 'tmp'));
    });

    after(function () {
      fs.emptyDirSync(path.resolve(__dirname, 'tmp'));
    });

    describe('correctly parses .jsx files', function () {
      it('with zero experiments', async function () {
        this.timeout(10000);

        await runWebpack(['empty.jsx']);

        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [];

        assert.deepStrictEqual(result, expectedResult);
      });

      it('with one experiment', async function () {
        this.timeout(10000);

        await runWebpack(['sample.jsx']);

        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [
          {
            experimentsPayload: { experiment: ['variantA', 'variantB'] },
            pagePathRegex: 'index$',
          },
        ];

        assert.deepStrictEqual(result, expectedResult);
      });

      it('with several experiments', async function () {
        this.timeout(10000);

        await runWebpack(['entryWithSeveralExperiments', 'index.jsx']);

        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [
          {
            experimentsPayload: {
              experiment1: ['variantA', 'variantB'],
              experiment2: ['variantA', 'variantB'],
            },
            pagePathRegex: 'index$',
          },
        ];

        assert.deepStrictEqual(result, expectedResult);
      });
    });

    describe('it fails', function () {
      it('when .jsx file has no Experiment import', async function () {
        this.timeout(10000);

        assert.rejects(
          runWebpack(['noImports.jsx']),
          /ERROR in Did not find any .jsx or .tsx component with "import { Experiment }/gim,
        );
      });
    });

    describe('resolve correct regex', function () {
      it('for dynamic pages', async function () {
        this.timeout(10000);

        await runWebpack(['sample.jsx'], 'pages/products/[handle]');

        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [
          {
            experimentsPayload: {
              experiment: ['variantA', 'variantB'],
            },
            pagePathRegex: '^\\/products\\/[^\\s\\/]+$',
          },
        ];

        assert.deepStrictEqual(result, expectedResult);
      });

      it('for static pages', async function () {
        this.timeout(10000);

        await runWebpack(['sample.jsx'], 'pages/products.js');

        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [
          {
            experimentsPayload: {
              experiment: ['variantA', 'variantB'],
            },
            pagePathRegex: '^\\/products$',
          },
        ];

        assert.deepStrictEqual(result, expectedResult);
      });
    });
  });
});

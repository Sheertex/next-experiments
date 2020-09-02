/**
 * @jest-environment node
 */

import path from 'path';
import webpack from 'webpack';
import ExtractExperimentsPlugin from '../index';
import fs from 'fs-extra';

const EXTENDED_TIMEOUT = 15000;

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
        libraryName: 'index',
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

describe('webpack/webpack-plugin', function () {
  describe('#ExperimentExtractorPlugin', function () {
    beforeAll(() => {
      jest.setTimeout(EXTENDED_TIMEOUT);
    });

    beforeEach(() => {
      fs.emptyDirSync(path.resolve(__dirname, 'tmp'));
    });

    afterEach(function () {
      fs.emptyDirSync(path.resolve(__dirname, 'tmp'));
    });

    describe('when JSX file includes zero experiments', function () {
      beforeEach(async function () {
        await runWebpack(['empty.jsx']);
      });

      it('returns an empty array', async function () {
        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [];

        expect(result).toStrictEqual(expectedResult);
      });
    });

    describe('when JSX file includes one experiment', function () {
      beforeEach(async function () {
        await runWebpack(['sample.jsx']);
      });

      it('returns an experiments payload with one experiment', async function () {
        const result = fs.readJSONSync(resultFilePath);
        const expectedResult = [
          {
            experimentsPayload: { experiment: ['variantA', 'variantB'] },
            pagePathRegex: 'index$',
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });
    });

    it('with several experiments', async function () {
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

      expect(result).toStrictEqual(expectedResult);
    });

    describe('it fails', function () {
      it('when .jsx file has no Experiment import', async function () {
        expect.assertions(1);
        await expect(runWebpack(['noImports.jsx'])).rejects.toBeDefined();
      });
    });

    describe('resolve correct regex', function () {
      it('for dynamic pages', async function () {
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

        expect(result).toStrictEqual(expectedResult);
      });

      it('for static pages', async function () {
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

        expect(result).toStrictEqual(expectedResult);
      });
    });
  });
});

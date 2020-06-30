import nodePath from 'path';
import { ParsedUrlQuery } from 'querystring';
import { EXPERIMENTS_FILE_NAME } from '../experimentExtractor/constants';
import { AB_TEST_PAYLOAD_PREFIX } from './utils';
import { Experiment, ExperimentVariant } from './types';

let fs = null;

if (typeof window === 'undefined') {
  fs = require('fs-extra');
}

function getActiveVariantForExperiment(
  experiment: Experiment,
): ExperimentVariant[] {
  return experiment.variants.map((variantName) => {
    const item: ExperimentVariant = {};

    item[experiment.name] = variantName;

    return item;
  });
}

function getPermutations(
  experimentsArray: Experiment[],
): ExperimentVariant[] | undefined {
  if (!experimentsArray || experimentsArray.length === 0) {
    return undefined;
  }

  const curPermutaions = getActiveVariantForExperiment(experimentsArray[0]);

  if (experimentsArray.length === 1) {
    return curPermutaions;
  }

  const permutations: ExperimentVariant[] = [];

  const otherPermutations = getPermutations(experimentsArray.slice(1));

  curPermutaions.forEach((expPerm) => {
    otherPermutations.forEach((otherPerm) => {
      permutations.push({ ...expPerm, ...otherPerm });
    });
  });

  return permutations;
}

export function explodePathsWithVariantCombinations(paths: string[]): string[] {
  const pathToExperimentsPayload = nodePath.join(
    process.cwd(),
    EXPERIMENTS_FILE_NAME,
  );

  if (!fs.existsSync(pathToExperimentsPayload)) {
    console.warn(
      `Failed to load experiments payload, file not found. Expected path: ${pathToExperimentsPayload}`,
    );

    return paths;
  }

  const experiments = fs.readJsonSync(pathToExperimentsPayload, 'utf8');

  const permutatedPaths: string[] = [];

  paths.forEach((path) => {
    const normalizedPath = path === '/' ? '/index' : path;

    experiments.forEach(({ pagePathRegex, experimentsPayload }) => {
      const pathRegex = new RegExp(pagePathRegex, 'gi');

      if (pathRegex.test(normalizedPath)) {
        const numberOfExperiments = Object.keys(experimentsPayload).length;

        if (numberOfExperiments > 5) {
          throw new Error(
            `Too much experiments [${numberOfExperiments}] for the page [${path}], this number of experiments will produce at least ${Math.pow(
              numberOfExperiments,
              2,
            )} variants of the page!`,
          );
        }

        const transformed: Experiment[] = Object.keys(
          experimentsPayload,
        ).reduce((flattenedExperiments, expName) => {
          flattenedExperiments.push({
            name: expName,
            variants: experimentsPayload[expName],
          });

          return flattenedExperiments;
        }, []);

        const permutatedExperiments = getPermutations(transformed);

        permutatedExperiments.forEach((pExp) => {
          const payload = new URLSearchParams();

          for (const key in pExp) {
            payload.append(key, pExp[key]);
          }

          payload.sort();

          permutatedPaths.push(
            `${normalizedPath}${AB_TEST_PAYLOAD_PREFIX}${payload.toString()}`,
          );
        });
      }
    });
  });

  return [...paths, ...permutatedPaths];
}

export function stripPermutationsPayload(
  query: ParsedUrlQuery,
): { result: ParsedUrlQuery; permutationsPayload: string } {
  let permutationsPayload = '';

  const resultQuery: ParsedUrlQuery = Object.keys(query).reduce(
    (queryParamsDict, key) => {
      const value = query[key];

      if (typeof value !== 'string') {
        queryParamsDict[key] = value;

        return queryParamsDict;
      }

      const hasAbTestsPayload = value.includes(AB_TEST_PAYLOAD_PREFIX);

      if (!hasAbTestsPayload) {
        queryParamsDict[key] = value;

        return queryParamsDict;
      }

      const [queryValues, payload] = value.split(AB_TEST_PAYLOAD_PREFIX);

      queryParamsDict[key] = queryValues;
      permutationsPayload = payload;

      return queryParamsDict;
    },
    {},
  );

  return {
    result: resultQuery,
    permutationsPayload,
  };
}

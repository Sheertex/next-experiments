import nodePath from 'path';
import { ParsedUrlQuery } from 'querystring';
import { EXPERIMENTS_FILE_NAME, AB_TEST_PAYLOAD_PREFIX } from '../constants';
import {
  Experiment,
  ExperimentVariant,
  ExperimentDefinitionFromFile,
} from '../types';

let fs = null;

if (typeof window === 'undefined') {
  fs = require('fs-extra');
}

function getAllPossiblePermutationForSingleExperiment(
  experiment: Experiment,
): ExperimentVariant[] {
  return experiment.variants.map((variantName) => {
    const item: ExperimentVariant = {};

    item[experiment.name] = variantName;

    return item;
  });
}

function recursivelyFindAllPermutations(
  experiments: Experiment[],
): ExperimentVariant[] | undefined {
  if (!experiments || experiments.length === 0) {
    return undefined;
  }

  const experimentPermutations = getAllPossiblePermutationForSingleExperiment(
    experiments[0],
  );

  if (experiments.length === 1) {
    return experimentPermutations;
  }

  const remainingExperimentsPermutations = recursivelyFindAllPermutations(
    experiments.slice(1),
  );

  return experimentPermutations.reduce(
    (mergedPermutations, experimentPermutation) => {
      remainingExperimentsPermutations.forEach(
        (anotherExperimentPermutation) => {
          mergedPermutations.push({
            ...experimentPermutation,
            ...anotherExperimentPermutation,
          });
        },
      );

      return mergedPermutations;
    },
    [],
  );
}

function tryLoadExperimentsFromFile():
  | ExperimentDefinitionFromFile[]
  | undefined {
  const pathToExperimentsPayload = nodePath.join(
    process.cwd(),
    EXPERIMENTS_FILE_NAME,
  );

  if (!fs.existsSync(pathToExperimentsPayload)) {
    console.warn(
      `Failed to load experiments payload, file not found. Expected path: ${pathToExperimentsPayload}`,
    );

    return undefined;
  }

  return fs.readJsonSync(pathToExperimentsPayload, 'utf8');
}

function convertToExperimentFormat(experimentsPayload: object): Experiment[] {
  return Object.keys(experimentsPayload).reduce(
    (flattenedExperiments, expName) => {
      flattenedExperiments.push({
        name: expName,
        variants: experimentsPayload[expName],
      });

      return flattenedExperiments;
    },
    [],
  );
}

export function explodePathsWithVariantCombinations(paths: string[]): string[] {
  // TECHDEBT: https://www.notion.so/sheertex/next-experiments-does-not-protect-users-from-rendering-too-many-experiments-at-once-c78b9f0a10ab4ed0bb9da9ea018fea11
  const loadedExperiments = tryLoadExperimentsFromFile();

  if (!loadedExperiments) {
    return paths;
  }

  const permutatedPaths: string[] = paths.reduce((permutatedPaths, path) => {
    const normalizedPath = path === '/' ? '/index' : path;

    loadedExperiments.forEach(({ pagePathRegex, experimentsPayload }) => {
      const pathRegex = new RegExp(pagePathRegex, 'gi');

      if (!pathRegex.test(normalizedPath)) {
        return;
      }

      const permutatedExperiments = recursivelyFindAllPermutations(
        convertToExperimentFormat(experimentsPayload),
      );

      permutatedExperiments.forEach((permutatedExperiment) => {
        const payload = new URLSearchParams();

        for (const experimentName in permutatedExperiment) {
          payload.append(experimentName, permutatedExperiment[experimentName]);
        }

        payload.sort();

        permutatedPaths.push(
          `${normalizedPath}${AB_TEST_PAYLOAD_PREFIX}${payload.toString()}`,
        );
      });
    });

    return permutatedPaths;
  }, []);

  return [...paths, ...permutatedPaths];
}

export function stripPermutationsPayloadFromQuery(
  query: ParsedUrlQuery,
): { query: ParsedUrlQuery; permutationsPayload: string } {
  let permutationsPayload = '';

  if (!query) {
    return {
      query,
      permutationsPayload,
    };
  }

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
    query: resultQuery,
    permutationsPayload,
  };
}

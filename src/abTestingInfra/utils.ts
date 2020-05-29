import fs from 'fs-extra';
import nodePath from 'path';
import { ParsedUrlQuery } from 'querystring';
import { EXPERIMENTS_FILE_NAME } from '../experimentExtractor/constants';

const AB_TEST_PAYLOAD_PREFIX = '--ab--';
const AB_TEST_PAYLOAD_KEY = 'AB_TESTING_PAYLOAD';

function isValidName(name: string): boolean {
  if (!name) {
    return false;
  }

  //Name should contain only a-z 0-9 and dash as it will be passed in the url
  return /^[a-z0-9-]+$/.test(name);
}

function assertNameIsValid(name: string): void {
  if (!name) {
    throw new Error('Name is undefined');
  }

  if (!isValidName(name)) {
    throw new Error(
      `"${name}" is not valid name. Use only lowercase latin symbols, digits and dash`,
    );
  }

  return;
}

interface Experiment {
  name: string;
  variants: string[];
}

interface ExperimentVariant {
  [key: string]: string;
}

function getPermutationForExperiment(
  experiment: Experiment,
): ExperimentVariant[] {
  const result: ExperimentVariant[] = [];

  experiment.variants.forEach((variantName) => {
    const item: ExperimentVariant = {};

    item[experiment.name] = variantName;
    result.push(item);
  });

  return result;
}

function getPermutations(
  experimentsArray: Experiment[],
): ExperimentVariant[] | undefined {
  if (!experimentsArray || experimentsArray.length === 0) {
    return undefined;
  }

  const curPermutaions = getPermutationForExperiment(experimentsArray[0]);

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

function getPermutatedPaths(paths: string[]): string[] {
  const CWD = process.cwd();
  const pathToExperimentsPayload = nodePath.join(CWD, EXPERIMENTS_FILE_NAME);

  if (!fs.existsSync(pathToExperimentsPayload)) {
    console.warn(
      `Failed to load experiments payload, file not found. Expected path: ${pathToExperimentsPayload}`,
    );

    return paths;
  }

  const experiments = fs.readJsonSync(pathToExperimentsPayload, 'utf8');

  const permutatedPaths: string[] = [];

  paths.forEach((path) => {
    experiments.forEach((experiment) => {
      const pathRegex = new RegExp(experiment.pagePathRegex, 'gi');

      if (pathRegex.test(path)) {
        const numberOfExperiments = Object.keys(experiment.experimentsPayload)
          .length;

        if (numberOfExperiments > 5) {
          throw new Error(
            `Too much experiments [${numberOfExperiments}] for the page [${path}], this number of experiments will produce at least ${Math.pow(
              numberOfExperiments,
              2,
            )} variants of the page!`,
          );
        }

        const transformed: Experiment[] = Object.keys(
          experiment.experimentsPayload,
        ).reduce((accumualtor, expName) => {
          accumualtor.push({
            name: expName,
            variants: experiment.experimentsPayload[expName],
          });

          return accumualtor;
        }, []);

        const permutatedExperiments = getPermutations(transformed);

        permutatedExperiments.forEach((pExp) => {
          const payload = new URLSearchParams();

          for (const key in pExp) {
            payload.append(key, pExp[key]);
          }

          permutatedPaths.push(
            `${path}${AB_TEST_PAYLOAD_PREFIX}${payload.toString()}`,
          );
        });
      }
    });
  });

  return [...paths, ...permutatedPaths];
}

function stripPermutationsPayload(
  query: ParsedUrlQuery,
): { result: ParsedUrlQuery; permutationsPayload: string } {
  let permutationsPayload = '';

  const resultQuery: ParsedUrlQuery = Object.keys(query).reduce(
    (accumulator, key) => {
      const value = query[key];

      if (typeof value !== 'string') {
        accumulator[key] = value;

        return accumulator;
      }

      const idx = value.indexOf(AB_TEST_PAYLOAD_PREFIX);

      if (idx === -1) {
        accumulator[key] = value;

        return accumulator;
      }

      accumulator[key] = value.slice(0, idx);
      permutationsPayload = value.slice(idx + AB_TEST_PAYLOAD_PREFIX.length);

      return accumulator;
    },
    {},
  );

  return {
    result: resultQuery,
    permutationsPayload,
  };
}

export {
  AB_TEST_PAYLOAD_KEY,
  AB_TEST_PAYLOAD_PREFIX,
  getPermutatedPaths,
  stripPermutationsPayload,
  assertNameIsValid,
  isValidName,
};

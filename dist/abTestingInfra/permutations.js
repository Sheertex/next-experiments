"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripPermutationsPayload = exports.getPermutatedPaths = void 0;
const tslib_1 = require("tslib");
let fs = null;
if (typeof window === "undefined") {
    fs = require("fs-extra");
}
const path_1 = tslib_1.__importDefault(require("path"));
const constants_1 = require("../experimentExtractor/constants");
const utils_1 = require("./utils");
function getPermutationForExperiment(experiment) {
    const result = [];
    experiment.variants.forEach((variantName) => {
        const item = {};
        item[experiment.name] = variantName;
        result.push(item);
    });
    return result;
}
function getPermutations(experimentsArray) {
    if (!experimentsArray || experimentsArray.length === 0) {
        return undefined;
    }
    const curPermutaions = getPermutationForExperiment(experimentsArray[0]);
    if (experimentsArray.length === 1) {
        return curPermutaions;
    }
    const permutations = [];
    const otherPermutations = getPermutations(experimentsArray.slice(1));
    curPermutaions.forEach((expPerm) => {
        otherPermutations.forEach((otherPerm) => {
            permutations.push(Object.assign(Object.assign({}, expPerm), otherPerm));
        });
    });
    return permutations;
}
function getPermutatedPaths(paths) {
    const CWD = process.cwd();
    const pathToExperimentsPayload = path_1.default.join(CWD, constants_1.EXPERIMENTS_FILE_NAME);
    if (!fs.existsSync(pathToExperimentsPayload)) {
        console.warn(`Failed to load experiments payload, file not found. Expected path: ${pathToExperimentsPayload}`);
        return paths;
    }
    const experiments = fs.readJsonSync(pathToExperimentsPayload, "utf8");
    const permutatedPaths = [];
    paths.forEach((path) => {
        const normalizedPath = path === '/' ? '/index' : path;
        experiments.forEach((experiment) => {
            const pathRegex = new RegExp(experiment.pagePathRegex, "gi");
            if (pathRegex.test(normalizedPath)) {
                const numberOfExperiments = Object.keys(experiment.experimentsPayload)
                    .length;
                if (numberOfExperiments > 5) {
                    throw new Error(`Too much experiments [${numberOfExperiments}] for the page [${path}], this number of experiments will produce at least ${Math.pow(numberOfExperiments, 2)} variants of the page!`);
                }
                const transformed = Object.keys(experiment.experimentsPayload).reduce((accumualtor, expName) => {
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
                    permutatedPaths.push(`${normalizedPath}${utils_1.AB_TEST_PAYLOAD_PREFIX}${payload.toString()}`);
                });
            }
        });
    });
    return [...paths, ...permutatedPaths];
}
exports.getPermutatedPaths = getPermutatedPaths;
function stripPermutationsPayload(query) {
    let permutationsPayload = "";
    const resultQuery = Object.keys(query).reduce((accumulator, key) => {
        const value = query[key];
        if (typeof value !== "string") {
            accumulator[key] = value;
            return accumulator;
        }
        const idx = value.indexOf(utils_1.AB_TEST_PAYLOAD_PREFIX);
        if (idx === -1) {
            accumulator[key] = value;
            return accumulator;
        }
        accumulator[key] = value.slice(0, idx);
        permutationsPayload = value.slice(idx + utils_1.AB_TEST_PAYLOAD_PREFIX.length);
        return accumulator;
    }, {});
    return {
        result: resultQuery,
        permutationsPayload,
    };
}
exports.stripPermutationsPayload = stripPermutationsPayload;
//# sourceMappingURL=permutations.js.map
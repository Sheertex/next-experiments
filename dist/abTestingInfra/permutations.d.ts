/// <reference types="node" />
import { ParsedUrlQuery } from "querystring";
declare function getPermutatedPaths(paths: string[]): string[];
declare function stripPermutationsPayload(query: ParsedUrlQuery): {
    result: ParsedUrlQuery;
    permutationsPayload: string;
};
export { getPermutatedPaths, stripPermutationsPayload };

import assert from "assert";
import { describe, it, beforeEach, afterEach } from "mocha";
import mockFS from "mock-fs";

import {
  stripPermutationsPayload,
  explodePathsWithVariantCombinations,
} from "./permutations";

describe("abTestingInfra/permutations", function () {
  describe("#stripPermutationsPayload", function () {
    describe("pass through", function () {
      it("empty query", function () {
        const result = stripPermutationsPayload({});

        assert.deepEqual(result.result, {});
        assert.equal(result.permutationsPayload, "");
      });

      it("undefined query", function () {
        const result = stripPermutationsPayload({});

        assert.deepEqual(result.result, {});
        assert.equal(result.permutationsPayload, "");
      });
    });

    describe("did not change", function () {
      it("non string query fields", function () {
        const query = { a: 1, b: true };
        const result = stripPermutationsPayload(query as any);

        assert.deepEqual(result.result, query);
        assert.equal(result.permutationsPayload, "");
      });

      it("string query fields w/o ab testing payload", function () {
        const query = { a: "a" };
        const result = stripPermutationsPayload(query as any);

        assert.deepEqual(result.result, query);
        assert.equal(result.permutationsPayload, "");
      });
    });

    describe("correclty extracts AB testing payload", function () {
      it("from query fields", function () {
        const query = { a: "a--ab--test" };
        const result = stripPermutationsPayload(query);

        assert.deepEqual(result.result, { a: "a" });
        assert.equal(result.permutationsPayload, "test");
      });
    });
  });

  describe("#explodePathsWithVariantCombinations ", function () {
    describe("when experiments json file does not exist", function () {
      beforeEach(() => {
        mockFS();
      });

      afterEach(() => {
        mockFS.restore();
      });

      it("did not change paths when experiments file is not found", function () {
        const result = explodePathsWithVariantCombinations(["/index"]);

        assert.deepEqual(result, ["/index"]);
      });
    });

    describe("when experiments json file exists", function () {
      afterEach(() => {
        mockFS.restore();
      });

      describe("returns correct permutations", function () {
        it("for the index page", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: "^\\/index$",
                experimentsPayload: { experiment: ["variant"] },
              },
            ]),
          });
          assert.deepEqual(explodePathsWithVariantCombinations(["/"]), [
            "/",
            "/index--ab--experiment=variant",
          ]);
        });

        it("when page path is match experiment regex", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: ".*",
                experimentsPayload: { experiment: ["variant"] },
              },
            ]),
          });

          assert.deepEqual(explodePathsWithVariantCombinations(["/index"]), [
            "/index",
            "/index--ab--experiment=variant",
          ]);
        });

        it("when experiment has several variants", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: ".*",
                experimentsPayload: { experiment: ["variantA", "variantB"] },
              },
            ]),
          });

          assert.deepEqual(explodePathsWithVariantCombinations(["/index"]), [
            "/index",
            "/index--ab--experiment=variantA",
            "/index--ab--experiment=variantB",
          ]);
        });

        it("when page has several experiments", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: ".*",
                experimentsPayload: {
                  experimentA: ["variant"],
                  experimentB: ["variant"],
                },
              },
            ]),
          });

          assert.deepEqual(explodePathsWithVariantCombinations(["/index"]), [
            "/index",
            "/index--ab--experimentA=variant&experimentB=variant",
          ]);
        });

        it("when page has several experiments and several variants", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: ".*",
                experimentsPayload: {
                  experimentA: ["variantA", "variantB"],
                  experimentB: ["variantA", "variantB"],
                },
              },
            ]),
          });

          assert.deepEqual(explodePathsWithVariantCombinations(["/index"]), [
            "/index",
            "/index--ab--experimentA=variantA&experimentB=variantA",
            "/index--ab--experimentA=variantA&experimentB=variantB",
            "/index--ab--experimentA=variantB&experimentB=variantA",
            "/index--ab--experimentA=variantB&experimentB=variantB",
          ]);
        });

        it("sorted alphabetically", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: ".*",
                experimentsPayload: { z: ["1", "2"], a: ["1", "2"] },
              },
            ]),
          });

          assert.deepEqual(explodePathsWithVariantCombinations(["/index"]), [
            "/index",
            "/index--ab--a=1&z=1",
            "/index--ab--a=2&z=1",
            "/index--ab--a=1&z=2",
            "/index--ab--a=2&z=2",
          ]);
        });
      });

      describe("returns `paths` as is", function () {
        it("when experiments file has no experiemnts", function () {
          mockFS({
            "experiments.json": JSON.stringify([]),
          });

          const result = explodePathsWithVariantCombinations(["/index"]);

          assert.deepEqual(result, ["/index"]);
        });

        it("when page path is not match experiment regex", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: "something",
                experimentsPayload: { experiment: ["variant"] },
              },
            ]),
          });

          assert.deepEqual(explodePathsWithVariantCombinations(["/index"]), [
            "/index",
          ]);
        });
      });

      describe("throws", function () {
        it("when page has more than 5 experiments", function () {
          mockFS({
            "experiments.json": JSON.stringify([
              {
                pagePathRegex: ".*",
                experimentsPayload: {
                  experimentA: ["variant"],
                  experimentB: ["variant"],
                  experimentC: ["variant"],
                  experimentD: ["variant"],
                  experimentE: ["variant"],
                  experimentF: ["variant"],
                },
              },
            ]),
          });

          assert.throws(
            () => explodePathsWithVariantCombinations(["/index"]),
            /^Error: Too much experiments.*/gi
          );
        });
      });
    });
  });
});

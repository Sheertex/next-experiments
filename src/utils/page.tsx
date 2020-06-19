import React from "react";

import { AB_TEST_PAYLOAD_KEY } from "../abTestingInfra/utils";
import {
  explodePathsWithVariantCombinations ,
  stripPermutationsPayload,
} from "../abTestingInfra/permutations";
import { ABTestingContextProvider } from "../abTestingInfra/ABTestingContext";

// TODO: maybe we should remove async from this func? It did not perform internally any async actions
export async function permuteStaticPaths(paths: string[]): Promise<string[]> {
  return explodePathsWithVariantCombinations(paths);
}

export const withPermutationContext = (
  Component: (props: object) => JSX.Element
) => (props: object): JSX.Element => {
  const permutationsPayload = props[AB_TEST_PAYLOAD_KEY];

  delete props[AB_TEST_PAYLOAD_KEY];

  return (
    <ABTestingContextProvider permutationsPayload={permutationsPayload}>
      <Component {...props} />
    </ABTestingContextProvider>
  );
};

export const withPermutedStaticProps = (getStaticProps?) => {
  return async (context) => {
    let payload;

    if (!!context && !!context.params) {
      const { result, permutationsPayload } = stripPermutationsPayload(
        context.params
      );

      context.params = result;
      payload = permutationsPayload;
    }

    const props = getStaticProps
      ? await getStaticProps(context)
      : { props: {} };

    if (payload) {
      props.props[AB_TEST_PAYLOAD_KEY] = payload;
    }

    return props;
  };
};

// This is handy wrapper to export getStaticProps right from the page, using export {getStaticProps} from ...
export const getStaticProps = withPermutedStaticProps();

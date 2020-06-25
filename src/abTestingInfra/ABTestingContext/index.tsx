import React, { ReactNode } from "react";
import { useRouter } from "next/router";
import { AB_TEST_PAYLOAD_PREFIX } from "../utils";
import { ABTestingPayload } from "../types";

type Props = {
  children: ReactNode;
  permutationsPayload: string;
};

function getABTestContext(payload: string): ABTestingPayload {
  const searchParams = new URLSearchParams(payload);

  const result: ABTestingPayload = {};

  // can't call reduce on searchParams, that's why using forEach
  searchParams.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function getABTestContextFromPath(path: string): ABTestingPayload {
  const idx = path.indexOf(AB_TEST_PAYLOAD_PREFIX);

  if (idx === -1) {
    return {};
  }

  const pathWithoutTrailingSlash = path.replace(/\/$/, "");

  // we should exclude possible query string from payload
  const queryIdx = path.indexOf("?");
  let endIdx = pathWithoutTrailingSlash.length;

  if (queryIdx !== -1) {
    endIdx = queryIdx;
  }

  const testPayload = pathWithoutTrailingSlash.slice(
    idx + AB_TEST_PAYLOAD_PREFIX.length,
    endIdx
  );

  return getABTestContext(decodeURIComponent(testPayload));
}

const defaultABTestingContext: ABTestingPayload = {};
const ABTestingContext = React.createContext(defaultABTestingContext);

export const ABTestingContextProvider = ({
  children,
  permutationsPayload,
}: Props): JSX.Element => {
  const router = useRouter();

  const abTestingContext = permutationsPayload
    ? getABTestContext(permutationsPayload)
    : getABTestContextFromPath(router.asPath);

  return (
    <ABTestingContext.Provider value={abTestingContext}>
      {children}
    </ABTestingContext.Provider>
  );
};

export const ABTestingContextConsumer = ABTestingContext.Consumer;

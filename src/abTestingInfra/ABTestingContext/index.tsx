import React, { ReactNode, createContext } from "react";
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

  const pathWithoutTrailingSlashAndQueryStr = path.replace(
    /\/?(\?.*)?$/gim,
    ""
  );

  const testPayload = pathWithoutTrailingSlashAndQueryStr.slice(
    idx + AB_TEST_PAYLOAD_PREFIX.length
  );

  return getABTestContext(decodeURIComponent(testPayload));
}

const defaultABTestingContext: ABTestingPayload = {};
const { Provider, Consumer } = createContext(defaultABTestingContext);

export const ABTestingContextProvider = ({
  children,
  permutationsPayload,
}: Props): JSX.Element => {
  const router = useRouter();

  const abTestingContext = permutationsPayload
    ? getABTestContext(permutationsPayload)
    : getABTestContextFromPath(router.asPath);

  return <Provider value={abTestingContext}>{children}</Provider>;
};

export const ABTestingContextConsumer = Consumer;

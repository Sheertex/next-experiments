import React from 'react';
import { AB_TEST_PAYLOAD_PREFIX } from '../utils';
import { useRouter } from 'next/router';
import { ABTestingPayload } from '../types';

const defaultABTestingContext: ABTestingPayload = {};
const ABTestingContext = React.createContext(defaultABTestingContext);

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

  // removing possible trailing slash
  const normalizedPath = path.replace(/\/$/, '');

  // we should exclude possible query string from payload
  const queryIdx = path.indexOf('?');
  let endIdx = normalizedPath.length;

  if (queryIdx !== -1) {
    endIdx = queryIdx;
  }

  const testPayload = normalizedPath.slice(
    idx + AB_TEST_PAYLOAD_PREFIX.length,
    endIdx,
  );

  return getABTestContext(decodeURIComponent(testPayload));
}

type Props = {
  children: React.ReactNode;
  permutationsPayload: string;
};

function ABTestingContextProvider({
  children,
  permutationsPayload,
}: Props): JSX.Element {
  const router = useRouter();

  const abTestingContext = permutationsPayload
    ? getABTestContext(permutationsPayload)
    : getABTestContextFromPath(router.asPath);

  return (
    <ABTestingContext.Provider value={abTestingContext}>
      {children}
    </ABTestingContext.Provider>
  );
}

const ABTestingContextConsumer = ABTestingContext.Consumer;

export { ABTestingContextProvider, ABTestingContextConsumer };

import React from 'react';
import { ABTestingPayload } from '../types';
declare type Props = {
    children: React.ReactNode;
    permutationsPayload: string;
};
declare function ABTestingContextProvider({ children, permutationsPayload, }: Props): JSX.Element;
declare const ABTestingContextConsumer: React.Consumer<ABTestingPayload>;
export { ABTestingContextProvider, ABTestingContextConsumer };

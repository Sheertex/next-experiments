/// <reference types="react" />
export declare function permuteStaticPaths(paths: string[]): Promise<string[]>;
export declare const withPermutationContext: (Component: (props: object) => JSX.Element) => (props: object) => JSX.Element;
export declare const withPermutedStaticProps: (getStaticProps?: any) => (context: any) => Promise<any>;
export declare const getStaticProps: (context: any) => Promise<any>;

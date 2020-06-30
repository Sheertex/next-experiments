export type ABTestingPayload = {
  [name: string]: string;
};

export type VariantProps = {
  name: string;
  children: React.ReactNode;
};

export type Variants = {
  [name: string]: JSX.Element;
};

export interface Experiment {
  name: string;
  variants: string[];
}

export interface ExperimentVariant {
  [key: string]: string;
}

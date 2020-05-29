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

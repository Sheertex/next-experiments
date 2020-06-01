import TextExperiment from "../components/TextExperiment";
import {
  withPermutationContext,
  withPermutedStaticProps,
} from "next-experiments/dist/utils/page";

export { permuteStaticPaths } from "next-experiments/dist/utils/page";

export default withPermutationContext(({ message }) => {
  return (
    <>
      <h1>Page with static props can have experiments</h1>
      <TextExperiment />
      <code>{message}</code>
    </>
  );
});

export const getStaticProps = withPermutedStaticProps(async (context) => {
  return {
    props: {
      message: "Hello from getStaticProps()!",
    },
  };
});

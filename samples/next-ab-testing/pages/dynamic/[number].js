import TextExperiment from "../../components/TextExperiment";
import {
  withPermutationContext,
  withPermutedStaticProps,
} from "next-experiments/dist/utils/page";

export { permuteStaticPaths } from "next-experiments/dist/utils/page";

export default withPermutationContext(({ message }) => {
  return (
    <>
      <h1>Dynamic pages can have experiments</h1>
      <TextExperiment />
      <code>{message}</code>
    </>
  );
});

export const getStaticProps = withPermutedStaticProps(async (context) => {
  return {
    props: {
      message: `Hello from dynamic page #${context.params.number}`,
    },
  };
});

export const getStaticPaths = async () => {
  return {
    paths: ["/dynamic/1", "/dynamic/2", "/dynamic/3"],
    fallback: false,
  };
};

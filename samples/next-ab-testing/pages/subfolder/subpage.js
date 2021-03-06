import TextExperiment from "../../components/TextExperiment";
import { withPermutationContext } from "next-experiments";

export {
  permuteStaticPaths,
  getStaticProps,
} from "next-experiments";

export default withPermutationContext(() => {
  return (
    <>
      <h1>Pages under subfolders can have A/B Tests</h1>
      <TextExperiment />
    </>
  );
});

import TextExperiment from "../components/TextExperiment";
import ColorExperiment from "../components/ColorExperiment";

export {
  permuteStaticPaths,
  getStaticProps,
} from "next-experiments/dist/utils/page";

import { withPermutationContext } from "next-experiments/dist/utils/page";

export default withPermutationContext(() => {
  return (
    <>
      <h1>Page can have multiple experiments</h1>
      <TextExperiment />
      <ColorExperiment />
    </>
  );
});

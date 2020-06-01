import ButtonExperiment from "../components/ButtonExperiment";

export {
  permuteStaticPaths,
  getStaticProps,
} from "next-experiments/dist/utils/page";

import { withPermutationContext } from "next-experiments/dist/utils/page";

export default withPermutationContext(() => {
  return (
    <>
      <h1>You can add analytics for your A/B tests</h1>
      <p>Use win() and triggerPlay() hooks</p>
      <ButtonExperiment />
    </>
  );
});

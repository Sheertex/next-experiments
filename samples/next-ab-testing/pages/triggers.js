import ButtonExperiment from "../components/ButtonExperiment";

export {
  permuteStaticPaths,
  getStaticProps,
} from "next-experiments";

import { withPermutationContext } from "next-experiments";

export default withPermutationContext(() => {
  return (
    <>
      <h1>You can add analytics for your A/B tests</h1>
      <p>Use win() and triggerPlay() hooks</p>
      <ButtonExperiment />
    </>
  );
});

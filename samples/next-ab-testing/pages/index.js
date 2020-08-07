import TextExperiment from "../components/TextExperiment";
import Link from "next/link";

export {
  permuteStaticPaths,
  getStaticProps,
} from "next-experiments";

import { withPermutationContext } from "next-experiments";

export default withPermutationContext(() => {
  return (
    <>
      <h1>Welcome to A/B Testing for next.js</h1>
      <TextExperiment />
      <p>Other pages:</p>
      <ul>
        <li>
          <Link href="/multiple">
            <a>Multiple experiments on one page</a>
          </Link>
        </li>
        <li>
          <Link href="/static-props">
            <a>Example of using static props</a>
          </Link>
        </li>
        <li>
          <Link href="/dynamic/[number]" as="/dynamic/1">
            <a>Example of dynamic pages</a>
          </Link>
        </li>
        <li>
          <Link href="/subfolder/subpage">
            <a>Example of subfolders</a>
          </Link>
        </li>
        <li>
          <Link href="/triggers">
            <a>Triggers demonstration</a>
          </Link>
        </li>
      </ul>
    </>
  );
});

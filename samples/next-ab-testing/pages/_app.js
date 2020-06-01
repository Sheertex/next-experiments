import "../styles/global.css";
import Head from "next/head";

import emitter, {
  EXPERIMENT_PLAYED,
  EXPERIMENT_WON,
} from "next-experiments/dist/abTestingInfra/emitter";

if (typeof window !== "undefined") {
  emitter.on(EXPERIMENT_PLAYED, ({ experimentName, variantName }) => {
    console.log(
      `Playing "${variantName}" variant of "${experimentName}" experiment`
    );
  });

  emitter.on(EXPERIMENT_WON, ({ experimentName, variantName }) => {
    console.log(
      `"${variantName}" variant is won in "${experimentName}" experiment`
    );
  });
}

export default function SampleApp({ Component, pageProps }) {
  return (
    <div className="container">
      <Head>
        <title>Next.js A/B Testing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

import * as React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import type { AppProps } from "next/app";

import "../emporium-styles.scss";

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

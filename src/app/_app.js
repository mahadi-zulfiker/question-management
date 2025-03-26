// app/_app.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { logActivity } from "../utils/activityLogger";
import "../globals.css";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Log route changes (client-side navigation)
    const handleRouteChange = (url) => {
      logActivity("route_change", { page: url });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // Clean up the event listener on unmount
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    // Log form submissions
    const handleFormSubmit = (event) => {
      const formData = new FormData(event.target);
      const formValues = Object.fromEntries(formData.entries());
      logActivity("form_submission", {
        formId: event.target.id || "unknown_form",
        formValues,
      });
    };

    // Log clicks on buttons or links
    const handleClick = (event) => {
      if (event.target.tagName === "BUTTON" || event.target.tagName === "A") {
        logActivity("click", {
          element: event.target.tagName,
          text: event.target.textContent,
          id: event.target.id || "unknown_element",
        });
      }
    };

    // Add event listeners to the document
    document.addEventListener("submit", handleFormSubmit);
    document.addEventListener("click", handleClick);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener("submit", handleFormSubmit);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Google Analytics + Meta Pixel. Add the IDs in your .env file to switch them on. */
export default function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  // Count page views when moving between pages
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    if (GA_ID) w.gtag?.("event", "page_view", { page_path: pathname });
    if (PIXEL_ID) w.fbq?.("track", "PageView");
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}

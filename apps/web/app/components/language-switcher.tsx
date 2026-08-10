"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Languages } from "lucide-react";
import { Button } from "@career-os/ui";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Check initial cookie to set state safely on client
    if (document.cookie.includes("googtrans=/en/hi")) {
      setCurrentLang("hi");
    }
  }, []);

  const cookieDomains = () => {
    const host = window.location.hostname;
    const apex = host.replace(/^www\./, "");
    // Google's own widget can write the googtrans cookie under any of these
    // domain forms depending on how translation was last triggered (our code,
    // or a user driving the native picker directly), so every clear/set must
    // hit all of them or a stale cookie on another domain form keeps winning.
    return Array.from(new Set([host, "." + host, apex, "." + apex]));
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === "en" ? "hi" : "en";

    // The in-page "flip the hidden <select> and fire a change event" trick is
    // unreliable across Google's widget versions/browsers. Setting the
    // googtrans cookie and reloading is the mechanism Google's own script
    // actually reads on page load, so it's what reliably drives translation.
    if (nextLang === "hi") {
      const value = "googtrans=/en/hi; path=/; max-age=" + 60 * 60 * 24 * 365;
      document.cookie = value;
      cookieDomains().forEach((domain) => {
        document.cookie = value + "; domain=" + domain;
      });
    } else {
      const expired = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = expired;
      cookieDomains().forEach((domain) => {
        document.cookie = expired + "; domain=" + domain;
      });
    }
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          window.googleTranslateElementInit = function() {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,hi',
              autoDisplay: false
            }, 'google_translate_element');
          }
        `}
      </Script>
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide the annoying google translate banner that forces itself at the top */
        .skiptranslate > iframe.skiptranslate { display: none !important; }
        body { top: 0 !important; }
      `}} />

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleLanguage}
        aria-label="Switch Language"
        className="hidden lg:inline-flex w-auto px-2"
      >
        <span className="flex items-center gap-1.5 font-bold text-sm text-[var(--cos-on-surface)]">
          <Languages size={17} />
          {currentLang === "en" ? "हिंदी" : "EN"}
        </span>
      </Button>
    </>
  );
}

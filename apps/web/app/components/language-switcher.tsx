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

  const toggleLanguage = () => {
    const nextLang = currentLang === "en" ? "hi" : "en";
    const host = window.location.hostname;

    // The in-page "flip the hidden <select> and fire a change event" trick is
    // unreliable across Google's widget versions/browsers. Setting the
    // googtrans cookie and reloading is the mechanism Google's own script
    // actually reads on page load, so it's what reliably drives translation.
    if (nextLang === "hi") {
      const value = "googtrans=/en/hi; path=/; max-age=" + 60 * 60 * 24 * 365;
      document.cookie = value;
      document.cookie = value + "; domain=" + host;
    } else {
      const expired = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = expired;
      document.cookie = expired + "; domain=" + host;
    }
    window.location.reload();
  };

  return (
    <>
      {/* TEMP DEBUG: visible so we can test Google's own dropdown directly, bypassing our custom trigger logic. Re-hide once translation is confirmed working. */}
      <div id="google_translate_element" />
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

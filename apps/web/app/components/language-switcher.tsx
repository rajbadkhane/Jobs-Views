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
    
    // Set the cookie for google translate
    if (nextLang === "hi") {
      document.cookie = "googtrans=/en/hi; path=/; domain=" + window.location.hostname;
      document.cookie = "googtrans=/en/hi; path=/;";
    } else {
      document.cookie = "googtrans=/en/en; path=/; domain=" + window.location.hostname;
      document.cookie = "googtrans=/en/en; path=/;";
      // Ensure English restores by deleting translation cookies
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    }
    
    // Reload to apply translation over the whole DOM cleanly
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
          function googleTranslateElementInit() {
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

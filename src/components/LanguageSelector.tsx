import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useMarketStore } from "../store";
import { SUPPORTED_LANGUAGES } from "../translations";
import { LanguageCode } from "../types";

export default function LanguageSelector() {
  const { language, setLanguage } = useMarketStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-neutral-200 hover:border-amber-400 bg-neutral-50 hover:bg-white text-neutral-800 text-xs font-medium transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[38px] shrink-0"
        title="Choose Language / ቋንቋ ምረጡ / Afaan Filadhaa"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none shrink-0">{currentLangOption.flag}</span>
        <span className="font-semibold text-neutral-900 hidden sm:inline text-xs">
          {currentLangOption.nativeName}
        </span>
        <span className="font-semibold text-neutral-900 sm:hidden text-[11px]">
          {currentLangOption.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          id="language-dropdown-menu"
          className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-2xl bg-white border border-neutral-150 shadow-xl py-2 z-50 focus:outline-none animate-in fade-in slide-in-from-top-1"
        >
          <div className="px-3 py-1.5 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-500" /> Ethiopian Languages
            </span>
            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
              4 Regional + EN
            </span>
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition-colors cursor-pointer min-h-[44px] ${
                    isSelected 
                      ? "bg-amber-50/80 text-amber-950 font-semibold" 
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-neutral-900 leading-tight truncate">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-neutral-500 leading-tight">
                        {lang.name} • <span className="text-neutral-400">{lang.region}</span>
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-amber-600 pl-2 shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-1.5 border-t border-neutral-100 px-3 py-1 text-[10px] text-neutral-400">
            🇪🇹 አማርኛ • Afaan Oromoo • ትግርኛ • Af-Soomaali
          </div>
        </div>
      )}
    </div>
  );
}

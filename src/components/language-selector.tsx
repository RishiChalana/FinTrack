"use client";

import { useEffect, useState } from "react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

export function LanguageSelector() {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);
  function change(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setLang(value);
    localStorage.setItem("lang", value);
  }
  return (
    <select className="border rounded px-2 py-1 text-sm" value={lang} onChange={change}>
      {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}



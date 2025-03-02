"use client";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { MdLanguage } from "react-icons/md";

export default function Header() {
  const [language, setLanguage] = useState("Uzb"); // Default language
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
    // Add your logic to handle language change here
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!langMenuRef.current?.contains(event.target as Node)) {
      setIsLangMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isLangMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangMenuOpen]);

  return (
    <div className="h-full">
      <div className="fixed top-0 pt-12 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg dark:bg-background flex items-center justify-between  max-w-full pl-20 pr-20 mx-auto py-4 ">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" passHref>
              <Image src="/Qonuniy.png" alt="Logo" width={80} height={80} />
          </Link>
        </div>



        {/* Search and Language Selector */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-3 py-2 border rounded-md transition focus:outline-none focus:ring-2 focus:ring-[#0099b5]"
            />
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center px-3 py-2 border rounded-md transition focus:outline-none focus:ring-2 focus:ring-[#0099b5]"
            >
              <MdLanguage className="mr-1" />
              {language}
            </button>
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10 transition-opacity duration-300">
                {["Узб", "Рус", "Eng", "Uzb"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition",
                      language === lang ? "font-bold" : ""
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
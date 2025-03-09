"use client";
import { Dock, DockIcon } from "@/components/magicui/dock";
// import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Navbar() {
  // useEffect(() => {
  //   window.$crisp = []; 
  //   window.CRISP_WEBSITE_ID = "70eb2ee0-be96-463b-8c6e-8df7c87b1ccc"; 
  //   (function () {
  //     const d = document;
  //     const s = d.createElement("script");
  //     s.src = "https://client.crisp.chat/l.js";
  //     s.async = true;
  //     d.getElementsByTagName("head")[0].appendChild(s); 
  //   })();
  // }, []);

  return (
    <div className="h-full">
      <div></div>
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background shadow-2xl [box-shadow:0_0_0_0px_#0099b5,0_2px_8px_#0099b589,0_12px_24px_#0099b559] transform-gpu text-[#0099b5] border-none"      >
        {/* Navbar Items */}
        {DATA.navbar.map((item) => (
          <DockIcon key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12"
                  )}
                >
                  <item.icon className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}

        <Separator orientation="vertical" className="h-full " />

        {/* Social Media Icons */}
        {Object.entries(DATA.contact.social)
          .filter(([name]) => name !== "X" && name !== "tel" && name !== "email")
          .filter(([_, social]) => social.navbar)
          .map(([name, social]) => (
            <DockIcon key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={social.url}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12"
                    )}
                  >
                    <social.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}

        {/* <Separator orientation="vertical" className="h-full py-2" /> */}

        {/* Theme Toggle */}
        {/* <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon> */}
      </Dock>
    </div>
  );
}
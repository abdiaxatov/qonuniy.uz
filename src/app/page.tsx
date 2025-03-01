'use client';
import { HackathonCard } from "@/components/hackathon-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import IconCloud from "@/components/magicui/icon-cloud";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import Contact from "@/components/contact";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
// import Particleimage from "@/components/particleimage";



import Particles from "@/components/ui/particles";
const BLUR_FADE_DELAY = 0.04;


export default function Page() {
  const { theme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);
   const handleClick = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
 
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
 
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
 
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
 
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };
  return (
    <main className="flex flex-col  space-y-10 bg-background min-h-screen  font-sans antialiased max-w-2xl mx-auto py-4 sm:py-4 px-6">
      
      <section id="banner" className="relative mb-8" >
        <div className="">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <Image className="text-3xl font-bold tracking-tighter sm:text-5xl rounded-tl-xl rounded-tr-xl" src={DATA.banner || 'https://media.licdn.com/dms/image/v2/D4D16AQFM5aIrJMrgTg/profile-displaybackgroundimage-shrink_350_1400/profile-displaybackgroundimage-shrink_350_1400/0/1729114096797?e=1736380800&v=beta&t=NeyVFu4u0k8kLpFmVsxLlm5z3oqCMKOCqu8Ag8M7UYE'} alt="banner" width={1000} height={100}/>
          </BlurFade>
        </div>
        <div className="absolute top-1/1 left-1/2-translate-x-1/2 -translate-y-1/2">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <div className="border rounded-full overflow-hidden 
                    w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
              <Image
                alt={DATA.name}
                src={DATA.avatarUrl}
                className="object-cover w-full h-full"
                width={1000} height={100}
              />
              <div className="fallback-text text-center">{DATA.initials}</div>
            </div>
          </BlurFade>
        </div>
     
      </section>
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <div className="flex flex-wrap">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(" ")[0]}`}
              />
              <div className="relative">
                  <div
                    className="bg-[rgba(255,255,255,0)] p-0 hover:bg-[rgba(255,255,255,0)] shadow-none text-3xl font-bold tracking-tighter -mt-3 cursor-pointer sm:text-5xl xl:text-6xl"
                    onClick={handleClick}
                  >{DATA.prize}</div>
                </div>
              </div>
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>
          </div>
        </div>
        
      </section>
      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            {DATA.summary}
          </Markdown>
        </BlurFade>
      </section>  
    </main>
  );
}

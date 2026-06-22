import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Bell, Bot, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/",          icon: Home,        en: "Home",    bn: "হোম" },
  { href: "/alerts",    icon: Bell,        en: "Alerts",  bn: "সতর্কতা" },
  { href: "/assistant", icon: Bot,         en: "AI Doc",  bn: "AI ডাক্তার" },
  { href: "/doctors",   icon: Stethoscope, en: "Doctors", bn: "ডাক্তার" },
  { href: "/profile",   icon: User,        en: "Profile", bn: "প্রোফাইল" },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isBangla } = useLanguage();

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-gray-200 overflow-hidden">
      {/* Phone Frame — scales down to fit any viewport height */}
      <div
        className="relative bg-background shadow-2xl overflow-hidden border-[6px] border-gray-900 flex flex-col"
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100dvh)",
          borderRadius: "min(40px, 5vw)",
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-50 pointer-events-none">
          <div className="w-28 h-5 bg-gray-900 rounded-b-2xl" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[64px] pt-5 scrollbar-hide">
          {children}
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 inset-x-0 h-[64px] bg-white border-t border-border flex items-center justify-around px-1 z-40">
          {NAV_ITEMS.map((nav) => {
            const Icon = nav.icon;
            const isActive = location === nav.href;
            const label = isBangla ? nav.bn : nav.en;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className="flex flex-col items-center justify-center w-[60px] h-[56px] rounded-xl"
                data-testid={`nav-${nav.en.toLowerCase().replace(" ", "-")}`}
              >
                <div className={cn("p-1.5 rounded-xl mb-0.5 transition-colors", isActive && "bg-primary/10")}>
                  <Icon
                    className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn("text-[9px] font-semibold leading-tight text-center transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Bell, Bot, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/",         icon: Home,        en: "Home",      bn: "হোম" },
  { href: "/alerts",   icon: Bell,        en: "Alerts",    bn: "সতর্কতা" },
  { href: "/assistant",icon: Bot,         en: "AI Doc",    bn: "AI ডাক্তার" },
  { href: "/doctors",  icon: Stethoscope, en: "Doctors",   bn: "ডাক্তার" },
  { href: "/profile",  icon: User,        en: "Profile",   bn: "প্রোফাইল" },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isBangla } = useLanguage();

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gray-200 py-8">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-background rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-900 flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
          <div className="w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-20 pt-8 scrollbar-hide">
          {children}
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 inset-x-0 h-[72px] bg-white border-t border-border flex items-center justify-around px-1 z-40">
          {NAV_ITEMS.map((nav) => {
            const Icon = nav.icon;
            const isActive = location === nav.href;
            const label = isBangla ? nav.bn : nav.en;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className="flex flex-col items-center justify-center w-[60px] h-14 rounded-xl transition-colors"
                data-testid={`nav-${nav.en.toLowerCase().replace(" ", "-")}`}
              >
                <div className={cn("p-1.5 rounded-xl transition-colors mb-0.5", isActive && "bg-primary/10")}>
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn("text-[9px] font-semibold transition-colors leading-tight text-center", isActive ? "text-primary" : "text-muted-foreground")}>
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

import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Bell, Bot, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "AI Assistant", href: "/assistant", icon: Bot },
    { name: "Doctors", href: "/doctors", icon: Stethoscope },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gray-200 py-8">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-background rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-900 flex flex-col">
        {/* Notch simulation */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
          <div className="w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-20 pt-8 scrollbar-hide">
          {children}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-border flex items-center justify-around px-2 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-16 h-14"
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 mb-1 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

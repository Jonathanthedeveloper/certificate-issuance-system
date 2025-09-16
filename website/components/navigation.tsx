"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface NavigationProps {
  items: NavItem[];
  variant?: "header" | "sidebar";
  className?: string;
}

export function Navigation({ items, variant = "header", className }: NavigationProps) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav className={cn("p-4", className)}>
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon && (
                    <item.icon className={cn(
                      "w-4 h-4",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )} />
                  )}
                  <span className={cn(
                    "font-medium",
                    isActive && "text-blue-700"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  // Header variant
  return (
    <nav className={cn("flex items-center gap-6", className)}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors",
              isActive
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

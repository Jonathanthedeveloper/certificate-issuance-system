"use client";

import { Navigation } from "@/components/navigation";
import { Building, FileText, Settings, Users, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconName =
  | "Building"
  | "FileText"
  | "Settings"
  | "Users"
  | "User"
  | string;

interface NavItem {
  href: string;
  label: string;
  // accept either a LucideIcon component or the name of a known icon
  icon?: LucideIcon | IconName;
}

interface SidebarNavProps {
  items: NavItem[];
}

function resolveIcon(icon?: LucideIcon | IconName): LucideIcon | undefined {
  if (!icon) return undefined;
  if (typeof icon === "function") return icon as LucideIcon;
  // map known icon names
  const map: Record<string, LucideIcon> = {
    Building,
    FileText,
    Settings,
    Users,
    User,
  };
  return map[icon as string];
}

export function SidebarNav({ items }: SidebarNavProps) {
  // Convert incoming items so `icon` is a LucideIcon when possible; Navigation is client-only
  const normalized = items.map((it) => ({ ...it, icon: resolveIcon(it.icon) }));
  return <Navigation items={normalized} variant="sidebar" />;
}

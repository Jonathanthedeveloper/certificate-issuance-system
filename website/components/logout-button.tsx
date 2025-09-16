"use client";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import type { ComponentProps } from "react";

export default function LogoutButton({
  variant,
  size,
  ...props
}: ComponentProps<typeof Button>) {
  const { logout } = useAuth();

  return (
    <Button variant={variant} size={size} onClick={logout} {...props}>
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}

"use client";
import { getQueryClient } from "@/lib/get-query-client";
import { QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type * as React from "react";

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </ReactQueryClientProvider>
  );
}

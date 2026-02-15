import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <SidebarProvider>
      <AppSidebar/>
      <div className="w-full min-h-screen">
        <AppHeader/>
        {children}
      </div>
    </SidebarProvider>
    
  );
}

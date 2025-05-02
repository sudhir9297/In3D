import { AppSidebar } from "@/app/studio/_components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ViewerWrapper } from "./_components/viewer";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "380px",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <ViewerWrapper />
      </SidebarInset>
      <AppSidebar side="right" />
    </SidebarProvider>
  );
}

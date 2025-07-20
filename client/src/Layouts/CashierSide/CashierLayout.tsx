import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./Components/app-sidebar";
import { AuthContext } from "@/Context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function CashierLayout() {
  const { user, loading } = useContext(AuthContext)!;

  // Wait for loading to complete
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }
  console.log("User:", user);
  // Check for the correct role
  if (!user || user.role !== "CASHIER") {
    console.log("Unauthorized user:", user);
    window.location.href = "/login";
  }
  const location = useLocation();

  // Function to get page title from path
  const getPageTitle = (path: string) => {
    // Remove leading slash and split by remaining slashes
    const segments = path.split("/").filter(Boolean);

    // If we're at the r
    if (segments.length === 1 && segments[0] === "cashier") {
      return "Dashboard";
    }

    // Get the last segment and capitalize it
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const currentPageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/cashier">Cashier</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default CashierLayout;

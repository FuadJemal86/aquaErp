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
import { useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./Components/app-sidebar";
import { AuthContext } from "@/Context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import api from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, AlertTriangle, DollarSign, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type NotificationType = 'stock' | 'sales' | 'buy';

interface Notification {
  message: string;
  type: NotificationType;
  timestamp: string;
}

function AdminLayout() {
  const { user, loading } = useContext(AuthContext)!;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await api.get('/admin/notifications');
        if (result.data.status && result.data.notifications) {
          const parsedNotifications: Notification[] = result.data.notifications.map((msg: string) => {
            let type: NotificationType = 'stock';
            if (msg.includes('Sales credit overdue')) type = 'sales';
            else if (msg.includes('Buy credit overdue')) type = 'buy';

            return {
              message: msg,
              type,
              timestamp: new Date().toISOString()
            };
          });
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.length);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'sales':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'buy':
        return <Package className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPageTitle = (path: string): string => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 1 && segments[0] === "admin") {
      return "Dashboard";
    }
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user || user.role !== "ADMIN") {
    window.location.href = "/login";
    return null;
  }

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
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <BellIcon className="h-[1.2rem] w-[1.2rem]" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 rounded-full"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              {isDropdownOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
              )}
              <DropdownMenuContent
                className="w-96 p-0 z-50"
                align="end"
                onInteractOutside={() => setIsDropdownOpen(false)}
              >
                <div className="px-4 py-3 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2 font-semibold">
                    <BellIcon className="h-4 w-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
                <ScrollArea className="h-72">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="flex gap-3 py-3 border-b"
                      >
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No notifications found
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
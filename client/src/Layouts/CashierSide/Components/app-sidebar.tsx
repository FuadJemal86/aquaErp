import {
  Bell,
  CreditCard,
  FileText,
  LayoutDashboardIcon,
  Package,
  Settings,
  ShoppingCart,
  Banknote,
  UserPlus,
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { ThemeToggle } from "./theme-toggle";
import { AuthContext } from "@/Context/AuthContext";
import { useContext } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useContext(AuthContext)!;

  const getMenuItems = () => {
    const isCashier = user?.role === "CASHIER";

    if (isCashier) {
      return [
        {
          title: "Dashboard",
          url: "/cashier/",
          icon: LayoutDashboardIcon,
        },
        {
          title: "Sales",
          url: "#",
          icon: ShoppingCart,
          items: [
            {
              title: "Sales products",
              url: "/cashier/sales-products",
            },
          ],
        },
        {
          title: "Buy",
          url: "#",
          icon: Package,
          items: [
            {
              title: "Buy products",
              url: "/cashier/buy-products",
            },
          ],
        },
        {
          title: "Repay credit",
          url: "#",
          icon: CreditCard,
          items: [
            {
              title: "Sales credit repay",
              url: "/cashier/sales-credit-repay",
            },
            {
              title: "Buy credit repay",
              url: "/cashier/buy-credit-repay",
            },
          ],
        },
        {
          title: "Add Customer",
          url: "#",
          icon: UserPlus,
          items: [
            {
              title: "Add Customer",
              url: "/cashier/customers/add",
            },
            {
              title: "List of Customers",
              url: "/cashier/customers",
            },
          ],
        },
        {
          title: "Notifications",
          url: "/cashier/notifications",
          icon: Bell,
          badgeCount: 0,
        },
      ];
    } else {
      return [
        {
          title: "login",
          url: "/login/",
          icon: LayoutDashboardIcon,
        },
      ];
    }
  };

  const data = {
    navMain: getMenuItems(),
  };

  const passdata = {
    user: {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.image || "",
    },
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    src="/images/teachreach.jpg"
                    alt="Tech Reach Logo"
                    className="rounded-bl-md border-2 border-blue-600 h-10 w-10"
                  />
                </div>
                <div className="grid flex-1 text-left ml-2">
                  <span className="text-lg font-bold tracking-tight text-blue-900">
                    Aqua
                  </span>
                  <span className="text-xs font-medium text-muted-foreground tracking-wide">
                    System
                  </span>
                </div>
                <ThemeToggle />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={passdata.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Sales",
        url: "#",
        icon: ShoppingCart,
        items: [
          {
            title: "Sales products",
            url: "/admin/sales-products",
          },
          {
            title: "Sales credit report",
            url: "/admin/sales-credit-report",
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
            url: "/admin/buy-products",
          },
          {
            title: "Buy credit report",
            url: "/admin/buy-credit-report",
          },
        ],
      },
      {
        title: "Reports",
        url: "#",
        icon: FileText,
        items: [
          {
            title: "sales report",
            url: "/admin/sales-report",
          },
          {
            title: "Buy report",
            url: "/admin/buy-report",
          },
          {
            title: "Product Transaction",
            url: "/admin/product-transaction",
          },
          {
            title: "Cash Transaction",
            url: "/admin/cash-transaction",
          },
          {
            title: "Bank Transaction",
            url: "/admin/bank-transaction",
          },
          {
            title: "Bank Balance",
            url: "/admin/bank-balance",
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
            url: "/admin/sales-credit-repay",
          },
          {
            title: "Buy credit repay",
            url: "/admin/buy-credit-repay",
          },
        ],
      },
      {
        title: "Bank Transfer",
        url: "#",
        icon: Banknote,
        items: [
          {
            title: "Deposit",
            url: "/admin/bank-transfer/deposit",
          },
          {
            title: "Withdraw",
            url: "/admin/bank-transfer/withdraw",
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
            url: "/admin/customers/add",
          },
          {
            title: "List of Customers",
            url: "/admin/customers",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "My Profile",
            url: "/admin/settings/my-profile",
          },
          {
            title: "Add User",
            url: "/admin/settings/add-user",
          },
          {
            title: "Add Product",
            url: "/admin/settings/add-product",
          },

          {
            title: "Bank Account",
            url: "/admin/settings/bank-account",
          },
        ],
      },

      {
        title: "Notifications",
        url: "/admin/notifications",
        icon: Bell,
        badgeCount: 0,
      },
    ],
  };

  let passdata = {
    user: {
      name: "",
      email: "",
      avatar: "",
    },
  };

  passdata = {
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://github.com/shadcn.png",
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

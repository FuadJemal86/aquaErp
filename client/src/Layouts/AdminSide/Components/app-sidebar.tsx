import {
  Banknote,
  CreditCard,
  FileText,
  LayoutDashboardIcon,
  Package,
  Settings,
  ShoppingCart,
  UserPlus
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

import { AuthContext } from "@/Context/AuthContext";
import { useContext } from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useContext(AuthContext)!;

  // Define menu items based on user role
  const getMenuItems = () => {
    const isCashier = user?.role === "CASHIER";

    if (isCashier) {
      // Cashier menu - limited access
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
        }
      ];
    } else {
      // Admin menu - full access
      return [
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
        }
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

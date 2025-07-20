import { ChevronRight, type LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    badgeCount?: number;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Determine which items should be open based on current location
  useEffect(() => {
    const newOpenItems = new Set<string>();

    items.forEach((item) => {
      // Check if current path matches the main item URL
      if (item.url !== "#" && location.pathname === item.url) {
        newOpenItems.add(item.title);
      }

      // Check if current path matches any sub-item URL
      if (item.items) {
        item.items.forEach((subItem) => {
          if (location.pathname === subItem.url) {
            newOpenItems.add(item.title);
          }
        });
      }
    });

    setOpenItems(newOpenItems);
  }, [location.pathname, items]);

  const toggleItem = (itemTitle: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemTitle)) {
        newSet.delete(itemTitle);
      } else {
        newSet.add(itemTitle);
      }
      return newSet;
    });
  };

  const handleItemClick = (
    e: React.MouseEvent,
    itemTitle: string,
    hasSubItems: boolean,
    itemUrl: string
  ) => {
    if (hasSubItems) {
      e.preventDefault();
      e.stopPropagation();
      toggleItem(itemTitle);
    } else if (itemUrl !== "#") {
      // Navigate to the URL if it's not a placeholder
      window.location.href = itemUrl;
    }
  };

  // Check if an item is active
  const isItemActive = (item: any) => {
    if (item.url !== "#" && location.pathname === item.url) {
      return true;
    }
    if (item.items) {
      return item.items.some(
        (subItem: any) => location.pathname === subItem.url
      );
    }
    return false;
  };

  // Check if a sub-item is active
  const isSubItemActive = (subItemUrl: string) => {
    return location.pathname === subItemUrl;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Pages</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            open={openItems.has(item.title)}
            onOpenChange={() => toggleItem(item.title)}
          >
            <SidebarMenuItem>
              <div
                className="flex items-center w-full cursor-pointer"
                onClick={(e) =>
                  handleItemClick(e, item.title, !!item.items?.length, item.url)
                }
              >
                <SidebarMenuButton tooltip={item.title}>
                  <div className="relative">
                    <item.icon />
                    {item.badgeCount ? (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {item.badgeCount}
                      </Badge>
                    ) : null}
                  </div>
                  <span
                    className={
                      isItemActive(item)
                        ? "text-foreground font-bold "
                        : "text-foreground"
                    }
                  >
                    {item.title}
                  </span>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuAction
                    className={`transition-transform duration-200 ${
                      openItems.has(item.title) ? "rotate-90" : ""
                    }`}
                  >
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                ) : null}
              </div>
              {item.items?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          onClick={() => (window.location.href = subItem.url)}
                        >
                          <span
                            className={
                              isSubItemActive(subItem.url)
                                ? "text-foreground font-bold font-mono "
                                : "text-foreground"
                            }
                          >
                            {subItem.title}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

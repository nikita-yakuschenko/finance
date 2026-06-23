"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Building2Icon,
  ChartBarIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  PackageIcon,
  TableIcon,
  TrendingUpIcon,
  WalletIcon,
  WarehouseIcon,
} from "lucide-react";

const data = {
  navMain: [
    { title: "Обзор", url: "#overview", icon: <LayoutDashboardIcon /> },
    { title: "Графики", url: "#charts", icon: <ChartBarIcon /> },
    { title: "Организации", url: "#organizations", icon: <Building2Icon /> },
    { title: "Кредиты", url: "#credit", icon: <LandmarkIcon /> },
    { title: "Накопл. CF", url: "#accumulated", icon: <TrendingUpIcon /> },
    { title: "Склады", url: "#warehouses", icon: <WarehouseIcon /> },
    { title: "P&L", url: "#pnl", icon: <TableIcon /> },
    { title: "Упр. баланс", url: "#mgmt-balance", icon: <PackageIcon /> },
    { title: "БДДС", url: "#bdds", icon: <WalletIcon /> },
    { title: "CF недели", url: "#cf-weekly", icon: <TableIcon /> },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <WalletIcon className="size-5!" />
              <span className="text-base font-semibold">ДДС</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

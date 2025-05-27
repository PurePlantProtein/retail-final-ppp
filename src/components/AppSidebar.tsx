
import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { customerItems, adminItems } from "./sidebar/menuItems"
import { AppSidebarMenuItem } from "./sidebar/SidebarMenuItem"
import { AppSidebarFooter } from "./sidebar/SidebarFooter"

export function AppSidebar() {
  const { isAdmin } = useAuth()
  const menuItems = isAdmin ? adminItems : customerItems

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <AppSidebarMenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  )
}

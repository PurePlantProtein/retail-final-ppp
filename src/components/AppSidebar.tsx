
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

export function AppSidebar() {
  const { isAdmin } = useAuth()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        {/* Customer Menu Items */}
        <SidebarGroup>
          <SidebarGroupLabel>Customer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {customerItems.map((item) => (
                <AppSidebarMenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Admin Menu Items - Only show if user is admin */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <AppSidebarMenuItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      {/* <AppSidebarFooter /> */}
    </Sidebar>
  )
}

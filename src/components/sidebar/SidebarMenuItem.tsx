
import React from "react"
import { NavLink } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRight } from "lucide-react"
import { MenuItem } from "./menuItems"

interface AppSidebarMenuItemProps {
  item: MenuItem
}

export function AppSidebarMenuItem({ item }: AppSidebarMenuItemProps) {
  if (item.items) {
    return (
      <Collapsible asChild defaultOpen={false} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <NavLink 
                      to={subItem.url}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <span>{subItem.title}</span>
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  // Handle external links (like Google Drive)
  if (item.url.startsWith('http')) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={item.title} asChild>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <item.icon />
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} asChild>
        <NavLink 
          to={item.url}
          className={({ isActive }) =>
            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
          }
        >
          <item.icon />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

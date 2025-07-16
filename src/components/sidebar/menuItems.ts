
import {
  Building2,
  Factory,
  DollarSign,
  FileText,
  Home,
  Inbox,
  Mail,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  User2,
  Users,
} from "lucide-react"

export interface SubMenuItem {
  title: string
  url: string
}

export interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType
  items?: SubMenuItem[]
}

// Menu items for customers/retailers
export const customerItems: MenuItem[] = [
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Cart",
    url: "/cart",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: FileText,
  },
  {
    title: "Marketing Materials",
    url: "https://drive.google.com/drive/folders/1pxLkF92zI2sogxEISkNUQJrGwTaJK6gR?usp=drive_link",
    icon: Building2,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User2,
  },
]

// Menu items for admin
export const adminItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: Search,
  },
  {
    title: "Email Marketing",
    url: "#",
    icon: Mail,
    items: [
      {
        title: "Email Settings",
        url: "/admin/email-settings",
      },
      {
        title: "Bulk Order Emails",
        url: "/admin/bulk-order-emails",
      },
    ],
  },
  {
    title: "Pricing",
    url: "/admin/pricing-tiers",
    icon: DollarSign,
  },
  {
    title: "Shipping",
    url: "/admin/shipping",
    icon: Truck,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Building2,
  },
  {
    title: "Business Types",
    url: "/admin/business-types",
    icon: Factory,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

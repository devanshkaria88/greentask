'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Briefcase,
  CheckCircle,
  Wallet,
  User,
  PanelLeftIcon,
  Leaf,
} from "lucide-react"
import { useState } from "react"
import { UserMenu } from "./UserMenu"
import { ThemeToggle } from "./ThemeToggle"

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
}

const menuItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "My Jobs",
    href: "/dashboard/jobs",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Verifications",
    href: "/dashboard/verifications",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "border-border bg-card flex h-full flex-col gap-2 border-r px-2 py-4 transition-all duration-150",
        collapsed ? "min-w-16" : "min-w-64"
      )}
    >
      {/* Header with logo and collapse button */}
      <div className="flex items-center justify-between px-2">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1.5">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary">GreenTask</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center !px-3.5 cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeftIcon className={cn(collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex w-full flex-col gap-2 self-start">
        <UserMenu collapsed={collapsed} />
        <ThemeToggle expanded={!collapsed} />
      </div>
    </div>
  )
}

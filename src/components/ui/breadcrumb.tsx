import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
  homeHref?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <ChevronRight className="w-4 h-4 text-stone-400" />,
  showHome = true,
  homeHref = "/"
}) => {
  const allItems = React.useMemo(() => showHome 
    ? [{ label: "Home", href: homeHref, icon: <Home className="w-4 h-4" /> }, ...items]
    : items, [showHome, homeHref, items])

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-2 text-body-sm text-stone-600 py-3",
        className
      )}
    >
      <ol className="flex items-center gap-2">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="flex-shrink-0">
                {separator}
              </span>
            )}
            
            {item.href && index < allItems.length - 1 ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 hover:text-earth-700 transition-colours duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-earth-500 focus:ring-offset-2 rounded px-1 py-0.5"
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <span 
                className={cn(
                  "flex items-center gap-2",
                  index === allItems.length - 1 
                    ? "text-earth-700 font-semibold" 
                    : "text-stone-600"
                )}
                aria-current={index === allItems.length - 1 ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Storytelling-themed breadcrumb with cultural styling
const CulturalBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <ChevronRight className="w-4 h-4 text-sage-400" />,
  showHome = true,
  homeHref = "/"
}) => {
  const allItems = React.useMemo(() => showHome 
    ? [{ label: "Home", href: homeHref, icon: <Home className="w-4 h-4" /> }, ...items]
    : items, [showHome, homeHref, items])

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-3 text-body-sm text-stone-600 py-4 px-6 bg-gradient-to-r from-stone-50 to-sage-50/50 rounded-lg border border-stone-200 shadow-sm",
        className
      )}
    >
      <ol className="flex items-center gap-3">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden="true" className="flex-shrink-0">
                {separator}
              </span>
            )}
            
            {item.href && index < allItems.length - 1 ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-stone-600 hover:text-earth-700 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-earth-500 focus:ring-offset-2 rounded-lg px-2 py-1",
                  "hover:bg-white hover:shadow-sm"
                )}
              >
                {item.icon && <span className="text-sage-500">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <span 
                className={cn(
                  "flex items-center gap-2",
                  index === allItems.length - 1 
                    ? "text-earth-800 font-semibold" 
                    : "text-stone-600"
                )}
                aria-current={index === allItems.length - 1 ? "page" : undefined}
              >
                {item.icon && (
                  <span className={index === allItems.length - 1 ? "text-earth-600" : "text-sage-500"}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Compact breadcrumb for tight spaces
const CompactBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <span className="text-stone-400 mx-1">/</span>,
  showHome = false
}) => {
  const displayItems = showHome 
    ? [{ label: "Home", href: "/" }, ...items]
    : items

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("text-body-xs text-stone-500", className)}
    >
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && separator}
          {item.href && index < displayItems.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-earth-700 transition-colours duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={index === displayItems.length - 1 ? "text-earth-700 font-medium" : ""}
              aria-current={index === displayItems.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export { Breadcrumb, CulturalBreadcrumb, CompactBreadcrumb }
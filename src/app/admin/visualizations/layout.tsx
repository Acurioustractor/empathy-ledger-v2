/**
 * Visualizations Layout
 * Provides a clean full-page layout for database visualizations
 * Accounts for admin sidebar on desktop
 */

export default function VisualizationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 lg:left-64 w-full lg:w-[calc(100%-16rem)] h-full overflow-hidden">
      {children}
    </div>
  )
}

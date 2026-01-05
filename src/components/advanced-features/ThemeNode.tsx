'use client'

interface ThemeNodeProps {
  node: { id: string; label: string; size: number; color: string }
  onClick: () => void
  isSelected: boolean
}

export function ThemeNode({ node, onClick, isSelected }: ThemeNodeProps) {
  const size = Math.max(node.size, 20)

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition-all cursor-pointer hover:scale-110 ${
        isSelected ? 'ring-4 ring-purple-500' : ''
      }`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: node.color
      }}
      title={`${node.label} (${node.size} stories)`}
    >
      <span className="text-white text-xs font-semibold text-center px-1 leading-tight">
        {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
      </span>
    </button>
  )
}

'use client'

export function MapLegend() {
  const culturalGroups = [
    { name: 'Anishinaabe', color: '#D97757' },
    { name: 'Cree', color: '#6B8E72' },
    { name: 'Haudenosaunee', color: '#4A90A4' },
    { name: 'Métis', color: '#D4A373' },
  ]

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
      <div className="grid grid-cols-2 gap-3">
        {culturalGroups.map(group => (
          <div key={group.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-sm text-gray-700">{group.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

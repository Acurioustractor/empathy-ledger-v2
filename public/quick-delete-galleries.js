// Quick script to delete fake galleries - paste in browser console

async function deleteFakeGalleries() {
  console.log('🗑️ Deleting fake galleries...')

  const fakeGalleryTitles = [
    'Community Ceremonies',
    'Youth Cultural Activities',
    'Elder Knowledge Keepers',
    'Healing Through Storytelling'
  ]

  try {
    // Get galleries from admin API
    const response = await fetch('/api/admin/galleries')
    const data = await response.json()

    console.log(`Found ${data.galleries?.length || 0} total galleries`)

    if (!data.galleries) {
      console.log('No galleries found')
      return
    }

    // Find fake galleries
    const fakeGalleries = data.galleries.filter(g =>
      fakeGalleryTitles.some(title => g.title.includes(title))
    )

    console.log(`Found ${fakeGalleries.length} fake galleries:`)
    fakeGalleries.forEach(g => console.log(`- ${g.title} (${g.id})`))

    // Delete each one
    for (const gallery of fakeGalleries) {
      console.log(`Deleting: ${gallery.title}`)

      const deleteResponse = await fetch(`/api/galleries/${gallery.id}`, {
        method: 'DELETE'
      })

      if (deleteResponse.ok) {
        console.log(`✅ Deleted: ${gallery.title}`)
      } else {
        const error = await deleteResponse.text()
        console.log(`❌ Failed: ${gallery.title} - ${error}`)
      }
    }

    console.log('🎉 Done!')

  } catch (error) {
    console.error('Error:', error)
  }
}

deleteFakeGalleries()
// Browser console script to add storytellers to Deadly Hearts Trek project
// Run this in the browser console when on the project manage page

async function addStorytellersToProject() {
  // Get project ID from current URL
  const urlParts = window.location.pathname.split('/')
  const projectIdIndex = urlParts.indexOf('projects') + 1
  const projectId = urlParts[projectIdIndex]

  console.log('🎯 Project ID from URL:', projectId)

  if (!projectId) {
    console.error('❌ Could not determine project ID from URL')
    return
  }

  // Known storyteller names from transcripts
  const storytellerNames = [
    'Heather Mundo',
    'Cissy Johns',
    'Dr Boe Remenyi',
    'Aunty Diganbal May Rose',
    'Georgina Byron AM',
    'Aunty Vicky Wade'
  ]

  console.log('🔍 Looking for storytellers:', storytellerNames)

  // First, get available storytellers
  try {
    const storytellersResponse = await fetch('/api/admin/storytellers')
    const storytellersData = await storytellersResponse.json()
    console.log('👥 Available storytellers:', storytellersData)

    if (!storytellersData.storytellers) {
      console.error('❌ No storytellers data found')
      return
    }

    // Find matching storytellers
    const matchingStorytellers = storytellersData.storytellers.filter(s =>
      storytellerNames.some(name =>
        (s.displayName && s.displayName.includes(name.split(' ')[0])) ||
        (s.fullName && s.fullName.includes(name.split(' ')[0]))
      )
    )

    console.log('✅ Matching storytellers found:', matchingStorytellers)

    // Add each storyteller to the project
    for (const storyteller of matchingStorytellers) {
      console.log(`🔗 Adding ${storyteller.displayName || storyteller.fullName} to project...`)

      try {
        const addResponse = await fetch(`/api/projects/${projectId}/storytellers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            storyteller_id: storyteller.id,
            role: 'storyteller'
          })
        })

        if (addResponse.ok) {
          const result = await addResponse.json()
          console.log(`✅ Added ${storyteller.displayName || storyteller.fullName}:`, result.message)
        } else {
          const error = await addResponse.text()
          console.error(`❌ Failed to add ${storyteller.displayName || storyteller.fullName}:`, error)
        }
      } catch (error) {
        console.error(`💥 Error adding ${storyteller.displayName || storyteller.fullName}:`, error)
      }
    }

    console.log('🎉 Finished adding storytellers. Refresh the page to see changes.')

  } catch (error) {
    console.error('💥 Error fetching storytellers:', error)
  }
}

// Run the function
addStorytellersToProject()

console.log(`
📋 Instructions:
1. Make sure you're on the Deadly Hearts Trek project manage page
2. Open browser console (F12 → Console tab)
3. Paste this entire script and press Enter
4. Wait for completion messages
5. Refresh the page to see the storytellers linked
`);
import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

/**
 * Scheduled job to automatically publish stories at their scheduled time
 * Runs every 5 minutes via cron
 */
export const publishScheduledStories = inngest.createFunction(
  {
    id: 'publish-scheduled-stories',
    name: 'Publish Scheduled Stories',
    retries: 3
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Step 1: Find stories ready to publish
    const stories = await step.run('find-scheduled-stories', async () => {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          slug,
          storyteller_id,
          organization_id,
          scheduled_publish_at,
          storytellers!storyteller_id (
            id,
            display_name,
            user_id
          )
        `)
        .eq('status', 'scheduled')
        .lte('scheduled_publish_at', now)
        .is('deleted_at', null)
        .limit(50) // Process max 50 stories per run

      if (error) {
        console.error('Error finding scheduled stories:', error)
        throw new Error(`Failed to find scheduled stories: ${error.message}`)
      }

      return data || []
    })

    if (stories.length === 0) {
      return {
        published: 0,
        failed: 0,
        skipped: 0,
        message: 'No stories ready to publish'
      }
    }

    // Step 2: Publish each story
    const results = await step.run('publish-stories', async () => {
      const publishResults = await Promise.allSettled(
        stories.map(async (story) => {
          try {
            // Update story to published
            const { error: updateError } = await supabase
              .from('stories')
              .update({
                status: 'published',
                published_at: new Date().toISOString(),
                scheduled_publish_at: null
              })
              .eq('id', story.id)

            if (updateError) {
              throw new Error(`Failed to update story: ${updateError.message}`)
            }

            // Log status change to history
            const { error: historyError } = await supabase
              .from('story_status_history')
              .insert({
                story_id: story.id,
                from_status: 'scheduled',
                to_status: 'published',
                reason: 'Scheduled publish time reached',
                metadata: {
                  scheduled_for: story.scheduled_publish_at,
                  published_at: new Date().toISOString(),
                  auto_published: true
                }
              })

            if (historyError) {
              console.warn('Failed to log status history:', historyError)
              // Don't fail the publish if history logging fails
            }

            return {
              id: story.id,
              title: story.title,
              slug: story.slug,
              success: true,
              storyteller_id: story.storyteller_id,
              user_id: story.storytellers?.user_id
            }

          } catch (error) {
            console.error(`Error publishing story ${story.id}:`, error)
            return {
              id: story.id,
              title: story.title,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      return publishResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            id: stories[index].id,
            title: stories[index].title,
            success: false,
            error: result.reason?.message || 'Promise rejected'
          }
        }
      })
    })

    // Step 3: Send notifications for successfully published stories
    const successfulPublishes = results.filter(r => r.success)

    if (successfulPublishes.length > 0) {
      await step.run('send-notifications', async () => {
        // Group by user for batched notifications
        const notificationsByUser = successfulPublishes.reduce((acc, story) => {
          const userId = story.user_id
          if (!userId) return acc

          if (!acc[userId]) {
            acc[userId] = []
          }
          acc[userId].push(story)
          return acc
        }, {} as Record<string, typeof successfulPublishes>)

        // TODO: Send email notifications
        // For now, log what would be sent
        console.log('Notifications to send:', {
          users: Object.keys(notificationsByUser).length,
          stories: successfulPublishes.length,
          details: notificationsByUser
        })

        // Future: Implement email sending
        // await Promise.all(
        //   Object.entries(notificationsByUser).map(([userId, stories]) =>
        //     sendEmail({
        //       to: userId,
        //       template: 'stories-published',
        //       data: { stories }
        //     })
        //   )
        // )

        return {
          notifications_queued: Object.keys(notificationsByUser).length
        }
      })
    }

    // Calculate summary
    const summary = {
      published: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      total_processed: results.length,
      stories: results,
      timestamp: new Date().toISOString()
    }

    // Log summary
    console.log('Scheduled publishing complete:', {
      published: summary.published,
      failed: summary.failed,
      total: summary.total_processed
    })

    return summary
  }
)

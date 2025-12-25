-- Story Notification Triggers
-- Automatically create notifications for storytellers when important events happen

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS on_story_invitation_accepted ON story_review_invitations;
DROP TRIGGER IF EXISTS on_story_permission_changed ON stories;
DROP FUNCTION IF EXISTS notify_storyteller_on_invitation_accepted();
DROP FUNCTION IF EXISTS notify_storyteller_on_permission_change();

-- Function: Notify storyteller when their invitation is accepted
CREATE OR REPLACE FUNCTION notify_storyteller_on_invitation_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if the invitation was just accepted (accepted_at changed from NULL to a value)
  IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL AND NEW.storyteller_id IS NOT NULL THEN
    -- Create notification
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      action_url,
      priority,
      created_at
    ) VALUES (
      NEW.storyteller_id,
      'story_ready',
      'Your Story is Ready to Review',
      'Your story has been captured and is ready for your review. You can set privacy settings and review the content.',
      '/my-story/' || NEW.story_id,
      'normal',
      NOW()
    );

    RAISE NOTICE 'Notification created for storyteller % for story %', NEW.storyteller_id, NEW.story_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: After invitation is accepted
CREATE TRIGGER on_story_invitation_accepted
  AFTER UPDATE ON story_review_invitations
  FOR EACH ROW
  EXECUTE FUNCTION notify_storyteller_on_invitation_accepted();

-- Function: Notify storyteller when permission tier changes
CREATE OR REPLACE FUNCTION notify_storyteller_on_permission_change()
RETURNS TRIGGER AS $$
DECLARE
  tier_name TEXT;
  tier_description TEXT;
BEGIN
  -- Only notify if permission tier changed and storyteller exists
  IF NEW.permission_tier IS DISTINCT FROM OLD.permission_tier
     AND NEW.storyteller_id IS NOT NULL THEN

    -- Get human-readable tier name
    tier_name := CASE NEW.permission_tier
      WHEN 1 THEN 'Private'
      WHEN 2 THEN 'Trusted Circle'
      WHEN 3 THEN 'Community'
      WHEN 4 THEN 'Public'
      WHEN 5 THEN 'Archive'
      ELSE 'Unknown'
    END;

    tier_description := CASE NEW.permission_tier
      WHEN 1 THEN 'Only you can see this story'
      WHEN 2 THEN 'Shared via direct links only'
      WHEN 3 THEN 'Visible in community events, not social media'
      WHEN 4 THEN 'Full public sharing (can be withdrawn)'
      WHEN 5 THEN 'Permanent public archive (cannot be withdrawn)'
      ELSE 'Permission tier changed'
    END;

    -- Create notification
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      action_url,
      priority,
      created_at
    ) VALUES (
      NEW.storyteller_id,
      'permission_changed',
      'Story Privacy Updated: ' || tier_name,
      tier_description || '. View your story to see the current settings.',
      '/my-story/' || NEW.id,
      'normal',
      NOW()
    );

    RAISE NOTICE 'Permission change notification created for storyteller % for story %', NEW.storyteller_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: After story permission tier changes
CREATE TRIGGER on_story_permission_changed
  AFTER UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION notify_storyteller_on_permission_change();

-- Function: Notify storyteller when story is linked to their account
CREATE OR REPLACE FUNCTION notify_storyteller_on_story_linked()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if storyteller_id was just set (changed from NULL to a value)
  IF NEW.storyteller_id IS NOT NULL
     AND OLD.storyteller_id IS NULL THEN

    -- Create notification
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      action_url,
      priority,
      created_at
    ) VALUES (
      NEW.storyteller_id,
      'story_linked',
      'New Story Linked to Your Account',
      COALESCE(NEW.title, 'Your story') || ' has been linked to your account. Click to review and set privacy preferences.',
      '/my-story/' || NEW.id,
      'high',
      NOW()
    );

    RAISE NOTICE 'Story linked notification created for storyteller % for story %', NEW.storyteller_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: After story is linked to storyteller
CREATE TRIGGER on_story_linked_to_storyteller
  AFTER UPDATE ON stories
  FOR EACH ROW
  WHEN (NEW.storyteller_id IS NOT NULL AND OLD.storyteller_id IS NULL)
  EXECUTE FUNCTION notify_storyteller_on_story_linked();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION notify_storyteller_on_invitation_accepted() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_storyteller_on_permission_change() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_storyteller_on_story_linked() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION notify_storyteller_on_invitation_accepted() IS
  'Automatically creates notification when storyteller accepts magic link invitation';

COMMENT ON FUNCTION notify_storyteller_on_permission_change() IS
  'Automatically creates notification when story permission tier changes';

COMMENT ON FUNCTION notify_storyteller_on_story_linked() IS
  'Automatically creates notification when story is linked to storyteller account';

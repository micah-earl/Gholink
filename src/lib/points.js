import { supabase } from './supabase'

/**
 * Apply points when a recruit accepts an invite
 * This calls the Supabase Edge Function to handle the pyramid points system
 */
export const applyRecruitPoints = async (recruitId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('apply-recruit-points', {
      body: { recruit_id: recruitId },
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error applying recruit points:', error)
    throw error
  }
}

/**
 * Accept a recruit invite (for testing/demo purposes)
 * In production, this would be done via email link
 */
export const acceptRecruitInvite = async (recruitId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Update recruit status to accepted
    const { error: updateError } = await supabase
      .from('recruits')
      .update({ 
        status: 'accepted',
        recruit_id: user.id,
      })
      .eq('id', recruitId)

    if (updateError) {
      throw updateError
    }

    // Apply points to the recruiter chain
    await applyRecruitPoints(recruitId)

    return { success: true }
  } catch (error) {
    console.error('Error accepting recruit invite:', error)
    throw error
  }
}


// Supabase Edge Function: apply-recruit-points
// This function applies the pyramid-style points system when a recruit accepts an invite

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the user from the auth token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      throw new Error('Invalid user')
    }

    // Get the recruit_id from the request body
    const { recruit_id } = await req.json()

    if (!recruit_id) {
      throw new Error('recruit_id is required')
    }

    // Get the recruit record
    const { data: recruit, error: recruitError } = await supabaseAdmin
      .from('recruits')
      .select('*')
      .eq('id', recruit_id)
      .single()

    if (recruitError || !recruit) {
      throw new Error('Recruit not found')
    }

    if (recruit.status !== 'accepted') {
      throw new Error('Recruit must be accepted before applying points')
    }

    // Traverse upward through the recruit chain and apply points
    let currentRecruiterId = recruit.recruiter_id
    let pointsToAward = 1000
    let level = 1

    while (currentRecruiterId && pointsToAward >= 1) {
      // Award points to the current recruiter
      const { error: transactionError } = await supabaseAdmin
        .from('points_transactions')
        .insert({
          user_id: currentRecruiterId,
          amount: pointsToAward,
          reason: `Recruit accepted - Level ${level} reward`,
          related_recruit_id: recruit.id,
        })

      if (transactionError) {
        console.error('Error creating points transaction:', transactionError)
        // Continue with next level even if this one fails
      } else {
        // Update the recruiter's total points
        const { error: updateError } = await supabaseAdmin.rpc('increment_points', {
          user_id: currentRecruiterId,
          points: pointsToAward,
        })

        // If RPC doesn't exist, use direct update
        if (updateError) {
          const { data: currentProfile } = await supabaseAdmin
            .from('profiles')
            .select('total_points')
            .eq('id', currentRecruiterId)
            .single()

          if (currentProfile) {
            await supabaseAdmin
              .from('profiles')
              .update({ total_points: currentProfile.total_points + pointsToAward })
              .eq('id', currentRecruiterId)
          }
        }
      }

      // Find the recruiter of the current recruiter
      const { data: parentRecruit } = await supabaseAdmin
        .from('recruits')
        .select('recruiter_id')
        .eq('recruit_id', currentRecruiterId)
        .eq('status', 'accepted')
        .single()

      // Move to the next level
      currentRecruiterId = parentRecruit?.recruiter_id || null
      pointsToAward = Math.floor(pointsToAward / 2)
      level++
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Points applied successfully up to level ${level - 1}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})


/**
 * Referral System Testing Examples
 * 
 * This file contains example code snippets for testing the referral system.
 * Copy these into your browser console or React components for testing.
 */

// ==============================================
// 1. TEST REFERRAL CODE VALIDATION
// ==============================================

async function testReferralCodeValidation() {
  const testCode = 'ABC12345' // Replace with actual code
  
  const { data, error } = await supabase
    .from('users')
    .select('id, referral_code, role')
    .eq('referral_code', testCode)
    .single()
  
  console.log('Referral validation:', { data, error })
  return data
}

// ==============================================
// 2. TEST REFERRAL TREE FETCH
// ==============================================

async function testGetReferralTree(userId) {
  const { data, error } = await supabase
    .rpc('get_referral_tree', { recruiter_id: userId })
  
  console.log('Referral tree:', { data, error })
  
  // Pretty print the tree
  if (data) {
    data.forEach(user => {
      const indent = '  '.repeat(user.level)
      console.log(`${indent}L${user.level}: ${user.referral_code} (${user.role})`)
    })
  }
  
  return data
}

// ==============================================
// 3. TEST RECRUIT COUNTS
// ==============================================

async function testRecruitCounts(userId) {
  const { data: directCount } = await supabase
    .rpc('get_direct_recruits_count', { recruiter_id: userId })
  
  const { data: totalCount } = await supabase
    .rpc('get_total_recruits_count', { recruiter_id: userId })
  
  console.log('Recruit counts:', {
    direct: directCount,
    total: totalCount
  })
  
  return { directCount, totalCount }
}

// ==============================================
// 4. TEST CREATING USER WITH REFERRAL
// ==============================================

async function testCreateUserWithReferral(email, password, referrerCode) {
  // Step 1: Validate referral code
  const { data: recruiter } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', referrerCode)
    .single()
  
  if (!recruiter) {
    console.error('Invalid referral code')
    return
  }
  
  // Step 2: Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (authError) {
    console.error('Auth error:', authError)
    return
  }
  
  const userId = authData.user.id
  
  // Step 3: Create users table entry
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      role: 'recruited',
      parent_id: recruiter.id,
    })
    .select()
    .single()
  
  console.log('User created:', { userData, error: userError })
  return userData
}

// ==============================================
// 5. TEST GETTING USER'S REFERRAL INFO
// ==============================================

async function testGetMyReferralInfo() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('Not logged in')
    return
  }
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  console.log('My referral info:', data)
  console.log('My referral link:', `${window.location.origin}/join/${data.referral_code}`)
  
  return data
}

// ==============================================
// 6. TEST BUILDING TREE STRUCTURE
// ==============================================

function buildTreeStructure(flatData, parentId = null) {
  return flatData
    .filter(node => node.parent_id === parentId)
    .map(node => ({
      ...node,
      children: buildTreeStructure(flatData, node.id)
    }))
}

async function testTreeStructure(userId) {
  const { data: flatTree } = await supabase
    .rpc('get_referral_tree', { recruiter_id: userId })
  
  const hierarchicalTree = buildTreeStructure(flatTree, null)
  
  console.log('Flat tree:', flatTree)
  console.log('Hierarchical tree:', hierarchicalTree)
  
  return hierarchicalTree
}

// ==============================================
// 7. TEST COMPLETE REFERRAL FLOW
// ==============================================

async function testCompleteReferralFlow() {
  console.log('🧪 Testing Complete Referral Flow')
  console.log('==================================')
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('❌ Not logged in')
    return
  }
  
  console.log('✅ User logged in:', user.email)
  
  // Get referral info
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  console.log('✅ Referral code:', userData.referral_code)
  console.log('✅ Role:', userData.role)
  
  // Get tree
  const { data: tree } = await supabase
    .rpc('get_referral_tree', { recruiter_id: user.id })
  
  console.log('✅ Tree size:', tree?.length || 0, 'users')
  
  // Get counts
  const { data: directCount } = await supabase
    .rpc('get_direct_recruits_count', { recruiter_id: user.id })
  
  const { data: totalCount } = await supabase
    .rpc('get_total_recruits_count', { recruiter_id: user.id })
  
  console.log('✅ Direct recruits:', directCount)
  console.log('✅ Total network:', totalCount)
  
  console.log('\n📋 Summary:')
  console.log({
    email: user.email,
    code: userData.referral_code,
    link: `${window.location.origin}/join/${userData.referral_code}`,
    role: userData.role,
    parent: userData.parent_id || 'None (top-level recruiter)',
    directRecruits: directCount,
    totalNetwork: totalCount,
  })
}

// ==============================================
// 8. RUN ALL TESTS
// ==============================================

async function runAllTests() {
  console.log('🧪 Running all referral system tests...\n')
  
  try {
    await testCompleteReferralFlow()
    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// ==============================================
// EXPORT FOR USE IN COMPONENTS
// ==============================================

export {
  testReferralCodeValidation,
  testGetReferralTree,
  testRecruitCounts,
  testCreateUserWithReferral,
  testGetMyReferralInfo,
  testTreeStructure,
  testCompleteReferralFlow,
  runAllTests,
}

// ==============================================
// USAGE IN BROWSER CONSOLE
// ==============================================

/*
// 1. Open browser console on your app
// 2. Import supabase client:
import { supabase } from './lib/supabase'

// 3. Run individual tests:
await testGetMyReferralInfo()
await testCompleteReferralFlow()

// 4. Or run all tests:
await runAllTests()
*/

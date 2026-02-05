import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Award, Hash, Link as LinkIcon, Copy, Check, Upload, Camera, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Account = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    loadUserPosts()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(userData)
      
      // Load avatar if exists
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        setUploading(false)
        return
      }

      // Resize image before upload
      const resizedFile = await resizeImage(file)
      
      const fileExt = file.name.split('.').pop()
      const { data: { user } } = await supabase.auth.getUser()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Delete old avatars for this user (optional cleanup)
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id)
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(x => `${user.id}/${x.name}`)
        await supabase.storage.from('avatars').remove(filesToRemove)
      }

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedFile, { 
          cacheControl: '3600',
          upsert: false 
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      console.log('Public URL:', publicUrl)

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      setAvatarUrl(publicUrl)
      
      // Reload profile to get fresh data
      await loadProfile()
      
      alert('Avatar uploaded successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert(`Error uploading avatar: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Helper function to resize images
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 400 // Max width/height
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          }, 'image/jpeg', 0.9)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      const referralUrl = `${window.location.origin}/join/${profile.referral_code}`
      navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const loadUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch posts by current user using the view
      const { data: postsData, error: postsError } = await supabase
        .from('posts_with_users')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      if (!postsData || postsData.length === 0) {
        setPosts([])
        return
      }

      // Get likes and comments counts
      const postIds = postsData.map(p => p.id)
      
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds)
      
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds)

      // Process posts
      const processedPosts = postsData.map((post) => {
        const postLikes = likesData?.filter(l => l.post_id === post.id) || []
        const postComments = commentsData?.filter(c => c.post_id === post.id) || []

        return {
          post_id: post.id,
          user_id: post.user_id,
          user_display_name: post.display_name || 'Unknown User',
          user_email: '',
          user_avatar: post.user_avatar || null,
          user_points: post.user_points || 0,
          content: post.content || '',
          image_url: post.image_url || null,
          media_type: post.media_type || null,
          created_at: post.created_at,
          likes_count: postLikes.length,
          comments_count: postComments.length,
          is_liked_by_user: postLikes.some(l => l.user_id === user.id)
        }
      })

      setPosts(processedPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  const toggleLike = async (postId, currentlyLiked) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Optimistically update UI
      setPosts(posts.map(post => 
        post.post_id === postId 
          ? { 
              ...post, 
              is_liked_by_user: !currentlyLiked,
              likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ))

      // Call the toggle function
      const { error } = await supabase
        .rpc('toggle_post_like', {
          p_post_id: postId,
          p_user_id: user.id
        })

      if (error) throw error
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert on error
      await loadUserPosts()
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const seconds = Math.floor((now - posted) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return posted.toLocaleDateString()
  }

  const getInitials = (name, email) => {
    if (name && name !== email) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || '?'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-gholink-blue">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">Account</h1>
        <p className="text-sm md:text-base text-gray-600">View your profile information</p>
      </div>

      {/* Profile Card */}
      <div className="duolingo-card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6 pb-6 border-b border-gray-200">
          {/* Avatar Upload */}
          <div className="relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gholink-blue shadow-lg"
                onError={(e) => {
                  console.error('Image failed to load:', avatarUrl)
                  e.target.style.display = 'none'
                  e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-gholink-blue shadow-lg fallback-avatar ${avatarUrl ? 'hidden' : ''}`}
            >
              {profile?.display_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            {/* Upload Button Overlay */}
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <Camera className="text-white" size={24} />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
            />
          </div>
          
          <div className="text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              {profile?.display_name || 'User'}
            </h2>
            <p className="text-sm md:text-base text-gray-600">{profile?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Click avatar to upload photo</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3 md:space-y-4">
          {/* Display Name */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gholink-blue/10 flex items-center justify-center flex-shrink-0">
              <User className="text-gholink-blue" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-500 mb-1">Display Name</p>
              <p className="text-base md:text-lg font-semibold text-gray-900">
                {profile?.display_name || 'Not set'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gholink-cyan/10 flex items-center justify-center flex-shrink-0">
              <Mail className="text-gholink-cyan" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900">{profile?.email}</p>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="text-yellow-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.points?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Referral Code */}
          {profile?.referral_code && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Hash className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Referral Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {profile.referral_code}
                  </p>
                  <button
                    onClick={copyReferralCode}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy referral link"
                  >
                    {copied ? (
                      <Check className="text-green-600" size={18} />
                    ) : (
                      <Copy className="text-gray-500" size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Referral Link */}
          {profile?.referral_code && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gholink-blue/10 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="text-gholink-blue" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg flex-1 overflow-x-auto">
                    {window.location.origin}/join/{profile.referral_code}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="duolingo-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-gholink-blue mb-1">
            {profile?.points?.toLocaleString() || '0'}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Total Points</div>
        </div>
        <div className="duolingo-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-gholink-cyan mb-1">
            {profile?.level || '1'}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Current Level</div>
        </div>
        <div className="duolingo-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
            {profile?.rank || 'Unranked'}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Rank</div>
        </div>
      </div>

      {/* My Posts Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Posts</h2>
        
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-gholink-blue" size={40} />
          </div>
        ) : posts.length === 0 ? (
          <div className="duolingo-card text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Share your first post on the Feed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.post_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    {post.user_avatar ? (
                      <img 
                        src={post.user_avatar} 
                        alt={post.user_display_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-yellow flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(post.user_display_name, post.user_email)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.user_display_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatTimeAgo(post.created_at)}</span>
                        <span>•</span>
                        <span className="text-gholink-blue font-medium">{post.user_points} pts</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Media */}
                {post.image_url && (
                  <div className="relative w-full bg-black">
                    {post.media_type === 'video' ? (
                      <video 
                        src={post.image_url}
                        controls
                        className="w-full max-h-[600px] object-contain mx-auto"
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        className="w-full max-h-[600px] object-contain mx-auto"
                      />
                    )}
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.post_id, post.is_liked_by_user)}
                      className={`transition ${
                        post.is_liked_by_user ? 'text-red-500' : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <Heart size={24} className={post.is_liked_by_user ? 'fill-current' : ''} />
                    </button>
                    
                    <button className="text-gray-700 hover:text-gray-900 transition">
                      <MessageCircle size={24} />
                    </button>
                    
                    <button className="text-gray-700 hover:text-gray-900 transition">
                      <Share2 size={24} />
                    </button>

                    <button className="ml-auto text-gray-700 hover:text-gray-900 transition">
                      <Bookmark size={24} />
                    </button>
                  </div>

                  <div className="font-semibold text-sm text-gray-900">
                    {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
                  </div>

                  {post.content && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900 mr-2">{post.user_display_name}</span>
                      <span className="text-gray-800 whitespace-pre-wrap">{post.content}</span>
                    </div>
                  )}

                  {post.comments_count > 0 && (
                    <button className="text-sm text-gray-500 hover:text-gray-700 transition">
                      View all {post.comments_count} comments
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Account

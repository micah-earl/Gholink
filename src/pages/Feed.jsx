import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Send, Loader, Image as ImageIcon, Video, X, Play } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadCurrentUser()
    loadPosts()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch posts using the view with user info
      const { data: postsData, error: postsError } = await supabase
        .from('posts_with_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

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
      // Show more helpful error
      alert('Error loading feed. Make sure you ran the SQL migrations!')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      alert('Please select a valid image or video file')
      return
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setMediaFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview({
        url: reader.result,
        type: validImageTypes.includes(file.type) ? 'image' : 'video'
      })
    }
    reader.readAsDataURL(file)
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadMedia = async (userId) => {
    if (!mediaFile) return null

    try {
      const fileExt = mediaFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('feed-media')
        .upload(fileName, mediaFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('feed-media')
        .getPublicUrl(fileName)

      return {
        url: publicUrl,
        type: mediaPreview.type
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      throw error
    }
  }

  const createPost = async () => {
    if ((!newPostContent.trim() && !mediaFile) || isPosting) return

    setIsPosting(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let mediaUrl = null
      let mediaType = null

      // Upload media if present
      if (mediaFile) {
        setUploadProgress(50)
        const media = await uploadMedia(user.id)
        mediaUrl = media.url
        mediaType = media.type
      }

      setUploadProgress(75)

      // Create post
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPostContent.trim() || '',
          image_url: mediaUrl,
          media_type: mediaType
        })

      if (error) throw error

      setUploadProgress(100)

      // Clear input and reload posts
      setNewPostContent('')
      removeMedia()
      await loadPosts()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsPosting(false)
      setUploadProgress(0)
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
      await loadPosts()
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="animate-spin text-gholink-blue" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
        <p className="text-gray-600 mt-1">See what your network is up to</p>
      </div>

      {/* Create Post Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-yellow flex items-center justify-center text-white font-bold flex-shrink-0">
            {currentUser && getInitials(
              currentUser.user_metadata?.display_name,
              currentUser.email
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share an update with your network..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-gholink-blue focus:ring-2 focus:ring-gholink-blue/20 outline-none bg-gray-50 resize-none"
              rows="3"
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
                {mediaPreview.type === 'image' ? (
                  <img 
                    src={mediaPreview.url} 
                    alt="Preview" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <div className="relative">
                    <video 
                      src={mediaPreview.url} 
                      className="w-full h-auto max-h-96 object-cover"
                      controls
                    />
                  </div>
                )}
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {isPosting && uploadProgress > 0 && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gholink-blue transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              {/* Media Buttons */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPosting}
                  className="p-2 text-gholink-blue hover:bg-gholink-blue/10 rounded-lg transition disabled:opacity-50"
                  title="Add photo"
                >
                  <ImageIcon size={20} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPosting}
                  className="p-2 text-gholink-blue hover:bg-gholink-blue/10 rounded-lg transition disabled:opacity-50"
                  title="Add video"
                >
                  <Video size={20} />
                </button>
              </div>

              {/* Post Button */}
              <button
                onClick={createPost}
                disabled={(!newPostContent.trim() && !mediaFile) || isPosting}
                className="px-6 py-2 bg-gholink-blue text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPosting ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something with your network!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.post_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-yellow flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(post.user_display_name, post.user_email)}
                </div>
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

            {/* Post Media - Instagram Style */}
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

            {/* Post Actions Bar */}
            <div className="p-4 space-y-3">
              {/* Action Buttons */}
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

              {/* Like Count */}
              <div className="font-semibold text-sm text-gray-900">
                {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
              </div>

              {/* Post Content */}
              {post.content && (
                <div className="text-sm">
                  <span className="font-semibold text-gray-900 mr-2">{post.user_display_name}</span>
                  <span className="text-gray-800 whitespace-pre-wrap">{post.content}</span>
                </div>
              )}

              {/* View Comments */}
              {post.comments_count > 0 && (
                <button className="text-sm text-gray-500 hover:text-gray-700 transition">
                  View all {post.comments_count} comments
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center py-6">
          <button 
            onClick={loadPosts}
            className="px-6 py-2 text-gholink-blue hover:bg-gholink-blue/10 rounded-lg transition font-medium"
          >
            Load more posts
          </button>
        </div>
      )}
    </div>
  )
}

export default Feed

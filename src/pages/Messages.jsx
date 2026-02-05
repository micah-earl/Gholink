import { MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null)

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start a conversation!</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Chat Name</h3>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center text-gray-500">No messages</div>
              </div>
              
              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-gholink-blue focus:ring-2 focus:ring-gholink-blue/20 outline-none"
                  />
                  <button className="px-4 py-2 bg-gholink-blue text-white rounded-lg hover:bg-blue-600 transition">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages

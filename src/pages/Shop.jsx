import { ShoppingBag, Sparkles, Gift, Clock } from 'lucide-react'

const Shop = () => {
  return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        {/* Icon Section */}
        <div className="relative inline-block mb-6 md:mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gholink-blue to-gholink-blue-dark rounded-full flex items-center justify-center shadow-2xl border-b-8 border-gholink-blue-dark">
            <ShoppingBag className="text-white" size={48} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-3 md:mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Coming Soon!
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-bold text-gholink-blue mb-4 md:mb-6">
          The Gholink Shop is on its way
        </p>

        {/* Description */}
        <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Get ready to redeem your hard-earned points for amazing rewards, exclusive merchandise, and special perks!
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 px-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gholink-blue/30 hover:scale-105 transition-transform">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gholink-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Gift className="text-gholink-blue" size={24} />
            </div>
            <h3 className="text-base md:text-lg font-black text-gray-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Exclusive Rewards
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Redeem points for awesome prizes
            </p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-purple-400 hover:scale-105 transition-transform">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
            <h3 className="text-base md:text-lg font-black text-gray-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Gholink items
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Show off with branded gear
            </p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-green-400 hover:scale-105 transition-transform">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Sparkles className="text-green-600" size={24} />
            </div>
            <h3 className="text-base md:text-lg font-black text-gray-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Special Perks
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Unlock premium benefits
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-gholink-blue to-gholink-blue-dark rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 border-b-4 md:border-b-8 border-gholink-blue-dark max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Clock className="text-white" size={24} />
            <h3 className="text-xl md:text-2xl font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Stay Tuned!
            </h3>
          </div>
          <p className="text-sm md:text-base text-white/90 font-semibold mb-4 md:mb-6">
            Keep recruiting and earning points. When the shop launches, you'll be ready to claim your rewards!
          </p>
          <div className="bg-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 backdrop-blur">
            <p className="text-base md:text-lg font-black text-white">
              💎 Start earning points now and be first in line when we launch! 💎
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop

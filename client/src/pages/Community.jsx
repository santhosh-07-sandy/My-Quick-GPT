import React, { useEffect, useState } from 'react'
import { dummyPublishedImages } from '../assets/assets'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Community = () => {

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const { axios, theme } = useAppContext()

  const fetchImages = async () => {
    try {
      const { data } = await axios.get('/api/user/published-images')
      if (data.success) {
        setImages(data.images)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='flex-1 h-screen overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-transparent transition-colors duration-500'>
      <div className='max-w-[1600px] mx-auto p-6 pt-12 md:pt-20 lg:px-12'>

        {/* Page Header */}
        <div className='mb-12 animate-in fade-in slide-in-from-left-4 duration-700'>
          <h2 className='text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent'>
            Community Showcase
          </h2>
          <p className='text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium'>
            Explore the most stunning AI-generated creations from our members.
          </p>
        </div>

        {/* Masonry / Grid Container */}
        {images.length > 0 ? (
          <div className='columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'>
            {images.map((item, index) => (
              <div
                key={index}
                className='relative group break-inside-avoid rounded-3xl overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 animate-in fade-in zoom-in-95 duration-700'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Component */}
                <img
                  src={item.imageUrl}
                  alt="AI Art"
                  className='w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out'
                />

                {/* Glassmorphism Hover Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5'>
                  <div className='flex items-center justify-between gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>

                    {/* Creator Info */}
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg'>
                        {item.userName?.slice(0, 1) || 'A'}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-white text-xs font-bold truncate'>{item.userName || 'Anonymous'}</p>
                        <p className='text-white/60 text-[10px] font-medium'>Published Piece</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className='flex gap-2'>
                      <a
                        href={item.imageUrl}
                        target='_blank'
                        rel="noreferrer"
                        className='p-2 rounded-xl bg-white/10 hover:bg-white text-white hover:text-purple-600 backdrop-blur-md transition-all'
                      >
                        <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Subtle Border Glow (Desktop Only) */}
                <div className='absolute inset-0 pointer-events-none border border-white/0 group-hover:border-purple-500/20 transition-colors duration-500 rounded-3xl'></div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000'>
            <div className='w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6'>
              <img src={assets.gallery_icon} className='w-8 opacity-20 dark:invert' alt="Empty" />
            </div>
            <p className='text-gray-400 dark:text-gray-500 font-bold text-lg'>The gallery is currently quiet.</p>
            <p className='text-gray-400 text-xs mt-2'>Be the first to publish your creative AI images!</p>
          </div>
        )}
      </div>
    </div>
  )
}


export default Community

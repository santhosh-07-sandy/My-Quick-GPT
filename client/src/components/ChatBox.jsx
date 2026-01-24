import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const { selectedChat, theme, user, axios, token, setUser } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const onSubmit = async (e) => {
    try {
      e.preventDefault()
      if (!user) return toast('Login to send message')
      setLoading(true)
      const promptCopy = prompt
      setPrompt('')
      setMessages(prev => [...prev, { role: 'user', content: prompt, timestamp: Date.now(), isImage: false }])

      if (!selectedChat) return toast.error('No chat selected')
      const { data } = await axios.post(`/api/message/${mode}`, { chatId: selectedChat._id, prompt, isPublished }, { headers: { Authorization: token } })

      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        // decrease credits
        if (mode === 'image') {
          setUser(prev => ({ ...prev, credits: prev.credits - 2 }))
        } else {
          setUser(prev => ({ ...prev, credits: prev.credits - 1 }))
        }
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPrompt('')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>

      {/* Chat Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="" className='w-full max-w-56 sm:max-w-68' />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>Ask me anything.</p>
          </div>
        )}

        {messages.map((message, index) => <Message key={index} message={message} />)}

        {/* Three Dots Loading  */}
        {
          loading && <div className='loader flex items-center gap-1.5 ml-1 my-4'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        }
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer' checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        </label>
      )}

      {/* Prompt Input Box */}
      <div className='bg-primary/20 dark:bg-[#583C79]/30 rounded-full w-full max-w-2xl mx-auto relative group'>

        {/* Animated Border Effect - Contained in its own mask layer to allow dropdown overflow */}
        <div className='absolute inset-0 rounded-full overflow-hidden pointer-events-none'>
          <div className='absolute -inset-[50%] bg-[conic-gradient(from_0deg,transparent_0_60deg,#9333EA_120deg,transparent_180deg,transparent_240deg,#9333EA_300deg,transparent_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0_60deg,#A855F7_120deg,transparent_180deg,transparent_240deg,#A855F7_300deg,transparent_360deg)] animate-spin-slow opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500'></div>
        </div>

        <form onSubmit={onSubmit} className='relative z-10 bg-white/50 dark:bg-[#2A1838]/90 rounded-full p-2 pl-4 flex gap-3 items-center backdrop-blur-sm m-[1.5px]'>

          {/* Custom Dropdown */}
          <div className='relative flex items-center group/select min-w-[80px] sm:min-w-[100px]'>
            {/* Dropdown Trigger */}
            <div onClick={() => setShowDropdown(!showDropdown)} className='flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 w-full cursor-pointer relative z-20 font-medium text-gray-800 dark:text-white'>
              {mode === 'text' ? (
                <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500' fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
              ) : (
                <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500' fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              )}
              <span className='text-xs sm:text-sm capitalize flex-1'>{mode === 'text' ? 'Text' : 'Image'}</span>
              <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className='absolute bottom-full mb-3 left-0 w-48 bg-white/90 dark:bg-[#1E0B2B]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 animate-pop-in origin-bottom-left'>
                <div className='p-1.5 flex flex-col gap-1'>
                  <div onClick={() => { setMode('text'); setShowDropdown(false); }} className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all duration-200 group ${mode === 'text' ? 'bg-purple-100/50 dark:bg-purple-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === 'text' ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 group-hover:text-purple-500'} transition-colors`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>Text Chat</p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 leading-tight'>Chat with AI assistant</p>
                    </div>
                  </div>

                  <div onClick={() => { setMode('image'); setShowDropdown(false); }} className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all duration-200 group ${mode === 'image' ? 'bg-purple-100/50 dark:bg-purple-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === 'image' ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 group-hover:text-purple-500'} transition-colors`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>Image Gen</p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 leading-tight'>Create AI images</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backdrop to close on click outside */}
            {showDropdown && <div className='fixed inset-0 z-10' onClick={() => setShowDropdown(false)}></div>}
          </div>

          <input onChange={(e) => setPrompt(e.target.value)} value={prompt} type="text" placeholder={window.innerWidth < 640 ? "Type..." : "Type your prompt here..."} className='flex-1 w-full text-sm outline-none bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white' required />

          <button
            disabled={loading}
            className={`p-2.5 rounded-full transition-all duration-300 relative group/btn overflow-hidden
              ${loading
                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-tr from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 active:scale-90 hover:scale-110 shadow-md hover:shadow-purple-500/40'
              }`}
          >
            {/* Background Glow Effect on Hover */}
            <div className='absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300'></div>

            <img
              src={loading ? assets.stop_icon : assets.send_icon}
              className={`w-5 sm:w-6 relative z-10 transition-transform duration-300 ${!loading && 'group-hover/btn:-rotate-12'}`}
              alt=""
            />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatBox

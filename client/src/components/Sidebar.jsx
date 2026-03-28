import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from 'react-hot-toast'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

    const {
        chats,
        selectedChat,
        setSelectedChat,
        theme,
        setTheme,
        user,
        navigate,
        createNewChat,
        axios,
        setChats,
        fetchUsersChats,
        setToken,
        token
    } = useAppContext()

    const [search, setSearch] = useState('')

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        toast.success('Logged out successfully')
    }

    const deleteChat = async (e, chatId) => {
        try {
            e.stopPropagation()
            const confirm = window.confirm('Are you sure you want to delete this chat?')
            if (!confirm) return
            const { data } = await axios.post('/api/chat/delete', { chatId }, { headers: { Authorization: token } })
            if (data.success) {
                setChats(prev => prev.filter(chat => chat._id !== chatId))
                await fetchUsersChats()
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Helper to group chats by date with safety checks
    const groupedChats = (chats || []).reduce((acc, chat) => {
        if (!chat || !chat.updatedAt) return acc;
        const date = moment(chat.updatedAt);
        let group = 'Older';
        if (date.isSame(moment(), 'day')) group = 'Today';
        else if (date.isSame(moment().subtract(1, 'days'), 'day')) group = 'Yesterday';
        else if (date.isAfter(moment().subtract(7, 'days'))) group = 'Previous 7 Days';
        else if (date.isAfter(moment().subtract(30, 'days'))) group = 'Previous 30 Days';

        if (!acc[group]) acc[group] = [];
        acc[group].push(chat);
        return acc;
    }, {});

    const groups = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];

    return (
        <>
            {/* Professional Backdrop Overlay */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    className='fixed inset-0 bg-[#0A0A0B]/60 backdrop-blur-[4px] z-[60] md:hidden animate-in fade-in transition-all'
                />
            )}

            <aside className={`fixed md:sticky top-0 left-0 h-[100dvh] flex flex-col p-4 dark:bg-[#110816] bg-white border-r border-gray-100 dark:border-white/5 transition-transform duration-500 ease-out z-[70] w-72 shrink-0 ${!isMenuOpen && 'max-md:-translate-x-full'} select-none shadow-sm`}>

                {/* Header Section */}
                <div className='flex items-center justify-between mb-8 h-12 px-1'>
                    <div
                        onClick={() => navigate('/')}
                        className='flex items-center gap-2 group/logo cursor-pointer transition-all duration-300 hover:translate-x-1'
                    >
                        <img
                            src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
                            alt="Logo"
                            className='h-8 md:h-8.5 w-auto object-contain transition-transform duration-500 group-hover/logo:scale-105 active:scale-95'
                        />
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className='p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-red-500/10 md:hidden transition-all group/close'>
                        <img src={assets.close_icon} className='w-4 h-4 not-dark:invert opacity-40 group-hover/close:opacity-100 transition-opacity' alt="Close" />
                    </button>
                </div>

                {/* New Chat Action */}
                <button
                    onClick={() => { createNewChat(); setIsMenuOpen(false); }}
                    className='group flex items-center gap-3 w-full p-3.5 mb-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.98] shadow-sm'
                >
                    <div className='w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20'>
                        <span className='text-xl font-light'>+</span>
                    </div>
                    <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>New Chat</span>
                </button>

                {/* Search Box */}
                <div className='flex items-center gap-2.5 p-3 mb-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl'>
                    <img src={assets.search_icon} className='w-4 opacity-40 not-dark:invert' alt="S" />
                    <input
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                        type="text"
                        placeholder='Search history...'
                        className='w-full text-xs outline-none bg-transparent dark:text-white text-gray-800'
                    />
                </div>

                {/* Conversation List with Advanced Grouping */}
                <div className='flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4 space-y-6'>
                    {groups.map(group => {
                        const items = (groupedChats[group] || []).filter(chat =>
                            (chat && chat.messages?.[0]?.content?.toLowerCase().includes(search.toLowerCase())) ||
                            (chat && chat.name?.toLowerCase().includes(search.toLowerCase()))
                        );

                        if (items.length === 0) return null;

                        return (
                            <div key={group} className='space-y-1.5'>
                                <p className='px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest'>{group}</p>
                                {items.map(chat => {
                                    const isActive = selectedChat && selectedChat._id === chat._id;
                                    return (
                                        <div
                                            onClick={() => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }}
                                            key={chat._id}
                                            className={`group p-3 px-3.5 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200 border ${isActive
                                                ? 'bg-purple-600/10 border-purple-500/30 dark:bg-purple-500/15'
                                                : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                        >
                                            <div className='flex-1 pr-2 overflow-hidden'>
                                                <p className={`text-sm truncate ${isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                                    {chat.messages && chat.messages.length > 0 ? chat.messages[0].content : (chat.name || 'New Chat')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); deleteChat(e, chat._id); }}
                                                className={`p-1.5 rounded-lg hover:bg-red-500/10 transition-all shrink-0 ${isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <img src={assets.bin_icon} className='w-3 h-3 not-dark:invert opacity-50 hover:opacity-100' alt="x" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Tools & Profile */}
                <div className='mt-auto pt-6 border-t border-gray-100 dark:border-white/10 space-y-3 bg-white dark:bg-[#110816] sticky bottom-0'>

                    {/* Compact Actions */}
                    <div className='flex gap-2'>
                        <div onClick={() => { navigate('/community'); setIsMenuOpen(false) }} className='flex-1 flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-purple-500/20 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all group'>
                            <img src={assets.gallery_icon} className='w-3.5 sm:w-4 not-dark:invert opacity-60 group-hover:opacity-100' alt="G" />
                            <span className='text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400'>Community</span>
                        </div>
                        <div onClick={() => { navigate('/credits'); setIsMenuOpen(false) }} className='flex-1 flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-purple-500/20 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all group'>
                            <img src={assets.diamond_icon} className='w-3.5 sm:w-4 dark:invert opacity-60 group-hover:opacity-100' alt="C" />
                            <span className='text-[10px] sm:text-[11px] font-bold text-purple-600/70 dark:text-purple-400 tabular-nums'>{user?.credits || 0} cr</span>
                        </div>
                    </div>

                    {/* Preferences & Profile Card */}
                    <div className='p-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2.5'>
                                <img src={assets.theme_icon} className='w-3.5 opacity-50 not-dark:invert' alt="T" />
                                <span className='text-[11px] font-bold text-gray-400 uppercase tracking-tighter'>Theme</span>
                            </div>
                            <label className='relative inline-flex cursor-pointer transition-transform active:scale-95 scale-90'>
                                <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="checkbox" className="sr-only peer" checked={theme === 'dark'} />
                                <div className='w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-purple-600 transition-all'></div>
                                <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-4 shadow-sm'></span>
                            </label>
                        </div>

                        <div className='flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-white/5'>
                            <div className='relative shrink-0'>
                                <img src={assets.user_icon} className='w-8 h-8 rounded-lg object-cover bg-purple-100 dark:bg-purple-500/10' alt="U" />
                                <div className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-gray-50 dark:border-black rounded-full'></div>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-xs font-bold text-gray-700 dark:text-gray-100 truncate'>{user ? user.name : 'Guest Account'}</p>
                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Subscriber</p>
                            </div>
                            {user && (
                                <button onClick={logout} className='p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all' title='Logout'>
                                    <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar

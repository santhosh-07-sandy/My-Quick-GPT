import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const Login = () => {

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { axios, setToken } = useAppContext()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = state === "login" ? '/api/user/login' : '/api/user/register'

        try {
            const { data } = await axios.post(url, { name, email, password })
            if (data.success) {
                setToken(data.token)
                localStorage.setItem('token', data.token)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#050506]'>

            {/* Ultra-Premium Background Effects */}
            <div className='absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse'></div>
            <div className='absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000'></div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>

            <div className='relative z-10 w-full max-w-[420px] px-3 sm:px-4 animate-in fade-in zoom-in-95 duration-1000'>

                {/* Branding / Logo */}
                <div className='flex flex-col items-center mb-8 drop-shadow-2xl'>
                    <img
                        src={assets.logo}
                        className='w-16 h-16 mb-2 hover:rotate-12 transition-transform duration-500'
                        alt="Logo"
                    />
                    <h1 className='text-white text-2xl font-black tracking-tighter uppercase'>Quick GPT</h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 sm:gap-5 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
                >
                    <div className='text-center mb-2'>
                        <h2 className='text-2xl font-black text-white mb-1.5'>
                            {state === "login" ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className='text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]'>
                            Next-gen AI assistant
                        </p>
                    </div>

                    <div className='space-y-4'>
                        {state === "register" && (
                            <div className="relative group">
                                <div className='absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-purple-500 transition-all'>
                                    <img src={assets.user_icon} className='w-4 h-4' alt="" />
                                </div>
                                <input
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    placeholder="Your Full Name"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-gray-600 outline-none ring-0 focus:ring-2 focus:ring-purple-500/40 focus:bg-white/10 transition-all"
                                    type="text"
                                    required
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className='absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-purple-500 transition-all font-bold text-white'>
                                @
                            </div>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                placeholder="Email Address"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-gray-600 outline-none ring-0 focus:ring-2 focus:ring-purple-500/40 focus:bg-white/10 transition-all"
                                type="email"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className='absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-purple-500 transition-all'>
                                <svg className='w-4 h-4 text-white' fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
                            </div>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                placeholder="Choose Password"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-gray-600 outline-none ring-0 focus:ring-2 focus:ring-purple-500/40 focus:bg-white/10 transition-all"
                                type="password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type='submit'
                        className="mt-2 relative group overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-full py-4 rounded-2xl font-black text-sm shadow-[0_20px_40px_-10px_rgba(147,51,234,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(147,51,234,0.5)] active:scale-95 transition-all"
                    >
                        <span className='relative z-10'>{state === "register" ? "GENERATE ACCOUNT" : "ENTER PLATFORM"}</span>
                        <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300'></div>
                    </button>

                    <div className='text-center mt-2'>
                        {state === "register" ? (
                            <p className='text-xs text-gray-500'>
                                Already part of the community? <span onClick={() => setState("login")} className="text-purple-400 font-bold cursor-pointer hover:text-purple-300 transition-colors">Sign In</span>
                            </p>
                        ) : (
                            <p className='text-xs text-gray-500'>
                                New to the future? <span onClick={() => setState("register")} className="text-purple-400 font-bold cursor-pointer hover:text-purple-300 transition-colors">Join Now</span>
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer Copyright */}
                <p className='text-center text-[10px] text-gray-600 mt-8 uppercase tracking-widest font-medium'>
                    &copy; 2026 QuickGPT Systems. All Rights Reserved.
                </p>
            </div>
        </div>
    )
}

export default Login

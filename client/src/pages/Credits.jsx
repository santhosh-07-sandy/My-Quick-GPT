import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Credits = () => {

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredPlanId, setHoveredPlanId] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState(null)

  const { token, axios, user } = useAppContext()

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/credit/plan', {
        headers: { Authorization: token }
      })
      if (data.success) {
        setPlans(data.plans)
        // Auto-select the first plan or a pro plan if available
        if (data.plans.length > 0) {
          const proPlan = data.plans.find(p => p.name.toLowerCase().includes('pro'));
          setSelectedPlanId(proPlan ? proPlan._id : data.plans[0]._id);
        }
      } else {
        toast.error(data.message || 'Failed to fetch plans.')
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post('/api/credit/purchase', { planId }, { headers: { Authorization: token } })
      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='flex-1 h-screen overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent transition-colors duration-500'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>

        {/* Header Section */}
        <div className='text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700'>
          <h2 className='text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent italic'>
            Ready for more?
          </h2>
          <p className='text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base'>
            Select your preferred credit bundle. Your selection will be highlighted for a faster checkout experience.
          </p>
          <div className='mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10'>
            <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
            <span className='text-sm font-bold text-gray-700 dark:text-gray-200'>Available: {user?.credits || 0} Credits</span>
          </div>
        </div>

        {/* Plans Container */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto px-2'>
          {plans.map((plan, index) => {
            const isHovered = hoveredPlanId === plan._id;
            const isSelected = selectedPlanId === plan._id;
            const isProfessional = plan.name.toLowerCase().includes('pro');

            return (
              <div
                key={plan._id}
                onClick={() => setSelectedPlanId(plan._id)}
                onMouseEnter={() => setHoveredPlanId(plan._id)}
                onMouseLeave={() => setHoveredPlanId(null)}
                className={`group relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 duration-700 cursor-pointer
                  ${isHovered || isSelected
                    ? 'scale-105 -translate-y-2'
                    : 'scale-100 translate-y-0'}
                  ${isSelected
                    ? 'bg-white dark:bg-[#1E0B2B]/90 ring-[3px] ring-purple-600 shadow-2xl shadow-purple-600/30'
                    : 'bg-white/80 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl'
                  } backdrop-blur-3xl overflow-hidden`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Active Selection Glow */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-transparent transition-opacity duration-700 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* Status Indicator */}
                <div className={`absolute top-6 left-6 flex items-center gap-1.5 transition-all duration-500 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  <div className='w-2 h-2 rounded-full bg-purple-600'></div>
                  <span className='text-[10px] font-black uppercase tracking-tighter text-purple-600'>Active Choice</span>
                </div>

                {/* Popular Badge */}
                {isProfessional && (
                  <div className='absolute top-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-[9px] font-black text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg'>
                    Most Popular
                  </div>
                )}

                <div className='relative flex-1 mt-6'>
                  <div className='flex items-center gap-3 mb-8'>
                    <div className={`p-2.5 rounded-2xl transition-all duration-500 ${isSelected ? 'bg-purple-600 text-white translate-x-1' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                      <img src={assets.diamond_icon} className={`w-6 h-6 ${!isSelected && 'dark:invert opacity-60'}`} alt="D" />
                    </div>
                    <h3 className={`text-xl font-black transition-colors ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'dark:text-white'}`}>{plan.name}</h3>
                  </div>

                  <div className='mb-10'>
                    <div className={`flex items-baseline gap-1.5 transition-transform duration-500 ${isSelected ? 'scale-110 origin-left' : ''}`}>
                      <span className={`text-5xl font-black transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>${plan.price}</span>
                      <span className='text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-widest'>USD</span>
                    </div>
                    <div className='flex items-center gap-2 mt-4'>
                      <div className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${isSelected ? 'bg-gradient-to-r from-purple-600 to-blue-500 w-full' : 'bg-gray-200 dark:bg-white/10 w-12'}`}></div>
                    </div>
                    <p className={`text-[11px] font-black mt-4 transition-colors tracking-widest uppercase ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                      {plan.credits.toLocaleString()} PACK CREDITS
                    </p>
                  </div>

                  <ul className='space-y-4 mb-10'>
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className='flex items-start gap-3 group/item'>
                        <div className={`mt-0.5 p-1 rounded-lg transition-colors ${isSelected ? 'bg-green-500/10 text-green-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                          <svg className='w-3.5 h-3.5' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className={`text-[13px] font-medium leading-relaxed transition-colors ${isSelected ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); toast.promise(purchasePlan(plan._id), { loading: 'Preparing checkout...', success: 'Redirecting to payment...', error: (err) => err.message }); }}
                  className={`relative w-full py-4.5 text-sm font-black rounded-2xl transition-all active:scale-[0.95] overflow-hidden group/btn
                    ${isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-600/40'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-purple-600 hover:text-white'
                    }`}
                >
                  <span className='relative z-10'>{isSelected ? 'CONFIRM & PURCHASE' : 'SELECT THIS PACK'}</span>
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300'></div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <p className='text-center mt-12 text-xs text-gray-400 dark:text-gray-600 max-w-md mx-auto'>
          All transactions are secured and encrypted. Credits are added instantly to your account upon successful payment.
        </p>
      </div>
    </div>
  )
}

export default Credits

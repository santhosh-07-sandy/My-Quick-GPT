import React, { useEffect, useState, useRef, useCallback } from 'react'
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

  const { setUser } = useAppContext();
  const paymentWindowRef = useRef(null);

  const checkPaymentStatus = useCallback(async () => {
    try {
      console.log('Checking payment status...');
      if (!token) {
        console.error('No auth token found');
        toast.error('Authentication error. Please log in again.');
        return;
      }

      const userResponse = await axios.get('/api/user/data', {
        headers: {
          'Authorization': token,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('User response:', userResponse.data);

      if (userResponse.data?.success && userResponse.data.user) {
        console.log('Updating user credits:', userResponse.data.user.credits);
        setUser(userResponse.data.user);
        toast.success(`Payment successful! You now have ${userResponse.data.user.credits} credits.`);
      } else {
        console.error('Invalid user response:', userResponse.data);
        toast.error('Failed to update credits. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Error updating credits. Please refresh the page or contact support.');
    }
  }, [setUser, token]);

  const purchasePlan = useCallback(async (planId) => {
    try {
      console.log('Initiating purchase for plan:', planId);
      const { data } = await axios.post(
        '/api/credit/purchase',
        { planId },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Purchase response:', data);

      if (data?.success && data.url) {
        console.log('Opening payment URL:', data.url);
        // Open payment in new tab
        paymentWindowRef.current = window.open(data.url, '_blank');

        if (!paymentWindowRef.current) {
          throw new Error('Popup was blocked. Please allow popups for this site.');
        }

        // Check for payment completion every 2 seconds
        const checkInterval = setInterval(async () => {
          try {
            if (paymentWindowRef.current?.closed) {
              console.log('Payment window closed, checking status...');
              clearInterval(checkInterval);
              await checkPaymentStatus();
            }
          } catch (error) {
            console.error('Error in payment check interval:', error);
            clearInterval(checkInterval);
            toast.error('Error verifying payment status. Please refresh the page to check your balance.');
          }
        }, 2000);

        // Stop checking after 10 minutes
        const timeoutId = setTimeout(() => {
          console.log('Payment check timeout reached');
          clearInterval(checkInterval);
        }, 10 * 60 * 1000);

        // Cleanup on unmount
        return () => {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
        };
      } else {
        console.error('Invalid purchase response:', data);
        throw new Error(data?.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'An error occurred while processing your payment');
    }
  }, [token, checkPaymentStatus]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (payment === 'success' && sessionId && token) {
      const verifyCheckout = async () => {
        try {
          toast.loading('Verifying payment...', { id: 'verify' });
          const { data } = await axios.post('/api/credit/verify', { sessionId }, {
            headers: { Authorization: token }
          });
          
          if (data.success) {
            toast.success(data.message || 'Payment successful!', { id: 'verify' });
            // Refresh user credits
            const userResponse = await axios.get('/api/user/data', { headers: { Authorization: token } });
            if (userResponse.data?.success) {
                setUser(userResponse.data.user);
            }
          } else {
            toast.error(data.message || 'Payment verification failed', { id: 'verify' });
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Verification error', { id: 'verify' });
        } finally {
          window.history.replaceState({}, '', '/credits');
        }
      };
      
      verifyCheckout();
    } else if (payment === 'cancelled') {
        toast.error('Payment was cancelled');
        window.history.replaceState({}, '', '/credits');
    }
  }, [token, axios, setUser]);

  useEffect(() => {
    fetchPlans()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='flex-1 lg:h-screen overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent transition-colors duration-500 flex flex-col justify-center'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>

        {/* Header Section */}
        <div className='text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent italic'>
            Ready for more?
          </h2>
          <p className='text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-xs md:text-sm lg:text-base'>
            Select your preferred credit bundle. Your selection will be highlighted for a faster checkout experience.
          </p>
          <div className='mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10'>
            <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
            <span className='text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200'>Available: {user?.credits || 0} Credits</span>
          </div>
        </div>

        {/* Plans Container - horizontal snap scroll on mobile, grid on md+ */}
        <div className='flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 items-stretch max-w-6xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-auto md:px-2'>
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
                className={`group relative flex flex-col p-6 lg:p-7 rounded-[2.5rem] transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 duration-700 cursor-pointer snap-center shrink-0 w-[80vw] sm:w-[70vw] md:w-auto
                  ${isHovered || isSelected
                    ? 'scale-[1.03] -translate-y-2'
                    : 'scale-100 translate-y-0'}
                  ${isSelected
                    ? 'bg-white dark:bg-[#1E0B2B]/90 ring-[3.5px] ring-purple-600 shadow-2xl shadow-purple-600/30'
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

                <div className='relative flex-1 mt-4'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className={`p-2 rounded-xl transition-all duration-500 ${isSelected ? 'bg-purple-600 text-white translate-x-1' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                      <img src={assets.diamond_icon} className={`w-5 h-5 ${!isSelected && 'dark:invert opacity-60'}`} alt="D" />
                    </div>
                    <h3 className={`text-lg font-black transition-colors ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'dark:text-white'}`}>{plan.name}</h3>
                  </div>

                  <div className='mb-6 lg:mb-8'>
                    <div className={`flex items-baseline gap-1.5 transition-transform duration-500 ${isSelected ? 'scale-110 origin-left' : ''}`}>
                      <span className={`text-4xl lg:text-5xl font-black transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>${plan.price}</span>
                      <span className='text-gray-400 dark:text-gray-500 font-bold uppercase text-[9px] tracking-widest'>USD</span>
                    </div>
                    <div className='flex items-center gap-2 mt-3'>
                      <div className={`h-1 rounded-full transition-all duration-1000 ease-out ${isSelected ? 'bg-gradient-to-r from-purple-600 to-blue-500 w-full' : 'bg-gray-200 dark:bg-white/10 w-12'}`}></div>
                    </div>
                    <p className={`text-[10px] font-black mt-3 transition-colors tracking-widest uppercase ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                      {plan.credits.toLocaleString()} PACK CREDITS
                    </p>
                  </div>

                  <ul className='space-y-3 mb-8 lg:mb-10'>
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className='flex items-start gap-3 group/item'>
                        <div className={`mt-0.5 p-0.5 rounded-lg transition-colors ${isSelected ? 'bg-green-500/10 text-green-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                          <svg className='w-3 h-3' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className={`text-[12px] lg:text-[13px] font-medium leading-relaxed transition-colors ${isSelected ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{feature}</span>
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
        <p className='text-center mt-8 text-[10px] lg:text-xs text-gray-400 dark:text-gray-600 max-w-md mx-auto'>
          All transactions are secured and encrypted. Credits are added instantly to your account upon successful payment.
        </p>
      </div>
    </div>
  )
}

export default Credits

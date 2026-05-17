import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Crown, ArrowRight, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PricingPage = ({ user, token, onBack, onUpgradeSuccess }) => {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan) => {
    if (plan.isCurrent || plan.name === 'Enterprise') return; // Enterprise is contact sales
    
    setLoadingPlan(plan.name);
    
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoadingPlan(null);
      return;
    }

    try {
      // 1. Create order on backend
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(plan.price),
          planName: plan.name
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const { order } = orderData;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'IDR AI',
        description: `Upgrade to ${plan.name} Plan`,
        image: '/images/logo.png',
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify payment on backend
            const verifyRes = await fetch(`${API_URL}/payments/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: plan.name
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onUpgradeSuccess(verifyData.user);
            } else {
              alert('Payment verification failed: ' + verifyData.error);
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Something went wrong during verification.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment initiation failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for exploring the power of IDR AI.",
      features: ["Basic Gemini models", "50 messages per day", "Standard response speed", "Community support"],
      color: "from-gray-500 to-gray-700",
      icon: <Zap size={24} className="text-gray-400" />,
      buttonText: "Current Plan",
      isCurrent: (user?.plan || 'free') === 'free'
    },
    {
      name: "Pro",
      price: "19",
      description: "Unleash the full potential of advanced AI models.",
      features: [
        "Advanced Gemini Pro & DeepSeek", 
        "Unlimited messages", 
        "2x faster response speed", 
        "Priority email support",
        "Custom theme persistence"
      ],
      color: "from-blue-500 to-indigo-600",
      icon: <Crown size={24} className="text-blue-400" />,
      buttonText: (user?.plan === 'pro') ? "Current Plan" : "Upgrade to Pro",
      popular: true,
      isCurrent: user?.plan === 'pro'
    },
    {
      name: "Enterprise",
      price: "49",
      description: "Maximum power and security for professional teams.",
      features: [
        "Everything in Pro",
        "Early access to new models",
        "Custom API integration",
        "24/7 dedicated support",
        "Advanced analytics dashboard"
      ],
      color: "from-emerald-500 to-teal-600",
      icon: <Shield size={24} className="text-emerald-400" />,
      buttonText: (user?.plan === 'enterprise') ? "Current Plan" : "Contact Sales",
      isCurrent: user?.plan === 'enterprise'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 overflow-y-auto p-6 md:p-12 bg-[var(--bg-panel)] relative"
    >
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-6"
          >
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Pricing Plans</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to supercharge your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">workflow?</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose the plan that's right for you. Whether you're just starting out or scaling an enterprise, we've got you covered.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[2.5rem] bg-[#111827]/60 backdrop-blur-xl border ${plan.popular ? 'border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'border-gray-800'} transition-all hover:translate-y-[-8px] group`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} p-2.5 flex items-center justify-center mb-6 shadow-lg`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-500 ml-2 font-medium">/month</span>
                </div>
              </div>

              <div className="flex-1 mb-10 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start space-x-3 text-sm text-gray-300">
                    <div className="mt-1 p-0.5 bg-emerald-500/20 rounded-full">
                      <Check size={12} className="text-emerald-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleUpgrade(plan)}
                disabled={plan.isCurrent || loadingPlan}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center group ${
                  plan.isCurrent 
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700' 
                    : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20'
                      : 'bg-white hover:bg-gray-100 text-black'
                }`}
              >
                {loadingPlan === plan.name ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>{plan.buttonText}</span>
                    {!plan.isCurrent && plan.name !== 'Enterprise' && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
           <button 
             onClick={onBack}
             className="text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center mx-auto"
           >
             Continue with current plan
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingPage;


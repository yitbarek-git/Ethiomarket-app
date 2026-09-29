import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2, Sparkles } from "lucide-react";

interface StaticViewsProps {
  viewType: "about" | "contact";
}

export default function StaticViews({ viewType }: StaticViewsProps) {
  // Contact Form state
  const [conName, setConName] = useState("");
  const [conEmail, setConEmail] = useState("");
  const [conMsg, setConMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conName && conEmail && conMsg) {
      setSubmitted(true);
      setConName("");
      setConEmail("");
      setConMsg("");
    }
  };

  if (viewType === "about") {
    return (
      <div className="space-y-16 max-w-4xl mx-auto py-4">
        {/* Story Intro */}
        <section className="text-center space-y-4">
          <div className="inline-flex py-1 px-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-mono font-bold uppercase tracking-wider items-center gap-1.5 mx-auto">
            <Sparkles className="w-3.5 h-3.5" /> Our Mission
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 leading-none">About EthioMarket</h1>
          <p className="text-neutral-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Connecting buyers and sellers across Ethiopia. We make it easy to find quality goods, negotiate prices directly, and pay safely using Telebirr, Chapa, or cash on delivery.
          </p>
        </section>

        {/* Narrative columns */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Built for Ethiopian Trade</h2>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-normal">
              For generations, marketplaces like Merkato and Shiro Meda have brought people together to trade, bargain, and connect. EthioMarket brings this everyday experience online.
            </p>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-normal">
              Whether you are looking for electronics in Bole, traditional handwoven dresses in Shiro Meda, or fresh specialty coffee from Sidama, our marketplace makes browsing and direct messaging simple for everyone.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video h-64 border border-amber-100/50">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80" 
              alt="Artisans trade" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* Core Pillars */}
        <section className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100 text-left space-y-6">
          <h3 className="font-sans font-bold text-neutral-900 text-lg border-b border-neutral-100 pb-3">How EthioMarket Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-600">
            <div className="space-y-2">
              <span className="text-amber-500 text-xl font-bold font-mono">01.</span>
              <h4 className="font-bold text-neutral-850 text-sm">Free for Local Sellers</h4>
              <p className="leading-relaxed font-normal">Individual sellers, students, and artisans can list their items easily without upfront fees.</p>
            </div>
            <div className="space-y-2">
              <span className="text-amber-500 text-xl font-bold font-mono">02.</span>
              <h4 className="font-bold text-neutral-850 text-sm">Direct Bargaining & Chat</h4>
              <p className="leading-relaxed font-normal">Message sellers directly to ask about conditions, negotiate fair prices, and arrange safe public meetups.</p>
            </div>
            <div className="space-y-2">
              <span className="text-amber-500 text-xl font-bold font-mono">03.</span>
              <h4 className="font-bold text-neutral-850 text-sm">Local Payment Options</h4>
              <p className="leading-relaxed font-normal">Pay using Telebirr mobile money, Chapa debit cards and CBE Birr, or cash on delivery.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // CONTACT VIEW
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Contact Us</h1>
        <p className="text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed">
          Have questions about buying, selling, or payments on EthioMarket? Get in touch with our team in Addis Ababa.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column Contact info */}
        <div className="space-y-6 text-left">
          <h2 className="text-xl font-bold text-neutral-950">Contact Information</h2>
          
          <div className="space-y-4 font-mono text-xs text-neutral-600 font-medium">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Email</span>
                <span className="text-neutral-800">support@ethiomarket.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Phone</span>
                <span className="text-neutral-800">+251 911 000000</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Office</span>
                <span className="text-neutral-800">Bole, Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>

          {/* Simple simulated maps iframe */}
          <div className="rounded-2xl overflow-hidden border border-neutral-200 h-44 bg-neutral-100 flex items-center justify-center p-4 text-center">
            <div className="text-neutral-400 space-y-1">
              <MapPin className="w-6 h-6 mx-auto text-red-500 animate-bounce" />
              <p className="text-[10px] font-mono uppercase tracking-wider font-bold">bole office coordinates map</p>
              <p className="text-[9px] text-neutral-450">District 03, Shala Park Office blocks</p>
            </div>
          </div>
        </div>

        {/* Right Column message form */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 relative">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 leading-none">Inquiry Transmitted!</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Thank you. Your message has been routed to EthioMarket's regional queue. We will contact you at your provided email coordinate.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
              <h3 className="font-sans font-bold text-neutral-900 text-sm border-b border-neutral-50 pb-2">Direct Message</h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">My Name</label>
                <input
                  type="text"
                  placeholder="e.g. Almaz Kebede"
                  value={conName}
                  onChange={(e) => setConName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-neutral-700 text-xs bg-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">My Email Address</label>
                <input
                  type="email"
                  placeholder="almaz@example.com"
                  value={conEmail}
                  onChange={(e) => setConEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-neutral-700 text-xs bg-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Inquiry Text</label>
                <textarea
                  placeholder="Ask and clarify specifications about listings verification, payment gateways, or layout assistance..."
                  value={conMsg}
                  onChange={(e) => setConMsg(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs bg-white outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 text-white font-semibold rounded-xl text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Mail, ShieldCheck, Lock, User, Sparkles, MapPin, Phone, UserCheck, Building2 } from "lucide-react";
import { useMarketStore } from "../store";

export default function LoginRegister() {
  const { setUser, addNotification, setCurrentPage } = useMarketStore();
  const [activeMode, setActiveMode] = useState<"login" | "register">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+251"); 
  const [location, setLocation] = useState("Bole, Addis Ababa");
  const [role, setRole] = useState<"BUYER" | "VENDOR">("BUYER");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const apiPath = activeMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const bodyPayload = activeMode === "login"
      ? { email, password }
      : { name, email, password, phone, location, role };

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.data.user, data.data.token);
        addNotification(
          activeMode === "login"
            ? `Welcome back to EthioMarket, ${data.data.user.name}!`
            : "Registration complete! Welcome to the marketplace."
        );
        setCurrentPage("home");
      } else {
        setErrorMsg(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to communicate with Auth controllers on the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xl p-6 sm:p-8 space-y-6">
      {/* Branding Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex py-1 px-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-mono font-bold uppercase tracking-wider items-center gap-1.5 mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          ethiopian virtual traditional market
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">EthioMarket Connect</h2>
        <p className="text-xs text-neutral-500">Join Addis Ababa's largest online barter community</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-neutral-100 p-1 rounded-xl shrink-0">
        <button
          onClick={() => {
            setActiveMode("login");
            setErrorMsg("");
          }}
          className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${activeMode === "login" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveMode("register");
            setErrorMsg("");
          }}
          className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${activeMode === "register" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
        >
          Register
        </button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {activeMode === "register" && (
          <>
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Yitbarek K"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500"
                />
                <User className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
              </div>
            </div>

            {/* Role selecting toggle */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Select Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={`py-2 rounded-xl text-[10px] font-mono font-bold cursor-pointer border flex items-center justify-center gap-1 transition-all ${role === "BUYER"
                      ? "bg-neutral-950 border-neutral-950 text-white"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Buyer Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole("VENDOR")}
                  className={`py-2 rounded-xl text-[10px] font-mono font-bold cursor-pointer border flex items-center justify-center gap-1 transition-all ${role === "VENDOR"
                      ? "bg-neutral-950 border-neutral-950 text-white"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Retail Vendor
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Mobile Phone (verification)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+251 9......"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500"
                />
                <Phone className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
              </div>
            </div>

            {/* Geographical Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Location city</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Bahir Dar, Ethiopia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500"
                />
                <MapPin className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
              </div>
            </div>
          </>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono block">E-Mail Address</label>
          <div className="relative">
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500 bg-white"
            />
            <Mail className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono block">Password Key</label>
          <div className="relative">
            <input
              type="password"
              placeholder="e.g. password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500 bg-white"
            />
            <Lock className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-md disabled:opacity-50 transition-colors"
        >
          {loading
            ? "Authorizing account state..."
            : activeMode === "login"
              ? "Complete Sign In"
              : "Register New Account"
          }
        </button>
      </form>

      {/* Developer Sandbox Hints */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] leading-relaxed text-neutral-700 font-serif">
        <strong>Demo Sandbox Profiles (Seed data):</strong> <br />
        • Buyer : <code className="font-mono bg-white px-1">buyer@gmail.com</code> + code <code className="font-mono bg-white px-1">password</code> <br />
        • Vendor : <code className="font-mono bg-white px-1">vendor@ethio.com</code> + code <code className="font-mono bg-white px-1">password</code> <br />
        • Admin : <code className="font-mono bg-white px-1">admin@gmail.com</code> + code <code className="font-mono bg-white px-1">password</code>
      </div>
    </div>
  );
}
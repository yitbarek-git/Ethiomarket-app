import React, { useState, useRef, useEffect } from "react";
import { useMarketStore } from "../store";
import { Product } from "../types";
import { 
  Sparkles, X, Send, Bot, User as UserIcon, ShoppingBag, 
  ExternalLink, Check, RefreshCw, ChevronDown, Database,
  ArrowRight, ShieldCheck, HelpCircle
} from "lucide-react";
import MySQLStatusModal from "./MySQLStatusModal";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

const STARTER_PROMPTS = [
  { label: "📱 Phones under 20k ETB", prompt: "Find me a good phone under 20,000 ETB" },
  { label: "💻 Used laptops", prompt: "Find used laptops in Addis Ababa" },
  { label: "☕ Specialty Coffee", prompt: "What specialty coffee beans are available on EthioMarket?" },
  { label: "👗 Habesha Kemis", prompt: "Show authentic Habesha Kemis listings" },
  { label: "💳 Payments & Delivery", prompt: "How do Telebirr payments and pickup work?" },
  { label: "🏪 How to sell", prompt: "How do I list an item for sale?" },
];

export default function AIAssistant() {
  const { 
    isAiOpen, 
    setAiOpen, 
    setCurrentPage, 
    addToCart, 
    addNotification, 
    language, 
    user 
  } = useMarketStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! Welcome to EthioMarket.\n\nAsk about available products, check prices in ETB, or get details on Telebirr, Chapa, and delivery across Ethiopia.\n\nWhat are you looking for today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAiOpen) {
      scrollToBottom();
    }
  }, [isAiOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        context: {
          language,
          userName: user?.name,
          userRole: user?.role,
          location: user?.location || "Addis Ababa, Ethiopia",
        },
      };

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.data.reply,
          recommendedProducts: data.data.recommendedProducts || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || "Could not fetch assistant response");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `Could not connect to the assistant right now. You can continue searching or browse listings directly in the Marketplace.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    setCurrentPage("product-details", productId);
    setAiOpen(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    addNotification(`Added ${product.title} to your cart`);
  };

  return (
    <>
      {/* 1. FLOATING ASSISTANT TRIGGER BUTTON */}
      {!isAiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 group flex items-center gap-2 bg-neutral-950 hover:bg-neutral-900 text-white p-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border border-neutral-800 transition-all transform hover:scale-105 cursor-pointer"
          title="Shopping Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-neutral-950" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-950 rounded-full"></span>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              Marketplace Help
            </span>
            <span className="text-[10px] text-neutral-400">Ask about products & prices</span>
          </div>
        </button>
      )}

      {/* 2. EXPANDABLE CHAT PANEL */}
      {isAiOpen && (
        <div className="fixed inset-x-2 bottom-18 md:inset-x-auto md:right-6 md:bottom-6 z-50 w-auto md:w-[420px] h-[75vh] md:h-[580px] max-h-[85vh] bg-white border border-neutral-200 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-neutral-950 text-white border-b border-neutral-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold shadow-xs shrink-0">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Marketplace Help
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online"></span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-neutral-400">
                  Find products, prices in ETB & seller info
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setAiOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-neutral-50/80 border-b border-neutral-150 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
            {STARTER_PROMPTS.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sp.prompt)}
                disabled={loading}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition-colors cursor-pointer shrink-0"
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs bg-neutral-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2 shadow-xs ${
                    msg.role === "user"
                      ? "bg-neutral-950 text-white rounded-tr-xs"
                      : "bg-white text-neutral-850 border border-neutral-200/90 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-normal">
                    {msg.content.split("\n\n").map((para, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Render Product Recommendations directly in chat */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="pt-2 border-t border-neutral-100 space-y-2 mt-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-amber-600" />
                        Available Listings
                      </div>
                      
                      <div className="space-y-2">
                        {msg.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                          >
                            <img
                              src={p.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                              alt={p.title}
                              className="w-12 h-12 object-cover rounded-lg shrink-0 border border-neutral-200"
                            />
                            
                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-neutral-900 truncate text-[11px]">
                                {p.title}
                              </h4>
                              <div className="text-[11px] font-bold text-amber-600 font-mono">
                                {p.price.toLocaleString()} ETB
                              </div>
                              <div className="text-[9px] text-neutral-400 truncate">
                                {p.location} • {p.condition}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                onClick={() => handleProductClick(p.id)}
                                className="px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                View
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleAddToCart(p)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                Buy
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] font-mono mt-1 ${
                      msg.role === "user" ? "text-neutral-400 text-right" : "text-neutral-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-500 text-xs p-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <span className="italic">Checking available listings...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-neutral-150 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, prices in ETB, or delivery..."
                disabled={loading}
                className="flex-grow min-h-[42px] px-3.5 py-2 bg-neutral-100 border-0 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 min-h-[42px] min-w-[42px] bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400 px-1">
              <span>Supports Amharic, Oromifa, Tigrinya, Somali & English</span>
              <button 
                onClick={() => setShowDbModal(true)}
                className="hover:text-amber-600 flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Database className="w-2.5 h-2.5" />
                <span>Database</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. DIAGNOSTICS MODAL FOR MYSQL */}
      <MySQLStatusModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { groqService, loadChatHistory, saveChatHistory } from '../services/groqService';
import { dbService } from '../services/dbService';
import { getApifyUsage } from '../services/apifyService';
import { ChatSession, ChatMessage, Salon } from '../types';
import { Sparkles, Send, Trash, Plus, Image, User, Sliders, Check, RefreshCw, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AiRecommendationsPage: React.FC = () => {
  // Session lists
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Style config options
  const [faceShape, setFaceShape] = useState<string>('oval');
  const [skinTone, setSkinTone] = useState<string>('medium');
  const [hairType, setHairType] = useState<string>('wavy');
  const [budget, setBudget] = useState<string>('premium');
  
  // File upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string>('');
  
  // Input and UI states
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [allSalons, setAllSalons] = useState<Salon[]>([]);
  const [quotaCount, setQuotaCount] = useState<number>(1000);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load historical sessions
    const hist = loadChatHistory();
    if (hist.length > 0) {
      setSessions(hist);
      setActiveSessionId(hist[0].id);
    } else {
      // Create default session
      const defaultId = `sess_${Date.now()}`;
      const defaultSess: ChatSession = {
        id: defaultId,
        title: "Initial Style Consultation",
        messages: [
          {
            id: 'm1',
            role: 'assistant',
            content: "Namaste! I am Jalwaa's Style Muse. Describe what look you are trying to achieve today, or configure your physical details below. You can even upload a portrait selfie for advanced style geometric mapping!",
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };
      setSessions([defaultSess]);
      setActiveSessionId(defaultId);
      saveChatHistory([defaultSess]);
    }

    // Load reference salons to perform matching overlays
    const loadSalons = async () => {
      try {
        const data = await dbService.fetchSalons({ location: 'Mumbai' });
        setAllSalons(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadSalons();

    // Check remaining Apify usage quota
    const usage = getApifyUsage();
    setQuotaCount(usage.callsLimit - usage.callsUsed);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, loading]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Create a brand new empty session
  const handleCreateNewSession = () => {
    const sId = `sess_${Date.now()}`;
    const newSess: ChatSession = {
      id: sId,
      title: `Style Query ${sessions.length + 1}`,
      messages: [
        {
          id: `m_${Date.now()}`,
          role: 'assistant',
          content: "Hello! Let's build your new signature look. Tell me your styling preference or upload an inspiration photo.",
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    const updated = [newSess, ...sessions];
    setSessions(updated);
    setActiveSessionId(sId);
    saveChatHistory(updated);
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== idToDelete);
    setSessions(updated);
    saveChatHistory(updated);

    if (activeSessionId === idToDelete) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  // Image base64 conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        // Strip headers for raw payload to pass to proxy
        const rawBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
        setBase64Image(rawBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId || (!inputMessage.trim() && !base64Image)) return;

    setLoading(true);
    const userText = inputMessage.trim() || (base64Image ? "Please analyze this uploaded style profile." : "");
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userText,
      base64Image: base64Image || undefined,
      createdAt: new Date().toISOString()
    };

    // Append to local state list immediately
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    saveChatHistory(updatedSessions);

    // Prepare full text prompt context merging styles selected
    const stylePrompt = `[Style Profile - Face Shape: ${faceShape}, Skin Tone: ${skinTone}, Hair Type: ${hairType}, Budget: ${budget}]. ${userText}`;

    // Compile entire past messages
    const currentSession = updatedSessions.find(s => s.id === activeSessionId)!;
    const historyPayload = currentSession.messages.map(m => ({
      role: (m.role || (m.sender === 'ai' ? 'assistant' : 'user')) as 'user' | 'assistant',
      content: m.id === userMsg.id ? stylePrompt : (m.content || m.text || '')
    }));

    try {
      const response = await groqService.getAIRecommendation(historyPayload, base64Image || undefined, allSalons);
      
      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        recommendedSalons: response.recommendedSalons,
        createdAt: new Date().toISOString()
      };

      // Update session title dynamically on first query
      const isFirstUserMsg = currentSession.messages.filter(m => m.role === 'user').length === 0;
      const titleUpdate = isFirstUserMsg ? userText.substring(0, 24) + "..." : currentSession.title;

      const finalSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: titleUpdate,
            messages: [...s.messages, assistantMsg]
          };
        }
        return s;
      });

      setSessions(finalSessions);
      saveChatHistory(finalSessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setImagePreview(null);
      setBase64Image('');
    }
  };

  return (
    <div className="bg-[#F4F5ED] min-h-screen grid grid-cols-1 md:grid-cols-4 items-stretch text-[#222017]" id="ai-chat-page">
      
      {/* 1. Left Sidebar: Sessions and Configurations */}
      <div className="md:col-span-1 border-r border-slate-200 bg-white p-4 flex flex-col justify-between h-[calc(100vh-80px)] overflow-y-auto">
        
        <div className="space-y-6">
          <button
            onClick={handleCreateNewSession}
            className="w-full bg-[#D6531F] hover:bg-opacity-95 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-[#D6531F]/10 cursor-pointer"
            id="btn-new-chat-session"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>

          {/* History Lists */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Previous consults</span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {sessions.map(s => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer group transition-all ${
                      isActive ? 'bg-burgundy/10 border-burgundy/20 text-burgundy font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span className="text-xs truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Style Geometric configuration panels */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-[#D6531F]" />
              <span>Face & Style Profile</span>
            </span>

            <div className="space-y-3">
              {/* Face Shape */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Face Contour Shape</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['oval', 'round', 'square', 'heart'].map(item => (
                    <button
                      key={item}
                      onClick={() => setFaceShape(item)}
                      className={`py-1 rounded-lg text-[10px] font-bold border transition-all capitalize ${
                        faceShape === item ? 'bg-[#D6531F]/10 border-[#D6531F] text-[#D6531F]' : 'border-slate-100 text-slate-500 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair texture */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Hair Texture</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['straight', 'wavy', 'curly', 'coily'].map(item => (
                    <button
                      key={item}
                      onClick={() => setHairType(item)}
                      className={`py-1 rounded-lg text-[10px] font-bold border transition-all capitalize ${
                        hairType === item ? 'bg-[#D6531F]/10 border-[#D6531F] text-[#D6531F]' : 'border-slate-100 text-slate-500 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Skin Undertone</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['light', 'medium', 'tan', 'deep'].map(item => (
                    <button
                      key={item}
                      onClick={() => setSkinTone(item)}
                      className={`py-1 rounded-lg text-[10px] font-bold border transition-all capitalize ${
                        skinTone === item ? 'bg-[#D6531F]/10 border-[#D6531F] text-[#D6531F]' : 'border-slate-100 text-slate-500 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget bracket */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Budget Bracket</label>
                <div className="grid grid-cols-3 gap-1">
                  {['budget', 'premium', 'luxury'].map(item => (
                    <button
                      key={item}
                      onClick={() => setBudget(item)}
                      className={`py-1.5 rounded-lg text-[9px] font-black border transition-all capitalize ${
                        budget === item ? 'bg-burgundy/10 border-burgundy text-burgundy' : 'border-slate-100 text-slate-500 bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Quota Remaining display info */}
        <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-mono flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5 text-[#D6531F] flex-shrink-0" />
          <span>Apify Quota: {quotaCount}/1,000 runs left.</span>
        </div>

      </div>

      {/* 2. Right Workspace Panel: Main Chat box */}
      <div className="md:col-span-3 flex flex-col justify-between h-[calc(100vh-80px)] bg-[#F4F5ED]">
        
        {/* Messages viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Top header stats bar */}
          <div className="bg-gradient-to-r from-burgundy to-charcoal text-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-white/5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F7B32B] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xs font-bold">Jalwaa AI Style Muse</h2>
                <span className="text-[9px] text-[#F7B32B] font-mono font-bold uppercase tracking-wider">Models: Llama 3.3-70B & Llama 3.2-Vision</span>
              </div>
            </div>
            <span className="bg-white/10 text-white/90 text-[9px] font-mono px-2 py-0.5 rounded">Active Consultation</span>
          </div>

          {/* Active messages lists */}
          {activeSession ? (
            <div className="space-y-4 pt-2">
              {activeSession.messages.map((m) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start space-x-3 max-w-[85%] ${isAssistant ? 'self-start' : 'ml-auto flex-row-reverse space-x-reverse'}`}
                  >
                    {/* Portrait head icons */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAssistant ? 'bg-burgundy text-white' : 'bg-[#D6531F] text-white'}`}>
                      {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble wrapper */}
                    <div className="space-y-2">
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isAssistant ? 'bg-white border border-slate-100 text-charcoal' : 'bg-slate-900 text-[#F4F5ED]'
                      }`}>
                        {m.content}

                        {/* Inline base64 user image preview */}
                        {m.base64Image && (
                          <div className="mt-3 max-w-[150px] rounded-lg overflow-hidden border border-slate-700">
                            <img src={`data:image/jpeg;base64,${m.base64Image}`} alt="User look" className="w-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Overlapping match card layouts */}
                      {isAssistant && m.recommendedSalons && m.recommendedSalons.length > 0 && (
                        <div className="space-y-2 pt-1 animate-slideDown">
                          <span className="text-[10px] text-slate-400 font-bold block">Recommended Mumbai Partners:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {m.recommendedSalons.map((sal) => (
                              <div key={sal.id} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center space-x-3 shadow-inner">
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-charcoal truncate">{sal.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{sal.address.split(',')[1] || 'Mumbai'}</div>
                                </div>
                                <Link
                                  to={`/book/${sal.id}`}
                                  className="bg-[#D6531F] hover:bg-opacity-95 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center space-x-1 flex-shrink-0 font-mono uppercase"
                                >
                                  <span>Book</span>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

              {/* Waiting status indicator */}
              {loading && (
                <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-mono bg-white border border-slate-100 w-fit p-3 rounded-2xl">
                  <RefreshCw className="w-4 h-4 text-[#D6531F] animate-spin" />
                  <span>Jalwaa AI is mapping geometries & matching salons...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">
              Select or create a style consult session to start.
            </div>
          )}

        </div>

        {/* Form message control inputs */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="space-y-3">
            
            {/* Inline base64 image portrait box preview before submit */}
            {imagePreview && (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-2 rounded-xl w-fit relative animate-slideDown">
                <img src={imagePreview} alt="Selfie" className="w-10 h-10 object-cover rounded-md" />
                <span className="text-[10px] text-slate-500 font-mono">Selfie ready for vision mapping</span>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setBase64Image('');
                  }}
                  className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center space-x-3">
              
              {/* Selfie Image uploader */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 border border-slate-200 rounded-xl hover:border-[#D6531F] hover:bg-slate-50 text-slate-500 hover:text-[#D6531F] transition-all cursor-pointer flex-shrink-0"
                id="btn-upload-selfie"
                title="Upload selfie portrait for custom shape mapping"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {/* Chat Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about style transformations (e.g. 'I want a chic look for a wedding in Bandra')"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D6531F] font-medium"
                required={!base64Image}
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-burgundy hover:bg-opacity-95 text-[#F4F5ED] p-3 rounded-xl shadow-md transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                id="btn-send-chat"
              >
                <Send className="w-4 h-4" />
              </button>

            </div>

            <p className="text-[10px] text-slate-400 text-center font-mono leading-none">
              Style consultations use real Groq AI llama models. Data is encrypted and stored locally.
            </p>

          </form>
        </div>

      </div>

    </div>
  );
};


import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS, Icons, BRANDS, TESTIMONIALS } from './constants';
import { Product, CartItem } from './types';

// --- Global Utilities ---
const useScrollDirection = () => {
  const [scrollDir, setScrollDir] = useState("up");
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;
      setScrolled(scrollY > 50);
      setScrollDir(scrollY > lastScrollY ? "down" : "up");
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDir);
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, []);
  return { scrollDir, scrolled };
};

// --- AI Styling Assistant Component ---
const AIStylist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Welcome to the Maison. I am your personal sartorial consultant. How may I refine your selection today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a professional high-end South Asian fashion stylist for "Trendy ND Modern". 
        Provide elegant, concise style advice for young professionals. User says: ${userMsg}`,
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I apologize, my creative processors are currently refreshing." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily offline. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 md:right-10 z-[70]">
      {isOpen && (
        <div className="bg-white w-[85vw] md:w-96 h-[500px] shadow-[0_30px_90px_rgba(0,0,0,0.15)] rounded-3xl flex flex-col overflow-hidden border border-slate-100 animate-fadeIn font-sans">
          <div className="bg-accent text-white p-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-80">Maison d'Elegance</span>
                <span className="text-sm serif italic">Sartorial AI</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform duration-300 text-2xl leading-none">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-accent animate-pulse italic text-[10px] pl-2">Consulting our archives...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t bg-white flex gap-3 shrink-0">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire about styling..." 
              className="flex-1 p-3 text-xs outline-none bg-slate-100 rounded-xl focus:ring-1 focus:ring-accent transition-all"
            />
            <button onClick={handleSend} className="bg-accent text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95">Send</button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-accent text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform border-4 border-white relative z-50"
      >
        <span className="text-2xl">{isOpen ? '💬' : '✨'}</span>
      </button>
    </div>
  );
};

// --- Admin Suite ---
interface AdminSettings {
  whatsappNumber: string;
  adminEmail: string;
}

const AdminOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: AdminSettings;
  onUpdateSettings: (s: AdminSettings) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}> = ({ isOpen, onClose, products, settings, onUpdateSettings, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'inventory' | 'settings'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Local state for settings to prevent jitter during typed updates
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [settings, isOpen]);

  const [formData, setFormData] = useState({
    name: '', brand: 'J.', price: '', fabric: 'Lawn' as any, color: '', image: '', images: [] as string[], 
    description: '', gender: 'Women' as any, season: 'Summer' as any, occasion: 'Casual' as any
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name, brand: editingProduct.brand, price: editingProduct.price.toString(),
        fabric: editingProduct.fabric, color: editingProduct.color, image: editingProduct.image, images: editingProduct.images || [],
        description: editingProduct.description, gender: editingProduct.gender, season: editingProduct.season, occasion: editingProduct.occasion
      });
      setActiveTab('add');
    }
  }, [editingProduct]);

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      ...formData,
      id: editingProduct?.id || Date.now().toString(),
      price: parseInt(formData.price) || 0,
      whatsIncluded: editingProduct?.whatsIncluded || ['Unstitched Set', 'Luxury Dupatta', 'Coordinating Trousers'],
      fabricCare: editingProduct?.fabricCare || ['Standard Professional Cleaning Recommended'],
      isNew: !editingProduct
    };
    if (editingProduct) { onUpdateProduct(productData); setEditingProduct(null); }
    else { onAddProduct(productData); }
    setFormData({ name: '', brand: 'J.', price: '', fabric: 'Lawn', color: '', image: '', images: [], description: '', gender: 'Women', season: 'Summer', occasion: 'Casual' });
    if (editingProduct) setActiveTab('inventory');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    alert('System Configuration Updated Successfully.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="w-full md:w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-10 border-b border-slate-800">
          <h2 className="text-2xl font-bold serif tracking-tight">Maison Suite</h2>
          <p className="text-[9px] uppercase tracking-[0.4em] mt-2 opacity-40 font-bold">Administrative Dashboard</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 mt-4">
          {[
            { id: 'dashboard', label: 'Overview', icon: '📊' },
            { id: 'add', label: editingProduct ? 'Edit Archival' : 'New Listing', icon: '🎨' },
            { id: 'inventory', label: 'Inventory', icon: '📜' },
            { id: 'settings', label: 'System Config', icon: '⚙️' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); if(tab.id !== 'add') setEditingProduct(null); }} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${activeTab === tab.id ? 'bg-accent text-white shadow-xl translate-x-1' : 'hover:bg-slate-800 text-slate-500 hover:text-white'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onClose} className="p-10 text-[10px] uppercase tracking-[0.4em] font-bold border-t border-slate-800 hover:text-accent transition-all text-center">✕ Exit Session</button>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8 md:p-20">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-fadeIn">
              <div className="space-y-2">
                 <h3 className="text-4xl font-bold serif text-slate-800">Operational Overview</h3>
                 <p className="text-slate-400 text-sm font-light">Managing the archival collection and system protocols.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  { label: 'Global Inventory', val: products.length, icon: '📦' },
                  { label: 'Women\'s Range', val: products.filter(p => p.gender === 'Women').length, icon: '👗' },
                  { label: 'Men\'s Range', val: products.filter(p => p.gender === 'Men').length, icon: '🕴️' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-700">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-3xl">{stat.icon}</span>
                       <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-1 rounded-full font-bold uppercase">Live</span>
                    </div>
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.3em] mb-1">{stat.label}</p>
                    <p className="text-5xl font-bold serif text-slate-800">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'add' && (
            <div className="space-y-10 animate-fadeIn">
              <h3 className="text-3xl font-bold serif text-slate-800">{editingProduct ? 'Modify Specification' : 'Add to Archival Collection'}</h3>
              <form onSubmit={handleSubmitProduct} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Curation Title</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-1 focus:ring-accent transition-all" placeholder="e.g. Imperial Emerald Karandi" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Valuation (PKR)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Associated House</label>
                  <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none">
                    {BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Color Shade</label>
                  <input required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" placeholder="e.g. Emerald" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Occasion</label>
                  <select value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value as any})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none">
                    {['Casual', 'Festive', 'Bridal'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Visual Asset URL</label>
                  <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" placeholder="https://..." />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Explanatory Narrative</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none resize-none" />
                </div>
                <button type="submit" className="md:col-span-2 bg-accent text-white py-6 rounded-2xl font-bold uppercase tracking-[0.4em] hover:bg-teal-700 transition-all shadow-xl active:scale-95 text-[10px]">
                  {editingProduct ? 'Update Archival' : 'Publish to Collection'}
                </button>
              </form>
            </div>
          )}
          {activeTab === 'inventory' && (
             <div className="space-y-10 animate-fadeIn">
               <h3 className="text-3xl font-bold serif text-slate-800">Master Catalog</h3>
               <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[9px] uppercase font-bold text-slate-400 border-b">
                     <tr>
                       <th className="p-8">Curation</th>
                       <th className="p-8">Price</th>
                       <th className="p-8 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {products.map(p => (
                       <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="p-8">
                           <div className="flex items-center gap-6">
                             <img src={p.image} className="w-14 h-20 object-cover rounded-xl shadow-sm" />
                             <div className="space-y-1">
                               <p className="font-bold text-slate-800 serif text-lg">{p.name}</p>
                               <p className="text-[8px] uppercase text-accent font-bold tracking-[0.2em]">{p.brand} | {p.color}</p>
                             </div>
                           </div>
                         </td>
                         <td className="p-8 font-medium text-slate-600">PKR {p.price.toLocaleString()}</td>
                         <td className="p-8 text-right">
                           <div className="flex justify-end gap-6">
                             <button onClick={() => setEditingProduct(p)} className="text-accent hover:text-teal-700 font-bold text-[9px] uppercase tracking-widest">Modify</button>
                             <button onClick={() => onDeleteProduct(p.id)} className="text-red-300 hover:text-red-500 font-bold text-[9px] uppercase tracking-widest">Purge</button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-10 animate-fadeIn">
              <h3 className="text-3xl font-bold serif text-slate-800">System Configuration</h3>
              <form onSubmit={handleSaveSettings} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">WhatsApp Business Hotline</label>
                  <p className="text-[8px] text-slate-400 italic">Include country code without +, e.g. 923001234567</p>
                  <input 
                    required 
                    value={localSettings.whatsappNumber} 
                    onChange={e => setLocalSettings({...localSettings, whatsappNumber: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-1 focus:ring-accent" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Administrative Email Liaison</label>
                  <input 
                    required 
                    type="email"
                    value={localSettings.adminEmail} 
                    onChange={e => setLocalSettings({...localSettings, adminEmail: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-1 focus:ring-accent" 
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all shadow-xl active:scale-95 text-[10px]">
                  Save System Parameters
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Website Components ---
const Header: React.FC<{ 
  onOpenSearch: () => void; 
  onOpenUser: () => void; 
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  cartCount: number;
}> = ({ onOpenSearch, onOpenUser, onOpenCart, onOpenAdmin, cartCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollDir, scrolled } = useScrollDirection();
  const location = useLocation();

  useEffect(() => setIsMobileMenuOpen(false), [location]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-700 ${scrolled ? 'bg-white/95 glass py-4 shadow-sm' : 'bg-white py-8'} ${scrollDir === 'down' ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-50 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <nav className="hidden lg:flex gap-10 text-[9px] font-bold uppercase tracking-[0.5em] text-slate-400">
              <Link to="/shop?gender=Women" className="hover:text-accent transition-all">Women</Link>
              <Link to="/shop?gender=Men" className="hover:text-accent transition-all">Men</Link>
              <div className="relative dropdown-trigger group">
                <button className="hover:text-accent transition-all uppercase tracking-[0.5em] flex items-center gap-2">Services <span className="text-[7px]">▼</span></button>
                <div className="absolute top-full -left-6 bg-white border border-slate-50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-3xl p-8 w-64 space-y-5 dropdown-menu">
                  <Link to="/shop?fabric=Lawn" className="block text-[10px] hover:text-accent tracking-widest font-bold transition-colors">Lawn Masterpieces</Link>
                  <Link to="/shop?fabric=Silk" className="block text-[10px] hover:text-accent tracking-widest font-bold transition-colors">Silk Curation</Link>
                  <Link to="/shop?fabric=Cotton" className="block text-[10px] hover:text-accent tracking-widest font-bold transition-colors">Premium Cotton</Link>
                  <div className="pt-4 border-t border-slate-50">
                    <Link to="/shop" className="block text-[8px] text-slate-300 uppercase tracking-widest font-bold">Archival Search</Link>
                  </div>
                </div>
              </div>
              <Link to="/shop" className="hover:text-accent transition-all">Collections</Link>
            </nav>
          </div>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
            <span className="text-2xl md:text-4xl font-bold serif tracking-tight group-hover:tracking-wider transition-all duration-1000">Trendy ND Modern</span>
            <span className="text-[7px] md:text-[9px] uppercase tracking-[0.8em] font-sans font-medium mt-1 opacity-30 group-hover:opacity-100 transition-opacity">Maison d'Elegance</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={onOpenAdmin} className="text-[9px] font-bold uppercase tracking-widest text-accent hover:text-gray-900 transition-all hidden md:block opacity-60 hover:opacity-100">Admin</button>
            <button onClick={onOpenSearch} className="p-2 hover:text-accent hover:scale-110 transition-all duration-500"><Icons.Search /></button>
            <button onClick={onOpenUser} className="p-2 hover:text-accent hover:scale-110 transition-all duration-500 hidden md:block"><Icons.User /></button>
            <button onClick={onOpenCart} className="p-2 relative hover:text-accent hover:scale-110 transition-all duration-500">
              <Icons.Cart />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-lg animate-fadeIn">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] font-sans">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-85 max-w-[90vw] h-full bg-white shadow-2xl animate-slideRight flex flex-col overflow-hidden">
            <div className="p-10 border-b flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xl serif font-bold">Maison Menu</span>
                <span className="text-[8px] uppercase tracking-widest text-slate-300 font-bold">Trendy ND Modern</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-light hover:text-accent">&times;</button>
            </div>
            <nav className="p-10 flex-1 space-y-12">
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-300">Archives</p>
                <Link to="/shop?gender=Women" className="block text-2xl font-bold text-slate-800 hover:text-accent transition-all animate-fadeIn" style={{animationDelay: '0.1s'}}>Women's Edit</Link>
                <Link to="/shop?gender=Men" className="block text-2xl font-bold text-slate-800 hover:text-accent transition-all animate-fadeIn" style={{animationDelay: '0.2s'}}>Men's Edit</Link>
                <Link to="/shop" className="block text-2xl font-bold text-slate-800 hover:text-accent transition-all animate-fadeIn" style={{animationDelay: '0.3s'}}>Full Catalog</Link>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-300">Fabric Curation</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Lawn', 'Silk', 'Cotton', 'Khaddar'].map((f, i) => (
                    <Link key={f} to={`/shop?fabric=${f}`} className="block text-sm font-medium text-slate-500 hover:text-accent transition-colors animate-fadeIn" style={{animationDelay: `${0.4 + (i*0.1)}s`}}>{f} Edit</Link>
                  ))}
                </div>
              </div>
            </nav>
            <div className="p-10 border-t space-y-5">
               <button onClick={() => { setIsMobileMenuOpen(false); onOpenUser(); }} className="w-full py-5 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">Client Portal</button>
               <button onClick={() => { setIsMobileMenuOpen(false); onOpenAdmin(); }} className="w-full py-5 bg-accent text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl">Management Suite</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProductCard: React.FC<{ product: Product; onAddToCart: () => void }> = ({ product, onAddToCart }) => (
  <div className="group space-y-6">
    <Link to={`/product/${product.id}`} className="block relative aspect-card overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 transition-all duration-1000 hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.1)]">
      <img src={product.image} className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" alt={product.name} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
      {product.isNew && <span className="absolute top-6 left-6 bg-accent text-white px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.4em] shadow-2xl">New Arrival</span>}
      <div className="absolute inset-x-6 bottom-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
        <div className="bg-white/95 glass p-4 rounded-2xl flex items-center justify-between shadow-2xl">
          <p className="text-[9px] font-bold text-accent uppercase tracking-[0.3em]">Explore Piece</p>
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </div>
      </div>
    </Link>
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-lg md:text-xl font-bold serif text-slate-800 line-clamp-1 group-hover:text-accent transition-colors duration-500">{product.name}</h3>
        <p className="text-sm font-bold text-slate-900 shrink-0 italic">PKR {product.price.toLocaleString()}</p>
      </div>
      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="flex flex-col">
          <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400 font-bold">{product.brand}</p>
          <p className="text-[7px] uppercase tracking-widest text-slate-300 font-bold mt-0.5">{product.color}</p>
        </div>
        <button onClick={(e) => { e.preventDefault(); onAddToCart(); }} className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] hover:translate-x-1 transition-transform border-b border-accent pb-0.5">Add to Bag</button>
      </div>
    </div>
  </div>
);

const TrustSignals = () => (
  <div className="bg-white py-24 md:py-32 border-b border-slate-50 overflow-hidden">
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
        {[
          { icon: <Icons.Shipping />, title: "Maison Logistics", desc: "Priority express delivery for the discerning professional." },
          { icon: <Icons.Original />, title: "Archival Vow", desc: "Sourced strictly from certified brand house archives." },
          { icon: <Icons.Returns />, title: "Liaison Exchange", desc: "Dedicated concierge support for archival collection returns." }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-8 group">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-700 transform group-hover:-translate-y-2 border border-slate-100">
              {s.icon}
            </div>
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-800">{s.title}</h4>
              <p className="text-xs text-slate-400 font-light max-w-[240px] leading-relaxed italic opacity-70">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BrandShowcase = () => (
  <section className="py-32 px-6 bg-slate-50/30">
    <div className="max-w-screen-2xl mx-auto">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.8em] text-slate-300 mb-24">Associated Archival Houses</p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-40 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
        {BRANDS.map(b => (
           <div key={b.name} className="flex flex-col items-center group cursor-default">
             <span className="text-3xl md:text-4xl font-bold serif tracking-tighter group-hover:text-accent transition-colors duration-700">{b.name}</span>
             <span className="h-0.5 w-0 bg-accent group-hover:w-full transition-all duration-1000 mt-2"></span>
           </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer: React.FC<{ adminMail: string; onOpenAdmin: () => void }> = ({ adminMail, onOpenAdmin }) => (
  <footer className="bg-white pt-32 pb-16 px-6 border-t border-slate-50 font-sans">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
      <div className="space-y-10">
        <div className="space-y-4">
          <h3 className="text-3xl font-bold serif tracking-tight">Trendy ND Modern</h3>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs italic font-light">South Asian unstitched heritage, curated for the contemporary professional silhouette since 2010.</p>
        </div>
      </div>
      <div className="space-y-10">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent border-b border-slate-50 pb-4">The Archives</h4>
        <ul className="space-y-5 text-[11px] font-medium text-slate-500 uppercase tracking-[0.4em]">
          <li><Link to="/shop?gender=Women" className="hover:text-accent transition-all">Women's Edit</Link></li>
          <li><Link to="/shop?gender=Men" className="hover:text-accent transition-all">Men's Edit</Link></li>
          <li><button onClick={() => window.open(`mailto:${adminMail}`)} className="hover:text-accent transition-all">Liaison Support</button></li>
        </ul>
      </div>
      <div className="space-y-10">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent border-b border-slate-50 pb-4">The Maison</h4>
        <ul className="space-y-5 text-[11px] font-medium text-slate-500 uppercase tracking-[0.4em]">
          <li><Link to="/" className="hover:text-accent transition-all">Our Narrative</Link></li>
          <li><Link to="/" className="hover:text-accent transition-all">Legal Charter</Link></li>
          <li><button onClick={onOpenAdmin} className="hover:text-accent transition-all opacity-30 text-[9px]">Management Portal</button></li>
        </ul>
      </div>
      <div className="space-y-10">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent border-b border-slate-50 pb-4">Inscribe</h4>
        <p className="text-[11px] text-slate-400 italic">Join our circle for priority archival collection previews.</p>
        <div className="flex border-b border-slate-200 pb-4 group">
          <input placeholder="professional@email.com" className="flex-1 bg-transparent border-none text-[11px] outline-none placeholder:text-slate-200 focus:placeholder:opacity-0 transition-all font-medium" />
          <button className="text-[10px] font-bold uppercase tracking-[0.4em] hover:text-accent transition-colors">Subscribe</button>
        </div>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto pt-16 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-10 text-[9px] text-slate-300 font-bold uppercase tracking-[0.6em]">
      <p>© 2026 Maison de Trendy ND Modern. Authentic Heritage.</p>
      <div className="flex gap-12 opacity-40">
        <span>Amex</span><span>Mastercard</span><span>JazzCash</span><span>Visa</span>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tnd_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tnd_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('tnd_settings');
    return saved ? JSON.parse(saved) : { whatsappNumber: '923001234567', adminEmail: 'admin@trendynd.com' };
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [preOpenAdminPrompt, setPreOpenAdminPrompt] = useState(false);

  useEffect(() => { localStorage.setItem('tnd_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('tnd_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('tnd_settings', JSON.stringify(settings)); }, [settings]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-slate-900 text-white text-[9px] text-center py-3 font-bold uppercase tracking-[0.6em] relative z-50">
        Maison d'Elegance | Complimentary Priority Logistics for Archival Collections
      </div>
      
      <Header 
        onOpenSearch={() => setIsSearchOpen(true)} 
        onOpenUser={() => { setIsUserOpen(true); setPreOpenAdminPrompt(false); }} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => { setIsUserOpen(true); setPreOpenAdminPrompt(true); }}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
      />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/shop" element={<Shop products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} whatsapp={settings.whatsappNumber} onAddToCart={handleAddToCart} />} />
        </Routes>
      </main>

      <Footer adminMail={settings.adminEmail} onOpenAdmin={() => { setIsUserOpen(true); setPreOpenAdminPrompt(true); }} />
      <AIStylist />
      
      <a 
        href={`https://wa.me/${settings.whatsappNumber}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-10 right-10 bg-green-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform z-[60] border-4 border-white"
      >
        <Icons.WhatsApp />
      </a>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} products={products} />
      <UserOverlay isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} onOpenAdmin={() => setIsAdminOpen(true)} forceAdminPrompt={preOpenAdminPrompt} />
      <CartOverlay 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={(id) => setCart(prev => prev.filter(i => i.product.id !== id))}
        onUpdateQuantity={(id, q) => setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: q } : i))}
      />
      
      <AdminOverlay 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        products={products}
        settings={settings}
        onUpdateSettings={setSettings}
        onAddProduct={(p) => setProducts([p, ...products])} 
        onUpdateProduct={(u) => setProducts(products.map(p => p.id === u.id ? u : p))}
        onDeleteProduct={(id) => confirm("Purge this archival piece from the collection?") && setProducts(products.filter(p => p.id !== id))}
      />
    </div>
  );
}

// --- Detail Pages ---
const Home: React.FC<{ products: Product[]; onAddToCart: (p: Product) => void }> = ({ products, onAddToCart }) => (
  <div className="animate-fadeIn">
    <Hero />
    <TrustSignals />
    <section className="py-32 max-w-[1600px] mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
        <div className="space-y-6">
          <p className="text-accent uppercase text-[10px] font-bold tracking-[0.8em]">Seasonal Archive</p>
          <h2 className="text-5xl md:text-7xl font-bold serif text-slate-800 tracking-tighter">The Current <br/>Selection</h2>
        </div>
        <Link to="/shop" className="text-[11px] font-bold uppercase tracking-[0.4em] border-b-2 border-slate-900 pb-3 hover:text-accent hover:border-accent transition-all duration-500 hover:translate-x-2">Explore Full Collection</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
        {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onAddToCart={() => onAddToCart(p)} />)}
      </div>
    </section>
    <TestimonialsSection />
    <BrandShowcase />
  </div>
);

const Hero = () => (
  <section className="relative h-[90vh] flex items-center overflow-hidden bg-slate-900">
    <img src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1920" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay scale-110 animate-[pulse_30s_infinite]" alt="Boutique Elegance" />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
    <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 w-full text-white animate-fadeIn">
      <div className="max-w-3xl space-y-12">
        <div className="space-y-6">
          <p className="text-accent uppercase tracking-[1em] text-[10px] font-bold drop-shadow-lg">Autumn / Winter Edition 2026</p>
          <h1 className="text-7xl md:text-[10rem] font-bold serif leading-[0.85] tracking-tighter italic">Refined <br/><span className="not-italic">Elegance</span></h1>
        </div>
        <p className="text-sm md:text-xl font-light text-slate-200/80 max-w-lg leading-relaxed italic">Defining the contemporary South Asian professional silhouette with unstitched archival masterpieces.</p>
        <div className="flex flex-wrap gap-8 pt-6">
          <Link to="/shop" className="bg-accent text-white px-12 md:px-16 py-6 font-bold uppercase tracking-[0.4em] hover:bg-teal-700 transition-all rounded-full shadow-2xl active:scale-95 text-[11px]">Join Us Today</Link>
          <Link to="/shop?gender=Women" className="bg-white/5 glass border border-white/20 text-white px-12 md:px-16 py-6 font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-accent transition-all rounded-full text-[11px] italic serif">Explore Women's Edit</Link>
        </div>
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="py-32 bg-slate-50/50 overflow-hidden">
    <div className="max-w-screen-xl mx-auto px-6">
      <div className="text-center mb-24 space-y-4">
        <p className="text-accent uppercase tracking-[0.6em] text-[10px] font-bold">Client Liaison</p>
        <h2 className="text-5xl md:text-6xl font-bold serif text-slate-800 tracking-tight">Maison Preferred</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-12">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all duration-1000 group hover:-translate-y-2">
            <div className="space-y-8">
              <span className="text-accent text-6xl serif italic leading-none opacity-20 group-hover:opacity-100 transition-opacity duration-1000">“</span>
              <p className="text-slate-500 font-light leading-relaxed italic text-base">{t.text}</p>
            </div>
            <div className="pt-12 flex flex-col gap-2">
              <p className="font-bold text-slate-900 serif text-xl">{t.name}</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold opacity-60">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Shop: React.FC<{ products: Product[]; onAddToCart: (p: Product) => void }> = ({ products, onAddToCart }) => {
  const { search } = useLocation();
  const navigate = useNavigate();
  
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const gender = queryParams.get('gender');
  const fabricFilter = queryParams.get('fabric');
  const colorFilter = queryParams.get('color');
  const occasionFilter = queryParams.get('occasion');
  
  const filtered = products.filter(p => 
    (!gender || p.gender === gender) && 
    (!fabricFilter || p.fabric === fabricFilter) &&
    (!colorFilter || p.color === colorFilter) &&
    (!occasionFilter || p.occasion === occasionFilter)
  );

  const colors = useMemo(() => Array.from(new Set(products.map(p => p.color))), [products]);
  const occasions = ['Casual', 'Festive', 'Bridal'];

  const toggleFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(search);
    if (nextParams.get(key) === value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    navigate(`/shop?${nextParams.toString()}`);
  };

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-24 animate-fadeIn min-h-screen font-sans">
      <div className="flex flex-col lg:flex-row gap-20">
        <aside className="w-full lg:w-72 shrink-0 space-y-12">
          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-slate-300 border-b border-slate-50 pb-4">Browse Maison</h4>
            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
              {['Women', 'Men'].map(g => (
                <button 
                  key={g} 
                  onClick={() => toggleFilter('gender', g)}
                  className={`text-sm py-1 px-3 lg:px-0 rounded-full lg:rounded-none transition-all duration-500 text-left ${gender === g ? 'text-accent font-bold translate-x-1 lg:translate-x-2' : 'text-slate-500 hover:text-accent'}`}
                >
                  {g}'s Edit
                </button>
              ))}
            </div>
          </div>

          {/* Fabrics */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-slate-300 border-b border-slate-50 pb-4">Fabric Archives</h4>
            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
              {['Lawn', 'Silk', 'Cotton', 'Khaddar', 'Karandi'].map(f => (
                <button 
                  key={f} 
                  onClick={() => toggleFilter('fabric', f)}
                  className={`text-sm py-1 px-3 lg:px-0 rounded-full lg:rounded-none transition-all duration-500 text-left ${fabricFilter === f ? 'text-accent font-bold translate-x-1 lg:translate-x-2' : 'text-slate-500 hover:text-accent'}`}
                >
                  {f} Curation
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-slate-300 border-b border-slate-50 pb-4">Color Palette</h4>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button 
                  key={c} 
                  onClick={() => toggleFilter('color', c)}
                  title={c}
                  className={`group relative flex items-center justify-center p-1 rounded-full border-2 transition-all duration-500 ${colorFilter === c ? 'border-accent scale-110 shadow-lg' : 'border-transparent hover:border-slate-100'}`}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-black/5" 
                    style={{ backgroundColor: c.toLowerCase() }} 
                  />
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest font-bold text-accent whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${colorFilter === c ? 'opacity-100' : ''}`}>
                    {c}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-slate-300 border-b border-slate-50 pb-4">Occasion</h4>
            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
              {occasions.map(o => (
                <button 
                  key={o} 
                  onClick={() => toggleFilter('occasion', o)}
                  className={`text-sm py-1 px-3 lg:px-0 rounded-full lg:rounded-none transition-all duration-500 text-left ${occasionFilter === o ? 'text-accent font-bold translate-x-1 lg:translate-x-2' : 'text-slate-500 hover:text-accent'}`}
                >
                  {o} Archive
                </button>
              ))}
            </div>
          </div>

          { (gender || fabricFilter || colorFilter || occasionFilter) && (
            <button 
              onClick={() => navigate('/shop')}
              className="text-[10px] uppercase font-bold tracking-[0.4em] text-slate-300 hover:text-red-400 border-b border-slate-100 pb-2 inline-block transition-all"
            >
              Reset All Filters
            </button>
          )}
        </aside>

        <div className="flex-1 space-y-16">
          <header className="flex flex-col sm:flex-row justify-between items-baseline border-b border-slate-50 pb-10 gap-4">
            <h2 className="text-5xl font-bold serif text-slate-800 tracking-tight">The Curation Edit</h2>
            <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300">{filtered.length} Pieces Found</p>
              { (gender || fabricFilter || colorFilter || occasionFilter) && (
                 <span className="flex gap-2">
                   {[gender, fabricFilter, colorFilter, occasionFilter].filter(Boolean).map((f, i) => (
                     <span key={i} className="bg-slate-50 text-slate-400 text-[8px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">{f}</span>
                   ))}
                 </span>
              )}
            </div>
          </header>
          
          {filtered.length === 0 ? (
            <div className="py-40 text-center space-y-6">
              <p className="text-slate-200 italic serif text-3xl">Archival query returned no matches.</p>
              <Link to="/shop" className="text-accent underline underline-offset-8 text-[11px] font-bold uppercase tracking-[0.4em]">Explore Full Catalog</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={() => onAddToCart(p)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetails: React.FC<{ products: Product[]; whatsapp: string; onAddToCart: (p: Product) => void }> = ({ products, whatsapp, onAddToCart }) => {
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  const product = products.find(p => p.id === id) || products[0];
  const [activeImg, setActiveImg] = useState(product.image);

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-32 animate-fadeIn font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32">
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-8">
          <div className="flex-1 aspect-card overflow-hidden rounded-[3rem] bg-slate-50 shadow-2xl">
             <img src={activeImg} className="w-full h-full object-cover" alt={product.name} />
          </div>
          <div className="flex md:flex-col gap-5 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[70vh] no-scrollbar py-2">
             {[product.image, ...(product.images || [])].map((img, i) => (
               <button key={i} onClick={() => setActiveImg(img)} className={`w-24 md:w-32 h-32 md:h-44 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 ${activeImg === img ? 'border-accent p-1.5' : 'border-transparent opacity-40 hover:opacity-80'}`}>
                 <img src={img} className="w-full h-full object-cover rounded-[1rem]" />
               </button>
             ))}
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
          <div className="space-y-6">
            <p className="text-accent uppercase text-[11px] font-bold tracking-[0.8em] italic opacity-80">{product.brand}</p>
            <h1 className="text-5xl md:text-7xl font-bold serif leading-[0.9] text-slate-800 tracking-tighter">{product.name}</h1>
            <div className="flex items-center gap-8 pt-4">
               <p className="text-3xl font-light text-slate-900 italic">PKR {product.price.toLocaleString()}</p>
               {product.originalPrice && <span className="text-slate-300 line-through text-xl font-light italic opacity-50">PKR {product.originalPrice.toLocaleString()}</span>}
            </div>
          </div>
          <p className="text-slate-500 leading-relaxed font-light text-xl italic border-l-4 border-slate-50 pl-8 max-w-xl">{product.description}</p>
          
          <div className="space-y-8">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-slate-300">Curation Detail:</h4>
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
               <div className="flex items-center gap-4 text-[12px] font-medium text-slate-600">
                  <div className="w-2 h-2 bg-accent/20 rounded-full" /> Color: {product.color}
               </div>
               <div className="flex items-center gap-4 text-[12px] font-medium text-slate-600">
                  <div className="w-2 h-2 bg-accent/20 rounded-full" /> Style: {product.occasion}
               </div>
               {product.whatsIncluded.map((item, i) => (
                 <div key={i} className="flex items-center gap-4 text-[12px] font-medium text-slate-600">
                    <div className="w-2 h-2 bg-accent/20 rounded-full" /> {item}
                 </div>
               ))}
            </div>
          </div>

          <div className="pt-12 flex flex-col sm:flex-row gap-6">
            <button onClick={() => onAddToCart(product)} className="flex-1 bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all shadow-2xl active:scale-95 text-[11px]">Add to Bag</button>
            <a href={`https://wa.me/${whatsapp}?text=Inquiry: ${product.name}`} target="_blank" rel="noreferrer" className="flex-1 border-2 border-slate-100 text-slate-600 py-6 rounded-3xl font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-5 hover:border-accent hover:text-accent transition-all text-[11px]">
              <Icons.WhatsApp /> Liaison Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartOverlay: React.FC<{ 
  isOpen: boolean; onClose: () => void; items: CartItem[]; onRemove: (id: string) => void; onUpdateQuantity: (id: string, q: number) => void;
}> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }) => {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        <div className="p-10 border-b flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold serif">Shopping Bag</h2>
            <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold">Curated Selection</span>
          </div>
          <button onClick={onClose} className="text-3xl font-light hover:text-accent">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
              <p className="text-slate-200 italic serif text-4xl">Bag is empty.</p>
              <button onClick={onClose} className="text-accent underline underline-offset-8 uppercase text-[11px] font-bold tracking-[0.4em]">Begin Curation</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-8 animate-fadeIn">
                <img src={item.product.image} className="w-24 h-32 object-cover rounded-2xl shadow-sm border border-slate-50" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-accent italic">{item.product.brand}</p>
                      <h4 className="font-bold text-lg text-slate-800 serif">{item.product.name}</h4>
                    </div>
                    <button onClick={() => onRemove(item.product.id)} className="text-slate-300 hover:text-red-400 transition-colors">✕</button>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex border border-slate-100 rounded-xl bg-slate-50/50">
                       <button onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="px-4 py-2 text-slate-400 hover:text-slate-900 transition-all">-</button>
                       <span className="px-5 py-2 font-bold text-xs">{item.quantity}</span>
                       <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="px-4 py-2 text-slate-400 hover:text-slate-900 transition-all">+</button>
                    </div>
                    <p className="text-sm font-bold text-slate-900 italic">PKR {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-10 border-t space-y-8 bg-slate-50/50 shrink-0">
          <div className="flex justify-between text-xl font-bold">
            <span className="serif italic">Total Curation</span>
            <span className="text-accent">PKR {total.toLocaleString()}</span>
          </div>
          <button className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-accent transition-all active:scale-95 disabled:opacity-50 text-[11px]" disabled={items.length === 0}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

const SearchOverlay: React.FC<{ isOpen: boolean; onClose: () => void; products: Product[] }> = ({ isOpen, onClose, products }) => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const results = useMemo(() => q.length > 1 ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())) : [], [q, products]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[130] bg-white/98 backdrop-blur-2xl flex flex-col items-center p-10 animate-fadeIn pt-40 font-sans overflow-hidden">
      <div className="absolute top-12 right-12"><button onClick={onClose} className="text-5xl font-light hover:text-accent transition-all">&times;</button></div>
      <div className="max-w-3xl mx-auto w-full space-y-16">
        <div className="relative group text-center">
          <input 
            autoFocus placeholder="Search the archives..." 
            className="w-full text-4xl md:text-6xl text-center pb-8 outline-none font-light serif bg-transparent border-b border-slate-100 focus:border-accent transition-all duration-1000 placeholder:text-slate-100" 
            onChange={e => setQ(e.target.value)} 
          />
        </div>
        <div className="space-y-6 max-h-[50vh] overflow-y-auto px-6 no-scrollbar">
          {results.map(p => (
            <div key={p.id} onClick={() => { navigate(`/product/${p.id}`); onClose(); }} className="flex gap-8 p-6 bg-white border border-slate-50 rounded-3xl cursor-pointer hover:shadow-2xl transition-all duration-700 items-center group">
               <img src={p.image} className="w-20 h-28 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-1000" />
               <div className="flex-1 space-y-1">
                 <p className="text-[8px] font-bold uppercase text-accent tracking-[0.4em] italic">{p.brand}</p>
                 <p className="font-bold text-2xl serif text-slate-800 group-hover:text-accent transition-colors duration-500">{p.name}</p>
                 <p className="text-[11px] text-slate-400 font-bold italic">PKR {p.price.toLocaleString()}</p>
               </div>
               <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"><Icons.Search /></div>
            </div>
          ))}
          {q.length > 1 && results.length === 0 && <p className="text-center text-slate-200 py-20 italic serif text-3xl">No matches found.</p>}
          {q.length <= 1 && (
             <div className="flex flex-wrap justify-center gap-4 pt-10">
               {['Maria B', 'Silk Edition', 'Luxury Lawn', 'Gul Ahmed', 'Winter Archive'].map(term => (
                 <button key={term} onClick={() => { setQ(term.split(' ')[0]); }} className="px-8 py-3 border border-slate-100 rounded-full text-[10px] uppercase font-bold tracking-[0.4em] text-slate-300 hover:border-accent hover:text-accent transition-all duration-700">{term}</button>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserOverlay: React.FC<{ isOpen: boolean; onClose: () => void; onOpenAdmin: () => void; forceAdminPrompt?: boolean }> = ({ isOpen, onClose, onOpenAdmin, forceAdminPrompt }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(forceAdminPrompt || false);
  const ADMIN_SECRET = "03377501681faheemabid";
  useEffect(() => { if (forceAdminPrompt) setShowKey(true); }, [forceAdminPrompt]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[140] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-16 md:p-24 flex flex-col animate-slideLeft">
        <div className="flex justify-between items-center mb-24">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold serif text-slate-900">{showKey ? 'Maison Suite' : 'Client Access'}</h2>
            <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold">Secure Gateway</span>
          </div>
          <button onClick={onClose} className="text-4xl font-light hover:text-accent">&times;</button>
        </div>
        <div className="space-y-12 flex-1">
          {!showKey ? (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] border-b border-slate-50 pb-5 text-slate-200">Membership Portal</h3>
              <input placeholder="Client Identifier" className="w-full p-6 bg-slate-50/50 border-none rounded-2xl outline-none text-sm font-medium" />
              <input type="password" placeholder="Passphrase" className="w-full p-6 bg-slate-50/50 border-none rounded-2xl outline-none text-sm font-medium" />
              <button className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.4em] shadow-2xl active:scale-95 text-[11px] transition-all">Authorize Session</button>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] border-b border-accent/20 pb-5 text-accent">Management Protocol</h3>
              <p className="text-xs text-slate-400 font-light italic leading-relaxed">Verification of administrative credentials is mandatory for suite access.</p>
              <input 
                type="password" autoFocus value={key} onChange={e => setKey(e.target.value)} 
                onKeyPress={e => { if(e.key === 'Enter') { if(key === ADMIN_SECRET) { onOpenAdmin(); onClose(); setKey(''); setShowKey(false); } else alert("Access Denied: Credential mismatch."); } }}
                placeholder="Admin Master Key" className="w-full p-6 bg-white border-2 border-slate-100 focus:border-accent rounded-3xl outline-none text-sm transition-all duration-500 shadow-inner" 
              />
              <button onClick={() => { if(key === ADMIN_SECRET) { onOpenAdmin(); onClose(); setKey(''); setShowKey(false); } else alert("Access Denied."); }} className="w-full bg-accent text-white py-6 rounded-3xl font-bold uppercase tracking-[0.4em] shadow-2xl text-[11px] active:scale-95 transition-all">Verify Credentials</button>
              <button onClick={() => setShowKey(false)} className="w-full text-[10px] uppercase font-bold text-slate-300 hover:text-slate-500 py-2 tracking-widest">Return to Client Portal</button>
            </div>
          )}
          {!showKey && <div className="pt-20 border-t border-slate-50"><button onClick={() => setShowKey(true)} className="w-full bg-slate-50 text-slate-300 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-slate-100 transition-all italic">Maison Management Suite</button></div>}
        </div>
      </div>
    </div>
  );
};

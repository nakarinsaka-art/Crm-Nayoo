import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  DollarSign,
  Building,
  Target,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  BarChart3,
  LogOut,
  User,
  Lock,
  UserPlus,
  Settings,
  Globe,
  Save,
  ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Types ---

interface Contact {
  name: string;
  phone: string;
  email: string;
}

interface ScoringFactors {
  price: number;
  days: number;
  demand: number;
  status: number;
}

interface Lead {
  id: string;
  name: string;
  type: string;
  price: number;
  marketAvg: number;
  province: string;
  subDistrict: string;
  address: string;
  createdAt: string;
  status: 'sold' | 'unsold';
  contact: Contact;
  score: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  factors: ScoringFactors;
  daysOnMarket: number;
}

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  token: string;
}

// --- Localization ---

const translations = {
  en: {
    portfolioView: "Portfolio View",
    leadHub: "Lead Hub",
    profile: "Profile",
    logout: "Logout",
    marketPerformance: "Market Performance",
    leadIntelligence: "Lead Intelligence",
    portfolioValue: "Portfolio Value",
    criticalLeads: "Critical Leads",
    conversion: "Conversion",
    ownerPain: "Owner Pain",
    criticalFollowups: "Critical Follow-ups",
    manageAll: "Manage All",
    lead: "Lead",
    price: "Price",
    score: "Score",
    action: "Action",
    strategyAdvisor: "Strategy Advisor",
    actionPlan: "Action Plan",
    searchPlaceholder: "Search by ID, Name or Address...",
    allPriorities: "All Priorities",
    allTypes: "All Types",
    property: "Property",
    waitTime: "Wait Time",
    leadScore: "Lead Score",
    sellerMotivation: "Seller Motivation",
    negotiationAngle: "Negotiation Angle",
    analyzeStrategy: "Analyze Negotiation Strategy",
    startDiscussion: "Start Discussion",
    logActivity: "Log Activity",
    internalNotes: "Internal Notes",
    notesPlaceholder: "Add notes about your last interaction...",
    profileTitle: "User Profile",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    username: "Username",
    saveChanges: "Save Changes",
    accountSettings: "Account Settings",
    language: "Language",
    thai: "Thai",
    english: "English",
    password: "Password",
    leaveBlank: "Leave blank to keep current password",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    mission: "Daily Mission for",
    strategySynthesizing: "Synthesizing Strategy...",
    geminiIntelligence: "Gemini Sales Intelligence",
    pricingBreakdown: "Pricing Breakdown",
    scoringMetrics: "Scoring Metrics",
    marketPrice: "Market Price",
    demand: "Demand",
    availability: "Availability",
    viewOnMaps: "View on Google Maps",
    ownerInfo: "Owner Information",
    primarySeller: "Primary Seller"
  },
  th: {
    portfolioView: "มุมมองพอร์ตโฟลิโอ",
    leadHub: "ศูนย์รวมข้อมูลลูกค้า",
    profile: "โปรไฟล์ผู้ใช้",
    logout: "ออกจากระบบ",
    marketPerformance: "ผลการดำเนินงานของตลาด",
    leadIntelligence: "ข้อมูลอัจฉริยะของลูกค้า",
    portfolioValue: "มูลค่าพอร์ตโฟลิโอ",
    criticalLeads: "ลูกค้าระดับวิกฤต",
    conversion: "อัตราการปิดการขาย",
    ownerPain: "จุดเจ็บปวดของผู้ขาย",
    criticalFollowups: "การติดตามผลที่สำคัญ",
    manageAll: "จัดการทั้งหมด",
    lead: "ลูกค้า",
    price: "ราคา",
    score: "คะแนน",
    action: "ดำเนินการ",
    strategyAdvisor: "ที่ปรึกษากลยุทธ์",
    actionPlan: "แผนการดำเนินงาน",
    searchPlaceholder: "ค้นหาด้วย ID, ชื่อ หรือที่อยู่...",
    allPriorities: "ทุกระดับความสำคัญ",
    allTypes: "ทุกประเภท",
    property: "อสังหาริมทรัพย์",
    waitTime: "เวลารอคอย",
    leadScore: "คะแนนเป้าหมาย",
    sellerMotivation: "แรงจูงใจของผู้ขาย",
    negotiationAngle: "มุมมองการเจรจา",
    analyzeStrategy: "วิเคราะห์กลยุทธ์การเจรจา",
    startDiscussion: "เริ่มการพูดคุย",
    logActivity: "บันทึกกิจกรรม",
    internalNotes: "บันทึกภายใน",
    notesPlaceholder: "เพิ่มบันทึกเกี่ยวกับการสื่อสารล่าสุด...",
    profileTitle: "โปรไฟล์ผู้ใช้",
    personalInfo: "ข้อมูลส่วนตัว",
    fullName: "ชื่อ-นามสกุล",
    username: "ชื่อผู้ใช้",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    accountSettings: "ตั้งค่าบัญชี",
    language: "ภาษา",
    thai: "ไทย",
    english: "English",
    password: "รหัสผ่าน",
    leaveBlank: "เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน",
    critical: "วิกฤต",
    high: "สูง",
    medium: "ปานกลาง",
    low: "ต่ำ",
    mission: "ภารกิจประจำวันสำหรับ",
    strategySynthesizing: "กำลังวิเคราะห์กลยุทธ์...",
    geminiIntelligence: "ข้อมูลอัจฉริยะ Gemini",
    pricingBreakdown: "รายละเอียดราคา",
    scoringMetrics: "เกณฑ์การให้คะแนน",
    marketPrice: "ราคาตลาด",
    demand: "ความต้องการ",
    availability: "สถานะการขาย",
    viewOnMaps: "ดูบน Google Maps",
    ownerInfo: "ข้อมูลเจ้าของ",
    primarySeller: "ผู้ขายหลัก"
  }
};

// --- Data & Scoring Engine ---

const PROPERTY_TYPES = ['บ้านเดี่ยว', 'ที่ดิน', 'คอนโด', 'ทาวน์โฮม', 'อาคารพาณิชย์', 'อพาร์ทเม้นท์'];
const DISTRICTS = ['เมือง', 'ศรีบุญเรือง', 'ทรายมูล', 'หนองบัว', 'บ้านฝาง', 'ศิลา', 'บ้านเป็ด'];
const NAMES = ['คุณสมชาย', 'คุณอนงค์', 'คุณกิตติ', 'คุณวิภา', 'คุณสมศักดิ์', 'คุณพรชัย', 'คุณมาลี', 'คุณสุดา', 'คุณนิรันดร์', 'คุณสุนีย์'];

const calculateScoring = (price: number, marketAvg: number, days: number, type: string, status: string) => {
  let score = 0;
  const factors: ScoringFactors = { price: 0, days: 0, demand: 0, status: 0 };

  const priceDev = Math.abs(price - marketAvg) / marketAvg;
  if (priceDev < 0.1) factors.price = 30;
  else if (priceDev < 0.2) factors.price = 25;
  else if (priceDev < 0.3) factors.price = 15;
  else factors.price = 5;
  score += factors.price;

  if (days > 730) factors.days = 25; 
  else if (days > 365) factors.days = 20;
  else if (days > 180) factors.days = 15;
  else if (days > 90) factors.days = 10;
  else factors.days = 5;
  score += factors.days;

  const demandMap: Record<string, number> = { 'บ้านเดี่ยว': 20, 'คอนโด': 18, 'ทาวน์โฮม': 15, 'ที่ดิน': 12, 'อาคารพาณิชย์': 10 };
  factors.demand = demandMap[type] || 10;
  score += factors.demand;

  factors.status = status === 'unsold' ? 25 : 0;
  score += factors.status;

  const finalScore = Math.min(score, 100);
  let priority: Lead['priority'] = 'low';
  if (finalScore >= 80) priority = 'critical';
  else if (finalScore >= 60) priority = 'high';
  else if (finalScore >= 40) priority = 'medium';

  return { finalScore, priority, factors };
};

const generateMockLeads = (count: number): Lead[] => {
  return Array.from({ length: count }).map((_, i) => {
    const type = PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)];
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
    const price = Math.floor(Math.random() * 12000000) + 800000;
    const marketAvg = price * (0.85 + Math.random() * 0.3);
    const status = Math.random() > 0.35 ? 'unsold' : 'sold';
    const daysOnMarket = Math.floor(Math.random() * 1100);
    const date = new Date();
    date.setDate(date.getDate() - daysOnMarket);

    const { finalScore, priority, factors } = calculateScoring(price, marketAvg, daysOnMarket, type, status);

    return {
      id: `PROP-${String(1000 + i).padStart(5, '0')}`,
      name: `${type} ${district}`,
      type,
      price,
      marketAvg,
      province: 'ขอนแก่น',
      subDistrict: district,
      address: `${Math.floor(Math.random() * 99) + 1} ถ.ประชาสโมสร, ${district}, ขอนแก่น`,
      createdAt: date.toISOString(),
      status,
      contact: {
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        phone: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: `contact_${i}@realestate-kk.th`
      },
      score: finalScore,
      priority,
      factors,
      daysOnMarket
    };
  });
};

// --- Authentication Components ---

const AuthView = ({ onLogin }: { onLogin: (u: UserProfile) => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const body = isRegistering 
      ? { username, password, full_name: fullName }
      : { username, password };

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'An error occurred');
      
      if (isRegistering) {
        setIsRegistering(false);
        setError('Registration successful. Please login.');
      } else {
        onLogin(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
            <Building className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 text-center mb-2">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-slate-400 text-center text-sm font-medium mb-8">
          {isRegistering ? 'Start your AI Real Estate journey' : 'Login to access your K-CRM dashboard'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Username" 
              required
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-xs font-bold text-center px-2">{error}</p>}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Profile View ---

const ProfileView = ({ user, onUpdate, lang, t }: { user: UserProfile, onUpdate: (u: UserProfile) => void, lang: 'en' | 'th', t: (k: string) => string }) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:8000/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          full_name: fullName,
          password: password || undefined
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update');
      
      onUpdate({ ...user, full_name: data.full_name });
      setMsg({ type: 'success', text: lang === 'en' ? 'Profile updated successfully' : 'อัปเดตโปรไฟล์เรียบร้อยแล้ว' });
      setPassword('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-10">
            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center">
                 <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user.username}`} alt="Avatar" className="rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-10 px-10">
          <h3 className="text-2xl font-black text-slate-900">{user.full_name}</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">@{user.username}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('personalInfo')}</h4>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('username')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    disabled
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm text-slate-400 cursor-not-allowed"
                    value={user.username}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('password')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder={t('leaveBlank')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {msg.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold text-center ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {msg.text}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> {t('saveChanges')}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('accountSettings')}</h4>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-3xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">{t('language')}</span>
                </div>
                <span className="text-xs font-black text-blue-600 uppercase">{lang === 'en' ? 'English' : 'ไทย'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-3xl flex justify-between items-center opacity-50">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">2FA Auth</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Components ---

const KPICard = ({ label, value, icon: Icon, color, trend }: { label: string, value: string, icon: any, color: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-extrabold mt-1 text-slate-900">{value}</h3>
    </div>
  </div>
);

const PriorityBadge = ({ priority, t }: { priority: Lead['priority'], t: (k: string) => string }) => {
  const styles = {
    critical: 'bg-red-50 text-red-600 border-red-100 ring-red-500/20',
    high: 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/20',
    medium: 'bg-yellow-50 text-yellow-600 border-yellow-100 ring-yellow-500/20',
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20',
  };
  const icon = priority === 'critical' ? '🔴' : priority === 'high' ? '🟠' : priority === 'medium' ? '🟡' : '🟢';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ring-2 ${styles[priority]}`}>
      <span className="text-[10px]">{icon}</span> {t(priority)}
    </span>
  );
};

// --- Main App ---

const App = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('kcrm_user');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'profile'>('dashboard');
  const [leads] = useState<Lead[]>(() => generateMockLeads(500));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const [dailyStrategy, setDailyStrategy] = useState<string | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  const [lang, setLang] = useState<'en' | 'th'>(() => {
    const stored = localStorage.getItem('kcrm_lang');
    return (stored as 'en' | 'th') || 'en';
  });

  const t = (key: string) => {
    return (translations[lang] as any)[key] || key;
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'th' : 'en';
    setLang(next);
    localStorage.setItem('kcrm_lang', next);
  };

  // Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kcrm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kcrm_user');
    }
  }, [currentUser]);

  // Initial Strategy Load
  useEffect(() => {
    if (currentUser && !dailyStrategy) {
      generateDailyStrategy();
    }
  }, [currentUser]);

  const generateDailyStrategy = async () => {
    if (!currentUser) return;
    setLoadingStrategy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const critCount = leads.filter(l => l.priority === 'critical').length;
      const painCount = leads.filter(l => l.daysOnMarket > 730 && l.status === 'unsold').length;
      
      const prompt = `You are a real estate sales management coach. 
        Agent Name: ${currentUser.full_name}
        Region: Khon Kaen
        Dashboard Context: ${critCount} critical leads requiring action, ${painCount} leads in high-pain (>2 years wait).
        Language: ${lang === 'en' ? 'English' : 'Thai'}
        
        Write a 2-sentence highly motivating 'Mission of the Day' for this agent in the specified language. Focus on clearing the critical backlog.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setDailyStrategy(response.text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStrategy(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  // Stats
  const metrics = useMemo(() => {
    const unsold = leads.filter(l => l.status === 'unsold');
    const totalValue = leads.reduce((acc, curr) => acc + curr.price, 0);
    const criticalCount = leads.filter(l => l.priority === 'critical').length;
    const painCount = leads.filter(l => l.daysOnMarket > 730 && l.status === 'unsold').length;
    const soldCount = leads.filter(l => l.status === 'sold').length;

    return {
      total: leads.length,
      unsold: unsold.length,
      sold: soldCount,
      value: `฿${(totalValue / 1000000000).toFixed(2)}B`,
      critical: criticalCount,
      pain: painCount,
      convRate: `${((soldCount / leads.length) * 100).toFixed(1)}%`,
      avgDays: Math.floor(leads.reduce((a, b) => a + b.daysOnMarket, 0) / leads.length)
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || l.priority === filterPriority;
      const matchesType = filterType === 'all' || l.type === filterType;
      return matchesSearch && matchesPriority && matchesType;
    }).sort((a, b) => b.score - a.score);
  }, [leads, searchTerm, filterPriority, filterType]);

  const handleGetAiInsight = async (lead: Lead) => {
    setLoadingAi(true);
    setAiInsight(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `As a real estate expert assistant in Khon Kaen, provide a strategic sales advice for this lead:
        Property: ${lead.type} at ${lead.address}
        Price: ฿${lead.price.toLocaleString()} (Market Avg: ฿${lead.marketAvg.toLocaleString()})
        Listed for: ${lead.daysOnMarket} days
        Owner Name: ${lead.contact.name}
        Priority Level: ${lead.priority}
        Scoring Points: Price(${lead.factors.price}), WaitTime(${lead.factors.days}), Demand(${lead.factors.demand})
        Language Preference: ${lang === 'en' ? 'English' : 'Thai'}
        
        Provide (in ${lang === 'en' ? 'English' : 'Thai'}):
        1. A "Seller Motivation" insight based on their wait time.
        2. A "Negotiation Angle" based on the price gap.
        3. A specific opening line for a call.
        Keep it concise and professional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text);
    } catch (err) {
      console.error(err);
      setAiInsight("Unable to generate AI strategy. Please check your connectivity.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col fixed h-full z-20 border-r border-slate-800">
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-none uppercase">K-CRM</h1>
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mt-1">Real Estate Engine</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-white' : 'group-hover:text-blue-400'}`} />
            <span className="font-bold text-sm">{t('portfolioView')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'leads' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'leads' ? 'text-white' : 'group-hover:text-blue-400'}`} />
            <span className="font-bold text-sm">{t('leadHub')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'group-hover:text-blue-400'}`} />
            <span className="font-bold text-sm">{t('profile')}</span>
          </button>
        </nav>

        <div className="px-4 py-8 space-y-4">
          <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black truncate">{currentUser.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">@{currentUser.username}</p>
                </div>
             </div>

             <div className="mt-4 flex flex-col gap-2">
               <button 
                  onClick={toggleLang}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-[10px] font-black uppercase tracking-widest border border-slate-700"
                >
                  <Globe className="w-3 h-3" /> {lang === 'en' ? 'ไทย' : 'English'}
               </button>
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <LogOut className="w-3 h-3" /> {t('logout')}
               </button>
             </div>
          </div>

          <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">AI Score Engine v1.4</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Real-time scoring active for 500 records in Khon Kaen market.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-10 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'dashboard' ? t('marketPerformance') : activeTab === 'leads' ? t('leadIntelligence') : t('profileTitle')}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Analytics Dashboard • 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-600">{new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'long' })}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/20">
              <div className="w-full h-full rounded-[14px] bg-white overflow-hidden border-2 border-white">
                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${currentUser.username}`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* AI Welcome Mission */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="w-32 h-32 text-blue-600" />
               </div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center shrink-0">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">{t('mission')} {currentUser.full_name}</h4>
                    {loadingStrategy ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase">{t('strategySynthesizing')}</span>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm font-medium italic">"{dailyStrategy || 'Focus on your critical leads to maximize conversion today.'}"</p>
                    )}
                  </div>
               </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard label={t('portfolioValue')} value={metrics.value} icon={DollarSign} color="bg-blue-600" trend="+4.2%" />
              <KPICard label={t('criticalLeads')} value={metrics.critical.toString()} icon={AlertCircle} color="bg-red-600" />
              <KPICard label={t('conversion')} value={metrics.convRate} icon={TrendingUp} color="bg-indigo-600" />
              <KPICard label={t('ownerPain')} value={metrics.pain.toString()} icon={Clock} color="bg-orange-600" />
            </div>

            {/* Main Dash Charts/Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Critical Leads List */}
              <div className="lg:col-span-2 bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-red-500" />
                    </div>
                    <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{t('criticalFollowups')}</h4>
                  </div>
                  <button onClick={() => setActiveTab('leads')} className="group flex items-center gap-2 text-blue-600 text-sm font-black hover:text-blue-700 transition-colors uppercase tracking-widest">
                    {t('manageAll')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-4">{t('lead')}</th>
                        <th className="px-8 py-4">{t('price')}</th>
                        <th className="px-8 py-4 text-center">{t('score')}</th>
                        <th className="px-8 py-4 text-right">{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leads.filter(l => l.priority === 'critical').slice(0, 5).map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{lead.name}</span>
                              <span className="text-xs text-slate-400 font-medium">{lead.id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-extrabold text-slate-900">฿{(lead.price / 1000000).toFixed(2)}M</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-red-600 mb-1">{lead.score}</span>
                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${lead.score}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => { setActiveTab('leads'); setExpandedLead(lead.id); }}
                              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Strategy Spotlight */}
              <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-900/40 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                  <Sparkles className="w-40 h-40 rotate-12" />
                </div>
                
                <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 z-10">
                  <Sparkles className="w-6 h-6 text-blue-300" />
                  {t('strategyAdvisor')}
                </h4>
                
                <div className="mt-8 flex-1 z-10">
                  <p className="text-blue-100 text-sm leading-relaxed font-medium">
                    Our AI identifies <span className="text-white font-black underline underline-offset-4 decoration-blue-400">{metrics.pain} listings</span> with high "Owner Pain". 
                    This represents a prime negotiation window.
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Key Insight</p>
                      <p className="text-xs font-bold leading-normal text-white">
                        Properties in {DISTRICTS[0]} are priced 14% above district averages, causing stagnation.
                      </p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Next Best Step</p>
                      <p className="text-xs font-bold leading-normal text-white">
                        Send "Re-price Strategy" packs to the top 15 critical leads.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveTab('leads'); setFilterPriority('critical'); }}
                  className="mt-10 w-full bg-white text-blue-900 font-black text-sm uppercase py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all z-10 tracking-widest"
                >
                  {t('actionPlan')}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'leads' ? (
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[700px] animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Filters */}
            <div className="p-8 border-b border-slate-100 bg-white flex flex-col lg:flex-row gap-6 items-center">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <select 
                  className="flex-1 lg:flex-none px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none font-bold text-sm focus:bg-white focus:border-blue-500/20"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">{t('allPriorities')}</option>
                  <option value="critical">{t('critical')}</option>
                  <option value="high">{t('high')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="low">{t('low')}</option>
                </select>
                <select 
                  className="flex-1 lg:flex-none px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none font-bold text-sm focus:bg-white focus:border-blue-500/20"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">{t('allTypes')}</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button className="p-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-slate-400 hover:bg-slate-100 transition-colors">
                  <Filter className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-8 py-5 w-16"></th>
                    <th className="px-8 py-5">{t('property')}</th>
                    <th className="px-8 py-5">{t('price')}</th>
                    <th className="px-8 py-5">{t('action')}</th>
                    <th className="px-8 py-5">{t('waitTime')}</th>
                    <th className="px-8 py-5 text-right">{t('leadScore')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeads.map(lead => (
                    <React.Fragment key={lead.id}>
                      <tr 
                        className={`hover:bg-blue-50/40 transition-all cursor-pointer group ${expandedLead === lead.id ? 'bg-blue-50/60' : ''}`}
                        onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      >
                        <td className="px-8 py-6">
                          <div className={`p-2 rounded-lg transition-transform duration-300 ${expandedLead === lead.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {expandedLead === lead.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{lead.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{lead.id} • {lead.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900">฿{lead.price.toLocaleString()}</span>
                            <span className={`text-[10px] font-bold ${lead.price > lead.marketAvg ? 'text-red-500' : 'text-emerald-500'}`}>
                              {lead.price > lead.marketAvg ? '↑' : '↓'} {Math.abs(((lead.price - lead.marketAvg) / lead.marketAvg) * 100).toFixed(1)}% vs Market
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <PriorityBadge priority={lead.priority} t={t} />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${lead.daysOnMarket > 730 ? 'text-orange-500' : 'text-slate-300'}`} />
                            <span className={`text-sm font-bold ${lead.daysOnMarket > 730 ? 'text-orange-600' : 'text-slate-600'}`}>{lead.daysOnMarket}d</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="inline-flex items-center gap-3">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                              <div 
                                className={`h-full rounded-full ${lead.score >= 80 ? 'bg-red-500' : lead.score >= 60 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                style={{ width: `${lead.score}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-black ${lead.score >= 80 ? 'text-red-600' : 'text-slate-900'}`}>{lead.score}</span>
                          </div>
                        </td>
                      </tr>
                      {expandedLead === lead.id && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={6} className="px-12 py-12">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in zoom-in-95 duration-500">
                              {/* Left: Intelligence */}
                              <div className="lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('personalInfo')}</p>
                                    <div className="flex items-start gap-3">
                                      <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{lead.address}, ขอนแก่น</p>
                                    </div>
                                    <button className="mt-4 flex items-center gap-2 text-blue-600 text-[11px] font-black uppercase hover:underline">
                                      {t('viewOnMaps')} <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('pricingBreakdown')}</p>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-bold text-slate-500">Listed Price</span>
                                      <span className="text-sm font-black text-slate-900">฿{lead.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-bold text-slate-500">Market Average</span>
                                      <span className="text-sm font-black text-slate-900">฿{Math.floor(lead.marketAvg).toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 my-3"></div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-black text-slate-900 uppercase">Valuation</span>
                                      <span className={`text-xs font-black ${lead.price > lead.marketAvg ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {lead.price > lead.marketAvg ? 'OVERPRICED' : 'UNDERVALUED'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-sm">
                                  <div className="flex justify-between items-center mb-6">
                                    <h5 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                      <BarChart3 className="w-5 h-5 text-blue-500" /> {t('scoringMetrics')}
                                    </h5>
                                    <span className="text-[11px] font-bold text-slate-400">Total Score: {lead.score}/100</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                      { label: t('marketPrice'), val: lead.factors.price, max: 30, color: 'bg-blue-600' },
                                      { label: t('ownerPain'), val: lead.factors.days, max: 25, color: 'bg-orange-600' },
                                      { label: t('demand'), val: lead.factors.demand, max: 20, color: 'bg-indigo-600' },
                                      { label: t('availability'), val: lead.factors.status, max: 25, color: 'bg-emerald-600' },
                                    ].map(f => (
                                      <div key={f.label} className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</p>
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className={`${f.color} h-full`} style={{ width: `${(f.val / f.max) * 100}%` }}></div>
                                          </div>
                                          <span className="text-xs font-black text-slate-900">{f.val}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* AI Interaction */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                    <Sparkles className="w-32 h-32" />
                                  </div>
                                  
                                  {loadingAi ? (
                                    <div className="flex flex-col items-center justify-center py-10">
                                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                      <p className="text-sm font-black text-blue-400 mt-4 uppercase tracking-[0.2em]">{t('strategySynthesizing')}</p>
                                    </div>
                                  ) : aiInsight ? (
                                    <div className="animate-in fade-in duration-700">
                                      <div className="flex items-center gap-3 mb-5">
                                        <Sparkles className="w-6 h-6 text-blue-400" />
                                        <h5 className="text-sm font-black text-white uppercase tracking-widest">{t('geminiIntelligence')}</h5>
                                      </div>
                                      <div className="prose prose-invert max-w-none">
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic font-medium">
                                          {aiInsight}
                                        </p>
                                      </div>
                                      <button 
                                        onClick={() => handleGetAiInsight(lead)}
                                        className="mt-6 text-blue-400 text-xs font-black uppercase hover:text-white transition-colors"
                                      >
                                        Re-generate Advice
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4">
                                      <h5 className="text-white font-black text-lg mb-2">Need a Winning Pitch?</h5>
                                      <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                                        Our AI analyzes market data, pricing history, and wait times to craft a personalized negotiation strategy for {lead.contact.name}.
                                      </p>
                                      <button 
                                        onClick={() => handleGetAiInsight(lead)}
                                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-500 hover:scale-[1.02] transition-all flex items-center gap-3 mx-auto"
                                      >
                                        <Sparkles className="w-5 h-5" /> {t('analyzeStrategy')}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Contact & Action */}
                              <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-sm">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('ownerInfo')}</h5>
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                        <Users className="w-6 h-6 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-lg font-black text-slate-900 leading-none">{lead.contact.name}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('primarySeller')}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer p-3 rounded-xl hover:bg-blue-50">
                                        <Phone className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-extrabold">{lead.contact.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer p-3 rounded-xl hover:bg-blue-50">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-extrabold truncate">{lead.contact.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                    <Phone className="w-5 h-5" /> {t('startDiscussion')}
                                  </button>
                                  <button className="w-full bg-white text-slate-900 border-2 border-slate-100 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3">
                                    <MessageSquare className="w-5 h-5" /> {t('logActivity')}
                                  </button>
                                </div>
                                
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('internalNotes')}</p>
                                  <textarea 
                                    className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-700 leading-relaxed placeholder:text-slate-300 resize-none min-h-[100px]"
                                    placeholder={t('notesPlaceholder')}
                                  ></textarea>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div className="py-32 text-center animate-in zoom-in-95">
                  <div className="bg-slate-100 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No leads found</h3>
                  <p className="text-slate-400 text-sm font-medium mt-2">Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{filteredLeads.length}</span> of <span className="text-slate-900">{leads.length}</span> leads
              </span>
              <div className="flex gap-3">
                <button className="px-6 py-3 border-2 border-slate-200 rounded-xl text-xs font-black uppercase bg-white text-slate-400 cursor-not-allowed">Prev</button>
                <button className="px-6 py-3 border-2 border-slate-200 rounded-xl text-xs font-black uppercase bg-white text-slate-900 hover:border-slate-300 transition-all shadow-sm">Next</button>
              </div>
            </div>
          </div>
        ) : (
          <ProfileView user={currentUser} onUpdate={setCurrentUser} lang={lang} t={t} />
        )}
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
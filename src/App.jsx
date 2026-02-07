import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  Shield,
  RefreshCcw,
  Search,
  Database,
  BarChart3,
  FileText,
  Globe,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  Download,
  Share2,
  Bell,
  Filter,
  MapPin,
  Network,
  Zap,
  Clock,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Wifi,
  WifiOff,
  KeyRound,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

/**
 * UN Office for Partnerships Dashboard
 *
 * Notes for Vite/GitHub:
 * - Configure backend URL via VITE_API_BASE_URL (see .env.example)
 * - Direct browser calls to UN sites will be blocked by CORS; use your own proxy backend.
 */

// ============================================================================
// DATA CATALOGUE REGISTRY (your provided list)
// ============================================================================

const DATA_SOURCES = [
  {
    id: "unop_main",
    name: "UN Office for Partnerships (UNOP)",
    url: "https://unpartnerships.un.org/",
    kind: "website",
    auth: "none",
    notes: "Content portal. Use backend ingestion (sitemap/RSS/scrape) to emit JSON to the dashboard.",
  },
  {
    id: "unop_sdg_data_alliance",
    name: "UNOP – SDG Data Alliance",
    url: "https://unpartnerships.un.org/sdg-data-alliance",
    kind: "website",
    auth: "none",
    notes: "Program page. Track as catalog asset + metadata. Optionally ingest related updates.",
  },
  {
    id: "un_partner_portal",
    name: "UN Partner Portal (UNPP)",
    url: "https://www.unpartnerportal.org/",
    kind: "app",
    auth: "token",
    notes: "Partner registration portal. API access typically requires authentication/authorization.",
  },
  {
    id: "undata",
    name: "UNdata (UN Statistics Division)",
    url: "https://data.un.org/",
    kind: "api",
    auth: "varies",
    notes: "Official interfaces are SDMX/SOAP. Recommend backend adapter that converts to JSON.",
  },
  {
    id: "unctadstat",
    name: "UNCTAD Data Hub (UNCTADstat)",
    url: "https://unctadstat.unctad.org/EN/",
    kind: "website",
    auth: "none",
    notes: "Portal/Downloads. Recommend backend ingestion and caching for key indicators used in KPIs.",
  },
  {
    id: "uninfo",
    name: "UN INFO (UNSDG)",
    url: "https://uninfo.org/",
    kind: "api",
    auth: "token",
    notes: "UN INFO provides an API (often Swagger). Recommend proxy + caching.",
  },
  {
    id: "cbpf",
    name: "OCHA CBPF Data Hub",
    url: "https://cbpf.data.unocha.org/",
    kind: "api",
    auth: "none",
    notes: "Public API available. Great for funding/allocations metrics via backend proxy.",
  },
  {
    id: "digital_cooperation",
    name: "UN Digital Cooperation Portal",
    url: "https://undigitalcooperation.org/",
    kind: "website",
    auth: "none",
    notes: "Content portal. Treat as catalog source and ingest key pages as needed.",
  },
];

// ============================================================================
// MOCK DATA (fallback if APIs are not configured yet)
// ============================================================================

const MOCK_GLOBAL_KPIS = {
  activePartnerships: 847,
  partnershipsTrend: 12.4,
  totalFunding: 2847000000,
  fundingTrend: 8.7,
  countriesEngaged: 127,
  countriesTrend: 5.2,
  sdgsImpacted: 17,
  sdgsTrend: 0,
  onTimeReporting: 0.89,
  reportingTrend: 3.1,
  riskScore: 23,
  riskTrend: -5.2,
};

const SDG_COLORS = {
  1: "#E5243B",
  2: "#DDA63A",
  3: "#4C9F38",
  4: "#C5192D",
  5: "#FF3A21",
  6: "#26BDE2",
  7: "#FCC30B",
  8: "#A21942",
  9: "#FD6925",
  10: "#DD1367",
  11: "#FD9D24",
  12: "#BF8B2E",
  13: "#3F7E44",
  14: "#0A97D9",
  15: "#56C02B",
  16: "#00689D",
  17: "#19486A",
};

const MOCK_SDG_DISTRIBUTION = [
  { sdg: 1, name: "No Poverty", partnerships: 89, funding: 342000000, progress: 67 },
  { sdg: 2, name: "Zero Hunger", partnerships: 76, funding: 298000000, progress: 72 },
  { sdg: 3, name: "Good Health", partnerships: 124, funding: 487000000, progress: 78 },
  { sdg: 4, name: "Quality Education", partnerships: 98, funding: 356000000, progress: 81 },
  { sdg: 5, name: "Gender Equality", partnerships: 112, funding: 289000000, progress: 64 },
  { sdg: 7, name: "Clean Energy", partnerships: 87, funding: 412000000, progress: 59 },
  { sdg: 8, name: "Decent Work", partnerships: 94, funding: 267000000, progress: 71 },
  { sdg: 9, name: "Innovation", partnerships: 103, funding: 534000000, progress: 55 },
  { sdg: 13, name: "Climate Action", partnerships: 156, funding: 678000000, progress: 52 },
  { sdg: 16, name: "Peace & Justice", partnerships: 67, funding: 184000000, progress: 69 },
  { sdg: 17, name: "Partnerships", partnerships: 841, funding: 0, progress: 85 },
];

const MOCK_REGIONAL_DATA = [
  { region: "Africa", partnerships: 234, funding: 892000000, beneficiaries: 45000000, sdgs: 15 },
  { region: "Asia-Pacific", partnerships: 198, funding: 743000000, beneficiaries: 89000000, sdgs: 16 },
  { region: "Europe", partnerships: 156, funding: 456000000, beneficiaries: 12000000, sdgs: 14 },
  { region: "Latin America", partnerships: 143, funding: 398000000, beneficiaries: 28000000, sdgs: 13 },
  { region: "Middle East", partnerships: 87, funding: 234000000, beneficiaries: 15000000, sdgs: 12 },
  { region: "North America", partnerships: 29, funding: 124000000, beneficiaries: 3000000, sdgs: 11 },
];

const MOCK_TIME_SERIES = [
  { month: "Feb '24", partnerships: 789, funding: 2.3, beneficiaries: 156 },
  { month: "Mar '24", partnerships: 801, funding: 2.4, beneficiaries: 162 },
  { month: "Apr '24", partnerships: 812, funding: 2.5, beneficiaries: 171 },
  { month: "May '24", partnerships: 798, funding: 2.4, beneficiaries: 168 },
  { month: "Jun '24", partnerships: 823, funding: 2.6, beneficiaries: 178 },
  { month: "Jul '24", partnerships: 834, funding: 2.7, beneficiaries: 184 },
  { month: "Aug '24", partnerships: 821, funding: 2.6, beneficiaries: 181 },
  { month: "Sep '24", partnerships: 839, funding: 2.8, beneficiaries: 189 },
  { month: "Oct '24", partnerships: 845, funding: 2.8, beneficiaries: 192 },
  { month: "Nov '24", partnerships: 838, funding: 2.7, beneficiaries: 188 },
  { month: "Dec '24", partnerships: 842, funding: 2.8, beneficiaries: 191 },
  { month: "Jan '25", partnerships: 847, funding: 2.8, beneficiaries: 194 },
];

const MOCK_PARTNERSHIP_TYPES = [
  { type: "Public-Private", count: 312, value: 45, funding: 1234000000 },
  { type: "Multi-Stakeholder", count: 267, value: 32, funding: 892000000 },
  { type: "Civil Society", count: 156, value: 18, funding: 456000000 },
  { type: "Academic", count: 89, value: 10, funding: 198000000 },
  { type: "Philanthropic", count: 67, value: 8, funding: 67000000 },
];

const MOCK_TOP_PARTNERS = [
  { name: "Global Climate Fund", type: "Philanthropic", funding: 456000000, sdgs: [7, 13], risk: "low" },
  { name: "Tech for Good Alliance", type: "Private Sector", funding: 387000000, sdgs: [4, 9], risk: "low" },
  { name: "Health Systems Coalition", type: "Multi-Stakeholder", funding: 298000000, sdgs: [3], risk: "medium" },
  { name: "Education First Initiative", type: "Civil Society", funding: 234000000, sdgs: [4, 5], risk: "low" },
  { name: "Sustainable Agriculture Network", type: "Public-Private", funding: 198000000, sdgs: [2, 12], risk: "medium" },
  { name: "Clean Water Alliance", type: "Multi-Stakeholder", funding: 176000000, sdgs: [6], risk: "low" },
  { name: "Gender Equality Fund", type: "Philanthropic", funding: 156000000, sdgs: [5, 10], risk: "low" },
  { name: "Innovation Hub Collective", type: "Academic", funding: 143000000, sdgs: [9, 11], risk: "high" },
];

const MOCK_PIPELINE = [
  { stage: "Prospecting", count: 234, value: 892000000 },
  { stage: "Negotiation", count: 89, value: 456000000 },
  { stage: "Due Diligence", count: 45, value: 234000000 },
  { stage: "Contracting", count: 23, value: 123000000 },
  { stage: "Active", count: 847, value: 2847000000 },
  { stage: "Renewal", count: 67, value: 298000000 },
];

const MOCK_ALERTS = [
  { id: 1, type: "risk", priority: "high", title: "Partnership renewal deadline approaching", partner: "Innovation Hub Collective", daysLeft: 12, created: "2 hours ago" },
  { id: 2, type: "opportunity", priority: "medium", title: "New funding opportunity identified", amount: 45000000, sdgs: [7, 13], created: "5 hours ago" },
  { id: 3, type: "risk", priority: "medium", title: "Reporting delay detected", partner: "Health Systems Coalition", delay: 8, created: "1 day ago" },
  { id: 4, type: "success", priority: "low", title: "Milestone achieved: 1M beneficiaries reached", program: "Education Access", created: "2 days ago" },
  { id: 5, type: "warning", priority: "medium", title: "Budget variance exceeds threshold", variance: 12, partner: "Sustainable Agriculture Network", created: "3 days ago" },
];

const MOCK_IMPACT_METRICS = [
  { metric: "Direct Beneficiaries", value: 194000000, target: 200000000, unit: "people" },
  { metric: "Jobs Created", value: 2340000, target: 2500000, unit: "jobs" },
  { metric: "CO2 Emissions Reduced", value: 45600000, target: 50000000, unit: "tons" },
  { metric: "People Lifted from Poverty", value: 12300000, target: 15000000, unit: "people" },
  { metric: "Children Educated", value: 23400000, target: 25000000, unit: "children" },
  { metric: "Healthcare Access Improved", value: 67000000, target: 75000000, unit: "people" },
];

const MOCK_PREDICTIVE_ANALYTICS = {
  fundingForecast: [
    { quarter: "Q1 2025", projected: 2.9, confidence: 0.87, lower: 2.7, upper: 3.1 },
    { quarter: "Q2 2025", projected: 3.2, confidence: 0.82, lower: 2.9, upper: 3.5 },
    { quarter: "Q3 2025", projected: 3.4, confidence: 0.76, lower: 3.0, upper: 3.8 },
    { quarter: "Q4 2025", projected: 3.7, confidence: 0.71, lower: 3.2, upper: 4.2 },
  ],
  riskPredictions: [
    { partner: "Innovation Hub Collective", riskScore: 72, likelihood: 0.68, impact: "high" },
    { partner: "Health Systems Coalition", riskScore: 54, likelihood: 0.42, impact: "medium" },
    { partner: "Sustainable Agriculture Network", riskScore: 48, likelihood: 0.38, impact: "medium" },
  ],
};

// Optional: content feed derived from https://unpartnerships.un.org/ via backend ingestion
const MOCK_UNOP_UPDATES = [
  { title: "UNOP update feed is not yet connected.", url: "https://unpartnerships.un.org/", date: "—", type: "notice" },
];

// ============================================================================
// UTILITIES
// ============================================================================

function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Number(n).toFixed(0);
}

function formatCurrency(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Number(n).toFixed(0)}`;
}

function getRiskBadge(risk) {
  if (risk === "low") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Low Risk</Badge>;
  if (risk === "medium") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Medium Risk</Badge>;
  return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">High Risk</Badge>;
}

function getTrendIcon(value) {
  if (value > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
  if (value < 0) return <ArrowDownRight className="w-4 h-4 text-rose-600" />;
  return <ChevronRight className="w-4 h-4 text-slate-500" />;
}

function getTrendColor(value) {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";
  return "text-slate-500";
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function statusBadge(status) {
  // status: connected | degraded | needs_auth | unavailable | unknown
  if (status === "connected") return <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>;
  if (status === "degraded") return <Badge className="bg-amber-100 text-amber-700">Degraded</Badge>;
  if (status === "needs_auth") return <Badge className="bg-indigo-100 text-indigo-700">Needs Auth</Badge>;
  if (status === "unavailable") return <Badge className="bg-rose-100 text-rose-700">Unavailable</Badge>;
  return <Badge className="bg-slate-100 text-slate-700">Unknown</Badge>;
}

async function fetchJson(url, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function App() {
  const API_BASE = (import.meta?.env?.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

  const [activeView, setActiveView] = useState("executive");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSDG, setSelectedSDG] = useState("all");
  const [selectedPartnerType, setSelectedPartnerType] = useState("all");
  const [timeRange, setTimeRange] = useState("12m");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // API-backed data (with mock fallback)
  const [kpis, setKpis] = useState(null);
  const [unopUpdates, setUnopUpdates] = useState(MOCK_UNOP_UPDATES);
  const [catalogSources, setCatalogSources] = useState(DATA_SOURCES);
  const [catalogHealth, setCatalogHealth] = useState({}); // { [id]: {status, checkedAt, message} }
  const [dataLoadNote, setDataLoadNote] = useState("Using demo data. Connect backend endpoints to go live.");

  // Simulate live clock
  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const loadLiveData = useCallback(async () => {
    const results = {
      kpis: null,
      sources: null,
      health: {},
      unop: null,
      note: "Using demo data. Connect backend endpoints to go live.",
    };

    // 1) Sources registry from backend (optional)
    try {
      const src = await fetchJson(`${API_BASE}/api/catalog/sources`);
      if (Array.isArray(src)) {
        results.sources = src;
      } else if (src && Array.isArray(src.sources)) {
        results.sources = src.sources;
      }
    } catch {
      // ignore
    }

    // 2) KPIs
    try {
      const liveKpis = await fetchJson(`${API_BASE}/api/kpis/global`);
      if (liveKpis && typeof liveKpis === "object") results.kpis = liveKpis;
    } catch {
      // ignore
    }

    // 3) UNOP updates (backend ingestion)
    try {
      const feed = await fetchJson(`${API_BASE}/api/unop/news`);
      if (feed && Array.isArray(feed.items)) results.unop = feed.items;
      else if (Array.isArray(feed)) results.unop = feed;
    } catch {
      // ignore
    }

    // 4) Health probes per source
    const sourcesForHealth = results.sources || DATA_SOURCES;
    await Promise.all(
      sourcesForHealth.map(async (s) => {
        // If auth required, mark needs_auth unless backend health says otherwise.
        if (s.auth === "token") {
          results.health[s.id] = {
            status: "needs_auth",
            checkedAt: new Date().toISOString(),
            message: "Token required",
          };
        }
        try {
          const h = await fetchJson(`${API_BASE}/api/health/${s.id}`);
          if (h && typeof h === "object") {
            results.health[s.id] = {
              status: h.status || results.health[s.id]?.status || "unknown",
              checkedAt: h.checkedAt || new Date().toISOString(),
              message: h.message || "",
              latencyMs: h.latencyMs,
            };
          }
        } catch {
          if (!results.health[s.id]) {
            results.health[s.id] = {
              status: "unknown",
              checkedAt: new Date().toISOString(),
              message: "Health endpoint not configured",
            };
          }
        }
      })
    );

    const isLive = !!results.kpis || !!results.sources || (!!results.unop && results.unop.length > 0);
    if (isLive) results.note = "Live mode: using backend-connected sources (with fallback where needed).";

    setCatalogSources(results.sources || DATA_SOURCES);
    setCatalogHealth(results.health);
    setKpis(results.kpis);
    setUnopUpdates(results.unop || MOCK_UNOP_UPDATES);
    setDataLoadNote(results.note);
  }, [API_BASE]);

  useEffect(() => {
    // Only attempt live calls if API_BASE is configured; otherwise keep demo mode.
    // (Still safe to call, but avoids confusing errors in the console.)
    if (API_BASE) loadLiveData();
  }, [API_BASE, loadLiveData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (API_BASE) await loadLiveData();
    } finally {
      setLastUpdated(new Date());
      setRefreshing(false);
    }
  };

  const activeKpis = kpis || MOCK_GLOBAL_KPIS;

  const filteredPartners = useMemo(() => {
    let filtered = [...MOCK_TOP_PARTNERS];
    if (searchQuery) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedPartnerType !== "all") {
      filtered = filtered.filter((p) => p.type === selectedPartnerType);
    }
    if (selectedSDG !== "all") {
      const sdgNum = parseInt(selectedSDG, 10);
      filtered = filtered.filter((p) => p.sdgs.includes(sdgNum));
    }
    return filtered;
  }, [searchQuery, selectedPartnerType, selectedSDG]);

  const totalBeneficiaries = useMemo(() => {
    return MOCK_REGIONAL_DATA.reduce((sum, r) => sum + r.beneficiaries, 0);
  }, []);

  const sdgTotals = useMemo(() => {
    const total = MOCK_SDG_DISTRIBUTION.reduce((sum, s) => sum + s.partnerships, 0);
    return { total };
  }, []);

  const timeSeriesForCharts = useMemo(() => {
    return MOCK_TIME_SERIES.map((d) => ({
      ...d,
      funding: d.funding * 1_000_000_000,
      beneficiaries: d.beneficiaries * 1_000_000,
    }));
  }, []);

  const pipelineChart = useMemo(() => {
    return MOCK_PIPELINE.map((p) => ({
      ...p,
      valueB: p.value / 1_000_000_000,
    }));
  }, []);

  const partnerTypePie = useMemo(() => {
    return MOCK_PARTNERSHIP_TYPES.map((t) => ({
      name: t.type,
      value: t.count,
      funding: t.funding,
    }));
  }, []);

  const VIEW_CONFIG = {
    executive: {
      title: "Executive Command Center",
      subtitle: "Strategic overview of global partnership ecosystem",
      icon: <Network className="w-5 h-5" />,
      accent: "from-blue-600 to-indigo-600",
      focus: "Strategic KPIs, risk management, global trends",
    },
    donor: {
      title: "Donor Intelligence Suite",
      subtitle: "Funding effectiveness and impact attribution",
      icon: <DollarSign className="w-5 h-5" />,
      accent: "from-emerald-600 to-teal-600",
      focus: "ROI analysis, impact metrics, transparency",
    },
    program: {
      title: "Program Operations Hub",
      subtitle: "Implementation tracking and performance management",
      icon: <Target className="w-5 h-5" />,
      accent: "from-purple-600 to-pink-600",
      focus: "Delivery metrics, milestone tracking, team coordination",
    },
    public: {
      title: "Public Impact Portal",
      subtitle: "Transparent view of UN partnerships creating change",
      icon: <Globe className="w-5 h-5" />,
      accent: "from-orange-600 to-red-600",
      focus: "Storytelling, outcomes, global engagement",
    },
  };

  const currentView = VIEW_CONFIG[activeView];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className={`bg-gradient-to-r ${currentView.accent} text-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">{currentView.icon}</div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{currentView.title}</h1>
                  <Badge className="bg-white/20 text-white border-white/30">UN Office for Partnerships</Badge>
                </div>
                <p className="text-white/90 mt-1 text-sm lg:text-base">{currentView.subtitle}</p>
                <p className="text-white/75 mt-2 text-xs lg:text-sm max-w-2xl">Focus: {currentView.focus}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* View Switcher */}
          <div className="mt-6 flex flex-wrap gap-2">
            {Object.entries(VIEW_CONFIG).map(([key, view]) => (
              <Button
                key={key}
                variant={activeView === key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView(key)}
                className={
                  activeView === key
                    ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }
              >
                {view.icon}
                <span className="ml-2 hidden sm:inline">{view.title.split(" ")[0]}</span>
              </Button>
            ))}
          </div>

          {/* Live Mode banner */}
          <div className="mt-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Database className="w-4 h-4" />
                <span>{API_BASE ? dataLoadNote : "Demo mode: set VITE_API_BASE_URL to enable live data."}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">Sources: {catalogSources.length}</Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  Connected: {Object.values(catalogHealth).filter((h) => h?.status === "connected").length}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  Needs Auth: {Object.values(catalogHealth).filter((h) => h?.status === "needs_auth").length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-md bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Active Partnerships</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Network className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-900">{activeKpis.activePartnerships ?? "—"}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(activeKpis.partnershipsTrend || 0)}
                <span className={`text-sm font-medium ${getTrendColor(activeKpis.partnershipsTrend || 0)}`}>
                  {activeKpis.partnershipsTrend ?? 0}%
                </span>
                <span className="text-sm text-slate-500">vs last quarter</span>
              </div>
              {kpis && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5" /> Live
                </div>
              )}
              {!kpis && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  <WifiOff className="w-3.5 h-3.5" /> Demo
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Funding</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(activeKpis.totalFunding)}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(activeKpis.fundingTrend || 0)}
                <span className={`text-sm font-medium ${getTrendColor(activeKpis.fundingTrend || 0)}`}>{activeKpis.fundingTrend ?? 0}%</span>
                <span className="text-sm text-slate-500">vs last quarter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Countries Engaged</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-900">{activeKpis.countriesEngaged ?? "—"}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(activeKpis.countriesTrend || 0)}
                <span className={`text-sm font-medium ${getTrendColor(activeKpis.countriesTrend || 0)}`}>{activeKpis.countriesTrend ?? 0}%</span>
                <span className="text-sm text-slate-500">vs last quarter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Risk Score</CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Shield className="w-4 h-4 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-900">{activeKpis.riskScore ?? "—"}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(activeKpis.riskTrend || 0)}
                <span className={`text-sm font-medium ${getTrendColor(-(activeKpis.riskTrend || 0))}`}>{Math.abs(activeKpis.riskTrend || 0)}%</span>
                <span className="text-sm text-slate-500">improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search partnerships, partners, programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {MOCK_REGIONAL_DATA.map((r) => (
                      <SelectItem key={r.region} value={r.region.toLowerCase()}>
                        {r.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSDG} onValueChange={setSelectedSDG}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="SDG" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SDGs</SelectItem>
                    {MOCK_SDG_DISTRIBUTION.map((s) => (
                      <SelectItem key={s.sdg} value={String(s.sdg)}>
                        SDG {s.sdg}: {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPartnerType} onValueChange={setSelectedPartnerType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Partner Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Philanthropic">Philanthropic</SelectItem>
                    <SelectItem value="Private Sector">Private Sector</SelectItem>
                    <SelectItem value="Multi-Stakeholder">Multi-Stakeholder</SelectItem>
                    <SelectItem value="Civil Society">Civil Society</SelectItem>
                    <SelectItem value="Public-Private">Public-Private</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant={showAdvanced ? "default" : "outline"} onClick={() => setShowAdvanced(!showAdvanced)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>

            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Time Range</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3m">Last 3 months</SelectItem>
                        <SelectItem value="6m">Last 6 months</SelectItem>
                        <SelectItem value="12m">Last 12 months</SelectItem>
                        <SelectItem value="24m">Last 24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Data Quality</label>
                    <div className="flex items-center gap-3">
                      <Progress value={89} className="flex-1" />
                      <span className="text-sm font-medium text-slate-700">89%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Based on completeness & validation checks</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Alerts Active</label>
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-slate-700">{MOCK_ALERTS.length} alerts</span>
                      <Badge className="bg-rose-100 text-rose-700">{MOCK_ALERTS.filter((a) => a.priority === "high").length} high</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Monitoring 24/7 across all portfolios</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="sdg" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">SDG Impact</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Partners</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Catalogue</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Governance</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Partnership Growth Trend */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Partnership Growth</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">Last 12 months</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesForCharts}>
                        <defs>
                          <linearGradient id="colorPartnerships" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Area type="monotone" dataKey="partnerships" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorPartnerships)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Funding & Beneficiaries */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Funding & Reach</CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700">Real-time</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={timeSeriesForCharts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#64748B" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value, name) => {
                            if (name === "Funding") return [formatCurrency(value), name];
                            if (name === "Beneficiaries") return [formatNumber(value), name];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="funding" name="Funding" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="beneficiaries" name="Beneficiaries" stroke="#8B5CF6" strokeWidth={3} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <div className="text-sm text-emerald-700 font-medium">Total Funding</div>
                      <div className="text-xl font-bold text-emerald-900">{formatCurrency(activeKpis.totalFunding)}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="text-sm text-purple-700 font-medium">Total Beneficiaries</div>
                      <div className="text-xl font-bold text-purple-900">{formatNumber(totalBeneficiaries)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* UNOP Updates (from backend ingestion) */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">UNOP Latest Updates</CardTitle>
                  <Badge className="bg-slate-100 text-slate-700">Source: unpartnerships.un.org</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(unopUpdates?.length ? unopUpdates : MOCK_UNOP_UPDATES).slice(0, 6).map((item, idx) => (
                    <div key={`${item.url}-${idx}`} className="p-4 border border-slate-200 rounded-2xl bg-gradient-to-br from-white to-slate-50 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.date || item.publishedAt || ""}</div>
                        </div>
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {item.summary && <div className="text-xs text-slate-600 mt-2 line-clamp-3">{item.summary}</div>}
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Tip: Implement <code className="px-1 py-0.5 bg-slate-100 rounded">GET /api/unop/news</code> on your backend to replace this feed with live items.
                </div>
              </CardContent>
            </Card>

            {/* Regional Performance */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">Regional Performance</CardTitle>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">6 regions</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_REGIONAL_DATA.map((region) => (
                    <div key={region.region} className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">{region.region}</h3>
                        <Badge className="bg-slate-100 text-slate-700">{region.sdgs} SDGs</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Partnerships</span>
                          <span className="text-sm font-medium text-slate-900">{region.partnerships}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Funding</span>
                          <span className="text-sm font-medium text-slate-900">{formatCurrency(region.funding)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Beneficiaries</span>
                          <span className="text-sm font-medium text-slate-900">{formatNumber(region.beneficiaries)}</span>
                        </div>
                        <Progress value={(region.partnerships / 250) * 100} className="mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SDG TAB */}
          <TabsContent value="sdg" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">SDG Portfolio Distribution</CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-700">{sdgTotals.total} partnerships</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={MOCK_SDG_DISTRIBUTION} dataKey="partnerships" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={60} paddingAngle={2}>
                          {MOCK_SDG_DISTRIBUTION.map((entry) => (
                            <Cell key={entry.sdg} fill={SDG_COLORS[entry.sdg]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value, name, props) => {
                            const sdg = props.payload.sdg;
                            return [`${value} partnerships`, `SDG ${sdg}: ${props.payload.name}`];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 space-y-3">
                    {MOCK_SDG_DISTRIBUTION.slice(0, 5).map((sdg) => (
                      <div key={sdg.sdg} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: SDG_COLORS[sdg.sdg] }} />
                          <span className="text-sm font-medium text-slate-900">SDG {sdg.sdg}</span>
                          <span className="text-sm text-slate-600">{sdg.name}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{sdg.partnerships}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">SDG Progress Index</CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700">Impact tracking</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={MOCK_SDG_DISTRIBUTION.slice(0, 8)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar name="Progress" dataKey="progress" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <Sparkles className="w-4 h-4" />
                      <AlertTitle className="text-blue-900">AI Insight</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Climate Action (SDG 13) shows highest partnership volume but lowest progress score, suggesting need for enhanced implementation support.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">Global Impact Metrics</CardTitle>
                  <Badge className="bg-purple-100 text-purple-700">Target tracking</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_IMPACT_METRICS.map((metric) => {
                    const progress = (metric.value / metric.target) * 100;
                    return (
                      <div key={metric.metric} className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">{metric.metric}</h3>
                            <p className="text-sm text-slate-500">
                              Target: {formatNumber(metric.target)} {metric.unit}
                            </p>
                          </div>
                          <div
                            className={`p-2 rounded-lg ${
                              progress >= 90 ? "bg-emerald-100" : progress >= 70 ? "bg-amber-100" : "bg-rose-100"
                            }`}
                          >
                            <TrendingUp
                              className={`w-4 h-4 ${
                                progress >= 90 ? "text-emerald-600" : progress >= 70 ? "text-amber-600" : "text-rose-600"
                              }`}
                            />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-2">{formatNumber(metric.value)}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-900">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={clamp(progress, 0, 100)} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PARTNERS TAB */}
          <TabsContent value="partners" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Top Strategic Partners</CardTitle>
                    <Badge className="bg-slate-100 text-slate-700">{filteredPartners.length} shown</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPartners.map((partner) => (
                      <div key={partner.name} className="p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-slate-900 text-lg">{partner.name}</h3>
                              {getRiskBadge(partner.risk)}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-slate-600">{partner.type}</span>
                              <span className="text-sm font-medium text-slate-900">{formatCurrency(partner.funding)}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {partner.sdgs.map((sdg) => (
                                <Badge key={sdg} className="text-xs" style={{ backgroundColor: SDG_COLORS[sdg], color: "white" }}>
                                  SDG {sdg}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Partner Mix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={partnerTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                          {partnerTypePie.map((_, index) => (
                            <Cell key={index} fill={["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 space-y-3">
                    {MOCK_PARTNERSHIP_TYPES.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"][index % 5] }} />
                          <span className="text-sm text-slate-700">{type.type}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{type.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PIPELINE TAB */}
          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Partnership Pipeline</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">{MOCK_PIPELINE[0].count + MOCK_PIPELINE[1].count + MOCK_PIPELINE[2].count} in development</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipelineChart} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="stage" width={80} />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "count") return [value, "Count"];
                            if (name === "valueB") return [`$${value}B`, "Value"];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600">Pipeline Value</div>
                      <div className="text-lg font-bold text-slate-900">{formatCurrency(MOCK_PIPELINE.reduce((sum, p) => sum + p.value, 0))}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600">Conversion Rate</div>
                      <div className="text-lg font-bold text-slate-900">72%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Active Alerts</CardTitle>
                    <Badge className="bg-rose-100 text-rose-700">{MOCK_ALERTS.filter((a) => a.priority === "high").length} high priority</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {MOCK_ALERTS.map((alert) => (
                      <div key={alert.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {alert.type === "risk" && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                              {alert.type === "opportunity" && <Sparkles className="w-4 h-4 text-emerald-600" />}
                              {alert.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              {alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                              <span className="text-sm font-medium text-slate-900">{alert.title}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {alert.partner && `Partner: ${alert.partner}`}
                              {alert.program && `Program: ${alert.program}`}
                              {alert.amount && `Amount: ${formatCurrency(alert.amount)}`}
                              {alert.daysLeft && `${alert.daysLeft} days left`}
                              {alert.delay && `${alert.delay} days delayed`}
                              {alert.variance && `${alert.variance}% variance`}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">{alert.created}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DATA CATALOGUE TAB */}
          <TabsContent value="catalog" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">Connected Data Catalogue</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-700">{catalogSources.length} sources</Badge>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                      <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                      Re-check
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogSources.map((s) => {
                    const h = catalogHealth?.[s.id];
                    const authBadge = s.auth === "token" ? (
                      <Badge className="bg-indigo-100 text-indigo-700">
                        <KeyRound className="w-3 h-3 mr-1" /> Auth
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700">Public</Badge>
                    );
                    return (
                      <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                              <Badge className="bg-blue-100 text-blue-700">
                                <LinkIcon className="w-3 h-3 mr-1" /> {s.kind}
                              </Badge>
                              {authBadge}
                              {statusBadge(h?.status)}
                            </div>
                            <div className="mt-2 text-xs text-slate-600 break-all">{s.url}</div>
                            {s.notes && <div className="mt-2 text-xs text-slate-500">{s.notes}</div>}
                          </div>
                          <a href={s.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[11px] text-slate-500">Last check</div>
                            <div className="text-xs font-medium text-slate-900">{h?.checkedAt ? new Date(h.checkedAt).toLocaleString() : "—"}</div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-[11px] text-slate-500">Latency</div>
                            <div className="text-xs font-medium text-slate-900">{h?.latencyMs != null ? `${h.latencyMs} ms` : "—"}</div>
                          </div>
                        </div>

                        {h?.message && <div className="mt-3 text-xs text-slate-600">{h.message}</div>}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Alert className="border-slate-200 bg-slate-50">
                    <Database className="w-4 h-4" />
                    <AlertTitle className="text-slate-900">How this connects</AlertTitle>
                    <AlertDescription className="text-slate-600">
                      This tab reads from <code className="px-1 py-0.5 bg-white rounded border">/api/catalog/sources</code> and health probes at <code className="px-1 py-0.5 bg-white rounded border">/api/health/:sourceId</code>. If those endpoints are not present yet, the UI still works with a static catalogue.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">AI Funding Forecast</CardTitle>
                    <Badge className="bg-purple-100 text-purple-700">Predictive</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_PREDICTIVE_ANALYTICS.fundingForecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}B`, "Funding"]} />
                        <Legend />
                        <Line type="monotone" dataKey="lower" name="Lower Bound" stroke="#94A3B8" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="projected" name="Projected" stroke="#8B5CF6" strokeWidth={3} />
                        <Line type="monotone" dataKey="upper" name="Upper Bound" stroke="#94A3B8" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Forecast Summary</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Projected funding growth of 31% by Q4 2025 with 71% confidence. Key drivers: climate finance expansion and new private sector commitments.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Funding Flow Network</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">Network</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <Network className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-sm">Connect your backend to supply flow data (Sankey/D3) from CBPF/UN INFO and internal systems.</p>
                      <p className="text-xs text-slate-400 mt-1">This placeholder keeps the UI stable until flows are wired.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">Risk Predictions</CardTitle>
                  <Badge className="bg-amber-100 text-amber-700">Early warning</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Partner</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Risk Score</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Likelihood</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Impact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PREDICTIVE_ANALYTICS.riskPredictions.map((risk) => (
                        <tr key={risk.partner} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-900">{risk.partner}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${risk.riskScore >= 70 ? "bg-rose-500" : risk.riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"}`} />
                              <span className="font-medium">{risk.riskScore}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-700">{(risk.likelihood * 100).toFixed(0)}%</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={risk.impact === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>{risk.impact}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button variant="outline" size="sm">Review</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GOVERNANCE TAB */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Data Lineage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Sources Connected</span>
                        <Badge className="bg-emerald-100 text-emerald-700">{Object.values(catalogHealth).filter((h) => h?.status === "connected").length}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">UN Partner Portal, UNdata, UN INFO, CBPF, UNOP content ingestion</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Refresh Cycle</span>
                        <Badge className="bg-blue-100 text-blue-700">Hourly</Badge>
                      </div>
                      <p className="text-xs text-slate-500">Automated ETL with validation & anomaly detection</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Quality Score</span>
                        <Badge className="bg-purple-100 text-purple-700">89%</Badge>
                      </div>
                      <p className="text-xs text-slate-500">Completeness, accuracy, timeliness metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Role-based Access",
                      "Audit Logging",
                      "Encryption at Rest",
                      "PII Detection",
                      "GDPR Compliance",
                    ].map((t) => (
                      <div key={t} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t}</span>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Last Access</span>
                        <span className="text-xs text-slate-500">2 min ago</span>
                      </div>
                      <p className="text-xs text-slate-500">Executive view accessed by Admin</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Last Export</span>
                        <span className="text-xs text-slate-500">1 hour ago</span>
                      </div>
                      <p className="text-xs text-slate-500">Quarterly report generated (PDF)</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Data Change</span>
                        <span className="text-xs text-slate-500">3 hours ago</span>
                      </div>
                      <p className="text-xs text-slate-500">Funding update from donor CRM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-slate-200 bg-slate-50">
              <Settings className="w-4 h-4" />
              <AlertTitle className="text-slate-900">Governance Roadmap</AlertTitle>
              <AlertDescription className="text-slate-600">
                <strong>Next steps:</strong> Integrate with a data catalog platform (DataHub/OpenMetadata/Purview), implement SSO, and enable automated compliance reporting.
                <br />
                <strong>Localization:</strong> Support 6 UN official languages with dynamic content translation.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

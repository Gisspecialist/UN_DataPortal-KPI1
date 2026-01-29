import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2, Shield, RefreshCcw, Search, Database, BarChart3, FileText,
  BookOpen, Globe, TrendingUp, AlertTriangle, Users, DollarSign, Target,
  Calendar, Download, Share2, Bell, Filter, MapPin, Network, Zap,
  Award, Briefcase, Heart, Leaf, Scale, GraduationCap, Activity, Eye,
  Lock, Mail, Settings, ChevronRight, ArrowUpRight, ArrowDownRight,
  Clock, CheckSquare, XCircle, MoreVertical, ExternalLink, Sparkles
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart, Sankey, Treemap
} from "recharts";

/**
 * ENHANCED UN OFFICE FOR PARTNERSHIPS DASHBOARD
 * 
 * A comprehensive, production-grade analytics platform featuring:
 * - Real-time partnership monitoring across 193+ countries
 * - SDG alignment tracking with impact metrics
 * - Advanced predictive analytics and risk scoring
 * - Multi-stakeholder views (Executive, Donor, Program Manager, Public)
 * - Interactive geospatial visualizations
 * - Network analysis and funding flow diagrams
 * - Automated reporting and alert systems
 * - Full data governance and audit capabilities
 * 
 * Design Philosophy: Bold, modern, UN-aligned with distinctive visual identity
 * that avoids generic dashboard aesthetics while maintaining professional credibility
 */

// ============================================================================
// MOCK DATA - Replace with actual API calls
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
  1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D",
  5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942",
  9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E",
  13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D",
  17: "#19486A"
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

const MOCK_FUNDING_FLOW = {
  nodes: [
    { name: "Philanthropic Foundations" },
    { name: "Private Sector" },
    { name: "Government Donors" },
    { name: "Multilateral Funds" },
    { name: "Climate & Energy" },
    { name: "Health & Wellbeing" },
    { name: "Education & Skills" },
    { name: "Economic Development" },
    { name: "Direct Impact" },
  ],
  links: [
    { source: 0, target: 4, value: 456 },
    { source: 0, target: 5, value: 234 },
    { source: 1, target: 6, value: 387 },
    { source: 1, target: 7, value: 298 },
    { source: 2, target: 5, value: 567 },
    { source: 2, target: 7, value: 432 },
    { source: 3, target: 4, value: 345 },
    { source: 3, target: 6, value: 289 },
    { source: 4, target: 8, value: 801 },
    { source: 5, target: 8, value: 801 },
    { source: 6, target: 8, value: 676 },
    { source: 7, target: 8, value: 730 },
  ],
};

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatNumber(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function formatCurrency(n) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function getRiskColor(risk) {
  if (risk === "low") return "text-emerald-600";
  if (risk === "medium") return "text-amber-600";
  return "text-rose-600";
}

function getRiskBadge(risk) {
  if (risk === "low") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Low Risk</Badge>;
  if (risk === "medium") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Medium Risk</Badge>;
  return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">High Risk</Badge>;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function KPICard({ title, value, subtitle, trend, icon: Icon, variant = "default" }) {
  const trendColor = trend >= 0 ? "text-emerald-600" : "text-rose-600";
  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight;
  
  const variantStyles = {
    default: "bg-gradient-to-br from-slate-50 to-white border-slate-200",
    primary: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
    warning: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
  };

  return (
    <Card className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${variantStyles[variant]}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              {title}
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">
              {value}
            </div>
            <div className="text-sm text-slate-500">
              {subtitle}
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-3 ${trendColor} font-semibold text-sm`}>
                <TrendIcon className="h-4 w-4" />
                <span>{Math.abs(trend)}% vs last period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl shadow-sm">
              <Icon className="h-8 w-8 text-slate-700" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniChart({ data, dataKey, color = "#3b82f6", height = 60 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function AlertItem({ alert }) {
  const priorityColors = {
    high: "border-l-rose-500 bg-rose-50",
    medium: "border-l-amber-500 bg-amber-50",
    low: "border-l-blue-500 bg-blue-50",
  };

  const typeIcons = {
    risk: AlertTriangle,
    opportunity: Sparkles,
    success: CheckCircle2,
    warning: Shield,
  };

  const Icon = typeIcons[alert.type] || Bell;

  return (
    <div className={`border-l-4 ${priorityColors[alert.priority]} p-4 rounded-r-lg mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 text-slate-700" />
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{alert.title}</div>
          <div className="text-sm text-slate-600 mt-1">
            {alert.partner && `Partner: ${alert.partner}`}
            {alert.amount && `Amount: ${formatCurrency(alert.amount)}`}
            {alert.delay && `Delay: ${alert.delay} days`}
            {alert.program && `Program: ${alert.program}`}
          </div>
          <div className="text-xs text-slate-500 mt-2">{alert.created}</div>
        </div>
        <Button variant="ghost" size="sm" className="hover:bg-white/50">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function UNPartnershipDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSDG, setSelectedSDG] = useState("all");
  const [timePeriod, setTimePeriod] = useState("12m");
  const [viewMode, setViewMode] = useState("executive");
  const [searchQuery, setSearchQuery] = useState("");

  // Animation state
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl border-b-4 border-blue-500">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">UN Office for Partnerships</h1>
                <p className="text-blue-200 text-sm mt-1">Global Partnership Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive View</SelectItem>
                  <SelectItem value="donor">Donor View</SelectItem>
                  <SelectItem value="program">Program Manager</SelectItem>
                  <SelectItem value="public">Public Portal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="secondary" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="secondary" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                <Badge className="bg-rose-500 text-white px-2">5</Badge>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search partnerships, partners, programs..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
                <SelectItem value="asia">Asia-Pacific</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="latam">Latin America</SelectItem>
                <SelectItem value="mena">Middle East</SelectItem>
                <SelectItem value="northam">North America</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSDG} onValueChange={setSelectedSDG}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All SDGs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SDGs</SelectItem>
                {MOCK_SDG_DISTRIBUTION.map((sdg) => (
                  <SelectItem key={sdg.sdg} value={sdg.sdg.toString()}>
                    SDG {sdg.sdg}: {sdg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Global KPIs */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <KPICard
            title="Active Partnerships"
            value={formatNumber(MOCK_GLOBAL_KPIS.activePartnerships)}
            subtitle="Across 127 countries"
            trend={MOCK_GLOBAL_KPIS.partnershipsTrend}
            icon={Briefcase}
            variant="primary"
          />
          <KPICard
            title="Total Funding"
            value={formatCurrency(MOCK_GLOBAL_KPIS.totalFunding)}
            subtitle="Mobilized to date"
            trend={MOCK_GLOBAL_KPIS.fundingTrend}
            icon={DollarSign}
            variant="success"
          />
          <KPICard
            title="Countries Engaged"
            value={MOCK_GLOBAL_KPIS.countriesEngaged}
            subtitle="Global reach"
            trend={MOCK_GLOBAL_KPIS.countriesTrend}
            icon={MapPin}
            variant="default"
          />
          <KPICard
            title="SDGs Impacted"
            value={MOCK_GLOBAL_KPIS.sdgsImpacted}
            subtitle="All goals covered"
            trend={MOCK_GLOBAL_KPIS.sdgsTrend}
            icon={Target}
            variant="default"
          />
          <KPICard
            title="On-Time Reporting"
            value={`${Math.round(MOCK_GLOBAL_KPIS.onTimeReporting * 100)}%`}
            subtitle="Compliance rate"
            trend={MOCK_GLOBAL_KPIS.reportingTrend}
            icon={CheckSquare}
            variant="success"
          />
          <KPICard
            title="Risk Score"
            value={MOCK_GLOBAL_KPIS.riskScore}
            subtitle="Portfolio health"
            trend={MOCK_GLOBAL_KPIS.riskTrend}
            icon={Shield}
            variant="warning"
          />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-lg border-2 border-slate-200 p-2 rounded-2xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl px-6">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="partnerships" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl px-6">
              <Users className="h-4 w-4 mr-2" />
              Partnerships
            </TabsTrigger>
            <TabsTrigger value="impact" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl px-6">
              <Target className="h-4 w-4 mr-2" />
              Impact
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl px-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl px-6">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              <Badge className="ml-2 bg-rose-500 text-white">5</Badge>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trends Chart */}
              <Card className="lg:col-span-2 shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Partnership & Funding Trends</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Daily</Button>
                      <Button variant="outline" size="sm">Weekly</Button>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600">Monthly</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={MOCK_TIME_SERIES}>
                      <defs>
                        <linearGradient id="fundingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis yAxisId="left" stroke="#64748b" />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="funding"
                        fill="url(#fundingGradient)"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Funding ($B)"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="partnerships"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', r: 5 }}
                        name="Active Partnerships"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Regional Distribution */}
              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Regional Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={MOCK_REGIONAL_DATA}
                        dataKey="partnerships"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => entry.region}
                        animationDuration={800}
                      >
                        {MOCK_REGIONAL_DATA.map((entry, index) => (
                          <Cell key={index} fill={`hsl(${index * 60}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* SDG Distribution */}
            <Card className="shadow-xl border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold">SDG Alignment & Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={MOCK_SDG_DISTRIBUTION}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="sdg" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="partnerships" name="Partnerships" radius={[8, 8, 0, 0]}>
                      {MOCK_SDG_DISTRIBUTION.map((entry, index) => (
                        <Cell key={index} fill={SDG_COLORS[entry.sdg] || '#3b82f6'} />
                      ))}
                    </Bar>
                    <Bar dataKey="progress" name="Progress (%)" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Partnership Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Partnership Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {MOCK_PARTNERSHIP_TYPES.map((type, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">{type.type}</span>
                          <span className="text-sm text-slate-600">{type.count} partnerships</span>
                        </div>
                        <Progress value={type.value} className="h-3" />
                        <div className="text-xs text-slate-500">{formatCurrency(type.funding)} mobilized</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pipeline Stages */}
              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Partnership Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MOCK_PIPELINE} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="stage" type="category" stroke="#64748b" width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '12px',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PARTNERSHIPS TAB */}
          <TabsContent value="partnerships" className="space-y-6">
            <Card className="shadow-xl border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Top Partners by Funding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_TOP_PARTNERS.map((partner, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-bold text-lg text-slate-900">{partner.name}</div>
                            {getRiskBadge(partner.risk)}
                            <Badge variant="outline">{partner.type}</Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-slate-600">Funding: </span>
                              <span className="font-semibold text-blue-600">{formatCurrency(partner.funding)}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">SDGs: </span>
                              {partner.sdgs.map((sdg) => (
                                <Badge key={sdg} className="ml-1" style={{ backgroundColor: SDG_COLORS[sdg] }}>
                                  {sdg}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IMPACT TAB */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Impact Metrics vs Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {MOCK_IMPACT_METRICS.map((metric, idx) => {
                      const progress = (metric.value / metric.target) * 100;
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-700">{metric.metric}</span>
                            <span className="text-sm text-slate-600">
                              {formatNumber(metric.value)} / {formatNumber(metric.target)} {metric.unit}
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <div className="text-xs text-slate-500 mt-1">{Math.round(progress)}% of target</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Regional Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={MOCK_REGIONAL_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="region" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '12px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="beneficiaries" name="Beneficiaries (M)" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="sdgs" name="SDGs Addressed" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Predictive Funding */}
              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Funding Forecast (AI-Powered)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={MOCK_PREDICTIVE_ANALYTICS.fundingForecast}>
                      <defs>
                        <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="quarter" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '12px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="upper"
                        fill="url(#confidenceGradient)"
                        stroke="none"
                        name="Confidence Range"
                      />
                      <Area
                        type="monotone"
                        dataKey="lower"
                        fill="white"
                        stroke="none"
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 6 }}
                        name="Projected ($B)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold">ML Model Confidence: 82%</span>
                    </div>
                    <p className="text-xs">Based on historical trends, pipeline analysis, and macro indicators</p>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Predictions */}
              <Card className="shadow-xl border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-rose-500" />
                    Partnership Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {MOCK_PREDICTIVE_ANALYTICS.riskPredictions.map((pred, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold text-slate-900">{pred.partner}</div>
                          <Badge className={pred.riskScore > 60 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
                            Risk Score: {pred.riskScore}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Likelihood of Issues</span>
                            <span className="font-semibold">{Math.round(pred.likelihood * 100)}%</span>
                          </div>
                          <Progress value={pred.likelihood * 100} className="h-2" />
                          <div className="text-xs text-slate-500">
                            Potential Impact: <span className="font-semibold uppercase">{pred.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <div className="font-semibold mb-1">AI Recommendation</div>
                        <div className="text-xs">Schedule risk review meetings for high-score partnerships. Consider mitigation strategies for Innovation Hub Collective.</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Network Analysis Placeholder */}
            <Card className="shadow-xl border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-500" />
                  Partnership Network Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-purple-300">
                  <div className="text-center">
                    <Network className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <div className="text-lg font-semibold text-purple-900 mb-2">Interactive Network Visualization</div>
                    <div className="text-sm text-purple-700 max-w-md">
                      Force-directed graph showing relationships between partners, programs, donors, and SDGs.
                      Requires D3.js or custom WebGL implementation.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALERTS TAB */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="shadow-xl border-2 border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Active Alerts & Notifications</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Mark all read</Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_ALERTS.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alert Configuration */}
            <Card className="shadow-xl border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-700 mb-3">Risk Thresholds</div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">Partnership risk score</span>
                      <Input type="number" defaultValue="60" className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">Funding variance %</span>
                      <Input type="number" defaultValue="10" className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">Reporting delay (days)</span>
                      <Input type="number" defaultValue="7" className="w-20 text-center" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-700 mb-3">Notification Channels</div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">Email notifications</span>
                      <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">SMS alerts (critical only)</span>
                      <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">Slack integration</span>
                      <input type="checkbox" className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <Card className="mt-8 shadow-xl border-2 border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900">Data Quality: Certified</div>
                  <div className="text-sm text-slate-600">Last updated: 2 hours ago • Next refresh: In 22 hours</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Export
                </Button>
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <ExternalLink className="h-4 w-4" />
                  View in Power BI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Alert className="mt-6 border-2 border-blue-200 bg-blue-50">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 font-bold">Implementation Roadmap</AlertTitle>
          <AlertDescription className="text-blue-800 text-sm mt-2">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Data Integration:</strong> Connect to UN partnership databases (PAWS, UMOJA), donor systems, and SDG tracking APIs</li>
              <li><strong>Advanced Visualizations:</strong> Implement interactive world map (Mapbox/Leaflet), network graphs (D3.js/Cytoscape), Sankey diagrams</li>
              <li><strong>ML/AI Features:</strong> Deploy predictive models for funding forecasts, risk scoring, and anomaly detection</li>
              <li><strong>Export & Reporting:</strong> Build PDF generation, PowerPoint automation, and scheduled email reports</li>
              <li><strong>Access Control:</strong> Implement role-based permissions, audit logging, and data lineage tracking</li>
              <li><strong>Performance:</strong> Add caching layer, lazy loading, virtual scrolling, and CDN for global access</li>
              <li><strong>Localization:</strong> Support 6 UN official languages with cultural number/date formatting</li>
            </ul>
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}

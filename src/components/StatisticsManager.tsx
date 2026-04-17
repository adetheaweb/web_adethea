import React from "react";
import { motion } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { TrendingUp, Users, Eye, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";

const DATA_TRAFFIC = [
  { name: "Sen", uv: 4000, pv: 2400 },
  { name: "Sel", uv: 3000, pv: 1398 },
  { name: "Rab", uv: 2000, pv: 9800 },
  { name: "Kam", uv: 2780, pv: 3908 },
  { name: "Jum", uv: 1890, pv: 4800 },
  { name: "Sab", uv: 2390, pv: 3800 },
  { name: "Min", uv: 3490, pv: 4300 },
];

const DATA_CATEGORIES = [
  { name: "Tech", value: 400, color: "#6366f1" },
  { name: "Design", value: 300, color: "#10b981" },
  { name: "Lifestyle", value: 200, color: "#f43f5e" },
  { name: "News", value: 278, color: "#f59e0b" },
];

export default function StatisticsManager() {
  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">Statistik Data</h1>
        <p className="text-white/60">Analisis performa konten dan interaksi pengguna secara real-time.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Kunjungan", value: "24.5K", delta: "+12%", icon: Eye, color: "text-blue-400" },
          { label: "Pengguna Aktif", value: "1.2K", delta: "+5%", icon: Users, color: "text-emerald-400" },
          { label: "Total Artikel", value: "854", delta: "+24", icon: FileText, color: "text-purple-400" },
          { label: "Engagement", value: "68%", delta: "-2%", icon: TrendingUp, color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 p-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center text-[10px] font-bold ${stat.delta.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.delta} {stat.delta.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1 font-mono">{stat.value}</div>
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 p-8 lg:p-10">
          <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-500 rounded-full" />
            Trafik Kunjungan Mingguan
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_TRAFFIC}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    color: '#fff'
                  }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="uv" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUv)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 p-8 lg:p-10">
          <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-2 h-8 bg-purple-500 rounded-full" />
            Populer Kategori
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_CATEGORIES}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                  }} 
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {DATA_CATEGORIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

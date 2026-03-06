"use client";

import React from 'react';
import {
  MapPin,
  Building2,
  Users,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// --- Mock Data ---
const STATS = [
  { label: 'Total Regions',     value: '18',   icon: MapPin    },
  { label: 'Franchise Groups',  value: '7',    icon: Building2 },
  { label: 'Regional Managers', value: '18',   icon: Users     },
  { label: 'Avg Growth',        value: '+16%', icon: TrendingUp },
];

const PERFORMANCE_DATA = [
  { name: 'Maha',  value: 78 },
  { name: 'Karn',  value: 56 },
  { name: 'Delhi', value: 49 },
  { name: 'Tami',  value: 42 },
  { name: 'Tela',  value: 37 },
];

const REGIONS = [
  { name: 'Maharashtra', salons: 78, manager: 'Suresh Iyer',  revenue: '₹22.4L', growth: '+18%' },
  { name: 'Karnataka',   salons: 56, manager: 'Divya Rao',    revenue: '₹16.8L', growth: '+14%' },
  { name: 'Delhi NCR',   salons: 49, manager: 'Rajesh Kumar', revenue: '₹14.2L', growth: '+11%' },
  { name: 'Tamil Nadu',  salons: 42, manager: 'Meera S',      revenue: '₹11.9L', growth: '+22%' },
  { name: 'Telangana',   salons: 37, manager: 'Ravi Teja',    revenue: '₹9.8L',  growth: '+16%' },
];

export default function RegionControlPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF3] font-sans text-[#433E37]">

      {/* Header */}
      <header className="mb-6 sm:mb-8 lg:mb-10">
        <h1 className="text-[22px] sm:text-3xl font-serif font-bold text-[#2D2A26]">
          Region &amp; Franchise Control
        </h1>
        <p className="text-[#8C877D] mt-1 text-sm">
          Manage regions, franchise performance and regional managers
        </p>
      </header>

      {/* Stats Grid
            mobile:  2 cols
            md+:     4 cols
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {STATS.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#F2EFE6] shadow-sm"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-[#8C877D] text-xs sm:text-sm font-medium leading-snug">
                {stat.label}
              </p>
              <stat.icon size={16} className="text-[#D4A117] flex-shrink-0" strokeWidth={1.5} />
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2A26]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid
            mobile:  1 col stacked
            lg:      2 equal cols (col-span-6 / col-span-6)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">

        {/* Region Performance Chart */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#F2EFE6] shadow-sm">
          <h2 className="text-base sm:text-lg font-serif font-bold mb-5 sm:mb-8">
            Region Performance
          </h2>
          <div className="h-56 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PERFORMANCE_DATA}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFE6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8C877D', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8C877D', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#FDFBF3' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#D4A117"
                  radius={[4, 4, 0, 0]}
                  barSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Regions Overview List */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#F2EFE6] shadow-sm">
          <h2 className="text-base sm:text-lg font-serif font-bold mb-5 sm:mb-8">
            Regions Overview
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {REGIONS.map((region, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 group cursor-pointer"
              >
                {/* Left: icon + name + details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDFBF3] flex items-center justify-center border border-[#F2EFE6] flex-shrink-0">
                    <MapPin size={16} className="text-[#D4A117]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#2D2A26] truncate">{region.name}</h3>
                    <p className="text-xs text-[#8C877D] truncate">
                      {region.salons} salons ·{" "}
                      <span className="text-[#A6A196]">{region.manager}</span>
                    </p>
                  </div>
                </div>

                {/* Right: revenue + growth + chevron */}
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#2D2A26]">{region.revenue}</p>
                    <p className="text-xs font-bold text-[#059669]">{region.growth}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#D9D4C7] group-hover:translate-x-1 transition-transform hidden sm:block"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
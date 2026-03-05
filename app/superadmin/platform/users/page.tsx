"use client";

import React from 'react';
import { Search, Plus, Settings, Ban, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from "react";

// --- Types ---
type UserStatus = 'active' | 'blocked' | 'pending';

interface Role {
  name: string;
  description: string;
  count: number;
  isActive?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  status: UserStatus;
  lastActive: string;
  initials: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ROLES: Role[] = [
  { name: 'Super Admin', description: 'Full Access', count: 2, isActive: true },
  { name: 'Salon Admin', description: 'Salon Management', count: 89 },
  { name: 'Branch Manager', description: 'Branch Operations', count: 234 },
  { name: 'Staff', description: 'Booking & Services', count: 1847 },
  { name: 'Receptionist', description: 'Front Desk', count: 562 },
];

const USERS_PER_PAGE = 7;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: USERS_PER_PAGE,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = (page: number) => {
    setIsLoading(true);
    fetch(`http://localhost:3001/api/superdashboard/users?page=${page}&limit=${USERS_PER_PAGE}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);
        setPagination(data.pagination);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUsers(page);
  };

  // Generate page number buttons with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    const { currentPage, totalPages } = pagination;
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="min-h-screen bg-[#FDFBF3] p-10 font-sans text-[#433E37]">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2A26]">User Management</h1>
          <p className="text-[#8C877D] mt-1">Manage users, roles and permissions across the platform</p>
        </div>
        <button className="bg-[#D4A117] hover:bg-[#B88A12] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm">
          <Plus size={20} /> Add User
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8">

        {/* Left Sidebar: Roles & Permissions */}
        <aside className="col-span-3 bg-white rounded-3xl p-6 border border-[#F2EFE6] shadow-sm h-fit">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-lg">Roles & Permissions</h2>
            <button className="text-[#D4A117] text-sm flex items-center gap-1.5 hover:underline">
              <Settings size={14} strokeWidth={2.5} /> Configure
            </button>
          </div>

          <nav className="space-y-7">
            {ROLES.map((role) => (
              <div key={role.name} className="flex justify-between items-center cursor-pointer group">
                <div>
                  <h3 className={`font-semibold ${role.isActive ? 'text-[#D4A117]' : 'text-[#433E37]'}`}>
                    {role.name}
                  </h3>
                  <p className="text-xs text-[#A6A196]">{role.description}</p>
                </div>
                <div className="flex items-center gap-2 text-[#433E37]">
                  <span className="font-bold text-sm">{role.count.toLocaleString()}</span>
                  <ChevronRight size={16} className="text-[#D9D4C7] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </nav>

          <button className="w-full mt-10 py-3.5 border-2 border-dashed border-[#E8E4D8] rounded-2xl text-[#B3AE9F] text-sm font-bold hover:border-[#D4A117] hover:text-[#D4A117] transition-all">
            + Create Custom Role
          </button>
        </aside>

        {/* Right Content: User Table */}
        <main className="col-span-9 bg-white rounded-3xl border border-[#F2EFE6] shadow-sm overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="p-5 border-b border-[#F9F8F3]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BFB9AB] group-focus-within:text-[#D4A117] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-12 pr-4 py-3 bg-[#F9F8F3] border-none rounded-2xl focus:ring-2 focus:ring-[#D4A117]/20 outline-none placeholder-[#BFB9AB] text-sm transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-[#B3AE9F] font-bold border-b border-[#F9F8F3]">
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Last Active</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6]">
                {isLoading
                  ? Array.from({ length: USERS_PER_PAGE }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#F2EFE6]" />
                            <div className="space-y-2">
                              <div className="h-3 w-28 bg-[#F2EFE6] rounded" />
                              <div className="h-2.5 w-36 bg-[#F2EFE6] rounded" />
                            </div>
                          </div>
                        </td>
                        {[...Array(4)].map((_, j) => (
                          <td key={j} className="px-6 py-5">
                            <div className="h-3 w-20 bg-[#F2EFE6] rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#FDFBF3]/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#D4A117] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#D4A117]/5">
                              {user.initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#433E37]">{user.name}</p>
                              <p className="text-xs text-[#A6A196]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-[#433E37]">{user.role}</p>
                          <p className="text-xs text-[#A6A196]">{user.company}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold capitalize border ${getStatusClasses(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-[#8C877D]">
                          {user.lastActive}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-[#D9D4C7] hover:text-[#E11D48] transition-colors rounded-lg hover:bg-rose-50">
                            <Ban size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-[#F2EFE6] flex items-center justify-between">
            <p className="text-xs text-[#A6A196]">
              Showing{' '}
              <span className="font-semibold text-[#433E37]">
                {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalUsers)}–
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}
              </span>{' '}
              of <span className="font-semibold text-[#433E37]">{pagination.totalUsers}</span> users
            </p>

            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 rounded-xl text-[#B3AE9F] hover:bg-[#F9F8F3] hover:text-[#433E37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-[#B3AE9F] text-sm select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      pagination.currentPage === page
                        ? 'bg-[#D4A117] text-white shadow-sm'
                        : 'text-[#8C877D] hover:bg-[#F9F8F3] hover:text-[#433E37]'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-xl text-[#B3AE9F] hover:bg-[#F9F8F3] hover:text-[#433E37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Helper for Status Styling ---
function getStatusClasses(status: UserStatus) {
  switch (status) {
    case 'active':
      return 'bg-[#E6F9F4] text-[#059669] border-[#D1FAE5]';
    case 'blocked':
      return 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]';
    case 'pending':
      return 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]';
    default:
      return 'bg-gray-50 text-gray-500 border-gray-100';
  }
}
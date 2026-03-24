"use client";

import React, { useState, useEffect } from "react";
import { Upload, Smartphone, ExternalLink, Check, AlertCircle, RefreshCw } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AppDistributionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<"customer" | "admin">("customer");
  const [currentLinks, setCurrentLinks] = useState<{ customer?: any, admin?: any }>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error", text: string } | null>(null);

  const fetchLinks = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/superadmin/apk-links`);
      if (res.ok) {
        const data = await res.json();
        setCurrentLinks(data);
      }
    } catch (err) {
      console.error("Failed to fetch current links:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".apk")) {
        setMsg({ type: "error", text: "Please upload a valid .apk file" });
        return;
      }
      setFile(selectedFile);
      setMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMsg({ type: "error", text: "Please select a file to upload" });
      return;
    }

    setLoading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append("apk", file);
    formData.append("target", target);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/superadmin/upload-apk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMsg({ type: "success", text: `${target === "admin" ? "Admin" : "Customer"} APK updated successfully!` });
      setFile(null);
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setMsg({ type: "error", text: err.message || "Failed to upload APK" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2C1E17]">App Distribution</h2>
          <p className="text-[#8A7060] text-sm mt-1">Manage and push latest APK versions to the platform</p>
        </div>
        <button 
          onClick={fetchLinks}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EBE0D2] rounded-xl text-[#7A5210] text-sm font-semibold hover:bg-[#FAF5EF] transition-all"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh Stats
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${
          msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {msg.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{msg.text}</p>
        </div>
      )}

      {/* Grid: Live Status & Upload Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Versions (Sticky on desktop) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 h-fit">
          <h3 className="text-xs font-bold text-[#9B8070] uppercase tracking-wider pl-1">Live Status</h3>
          
          {["customer", "admin"].map((t) => {
            const data = (currentLinks as any)[t];
            return (
              <div key={t} className="bg-white p-6 rounded-3xl border border-[#EBE0D2] shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF9EE] flex items-center justify-center text-[#C9A24D] group-hover:bg-[#C9A24D] group-hover:text-white transition-colors duration-300">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2C1E17] capitalize">{t === "admin" ? "Staff/Owner App" : "Customer App"}</h4>
                      <p className="text-[10px] text-[#8A7060] uppercase tracking-widest font-bold">Node: Server Local</p>
                    </div>
                  </div>

                  {data ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs py-2 border-b border-[#FAF5EF]">
                        <span className="text-[#8A7060]">Updated</span>
                        <span className="font-bold text-[#2C1E17]">{new Date(data.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2 border-b border-[#FAF5EF]">
                        <span className="text-[#8A7060]">Build</span>
                        <span className="font-mono text-[#D4A96A] font-bold">v{String(data.version).slice(-6)}</span>
                      </div>
                      <a 
                        href={data.url} 
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FAF5EF] text-[#7A5210] text-xs font-bold hover:bg-[#F5EDE0] transition-all mt-2"
                      >
                        <ExternalLink size={14} />
                        Verify Live Link
                      </a>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-[#EBE0D2]">
                      <p className="text-xs text-[#8A7060] italic">No active bundle</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-[#EBE0D2] shadow-sm overflow-hidden">
            <div className="p-8 md:p-12">
              <form onSubmit={handleUpload} className="space-y-10">
                
                {/* 1. Target Toggle */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-[#9B8070] uppercase tracking-widest pl-1">Application Target</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTarget("customer")}
                      className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${
                        target === "customer"
                          ? "border-[#C9A24D] bg-[#FDF9EE] text-[#2C1E17] shadow-sm"
                          : "border-[#FAF5EF] bg-[#FCFAF8] text-[#8A7060] hover:border-[#EBE0D2]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${target === "customer" ? "bg-[#C9A24D] text-white" : "bg-[#EBE0D2] text-[#8A7060]"}`}>
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Customer Client</p>
                        <p className="text-[10px] opacity-70">Main user application</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarget("admin")}
                      className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${
                        target === "admin"
                          ? "border-[#C9A24D] bg-[#FDF9EE] text-[#2C1E17] shadow-sm"
                          : "border-[#FAF5EF] bg-[#FCFAF8] text-[#8A7060] hover:border-[#EBE0D2]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${target === "admin" ? "bg-[#C9A24D] text-white" : "bg-[#EBE0D2] text-[#8A7060]"}`}>
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Vendor Dashboard</p>
                        <p className="text-[10px] opacity-70">Owners & Staff app</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. File Upload */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-[#9B8070] uppercase tracking-widest pl-1">Upload Bundle (.apk)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="apk-upload-file"
                      accept=".apk"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="apk-upload-file"
                      className={`flex flex-col items-center justify-center p-12 lg:p-20 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${
                        file
                          ? "border-[#C9A24D] bg-[#FDF9EE]/40"
                          : "border-[#EBE0D2] bg-[#FCFAF8] hover:border-[#C9A24D]"
                      }`}
                    >
                      {file ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-[#26A34A]/10 text-[#26A34A] rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
                            <Check size={32} />
                          </div>
                          <h4 className="font-bold text-[#2C1E17]">{file.name}</h4>
                          <p className="text-xs text-[#8A7060] mt-2">Ready to deploy • {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white border border-[#EBE0D2] text-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                          </div>
                          <h4 className="font-bold text-[#2C1E17]">Drop APK here or browse</h4>
                          <p className="text-xs text-[#8A7060] mt-2">Bundle limited to 100MB per file</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* 3. Execute */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !file}
                    className={`w-full py-5 rounded-2xl font-bold text-base transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${
                      loading || !file
                        ? "bg-[#EBE0D2] text-[#8A7060] cursor-not-allowed shadow-none"
                        : "bg-[#2C1E17] text-white hover:bg-[#3d2e22] active:scale-95"
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Deploying Build...
                      </>
                    ) : (
                      <>
                        Push Update to {target === 'admin' ? 'Staff' : 'Customers'}
                      </>
                    )}
                  </button>
                  
                  <div className="mt-8 flex items-start gap-3 p-5 rounded-2xl bg-[#FFF9F0] border border-[#FBEACF]">
                    <AlertCircle className="text-[#D4A96A] shrink-0 mt-0.5" size={18} />
                    <div className="text-[11px] text-[#7A5210] leading-relaxed">
                      <p className="font-bold mb-1">Production Alert:</p>
                      Pushing a new build will overwrite the existing APK on the server. Site download links will update globally. Please ensure you are uploading the correctly signed release version.
                    </div>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

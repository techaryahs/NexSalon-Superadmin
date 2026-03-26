"use client";

import React, { useState, useEffect } from "react";
import { Upload, Smartphone, ExternalLink, Check, AlertCircle, RefreshCw, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AppDistributionPage() {
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [target, setTarget] = useState<"customer" | "admin">("customer");
  
  const [currentLinks, setCurrentLinks] = useState<{ customer?: any, admin?: any }>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error", text: string } | null>(null);

  const fetchLinks = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/superadmin/app-links`);
      if (res.ok) {
        const data = await res.json();
        setCurrentLinks(data);
        
        // Populate inputs based on selected target
        if (data[target]) {
          setPlayStoreUrl(data[target].playStoreUrl || "");
          setAppStoreUrl(data[target].appStoreUrl || "");
        } else {
          setPlayStoreUrl("");
          setAppStoreUrl("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch current app links:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Sync inputs when target changes manually
  useEffect(() => {
    if (currentLinks[target]) {
      setPlayStoreUrl(currentLinks[target].playStoreUrl || "");
      setAppStoreUrl(currentLinks[target].appStoreUrl || "");
    } else {
      setPlayStoreUrl("");
      setAppStoreUrl("");
    }
    setQrFile(null); // clear file input
  }, [target, currentLinks]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith("image/")) {
        setMsg({ type: "error", text: "Please upload a valid image file for the QR code" });
        return;
      }
      setQrFile(selectedFile);
      setMsg(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append("target", target);
    formData.append("playStoreUrl", playStoreUrl);
    formData.append("appStoreUrl", appStoreUrl);
    
    if (qrFile) {
      formData.append("qrCode", qrFile);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/superadmin/app-links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setMsg({ type: "success", text: `${target === "admin" ? "Admin" : "Customer"} App Links updated successfully!` });
      setQrFile(null);
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setMsg({ type: "error", text: err.message || "Failed to update links" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2C1E17]">App Distribution Links</h2>
          <p className="text-[#8A7060] text-sm mt-1">Manage Play Store, App Store links and QR codes</p>
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
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
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
                      <p className="text-[10px] text-[#8A7060] uppercase tracking-widest font-bold">App Store / Play Store</p>
                    </div>
                  </div>

                  {data ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs py-2 border-b border-[#FAF5EF] gap-2">
                        <span className="text-[#8A7060]">Play Store</span>
                        <a href={data.playStoreUrl} target="_blank" className="font-bold text-[#2C1E17] hover:underline truncate w-32 text-right">
                           {data.playStoreUrl ? "Configured" : "None"}
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2 border-b border-[#FAF5EF] gap-2">
                        <span className="text-[#8A7060]">App Store</span>
                        <a href={data.appStoreUrl} target="_blank" className="font-bold text-[#2C1E17] hover:underline truncate w-32 text-right">
                          {data.appStoreUrl ? "Configured" : "None"}
                        </a>
                      </div>
                      <div className="flex flex-col items-center justify-center text-xs py-4 border-b border-[#FAF5EF]">
                        <span className="text-[#8A7060] mb-2 font-bold">Active QR Code</span>
                        {data.qrCodeUrl ? (
                          <img src={data.qrCodeUrl} alt="QR Code" className="w-24 h-24 object-contain rounded-lg border border-[#EBE0D2]" />
                        ) : (
                          <span className="text-[#2C1E17] italic">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-[#EBE0D2]">
                      <p className="text-xs text-[#8A7060] italic">No active configuration</p>
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
              <form onSubmit={handleSave} className="space-y-10">

                {/* 1. Target Toggle */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-[#9B8070] uppercase tracking-widest pl-1">Application Target</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTarget("customer")}
                      className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${target === "customer"
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
                      className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${target === "admin"
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

                {/* 2. Store Links */}
                <div className="space-y-4">
                   <label className="text-[11px] font-bold text-[#9B8070] uppercase tracking-widest pl-1">Store Links</label>
                   
                   <div className="space-y-3">
                     <div className="relative">
                       <input 
                          type="url" 
                          placeholder="https://play.google.com/store/apps/details?id=..." 
                          value={playStoreUrl}
                          onChange={(e) => setPlayStoreUrl(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#EBE0D2] bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/50 text-sm font-medium"
                       />
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7060]" size={18} />
                       <p className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8A7060] uppercase tracking-widest hidden sm:block">Play Store</p>
                     </div>

                     <div className="relative">
                       <input 
                          type="url" 
                          placeholder="https://apps.apple.com/app/id..." 
                          value={appStoreUrl}
                          onChange={(e) => setAppStoreUrl(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#EBE0D2] bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/50 text-sm font-medium"
                       />
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7060]" size={18} />
                       <p className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8A7060] uppercase tracking-widest hidden sm:block">App Store</p>
                     </div>
                   </div>
                </div>

                {/* 3. QR Code Upload */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-[#9B8070] uppercase tracking-widest pl-1">QR Code Image (Optional)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="qr-upload-file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="qr-upload-file"
                      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${qrFile
                          ? "border-[#C9A24D] bg-[#FDF9EE]/40"
                          : "border-[#EBE0D2] bg-[#FCFAF8] hover:border-[#C9A24D]"
                        }`}
                    >
                      {qrFile ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-[#26A34A]/10 text-[#26A34A] rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
                            <Check size={32} />
                          </div>
                          <h4 className="font-bold text-[#2C1E17]">{qrFile.name}</h4>
                          <p className="text-xs text-[#8A7060] mt-2">Ready to upload • {(qrFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white border border-[#EBE0D2] text-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <ImageIcon size={32} />
                          </div>
                          <h4 className="font-bold text-[#2C1E17]">Scan QR Image</h4>
                          <p className="text-xs text-[#8A7060] mt-2">Upload PNG or JPG</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* 4. Execute */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 rounded-2xl font-bold text-base transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${loading
                        ? "bg-[#EBE0D2] text-[#8A7060] cursor-not-allowed shadow-none"
                        : "bg-[#2C1E17] text-white hover:bg-[#3d2e22] active:scale-95"
                      }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Saving Configuration...
                      </>
                    ) : (
                      <>
                        Save Configuration for {target === 'admin' ? 'Staff' : 'Customers'}
                      </>
                    )}
                  </button>

                  <div className="mt-8 flex items-start gap-3 p-5 rounded-2xl bg-[#FFF9F0] border border-[#FBEACF]">
                    <AlertCircle className="text-[#D4A96A] shrink-0 mt-0.5" size={18} />
                    <div className="text-[11px] text-[#7A5210] leading-relaxed">
                      <p className="font-bold mb-1">Production Alert:</p>
                      Updating these links will change the App Store links and QR codes shown to users on the live websites immediately.
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

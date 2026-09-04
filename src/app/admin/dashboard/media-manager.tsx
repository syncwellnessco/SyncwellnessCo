"use client";

import { useState, useEffect } from "react";
import {
  HardDrive,
  ImageIcon,
  Video,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Layers,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { MediaStorageStats } from "@/lib/r2";
import { StatsCardSkeleton } from "@/components/ui/skeleton";

export function MediaManager() {
  const [stats, setStats] = useState<MediaStorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/media/stats", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load storage statistics");
      const data: MediaStorageStats = await res.json();
      setStats(data);
      if (isManual) {
        toast.success("Storage metrics refreshed");
      }
    } catch (err: any) {
      console.error("Storage fetch error:", err);
      if (isManual) {
        toast.error(err.message || "Failed to refresh storage metrics");
      }
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="h-64 bg-[#FAF8F5] rounded-md animate-pulse border border-[#EBE3DB]" />
      </div>
    );
  }

  const images = stats?.images || {
    count: 0,
    bytes: 0,
    formattedSize: "0 B",
    percentageOfTotalBytes: 0,
    percentageOfTotalCount: 0,
    avgSizeBytes: 0,
    formattedAvgSize: "0 B",
  };

  const videos = stats?.videos || {
    count: 0,
    bytes: 0,
    formattedSize: "0 B",
    percentageOfTotalBytes: 0,
    percentageOfTotalCount: 0,
    avgSizeBytes: 0,
    formattedAvgSize: "0 B",
  };

  const others = stats?.others || {
    count: 0,
    bytes: 0,
    formattedSize: "0 B",
    percentageOfTotalBytes: 0,
    percentageOfTotalCount: 0,
    avgSizeBytes: 0,
    formattedAvgSize: "0 B",
  };

  const totalCount = stats?.totalCount || 0;
  const totalSize = stats?.formattedTotalSize || "0 B";
  const totalBytes = stats?.totalBytes || 0;

  // Cloudflare R2 standard free tier is 10 GB per month
  const FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024;
  const quotaPercent = Math.min(100, Math.max(0, (totalBytes / FREE_TIER_BYTES) * 100));
  const isStorageHigh = quotaPercent >= 80;

  const imageWidth = totalBytes > 0 ? (images.bytes / totalBytes) * 100 : 0;
  const videoWidth = totalBytes > 0 ? (videos.bytes / totalBytes) * 100 : 0;
  const otherWidth = totalBytes > 0 ? (others.bytes / totalBytes) * 100 : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl text-charcoal font-semibold">
              Media & Storage
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              R2 Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/60 mt-1">
            Real-time storage usage across Cloudflare R2 bucket{" "}
            <span className="font-mono text-charcoal/80 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EBE3DB]">
              {stats?.bucketName || "syncwellnessco-media"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stats?.updatedAt && (
            <span className="text-[11px] text-charcoal/50 hidden md:inline">
              Updated: {new Date(stats.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EBE3DB] hover:border-[#8C6D40] text-charcoal text-xs font-semibold uppercase tracking-wider rounded-sm shadow-2xs hover:bg-[#FAF8F5] transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#8C6D40] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Sync Storage"}</span>
          </button>
        </div>
      </div>

      {/* 80% Capacity Alert Banner */}
      {isStorageHigh && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3.5 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Storage Warning: {quotaPercent.toFixed(1)}% Capacity Reached
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Your storage has exceeded 80% of the 10 GB standard quota ({totalSize} used). Consider reviewing and cleaning up unused media or verifying your Cloudflare R2 plan limits.
            </p>
          </div>
        </div>
      )}

      {/* Minimalist Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Storage Card */}
        <div className="bg-[#FAF8F5] p-6 rounded-md border border-[#EBE3DB] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                Total Storage Used
              </span>
              <div className="p-2 bg-[#8C6D40]/10 text-[#8C6D40] rounded-full">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-display font-semibold text-charcoal">{totalSize}</p>
              <p className="text-xs text-charcoal/60 mt-1">
                {totalCount} total media {totalCount === 1 ? "file" : "files"} stored
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBE3DB]/80">
            <div className="flex justify-between text-[11px] text-charcoal/60 mb-1.5">
              <span>R2 Free Quota (10 GB)</span>
              <span className="font-semibold text-charcoal">{quotaPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#EBE3DB] rounded-full h-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, quotaPercent)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isStorageHigh ? "bg-amber-600" : "bg-[#8C6D40]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Images Metric Card */}
        <div className="bg-white p-6 rounded-md border border-[#EBE3DB] flex flex-col justify-between hover:border-[#8C6D40]/60 transition-all shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                Images Breakdown
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full">
                <ImageIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-display font-semibold text-amber-900">{images.formattedSize}</p>
              <p className="text-xs text-charcoal/60 mt-1">
                <strong className="text-charcoal font-semibold">{images.count}</strong> images ({images.percentageOfTotalBytes.toFixed(1)}% of storage)
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBE3DB]/80 space-y-2">
            <div className="flex justify-between text-[11px] text-charcoal/60">
              <span>Average Size</span>
              <span className="font-mono text-charcoal font-medium">{images.formattedAvgSize}</span>
            </div>
            <div className="w-full bg-[#EBE3DB]/60 rounded-full h-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, images.percentageOfTotalBytes)}%` }}
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Videos Metric Card */}
        <div className="bg-white p-6 rounded-md border border-[#EBE3DB] flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                Videos Breakdown
              </span>
              <div className="p-2 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                <Video className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-display font-semibold text-indigo-900">{videos.formattedSize}</p>
              <p className="text-xs text-charcoal/60 mt-1">
                <strong className="text-charcoal font-semibold">{videos.count}</strong> videos ({videos.percentageOfTotalBytes.toFixed(1)}% of storage)
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBE3DB]/80 space-y-2">
            <div className="flex justify-between text-[11px] text-charcoal/60">
              <span>Average Size</span>
              <span className="font-mono text-charcoal font-medium">{videos.formattedAvgSize}</span>
            </div>
            <div className="w-full bg-[#EBE3DB]/60 rounded-full h-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, videos.percentageOfTotalBytes)}%` }}
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Proportional Storage Track Meter */}
      <div className="bg-white border border-[#EBE3DB] rounded-md p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-charcoal">Storage Proportions</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Visual distribution of storage consumption by media format</p>
          </div>
          <span className="text-xs text-charcoal/60 font-mono">
            {totalSize} / 10 GB
          </span>
        </div>

        {/* Stacked Bar */}
        <div className="w-full bg-[#FAF8F5] border border-[#EBE3DB] rounded-md p-1.5">
          <div className="w-full bg-[#EBE3DB]/60 rounded-sm h-4 overflow-hidden flex shadow-inner">
            {totalBytes === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-charcoal/40 font-mono">
                No media uploaded yet
              </div>
            ) : (
              <>
                {imageWidth > 0 && (
                  <div
                    style={{ width: `${imageWidth}%` }}
                    className="bg-amber-600 hover:opacity-90 transition-all duration-300 h-full"
                    title={`Images: ${images.formattedSize} (${imageWidth.toFixed(1)}%)`}
                  />
                )}
                {videoWidth > 0 && (
                  <div
                    style={{ width: `${videoWidth}%` }}
                    className="bg-indigo-600 hover:opacity-90 transition-all duration-300 h-full"
                    title={`Videos: ${videos.formattedSize} (${videoWidth.toFixed(1)}%)`}
                  />
                )}
                {otherWidth > 0 && (
                  <div
                    style={{ width: `${otherWidth}%` }}
                    className="bg-slate-400 hover:opacity-90 transition-all duration-300 h-full"
                    title={`Other: ${others.formattedSize} (${otherWidth.toFixed(1)}%)`}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-charcoal/70 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-amber-600"></span>
            <span>
              Images: <strong className="text-charcoal">{images.formattedSize}</strong> ({images.count} files • {images.percentageOfTotalBytes.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
            <span>
              Videos: <strong className="text-charcoal">{videos.formattedSize}</strong> ({videos.count} files • {videos.percentageOfTotalBytes.toFixed(1)}%)
            </span>
          </div>
          {others.count > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-slate-400"></span>
              <span>
                Other: <strong className="text-charcoal">{others.formattedSize}</strong> ({others.count} files • {others.percentageOfTotalBytes.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation to Media Sections */}
      <div className="bg-[#FAF8F5] border border-[#EBE3DB] rounded-md p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-4">
          Manage Media Across Sections
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="?tab=programs"
            className="p-4 bg-white border border-[#EBE3DB] rounded-sm hover:border-[#8C6D40] transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div>
              <p className="font-semibold text-xs text-charcoal group-hover:text-[#8C6D40]">Programs Media</p>
              <p className="text-[11px] text-charcoal/50 mt-0.5">Hero covers & curricula</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-charcoal/40 group-hover:text-[#8C6D40]" />
          </Link>

          <Link
            href="?tab=testimonials"
            className="p-4 bg-white border border-[#EBE3DB] rounded-sm hover:border-[#8C6D40] transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div>
              <p className="font-semibold text-xs text-charcoal group-hover:text-[#8C6D40]">Video Testimonials</p>
              <p className="text-[11px] text-charcoal/50 mt-0.5">Client story reels & videos</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-charcoal/40 group-hover:text-[#8C6D40]" />
          </Link>

          <Link
            href="?tab=resources"
            className="p-4 bg-white border border-[#EBE3DB] rounded-sm hover:border-[#8C6D40] transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div>
              <p className="font-semibold text-xs text-charcoal group-hover:text-[#8C6D40]">Blogs & Resources</p>
              <p className="text-[11px] text-charcoal/50 mt-0.5">Article banners & guides</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-charcoal/40 group-hover:text-[#8C6D40]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

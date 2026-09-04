"use client";

import { useState } from "react";
import {
  HardDrive,
  ImageIcon,
  Video,
  RefreshCw,
  FileCheck2,
  Database,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { MediaStorageStats } from "@/lib/r2";

interface MediaStorageMeterProps {
  initialStats?: MediaStorageStats | null;
}

export function MediaStorageMeter({ initialStats }: MediaStorageMeterProps) {
  const [stats, setStats] = useState<MediaStorageStats | null>(initialStats || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/media/stats", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch media statistics");
      }
      const data: MediaStorageStats = await res.json();
      setStats(data);
      toast.success("Media storage meter refreshed");
    } catch (err: any) {
      console.error("Refresh error:", err);
      toast.error(err.message || "Could not refresh media storage metrics");
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const imageWidth = totalBytes > 0 ? (images.bytes / totalBytes) * 100 : 0;
  const videoWidth = totalBytes > 0 ? (videos.bytes / totalBytes) * 100 : 0;
  const otherWidth = totalBytes > 0 ? (others.bytes / totalBytes) * 100 : 0;

  return (
    <div className="bg-white border border-[#EBE3DB] rounded-md shadow-sm overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-5 border-b border-[#EBE3DB] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8C6D40]/10 text-[#8C6D40] rounded-sm">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg text-charcoal font-semibold">
                Media Storage & Upload Meter
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                R2 Active
              </span>
            </div>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Live storage usage and file breakdown in Cloudflare R2 bucket:{" "}
              <span className="font-mono text-charcoal/80 font-medium">
                {stats?.bucketName || "syncwellnessco-media"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats?.updatedAt && (
            <span className="text-[11px] text-charcoal/50 hidden sm:inline">
              Updated: {new Date(stats.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#EBE3DB] hover:border-[#8C6D40] text-charcoal text-xs font-semibold uppercase tracking-wider rounded-sm shadow-2xs hover:bg-[#FAF8F5] transition-all cursor-pointer disabled:opacity-60"
            title="Refresh storage statistics"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#8C6D40] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Calculating..." : "Refresh Meter"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        {/* Overall Storage Visual Meter */}
        <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-md border border-[#EBE3DB]/80 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                Total Storage Consumed
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-display font-semibold text-charcoal">
                  {totalSize}
                </span>
                <span className="text-xs text-charcoal/60">
                  across <strong className="text-charcoal font-semibold">{totalCount}</strong> total uploaded {totalCount === 1 ? "file" : "files"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                R2 Free Tier Usage
              </span>
              <div className="text-xs text-charcoal/70 mt-0.5">
                <span className="font-semibold text-charcoal">{quotaPercent.toFixed(2)}%</span> of 10 GB
              </div>
            </div>
          </div>

          {/* Stacked Storage Meter Bar */}
          <div className="w-full bg-[#EBE3DB]/60 rounded-full h-3.5 overflow-hidden flex shadow-inner">
            {totalBytes === 0 ? (
              <div className="w-full h-full bg-[#EBE3DB]/40 flex items-center justify-center text-[9px] text-charcoal/40 font-mono">
                Storage Empty
              </div>
            ) : (
              <>
                {imageWidth > 0 && (
                  <div
                    style={{ width: `${imageWidth}%` }}
                    className="bg-amber-600 hover:bg-amber-500 transition-all duration-300 h-full relative group"
                    title={`Images: ${images.formattedSize} (${imageWidth.toFixed(1)}%)`}
                  />
                )}
                {videoWidth > 0 && (
                  <div
                    style={{ width: `${videoWidth}%` }}
                    className="bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 h-full relative group"
                    title={`Videos: ${videos.formattedSize} (${videoWidth.toFixed(1)}%)`}
                  />
                )}
                {otherWidth > 0 && (
                  <div
                    style={{ width: `${otherWidth}%` }}
                    className="bg-slate-400 hover:bg-slate-300 transition-all duration-300 h-full relative group"
                    title={`Other Files: ${others.formattedSize} (${otherWidth.toFixed(1)}%)`}
                  />
                )}
              </>
            )}
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-[11px] text-charcoal/70">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <span>
                Images: <strong className="text-charcoal font-medium">{images.formattedSize}</strong> ({images.percentageOfTotalBytes.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>
                Videos: <strong className="text-charcoal font-medium">{videos.formattedSize}</strong> ({videos.percentageOfTotalBytes.toFixed(1)}%)
              </span>
            </div>
            {others.count > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>
                  Other: <strong className="text-charcoal font-medium">{others.formattedSize}</strong> ({others.percentageOfTotalBytes.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Separate Detailed Cards for Images and Videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Images Detailed Card */}
          <div className="bg-white border border-[#EBE3DB] rounded-md p-5 hover:border-amber-400/80 transition-all shadow-2xs group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-charcoal">Images Storage</h4>
                    <span className="text-[11px] text-charcoal/50">PNG, JPG, WebP, SVG, AVIF</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-50/70 border border-amber-200/60 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                  {images.percentageOfTotalBytes.toFixed(0)}% Space
                </span>
              </div>

              {/* Number and Size */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#EBE3DB]/60">
                <div className="bg-[#FAF8F5] p-3 rounded-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                    Total Images
                  </span>
                  <p className="text-2xl font-display font-semibold text-charcoal mt-0.5">
                    {images.count}
                  </p>
                  <span className="text-[10px] text-charcoal/50 block mt-0.5">
                    {images.percentageOfTotalCount.toFixed(0)}% of total uploads
                  </span>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                    Space Consumed
                  </span>
                  <p className="text-2xl font-display font-semibold text-amber-800 mt-0.5">
                    {images.formattedSize}
                  </p>
                  <span className="text-[10px] text-charcoal/50 block mt-0.5">
                    Avg: {images.formattedAvgSize} / img
                  </span>
                </div>
              </div>

              {/* Mini meter line */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[11px] text-charcoal/60">
                  <span>Storage Share</span>
                  <span className="font-medium text-charcoal">{images.percentageOfTotalBytes.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#EBE3DB]/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, images.percentageOfTotalBytes)}%` }}
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EBE3DB]/60 flex items-center justify-between text-xs">
              <span className="text-charcoal/50 text-[11px]">Used in Programs, Blogs & Reviews</span>
              <Link
                href="?tab=programs"
                className="text-[#8C6D40] hover:text-[#B8955F] font-semibold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 group-hover:underline"
              >
                Manage Media <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Videos Detailed Card */}
          <div className="bg-white border border-[#EBE3DB] rounded-md p-5 hover:border-indigo-400/80 transition-all shadow-2xs group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-charcoal">Videos Storage</h4>
                    <span className="text-[11px] text-charcoal/50">MP4, WebM, MOV, MKV</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50/70 border border-indigo-200/60 text-indigo-800 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                  {videos.percentageOfTotalBytes.toFixed(0)}% Space
                </span>
              </div>

              {/* Number and Size */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#EBE3DB]/60">
                <div className="bg-[#FAF8F5] p-3 rounded-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                    Total Videos
                  </span>
                  <p className="text-2xl font-display font-semibold text-charcoal mt-0.5">
                    {videos.count}
                  </p>
                  <span className="text-[10px] text-charcoal/50 block mt-0.5">
                    {videos.percentageOfTotalCount.toFixed(0)}% of total uploads
                  </span>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                    Space Consumed
                  </span>
                  <p className="text-2xl font-display font-semibold text-indigo-800 mt-0.5">
                    {videos.formattedSize}
                  </p>
                  <span className="text-[10px] text-charcoal/50 block mt-0.5">
                    Avg: {videos.formattedAvgSize} / vid
                  </span>
                </div>
              </div>

              {/* Mini meter line */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[11px] text-charcoal/60">
                  <span>Storage Share</span>
                  <span className="font-medium text-charcoal">{videos.percentageOfTotalBytes.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#EBE3DB]/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, videos.percentageOfTotalBytes)}%` }}
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EBE3DB]/60 flex items-center justify-between text-xs">
              <span className="text-charcoal/50 text-[11px]">Used in Video Testimonials & Guides</span>
              <Link
                href="?tab=testimonials"
                className="text-[#8C6D40] hover:text-[#B8955F] font-semibold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 group-hover:underline"
              >
                Manage Videos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Activity / Bucket Info Footer */}
        {stats?.latestUpload && (
          <div className="bg-[#FAF8F5] border border-[#EBE3DB] rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal/70">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#8C6D40]" />
              <span>
                <strong>Latest Upload:</strong>{" "}
                <span className="font-mono text-charcoal">{stats.latestUpload.key.split("/").pop()}</span> (
                {stats.latestUpload.formattedSize})
              </span>
            </div>
            {stats.latestUpload.lastModified && (
              <span className="text-charcoal/50 text-[11px]">
                Uploaded {new Date(stats.latestUpload.lastModified).toLocaleDateString()} at{" "}
                {new Date(stats.latestUpload.lastModified).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

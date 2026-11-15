'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export function CamerasView() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        const data = await api.getCameraImages({ camera_name: selectedCamera });
        setImages(data);
        if (data.length > 0 && !selectedImage) {
          setSelectedImage(data[0]);
        }
      } catch (err) {
        console.warn('Cameras load notice:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, [selectedCamera]);

  const cameraFilters = [
    { id: 'all', name: 'All Cameras' },
    { id: 'MASTCAM-Z', name: 'Mastcam-Z (Multispectral Zoom)' },
    { id: 'HAZCAM_FRONT', name: 'Hazcam (Hazard Avoidance)' },
    { id: 'NAVCAM_RIGHT', name: 'Navcam (Navigation)' },
    { id: 'SUPERCAM', name: 'SuperCam (Remote Micro-Imager)' },
    { id: 'WATSON', name: 'SHERLOC WATSON (Microscopic)' },
  ];

  const handlePrev = () => {
    if (!selectedImage || images.length === 0) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
    setZoomLevel(1);
  };

  const handleNext = () => {
    if (!selectedImage || images.length === 0) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
    setZoomLevel(1);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              NASA Planetary Imaging Archive • Perseverance Rover
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            MARS CAMERA & OPTICAL RECONNAISSANCE
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Calibrated observations from Mastcam-Z, Hazcam, Navcam, and SuperCam micro-imagers.
          </p>
        </div>

        {/* Camera filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {cameraFilters.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCamera(cam.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedCamera === cam.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cam.id === 'all' ? 'All' : cam.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Large Active Viewer (Top/Left) + Gallery Grid (Bottom/Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Viewer */}
        <div className="lg:col-span-8 rounded-xl bg-zinc-950/90 border border-zinc-800 p-4 space-y-3 shadow-2xl flex flex-col">
          {/* Controls Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white tracking-wide">
                {selectedImage?.camera_name || 'Active Camera View'}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-cyan-400">Sol {selectedImage?.sol}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-zinc-400 font-mono w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <a
                href={selectedImage?.image_url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-800 ml-1"
                title="Download High-Resolution Image"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Image Frame */}
          <div className="relative w-full h-[420px] rounded-lg overflow-hidden bg-black flex items-center justify-center border border-zinc-850">
            {selectedImage ? (
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="w-full h-full object-contain transition-transform duration-200"
              />
            ) : (
              <span className="text-xs text-zinc-500">No image selected</span>
            )}

            {/* Prev / Next Overlay Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 border border-zinc-700/80 text-white backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 border border-zinc-700/80 text-white backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Caption & Title */}
          <div className="pt-1 flex flex-col gap-1">
            <h2 className="text-sm font-bold text-white tracking-wide">{selectedImage?.title}</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {selectedImage?.description}
            </p>
          </div>
        </div>

        {/* Right Column: Image Metadata & Camera Specs */}
        <div className="lg:col-span-4 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Observation Metadata
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Rover Instrument:</span>
                <span className="font-semibold text-white">{selectedImage?.camera_full_name}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Martian Sol:</span>
                <span className="font-semibold text-cyan-400">Sol {selectedImage?.sol}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Earth Date:</span>
                <span className="font-semibold text-white">{selectedImage?.earth_date}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Geological Target:</span>
                <span className="font-semibold text-mars-400">{selectedImage?.target_feature || 'Delta Outcrop'}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Source Credit:</span>
                <span className="font-semibold text-zinc-300 text-[11px] truncate max-w-[160px]">
                  {selectedImage?.source_attribution}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-[10px] text-zinc-400 font-sans leading-relaxed">
            Authentic imagery from NASA Mars 2020 mission data catalog. No generative AI or simulated camera feeds.
          </div>
        </div>
      </div>

      {/* Bottom Gallery Thumbnail Grid */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Cataloged Mars Image Frames ({images.length})
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img) => {
            const isSelected = img.id === selectedImage?.id;
            return (
              <div
                key={img.id}
                onClick={() => {
                  setSelectedImage(img);
                  setZoomLevel(1);
                }}
                className={`group relative rounded-lg overflow-hidden border cursor-pointer aspect-video bg-black transition-all ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <img
                  src={img.thumbnail_url || img.image_url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 pointer-events-none">
                  <span className="text-[10px] font-bold text-white truncate">{img.title}</span>
                  <span className="text-[8px] text-cyan-400">{img.camera_name} • Sol {img.sol}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import "cropperjs/dist/cropper.css";
import { useRef, useState, useEffect } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { 
  Crop, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Maximize2,
  Download,
  X,
  Sparkles,
  Grid3X3,
  Square,
  Smartphone,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CropImageDialogProps {
  src: string;
  cropAspectRatio: number;
  onCropped: (blob: Blob | null) => void;
  onClose: () => void;
}

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(cropAspectRatio);
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Predefined aspect ratios for social media
  const aspectRatios = [
    { label: "Original", value: 0, icon: Maximize2 },
    { label: "Square", value: 1, icon: Square },
    { label: "Portrait", value: 4/5, icon: Smartphone },
    { label: "Landscape", value: 16/9, icon: Monitor },
    { label: "Story", value: 9/16, icon: Smartphone },
  ];

  const crop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    
    setIsLoading(true);
    
    try {
      // Get cropped canvas with high quality settings
      const canvas = cropper.getCroppedCanvas({
        width: 1080, // High resolution for social media
        height: currentAspectRatio === 1 ? 1080 : currentAspectRatio === 9/16 ? 1920 : 1080 / currentAspectRatio,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      canvas.toBlob((blob) => {
        onCropped(blob);
        onClose();
      }, "image/webp", 0.9); // High quality WebP
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAspectRatioChange = (ratio: number) => {
    setCurrentAspectRatio(ratio);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(ratio);
    }
  };

  const handleRotate = (degrees: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(degrees);
    }
  };

  const handleZoom = (delta: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta));
      setZoomLevel(newZoom);
      cropper.zoomTo(newZoom);
    }
  };

  const handleReset = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
      setZoomLevel(1);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        {/* Modern Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-background to-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crop className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Crop & Edit Image</DialogTitle>
                <p className="text-sm text-muted-foreground">Perfect your image for social media</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Controls */}
          <div className="w-64 border-r bg-background/50 backdrop-blur-sm p-4 space-y-6 overflow-y-auto">
            {/* Aspect Ratios */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Square className="h-4 w-4" />
                Aspect Ratio
              </h3>
              <div className="space-y-2">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.label}
                    variant={currentAspectRatio === ratio.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAspectRatioChange(ratio.value)}
                    className={cn(
                      "w-full justify-start gap-2 transition-all duration-200",
                      currentAspectRatio === ratio.value && "bg-gradient-to-r from-purple-500 to-pink-500"
                    )}
                  >
                    <ratio.icon className="h-4 w-4" />
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Transform Controls */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Move className="h-4 w-4" />
                Transform
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(-90)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Rotate L
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(90)}
                  className="flex items-center gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Rotate R
                </Button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Zoom ({Math.round(zoomLevel * 100)}%)
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom(-0.1)}
                    disabled={zoomLevel <= 0.1}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom(0.1)}
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => handleZoom(parseFloat(e.target.value) - zoomLevel)}
                  className="w-full"
                />
              </div>
            </div>

            {/* View Options */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                View Options
              </h3>
              <div className="space-y-2">
                <Button
                  variant={showGrid ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className="w-full justify-start gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid Lines
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full justify-start gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Main Cropper Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <div className="relative max-w-full max-h-full">
              <Cropper
                src={src}
                aspectRatio={currentAspectRatio || undefined}
                guides={showGrid}
                center={true}
                highlight={true}
                cropBoxMovable={true}
                cropBoxResizable={true}
                toggleDragModeOnDblclick={true}
                zoomable={true}
                scalable={true}
                rotatable={true}
                ref={cropperRef}
                className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                }}
                viewMode={1}
                dragMode="move"
                checkOrientation={false}
                responsive={true}
                restore={false}
                checkCrossOrigin={false}
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-gradient-to-r from-background to-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              💡 Tip: Double-click to switch between crop and move modes
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={crop} 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Crop & Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

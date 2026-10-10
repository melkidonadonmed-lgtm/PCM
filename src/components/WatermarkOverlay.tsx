import React from 'react';
import { WatermarkType } from '../types';
import { PRESET_WATERMARKS } from '../data/presetAssets';

interface WatermarkOverlayProps {
  type?: WatermarkType;
  opacity?: number;
  customDataUrl?: string;
  className?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  type = 'none',
  opacity,
  customDataUrl,
  className = ''
}) => {
  if (type === 'none' || !type) return null;

  const preset = PRESET_WATERMARKS.find(w => w.id === type);
  const effectiveOpacity = opacity !== undefined ? opacity : (preset?.defaultOpacity || 0.08);
  const logoSrc = customDataUrl || preset?.publicUrl || '/watermarks/sus.png';

  return (
    <div 
      className={`watermark-overlay absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex items-center justify-around ${className}`}
      aria-hidden="true"
      style={{ opacity: effectiveOpacity }}
    >
      {type === 'sus_single' && (
        <div className="w-full h-full flex items-center justify-center p-8">
          <img 
            src={logoSrc} 
            alt="" 
            className="w-[55%] max-w-[340px] max-h-[340px] object-contain filter grayscale-20"
            draggable={false}
          />
        </div>
      )}

      {type === 'sus_double' && (
        <div className="w-full h-full flex items-center justify-around px-6 sm:px-10">
          <div className="w-1/2 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="" 
              className="w-[65%] max-w-[210px] max-h-[210px] object-contain filter grayscale-20"
              draggable={false}
            />
          </div>
          <div className="w-1/2 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="" 
              className="w-[65%] max-w-[210px] max-h-[210px] object-contain filter grayscale-20"
              draggable={false}
            />
          </div>
        </div>
      )}

      {type === 'sus_triple' && (
        <div className="w-full h-full flex items-center justify-around px-3 sm:px-6">
          <div className="w-1/3 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="" 
              className="w-[75%] max-w-[140px] max-h-[140px] object-contain filter grayscale-20"
              draggable={false}
            />
          </div>
          <div className="w-1/3 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="" 
              className="w-[75%] max-w-[140px] max-h-[140px] object-contain filter grayscale-20"
              draggable={false}
            />
          </div>
          <div className="w-1/3 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="" 
              className="w-[75%] max-w-[140px] max-h-[140px] object-contain filter grayscale-20"
              draggable={false}
            />
          </div>
        </div>
      )}

      {type === 'rondonia' && (
        <div className="w-full h-full flex items-center justify-center p-8">
          <img 
            src="/logos/rondonia-brasao.svg" 
            alt="" 
            className="w-[65%] max-w-[400px] max-h-[500px] object-contain filter"
            draggable={false}
          />
        </div>
      )}

      {type === 'custom' && customDataUrl && (
        <div className="w-full h-full flex items-center justify-center p-8">
          <img 
            src={customDataUrl} 
            alt="" 
            className="w-[55%] max-w-[340px] object-contain"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default WatermarkOverlay;

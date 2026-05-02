'use client';

/**
 * Polling station finder using Google Maps JavaScript API v2 loader.
 * Uses the new functional API: setOptions() + importLibrary().
 * Falls back to official election commission link if Maps unavailable.
 */

import { LocateFixed, MapPin } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import TranslatedText from '@/components/ui/TranslatedText';
import type { Country } from '@/types';
import { useGoogleMap } from '@/hooks/useGoogleMap';

interface PollingStationFinderProps {
  country: Country;
  fullScreen?: boolean;
}

export default function PollingStationFinder({ country, fullScreen = false }: PollingStationFinderProps) {
  const {
    mapRef,
    mapInstanceRef,
    mapLoaded,
    error,
    userPosition,
    pollingStations,
  } = useGoogleMap(country.code);

  if (error) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center space-y-3">
        <MapPin className="w-8 h-8 text-gray-500 mx-auto" />
        <p className="text-gray-400">
          <TranslatedText text="Unable to load polling map right now." />
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="PollingStationFinder">
      <div
        className={`relative w-full h-full overflow-hidden group ${
          fullScreen
            ? 'rounded-none border-0 bg-transparent shadow-none'
            : 'rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl'
        }`}
      >
        {/* Map instance */}
        <div
          ref={mapRef}
          className="w-full h-full"
          aria-label="Map showing nearby polling stations"
          role="application"
        />

        {/* Nearby Booths Side List - Top Left */}
        {mapLoaded && pollingStations.length > 0 && (
          <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10 w-64 max-h-[40%] bg-gray-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 overflow-hidden animate-in fade-in slide-in-from-left duration-500">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <TranslatedText text="Find your polling booth:" />
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {pollingStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => {
                    if (mapInstanceRef.current && station.location) {
                      mapInstanceRef.current.panTo(station.location);
                      mapInstanceRef.current.setZoom(16);
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <p className="text-[11px] font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                    {station.displayName}
                  </p>
                  <p className="text-[9px] text-gray-500 truncate mt-0.5">
                    {station.formattedAddress}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recenter control */}
        <button
          type="button"
          onClick={() => {
            if (!mapInstanceRef.current || !userPosition) return;
            mapInstanceRef.current.panTo(userPosition);
            mapInstanceRef.current.setZoom(14);
          }}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors"
          aria-label="Recenter to your location"
        >
          <LocateFixed className="w-4 h-4" />
        </button>

        {/* Legend Overlay */}
        <div
          className={`absolute left-3 sm:left-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-950/75 backdrop-blur-xl border border-white/10 flex items-center gap-4 sm:gap-6 pointer-events-auto ${
            fullScreen ? 'bottom-24 sm:bottom-6' : 'bottom-3 sm:bottom-6'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
            <span className="text-[9px] sm:text-[10px] text-gray-300 font-bold uppercase tracking-wider">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
            <span className="text-[9px] sm:text-[10px] text-gray-300 font-bold uppercase tracking-wider">
              <TranslatedText text="Polling Booths" />
            </span>
          </div>
        </div>

        {/* Loading Overlay */}
        {!mapLoaded && !error && (
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 border-4 border-blue-400/10 rounded-full animate-pulse" />
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                <TranslatedText text="Scanning Area" />...
              </p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

'use client';

/**
 * Polling station finder using Google Maps JavaScript API v2 loader.
 * Uses the new functional API: setOptions() + importLibrary().
 * Falls back to official election commission link if Maps unavailable.
 */

import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import TranslatedText from '@/components/ui/TranslatedText';
import type { Country } from '@/types';

interface PollingStationFinderProps {
  country: Country;
}

export default function PollingStationFinder({ country }: PollingStationFinderProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) {
      setError('Maps unavailable');
      return;
    }

    let cancelled = false;

    async function initMap() {
      try {
        const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader');

        setOptions({
          key: apiKey!,
          v: 'weekly',
          libraries: ['places'],
        });

        const { Map, InfoWindow } = await importLibrary('maps') as google.maps.MapsLibrary;
        const { Place, SearchNearbyRankPreference } = await importLibrary('places') as google.maps.PlacesLibrary;
        const { AdvancedMarkerElement, PinElement } = await importLibrary('marker') as google.maps.MarkerLibrary;

        if (cancelled || !mapRef.current) return;

        const position = await getCurrentPosition(country.code);
        const infoWindow = new InfoWindow();

        const map = new Map(mapRef.current, {
          center: position,
          zoom: 14,
          mapId: 'BALLOTIQ_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          clickableIcons: false, // Disable clicks on standard POIs
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        });

        // User location marker
        const userPin = new PinElement({
          background: '#3b82f6',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: 1,
        });

        new AdvancedMarkerElement({
          position,
          map,
          title: 'Your Location',
          content: userPin.element,
        });

        // New Places API Search - Specific for election context
        const searchTypes = country.code === 'IN'
          ? ['government_office', 'local_government_office', 'police']
          : ['government_office', 'local_government_office'];

        const request = {
          fields: ['displayName', 'location', 'formattedAddress', 'id'],
          locationRestriction: {
            center: position,
            radius: 10000,
          },
          includedPrimaryTypes: searchTypes,
          maxResultCount: 15,
          rankPreference: SearchNearbyRankPreference.POPULARITY,
          language: 'en',
        };

        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
          places.forEach((place) => {
            if (place.location) {
              const officePin = new PinElement({
                background: '#10b981',
                borderColor: '#ffffff',
                glyphColor: '#ffffff',
                scale: 0.8,
              });

              const marker = new AdvancedMarkerElement({
                position: place.location,
                map,
                title: place.displayName ?? 'Election Office',
                content: officePin.element,
              });

              // Add click listener for InfoWindow
              marker.addListener('click', () => {
                const destination = encodeURIComponent(place.formattedAddress || place.displayName || '');
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

                const contentString = `
                  <div style="padding: 8px; color: #0f172a; font-family: sans-serif; max-width: 200px;">
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${place.displayName}</h4>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;">${place.formattedAddress || 'Location nearby'}</p>
                    <a href="${directionsUrl}" target="_blank" style="display: block; background: #2563eb; color: white; text-align: center; padding: 6px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 600;">Get Directions</a>
                  </div>
                `;

                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
              });
            }
          });
        }

        if (!cancelled) setMapLoaded(true);

      } catch {
        if (!cancelled) setError('Could not load map');
      }
    }

    const currentMapRef = mapRef.current;
    initMap();
    return () => {
      cancelled = true;
      if (currentMapRef) {
        currentMapRef.innerHTML = '';
      }
    };
  }, [country.code, country.electionBody, country.electionBodyUrl]);

  if (error) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center space-y-3">
        <MapPin className="w-8 h-8 text-gray-500 mx-auto" />
        <p className="text-gray-400">Find your polling station on the official website:</p>
        <a
          href={country.electionBodyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          aria-label={`Visit ${country.electionBody} website`}
        >
          <span>{country.electionBody}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="PollingStationFinder">
      <div className="relative w-full h-[50vh] min-h-[320px] sm:h-[550px] lg:h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 shadow-2xl group">
        {/* Map instance */}
        <div
          ref={mapRef}
          className="w-full h-full grayscale-[0.2] contrast-[1.1] brightness-[0.8] hover:grayscale-0 hover:brightness-100 transition-all duration-700"
          aria-label="Map showing nearby polling stations"
          role="application"
        />

        {/* Floating Header Overlay */}
        <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
          <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gray-950/70 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
            <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <TranslatedText text="Station Finder" />
            </h3>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">
              <TranslatedText text="Registration centers near you" />
            </p>
          </div>

          <a
            href={country.electionBodyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl bg-blue-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 pointer-events-auto"
          >
            <span className="whitespace-nowrap">
              <TranslatedText text="Official page for" /> {country.name}
            </span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </a>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-950/70 backdrop-blur-xl border border-white/10 flex items-center gap-4 sm:gap-6 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span className="text-[9px] sm:text-[10px] text-gray-300 font-bold uppercase tracking-wider">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] sm:text-[10px] text-gray-300 font-bold uppercase tracking-wider">Election Office</span>
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

function getCurrentPosition(countryCode: string): Promise<{ lat: number; lng: number }> {
  const DEFAULTS: Record<string, { lat: number; lng: number }> = {
    IN: { lat: 28.6139, lng: 77.209 }, // New Delhi
    US: { lat: 38.9072, lng: -77.0369 }, // Washington DC
    GB: { lat: 51.5074, lng: -0.1278 }, // London
    AU: { lat: -35.2809, lng: 149.1300 }, // Canberra
    SA: { lat: 24.7136, lng: 46.6753 }, // Riyadh
    FR: { lat: 48.8566, lng: 2.3522 }, // Paris
    DE: { lat: 52.5200, lng: 13.4050 }, // Berlin
    BR: { lat: -15.7975, lng: -47.8919 }, // Brasilia
    CA: { lat: 45.4215, lng: -75.6972 }, // Ottawa
  };

  const defaultPos = DEFAULTS[countryCode.toUpperCase()] || { lat: 0, lng: 0 };

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(defaultPos);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(defaultPos)
    );
  });
}

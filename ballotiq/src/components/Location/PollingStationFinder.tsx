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

        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        const { Place, SearchNearbyRankPreference } = await importLibrary('places') as google.maps.PlacesLibrary;
        const { AdvancedMarkerElement, PinElement } = await importLibrary('marker') as google.maps.MarkerLibrary;

        if (cancelled || !mapRef.current) return;

        const position = await getCurrentPosition(country.code);

        const map = new Map(mapRef.current, {
          center: position,
          zoom: 14,
          mapId: 'BALLOTIQ_MAP_ID', // Required for Advanced Markers
          mapTypeControl: false,
          streetViewControl: false,
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
          ? ['government_office', 'local_government_office', 'police'] // In India, some offices are in administrative buildings
          : ['government_office', 'local_government_office'];

        const request = {
          fields: ['displayName', 'location', 'formattedAddress'],
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

              new AdvancedMarkerElement({
                position: place.location,
                map,
                title: place.displayName ?? 'Election Office',
                content: officePin.element,
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
  }, []);

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
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <TranslatedText text="Find Your Polling Station" />
            </h3>
            <p className="text-xs text-gray-500">
              <TranslatedText text="Showing nearby election offices and registration centers in" /> {country.name}
            </p>
          </div>
          <a
            href={country.electionBodyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-600/20 transition-all"
          >
            <TranslatedText text="Official Website" /> <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="relative w-full h-[400px] sm:h-[500px] rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
          <div
            ref={mapRef}
            className="w-full h-full"
            aria-label="Map showing nearby polling stations"
            role="application"
          />
          {!mapLoaded && !error && (
            <div className="absolute inset-0 bg-[#0f172a] flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium tracking-wide">
                  <TranslatedText text="Scanning for election offices..." />
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Election Office</span>
          </div>
        </div>
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
      () => resolve(defaultPos),
      { timeout: 5000 },
    );
  });
}

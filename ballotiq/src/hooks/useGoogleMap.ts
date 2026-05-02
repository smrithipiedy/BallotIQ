import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for Google Maps initialization and polling station search.
 */
export function useGoogleMap(countryCode: string) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [pollingStations, setPollingStations] = useState<google.maps.places.Place[]>([]);

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

        const position = await getCurrentPosition(countryCode);
        if (!cancelled) setUserPosition(position);

        const map = new Map(mapRef.current, {
          center: position,
          zoom: 14,
          mapId: 'BALLOTIQ_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          clickableIcons: false,
          fullscreenControl: false,
          disableDefaultUI: false,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

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

        const searchTypes = countryCode === 'IN'
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
          setPollingStations(places);
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
      mapInstanceRef.current = null;
      if (currentMapRef) {
        currentMapRef.innerHTML = '';
      }
    };
  }, [countryCode]);

  return {
    mapRef,
    mapInstanceRef,
    mapLoaded,
    error,
    userPosition,
    pollingStations,
  };
}

function getCurrentPosition(countryCode: string): Promise<{ lat: number; lng: number }> {
  const DEFAULTS: Record<string, { lat: number; lng: number }> = {
    IN: { lat: 28.6139, lng: 77.209 },
    US: { lat: 38.9072, lng: -77.0369 },
    GB: { lat: 51.5074, lng: -0.1278 },
    AU: { lat: -35.2809, lng: 149.1300 },
    SA: { lat: 24.7136, lng: 46.6753 },
    FR: { lat: 48.8566, lng: 2.3522 },
    DE: { lat: 52.5200, lng: 13.4050 },
    BR: { lat: -15.7975, lng: -47.8919 },
    CA: { lat: 45.4215, lng: -75.6972 },
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

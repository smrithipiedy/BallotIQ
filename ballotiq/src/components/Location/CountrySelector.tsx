'use client';

/**
 * Country selector using Google Maps Places autocomplete.
 * Falls back to a dropdown list if Maps API is unavailable.
 */

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants/countries';
import type { Country } from '@/types';

interface CountrySelectorProps {
  onSelect: (country: Country) => void;
  className?: string;
}

/** Country selector with search and flag display */
export default function CountrySelector({ onSelect, className = '' }: CountrySelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="Select your country">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search country..."
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Search for your country"
          id="country-search"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filtered.map((country) => (
          <button
            key={country.code}
            onClick={() => onSelect(country)}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200 text-left"
            aria-label={`Select ${country.name}`}
          >
            <img 
              src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`} 
              alt="" 
              className="w-8 h-6 object-cover rounded-sm shadow-sm"
            />
            <div>
              <p className="text-sm font-medium text-white">{country.name}</p>
              <p className="text-xs text-gray-500">{country.electionType}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

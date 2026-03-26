"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (components: AddressComponents) => void;
  className?: string;
  placeholder?: string;
  hasError?: boolean;
}

// Global script loader to prevent duplicate loads
let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key not configured"));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function parseAddressComponents(place: google.maps.places.PlaceResult): AddressComponents {
  const components = place.address_components || [];
  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let zipCode = "";

  for (const comp of components) {
    const types = comp.types;
    if (types.includes("street_number")) streetNumber = comp.long_name;
    if (types.includes("route")) route = comp.short_name;
    if (types.includes("locality")) city = comp.long_name;
    if (types.includes("sublocality_level_1") && !city) city = comp.long_name;
    if (types.includes("administrative_area_level_1")) state = comp.short_name;
    if (types.includes("postal_code")) zipCode = comp.long_name;
  }

  const streetAddress = streetNumber ? `${streetNumber} ${route}` : route;

  return { streetAddress, city, state, zipCode };
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  className = "",
  placeholder = "Start typing an address...",
  hasError = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsLoaded(true))
      .catch(() => setLoadError(true));
  }, []);

  // Initialize autocomplete once script is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      types: ["address"],
      fields: ["address_components", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      const parsed = parseAddressComponents(place);
      onChange(parsed.streetAddress);
      onAddressSelect(parsed);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onChange, onAddressSelect]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${hasError ? "error" : ""} ${className}`}
        placeholder={loadError ? "Enter address manually" : placeholder}
        autoComplete="off"
      />
      {isLoaded && !loadError && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}
    </div>
  );
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Locate, Loader2, MapPin, Navigation } from "lucide-react"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any
  }
}

interface LocationValue {
  lat: string
  lng: string
  displayName: string
}

interface Props {
  value: LocationValue | null
  onChange: (v: LocationValue) => void
}

export function LocationMapPicker({ value, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [results, setResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([])

  // charge leaflet css/js une fois
  useEffect(() => {
    if (typeof window === "undefined") return
    const ensureLeaflet = () =>
      new Promise<void>((resolve) => {
        if (window.L) return resolve()
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => resolve()
        document.body.appendChild(script)
      })

    let cancelled = false
    ensureLeaflet().then(() => {
      if (cancelled || !mapRef.current || mapInstance.current) return
      const L = window.L
      // Centre RDC par défaut
      const defaultLat = value ? parseFloat(value.lat) : -4.4419
      const defaultLng = value ? parseFloat(value.lng) : 15.2663
      const map = L.map(mapRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], value ? 13 : 6)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)
      const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)
      marker.on("dragend", () => {
        const ll = marker.getLatLng()
        reverseGeocode(ll.lat, ll.lng)
      })
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        reverseGeocode(lat, lng)
      })
      mapInstance.current = map
      markerRef.current = marker
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // quand value change de l'extérieur, recadre
  useEffect(() => {
    if (!value || !mapInstance.current || !markerRef.current) return
    const lat = parseFloat(value.lat)
    const lng = parseFloat(value.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    markerRef.current.setLatLng([lat, lng])
    mapInstance.current.setView([lat, lng], 14)
  }, [value])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=0`,
        { headers: { Accept: "application/json" } }
      )
      const data = await res.json()
      const displayName = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onChange({ lat: lat.toFixed(6), lng: lng.toFixed(6), displayName })
    } catch {
      onChange({ lat: lat.toFixed(6), lng: lng.toFixed(6), displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
    }
  }

  const handleSearch = async () => {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json" },
      })
      const data = await res.json()
      setResults(data)
      if (data.length > 0 && mapInstance.current && markerRef.current) {
        const first = data[0]
        const lat = parseFloat(first.lat)
        const lon = parseFloat(first.lon)
        mapInstance.current.setView([lat, lon], 14)
        markerRef.current.setLatLng([lat, lon])
        onChange({ lat: lat.toFixed(6), lng: lon.toFixed(6), displayName: first.display_name })
      }
    } catch {
      // ignore
    } finally {
      setSearching(false)
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        if (mapInstance.current && markerRef.current) {
          mapInstance.current.setView([lat, lng], 15)
          markerRef.current.setLatLng([lat, lng])
        }
        reverseGeocode(lat, lng)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const selectResult = (r: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(r.lat)
    const lon = parseFloat(r.lon)
    if (mapInstance.current && markerRef.current) {
      mapInstance.current.setView([lat, lon], 14)
      markerRef.current.setLatLng([lat, lon])
    }
    onChange({ lat: lat.toFixed(6), lng: lon.toFixed(6), displayName: r.display_name })
    setResults([])
    setQuery(r.display_name)
  }

  return (
    <div className="space-y-2.5 max-[360px]:space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-1.5 max-[360px]:gap-1 sm:gap-2 sm:flex-row">
        <div className="flex flex-1 gap-1.5 max-[360px]:gap-1 sm:gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher : ex. Marché Gambela, Kinshasa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="h-8 max-[360px]:h-7 pl-8 sm:pl-9 text-xs max-[360px]:text-[11px] sm:text-sm sm:h-10"
            />
          </div>
          <Button type="button" onClick={handleSearch} disabled={searching || !query.trim()} className="h-8 max-[360px]:h-7 shrink-0 gap-1 px-2.5 max-[360px]:px-2 text-xs max-[360px]:text-[11px] sm:h-10 sm:px-4 sm:text-sm">
            {searching ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            <span className="hidden min-[360px]:inline sm:inline">Rechercher</span>
            <span className="min-[360px]:hidden sm:hidden">Go</span>
          </Button>
        </div>
        <Button type="button" variant="outline" onClick={handleLocateMe} disabled={locating} className="h-8 max-[360px]:h-7 w-full gap-1.5 sm:gap-2 border-lime-400/20 text-xs max-[360px]:text-[11px] sm:text-sm sm:h-10 sm:w-auto">
          {locating ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Locate className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-400" />}
          Me localiser
        </Button>
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm">
          {results.map((r) => (
            <button
              key={`${r.lat}-${r.lon}-${r.display_name}`}
              type="button"
              onClick={() => selectResult(r)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border">
        <div ref={mapRef} className="h-[200px] max-[360px]:h-[170px] w-full bg-muted sm:h-[260px]" />
      </div>
      <p className="text-[11px] max-[360px]:text-[10px] leading-relaxed text-muted-foreground">Clique sur la carte ou déplace le marqueur pour cibler l&apos;emplacement exact.</p>

      {value && (
        <div className="rounded-lg bg-lime-400/10 p-2 max-[360px]:p-1.5 sm:p-2.5 text-xs max-[360px]:text-[11px]">
          <p className="flex items-center gap-1.5 font-medium text-lime-300">
            <Navigation className="h-3.5 w-3.5" />
            Localisation ciblée sur la carte
          </p>
          <p className="mt-1 text-foreground">{value.displayName}</p>
          <p className="font-mono text-muted-foreground">{value.lat}, {value.lng}</p>
        </div>
      )}
    </div>
  )
}

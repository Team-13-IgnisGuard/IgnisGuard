import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { subscribeToBookingLocation, haversineDistanceKm, estimateEtaMinutes } from '../services/trackingSocket';

// Vite bundles Leaflet's default marker icons in a way that breaks the
// library's own path-lookup logic — this is a well-known Leaflet+bundler
// issue, not specific to this project. Fixed by pointing icons at a CDN.
const agentIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const homeIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  className: 'lpg-home-marker',
});

/**
 * Live GPS tracking map for a single OutForDelivery booking.
 * Only mount this while the booking is actually OutForDelivery — unmounting
 * it (e.g. because the parent stops rendering it once status changes)
 * automatically disconnects the WebSocket subscription via the effect
 * cleanup below. There's no separate "stop tracking" call needed.
 */
const LiveTrackingMap = ({ bookingId, address, city, state, pinCode }) => {
  const [agentPosition, setAgentPosition] = useState(null);
  const [customerPosition, setCustomerPosition] = useState(null);
  const [geocodeError, setGeocodeError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const unsubscribeRef = useRef(null);

  // Geocode the customer's saved address once, using OpenStreetMap's free
  // Nominatim API — no API key needed, but it's a shared public service
  // meant for light use. This is an honest approximation: it resolves to
  // wherever OSM's data says that address is, which can be a rough estimate
  // for less precise addresses. If it fails, we still show the agent's live
  // marker — just without the polyline/ETA/distance to compare it against.
  useEffect(() => {
    const geocode = async () => {
      try {
        const query = encodeURIComponent(`${address}, ${city}, ${state} ${pinCode}, India`);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const results = await response.json();
        if (results && results.length > 0) {
          setCustomerPosition([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
        } else {
          setGeocodeError("Couldn't pinpoint your address on the map — showing agent location only.");
        }
      } catch (err) {
        console.error('Geocoding failed', err);
        setGeocodeError("Couldn't pinpoint your address on the map — showing agent location only.");
      }
    };
    geocode();
  }, [address, city, state, pinCode]);

  // Subscribe to the agent's live location for this booking.
  useEffect(() => {
    unsubscribeRef.current = subscribeToBookingLocation(bookingId, (location) => {
      setAgentPosition([location.latitude, location.longitude]);
      setLastUpdated(new Date(location.timestamp));
    });

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [bookingId]);

  const distanceKm = agentPosition && customerPosition
    ? haversineDistanceKm(agentPosition[0], agentPosition[1], customerPosition[0], customerPosition[1])
    : null;
  const etaMinutes = distanceKm !== null ? estimateEtaMinutes(distanceKm) : null;

  const mapCenter = agentPosition || customerPosition || [20.5937, 78.9629]; // fallback: India center

  if (!agentPosition) {
    return (
      <div className="glass-card p-3 mb-3">
        <div className="d-flex align-items-center gap-2 text-secondary small">
          <span className="spinner-border spinner-border-sm"></span>
          Waiting for your delivery agent's location — this appears once they're on the way.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <span className="text-white small fw-semibold">
          <i className="bi bi-geo-alt-fill text-danger me-1"></i>Live delivery tracking
        </span>
        {etaMinutes !== null && (
          <span className="badge-status badge-delivery small">
            ~{etaMinutes} min &middot; {distanceKm.toFixed(1)} km away
          </span>
        )}
      </div>

      {geocodeError && (
        <p className="text-muted small mb-2">{geocodeError}</p>
      )}

      <div style={{ height: '260px', borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={agentPosition} icon={agentIcon}>
            <Popup>Your delivery agent</Popup>
          </Marker>
          {customerPosition && (
            <>
              <Marker position={customerPosition} icon={homeIcon}>
                <Popup>Your delivery address</Popup>
              </Marker>
              <Polyline
                positions={[agentPosition, customerPosition]}
                pathOptions={{ color: '#ff5e36', dashArray: '6 8', weight: 3 }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <p className="text-muted small mt-2 mb-0">
        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}
        {customerPosition && ' — straight-line distance, not the actual road route.'}
      </p>
    </div>
  );
};

export default LiveTrackingMap;

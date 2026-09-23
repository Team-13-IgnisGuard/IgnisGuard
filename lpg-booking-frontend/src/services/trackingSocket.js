import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Connects directly to booking-service's port, bypassing api-gateway — the
// gateway isn't currently configured to route WebSocket traffic in this
// project. See WebSocketConfig.java for the security implications of this
// (no per-connection auth on who can subscribe to a booking's location feed).
const TRACKING_WS_URL = 'http://localhost:8082/ws-tracking';

/**
 * Subscribes to live location updates for a single booking.
 * @param {number|string} bookingId
 * @param {(location: {bookingId, latitude, longitude, timestamp}) => void} onLocation
 * @returns {() => void} an unsubscribe/disconnect function — call this when
 *   the booking is no longer OutForDelivery, or when the component unmounts.
 */
export function subscribeToBookingLocation(bookingId, onLocation) {
  const client = new Client({
    webSocketFactory: () => new SockJS(TRACKING_WS_URL),
    reconnectDelay: 4000,
    onConnect: () => {
      client.subscribe(`/topic/booking/${bookingId}/location`, (message) => {
        try {
          onLocation(JSON.parse(message.body));
        } catch (e) {
          console.error('Malformed location message', e);
        }
      });
    },
  });

  client.activate();

  return () => {
    client.deactivate();
  };
}

// Haversine formula — straight-line ("as the crow flies") distance in km.
// This is NOT real road-routing (that needs a routing API like OSRM/Google
// Directions, which needs an API key this project doesn't have configured).
// It's a reasonable, honest approximation for a student project — call it
// out as such if asked in a viva, don't present it as a real route.
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Very rough ETA: assumes a flat 25 km/h average city delivery speed.
// Straight-line distance also underestimates real road distance, so this
// is a lower-bound estimate, not a precise one — same honesty caveat.
export function estimateEtaMinutes(distanceKm, avgSpeedKmh = 25) {
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Navigation } from 'lucide-react';

interface Route {
  id: number;
  name: string;
  start_location: string;
  end_location: string;
  distance: number;
  estimated_duration: number;
}

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  route: number;
}

interface InteractiveMapProps {
  onRouteSelect: (route: Route) => void;
  onStationSelect: (fromStation: Station, toStation: Station) => void;
  selectedRoute?: Route;
}

const DEFAULT_CENTER: [number, number] = [-6.1659, 39.2026]; // Zanzibar

// Fix default marker icon issues in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onRouteSelect,
  onStationSelect,
  selectedRoute,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedFromStation, setSelectedFromStation] = useState<Station | null>(null);
  const [selectedToStation, setSelectedToStation] = useState<Station | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Load all routes
  const loadRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routes/`);
      if (!res.ok) throw new Error('Failed to load routes');
      const data: Route[] = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error(err);
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Load stations for selected route
  const loadStations = async (routeId: number) => {
    setLoadingStations(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routes/${routeId}/stations/`);
      if (!res.ok) throw new Error('Failed to load stations');
      const data: Station[] = await res.json();
      setStations(data);
    } catch (err) {
      console.error(err);
      setStations([]);
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadStations(selectedRoute.id);
      setSelectedFromStation(null);
      setSelectedToStation(null);
    } else {
      setStations([]);
      setSelectedFromStation(null);
      setSelectedToStation(null);
    }
  }, [selectedRoute]);

  const handleStationClick = (station: Station) => {
    if (!selectedFromStation) {
      setSelectedFromStation(station);
    } else if (!selectedToStation && station.id !== selectedFromStation.id) {
      setSelectedToStation(station);
      onStationSelect(selectedFromStation, station);
    } else {
      setSelectedFromStation(station);
      setSelectedToStation(null);
    }
  };

  const resetSelection = () => {
    setSelectedFromStation(null);
    setSelectedToStation(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Select Route & Stations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 h-[400px] rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
              center={
                selectedFromStation
                  ? [selectedFromStation.latitude, selectedFromStation.longitude]
                  : DEFAULT_CENTER
              }
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              {/* OpenStreetMap tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Station Markers */}
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  eventHandlers={{
                    click: () => handleStationClick(station),
                  }}
                >
                  <Popup>
                    <div>
                      <strong>{station.name}</strong>
                      <br />
                      {`Order: ${station.order}`}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Route Selection */}
          <div className="space-y-3">
            <h4>Available Routes</h4>
            {loadingRoutes ? (
              <p>Loading routes...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {routes.map((route) => (
                  <Button
                    key={route.id}
                    variant={selectedRoute?.id === route.id ? 'default' : 'outline'}
                    onClick={() => onRouteSelect(route)}
                    className="justify-start p-3 h-auto"
                  >
                    <div className="text-left">
                      <div className="font-medium">{route.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {route.start_location} → {route.end_location}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Station Selection Status */}
          {selectedRoute && (
            <div className="space-y-3 mt-4 p-3 bg-gray-50 rounded-lg">
              <h4>Station Selection</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFromStation && (
                  <Badge variant="default">From: {selectedFromStation.name}</Badge>
                )}
                {selectedToStation && (
                  <Badge variant="secondary">To: {selectedToStation.name}</Badge>
                )}
              </div>
              {selectedFromStation && (
                <p className="text-sm text-muted-foreground">
                  {selectedToStation
                    ? 'Route selected! You can now search for buses.'
                    : 'Now select your destination station.'}
                </p>
              )}
              <Button variant="outline" size="sm" onClick={resetSelection}>
                Reset Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Navigation } from 'lucide-react';
import { Route, Station } from '../../types';
import { apiService } from '../../services/api';

interface InteractiveMapProps {
  onRouteSelect: (route: Route) => void;
  onStationSelect: (fromStation: Station, toStation: Station) => void;
  selectedRoute?: Route;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onRouteSelect,
  onStationSelect,
  selectedRoute,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedFromStation, setSelectedFromStation] = useState<Station | null>(null);
  const [selectedToStation, setSelectedToStation] = useState<Station | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -6.1659, lng: 39.2026 }); // Zanzibar coordinates

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadStations(selectedRoute.id);
    }
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      const response = await apiService.getRoutes();
      if (response.success) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  };

  const loadStations = async (routeId: string) => {
    try {
      const response = await apiService.getStationsByRoute(routeId);
      if (response.success) {
        setStations(response.data);
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  const handleStationClick = (station: Station) => {
    if (!selectedFromStation) {
      setSelectedFromStation(station);
    } else if (!selectedToStation && station.id !== selectedFromStation.id) {
      setSelectedToStation(station);
      onStationSelect(selectedFromStation, station);
    } else {
      // Reset selection
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
          {/* Map Container - This would integrate with actual map service */}
          <div className="relative bg-gray-100 rounded-lg h-96 mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-green-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-600">Interactive Map</p>
                <p className="text-sm text-gray-500">
                  {/* API Integration Point: Use Google Maps, Mapbox, or OpenStreetMap */}
                  Integrate with mapping service
                </p>
              </div>
            </div>
            
            {/* Simulated map content for demonstration */}
            <div className="absolute inset-4 space-y-2">
              {stations.map((station, index) => (
                <Button
                  key={station.id}
                  variant={
                    selectedFromStation?.id === station.id
                      ? 'default'
                      : selectedToStation?.id === station.id
                      ? 'secondary'
                      : 'outline'
                  }
                  size="sm"
                  className="absolute"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`,
                  }}
                  onClick={() => handleStationClick(station)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {station.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Route Selection */}
          <div className="space-y-3">
            <h4>Available Routes</h4>
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
                      {route.startLocation} → {route.endLocation}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Station Selection Status */}
          {selectedRoute && (
            <div className="space-y-3 mt-4 p-3 bg-gray-50 rounded-lg">
              <h4>Station Selection</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFromStation && (
                  <Badge variant="default">
                    From: {selectedFromStation.name}
                  </Badge>
                )}
                {selectedToStation && (
                  <Badge variant="secondary">
                    To: {selectedToStation.name}
                  </Badge>
                )}
              </div>
              {selectedFromStation && (
                <p className="text-sm text-muted-foreground">
                  {selectedToStation 
                    ? 'Route selected! You can now search for buses.'
                    : 'Now select your destination station.'
                  }
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
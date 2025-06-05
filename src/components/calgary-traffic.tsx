import { useEffect, useState, useRef } from "react";
import { trafficAPI } from "@/api/traffic-cam";
import { GoogleMap, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrafficCamera } from "@/api/types";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

export const CalgaryTraffic = () => {
    // All hooks must be called unconditionally at the top level
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY,
    });

    const [cameras, setCameras] = useState<TrafficCamera[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);
    
    const mapRef = useRef<google.maps.Map | null>(null);
    const clustererRef = useRef<MarkerClusterer | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);

    // Load camera data
    const loadCameras = async () => {
        try {
            setLoading(true);
            const data = await trafficAPI.getTrafficCameras();
            setCameras(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load cameras");
        } finally {
            setLoading(false);
        }
    };

    // Initialize map
    const onLoad = (map: google.maps.Map) => {
        mapRef.current = map;
        setMapReady(true);
        initClusterer();
    };

    // Clean up map resources
    const onUnmount = () => {
        if (clustererRef.current) {
            clustererRef.current.clearMarkers();
            clustererRef.current = null;
        }
        markersRef.current = [];
        mapRef.current = null;
        setMapReady(false);
    };

    // Initialize marker clusterer
    const initClusterer = () => {
        if (!mapRef.current) return;
        
        clustererRef.current = new MarkerClusterer({
            map: mapRef.current,
            markers: [],
            renderer: {
                render: ({ count, position }) => {
                    return new google.maps.Marker({
                        position,
                        label: {
                            text: String(count),
                            color: "white",
                            fontSize: "12px",
                        },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#EA4335",
                            fillOpacity: 0.9,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                            scale: 10 + Math.log2(count) * 2,
                        },
                    });
                },
            },
        });
        updateMarkers();
    };

    // Update markers when cameras or map changes
    const updateMarkers = () => {
        if (!mapRef.current || !clustererRef.current) return;
        
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
        // Create new markers
        const newMarkers = cameras.map(camera => {
            const marker = new google.maps.Marker({
                position: {
                    lat: camera.point.coordinates[1],
                    lng: camera.point.coordinates[0]
                },
                icon: {
                    path: "M12 2C15.9 2 19 5.1 19 9C19 14.2 12 22 12 22C12 22 5 14.2 5 9C5 5.1 8.1 2 12 2Z",
                    fillColor: "#EA4335",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 1,
                    scale: 1.5,
                },
                map: mapRef.current
            });

            marker.addListener("click", () => {
                setSelectedCamera(camera);
            });

            return marker;
        });

        markersRef.current = newMarkers;
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(newMarkers);
    };

    // Initial load
    useEffect(() => {
        loadCameras();
        return () => onUnmount();
    }, []);

    // Update markers when cameras or map changes
    useEffect(() => {
        if (mapReady && cameras.length > 0) {
            updateMarkers();
        }
    }, [cameras, mapReady]);

    if (!isLoaded) {
        return <div className="p-4 text-center">Loading Google Maps...</div>;
    }

    if (loading) return <div className="p-4 text-center">Loading traffic cameras...</div>;
    if (error) return (
        <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <Button onClick={loadCameras} className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
            </Button>
        </div>
    );

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Calgary Traffic Cameras</CardTitle>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadCameras}
                        disabled={loading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[600px] w-full rounded-md overflow-hidden bg-gray-100">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat: 51.0447, lng: -114.0719 }}
                        zoom={12}
                        options={{
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: true,
                            backgroundColor: "#f0f0f0",
                        }}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                    >
                        {selectedCamera && (
                            <InfoWindow
                                position={{
                                    lat: selectedCamera.point.coordinates[1],
                                    lng: selectedCamera.point.coordinates[0],
                                }}
                                onCloseClick={() => setSelectedCamera(null)}
                                options={{ maxWidth: 600 }}
                            >
                                <div className="w-[550px] p-2">
                                    <img 
                                        src={`${selectedCamera.camera_url.url}?t=${Date.now()}`} 
                                        alt={selectedCamera.camera_url.description}
                                        className="w-full h-auto rounded-lg shadow"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/camera-error-placeholder.jpg';
                                            (e.target as HTMLImageElement).className = "w-full h-64 object-cover rounded-lg bg-gray-200";
                                        }}
                                    />
                                    <div className="mt-2">
                                        <p className="font-medium">{selectedCamera.camera_location}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCamera.quadrant} • {new Date().toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </div>
            </CardContent>
        </Card>
    );
};
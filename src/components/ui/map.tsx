import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface MapProps {
  lat: number;
  lng: number;
  locationName?: string;
  className?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const Map = ({ lat, lng, locationName, className }: MapProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const center = { lat, lng };

  if (loadError) {
    return <div className={className}>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className={className}>Loading map...</div>;
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={{
          mapId: "WEATHER_APP_MAP",
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker position={center} title={locationName} />
      </GoogleMap>
    </div>
  );
};

export default Map;
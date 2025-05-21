import { Card, CardContent, CardHeader, CardTitle } from "./card";
import Map from "./map";

interface MapCardProps {
  lat: number;
  lng: number;
  locationName?: string;
}

const MapCard = ({ lat, lng, locationName }: MapCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 w-full">
          <Map 
            lat={lat} 
            lng={lng} 
            locationName={locationName}
            className="h-full w-full rounded-b-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapCard;
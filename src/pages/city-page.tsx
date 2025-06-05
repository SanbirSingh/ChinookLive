import CurrentWeather from "@/components/current-weather";
import FavouriteButton from "@/components/favourite-button";
import HourlyTemperature from "@/components/hourly-temperature";
import WeatherSkeleton from "@/components/loading-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WeatherDetails from "@/components/weather-details";
import WeatherForecast from "@/components/weather-forecast";
import { useForecastQuery, useWeatherQuery } from "@/hooks/use-weather";
import { AlertTriangle } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom"
import MapCard from "@/components/ui/map-card";
import { CalgaryTraffic } from "@/components/calgary-traffic";
import { useEffect, useState } from "react";

const CityPage = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [isCalgary, setIsCalgary] = useState(false);
  const calgaryCoordinates = { lat: 51.0447, lon: -114.0719 };
  const lat = parseFloat(searchParams.get("lat") || calgaryCoordinates.lat.toString());
  const lon = parseFloat(searchParams.get("lon") || calgaryCoordinates.lon.toString());

  const coordinates = { lat, lon };

    // Check if current location is Calgary (within reasonable distance)
  useEffect(() => {
    const distance = Math.sqrt(
      Math.pow(lat - calgaryCoordinates.lat, 2) + 
      Math.pow(lon - calgaryCoordinates.lon, 2)
    );
    setIsCalgary(distance < 0.2); // Roughly ~22km radius
  }, [lat, lon]);

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);

  if(weatherQuery.error || forecastQuery.error) {
    return(
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>Failed to fetch weather data. Please try again.</p>
        </AlertDescription>
      </Alert>
    );
  }

  if(!weatherQuery.data || !forecastQuery.data) {
    return <WeatherSkeleton />
  }

  // Get the city name from params or from weather data if params is not available
  const cityName = params.cityName || weatherQuery.data.name;

  return (
    <div className="space-y-4">
      {/* Favourite Cities */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {cityName}
        </h1>
        <div>
          <FavouriteButton data={{...weatherQuery.data, name: cityName}}/>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-4">
          <CurrentWeather data={weatherQuery.data} />
          <HourlyTemperature data={forecastQuery.data} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <WeatherDetails data={weatherQuery.data} />
            <MapCard 
              lat={coordinates.lat} 
              lng={coordinates.lon} 
              locationName={cityName} 
              
            />
          </div>
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
      
      {/* Check if city is Calgary (case-insensitive) */}
      {(params.cityName?.toLowerCase() === 'calgary' || isCalgary) && (
        <CalgaryTraffic />
      )}
    </div>
  )
}

export default CityPage

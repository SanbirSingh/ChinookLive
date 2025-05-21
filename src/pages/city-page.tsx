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

const CityPage = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const lat = parseFloat(searchParams.get("lat") || "0")
  const lon = parseFloat(searchParams.get("lon") || "0")

  const coordinates = { lat, lon };

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

  if(!weatherQuery.data || !forecastQuery.data || !params.cityName) {
    return <WeatherSkeleton />
  }
  console.log(weatherQuery.data)

  return (
    <div className="space-y-4">
      {/* {Favourite Cities} */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {params.cityName}
        </h1>
        <div>
          <FavouriteButton data={{...weatherQuery.data, name: params.cityName}}/>
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
              locationName={params.cityName} 
            />
          </div>
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
      {params.cityName?.toLowerCase() === 'calgary' && (
        <CalgaryTraffic />
      )}
    </div>
  )
}

export default CityPage

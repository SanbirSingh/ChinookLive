import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/layout'
import { ThemeProvider } from './context/theme-provider'
import WeatherDashboard from './pages/weather-dashboard'
import CityPage from './pages/city-page'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime: 5 * 60 * 1000, //5 minutes
      gcTime: 10 * 60 * 1000,  //10 minutes
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
});

function App() {
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isCalgary, setIsCalgary] = useState(false);
  const calgaryCoordinates = { lat: 51.0447, lon: -114.0719 };

  // Get user location on app load
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        
        // Check if location is Calgary (within ~22km)
        const calgaryCoordinates = { lat: 51.0447, lon: -114.0719 };
        const distance = Math.sqrt(
          Math.pow(latitude - calgaryCoordinates.lat, 2) + 
          Math.pow(longitude - calgaryCoordinates.lon, 2)
        );
        setIsCalgary(distance < 0.2);
      },
      () => {
        // If geolocation fails, fall back to Calgary by default
        setIsCalgary(true);
      }
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme='dark'>
          <Layout>
            <Routes>
              <Route path="/" element={
                isCalgary ? (
                  <Navigate to={`/city/Calgary?lat=${calgaryCoordinates.lat}&lon=${calgaryCoordinates.lon}`} replace />
                ) : (
                  <WeatherDashboard />
                )
              }/>
              <Route path="/city/:cityName" element={<CityPage />}/>
            </Routes>
          </Layout>
          <Toaster richColors/>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
export default App

package com.sinergias365.weatherwidget

import android.content.Context
import android.location.Geocoder
import android.location.Location
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

/**
 * Fetches current weather for a location from Open-Meteo (no API key required)
 * and resolves a human-readable place name via the on-device Geocoder.
 */
object WeatherRepository {

    private const val FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    private const val AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

    suspend fun fetchWeather(context: Context, location: Location): WeatherData = withContext(Dispatchers.IO) {
        val json = requestJson(
            "$FORECAST_URL?latitude=${location.latitude}&longitude=${location.longitude}" +
                "&current=temperature_2m,weather_code,is_day&timezone=auto"
        )
        val current = json.getJSONObject("current")

        val airQuality = try {
            requestJson(
                "$AIR_QUALITY_URL?latitude=${location.latitude}&longitude=${location.longitude}" +
                    "&current=european_aqi,uv_index&timezone=auto"
            ).getJSONObject("current")
        } catch (_: Exception) {
            null
        }

        WeatherData(
            locationName = resolveLocationName(context, location),
            temperatureC = current.getDouble("temperature_2m"),
            weatherCode = current.getInt("weather_code"),
            isDay = current.optInt("is_day", 1) == 1,
            europeanAqi = airQuality?.let { if (it.isNull("european_aqi")) null else it.getInt("european_aqi") },
            uvIndex = airQuality?.let { if (it.isNull("uv_index")) null else it.getDouble("uv_index") },
            updatedAtMillis = System.currentTimeMillis()
        )
    }

    private fun requestJson(url: String): JSONObject {
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.connectTimeout = 10_000
        connection.readTimeout = 10_000
        connection.requestMethod = "GET"

        try {
            val responseCode = connection.responseCode
            check(responseCode == HttpURLConnection.HTTP_OK) { "HTTP $responseCode" }
            val body = BufferedReader(InputStreamReader(connection.inputStream)).use { it.readText() }
            return JSONObject(body)
        } finally {
            connection.disconnect()
        }
    }

    private fun resolveLocationName(context: Context, location: Location): String {
        return try {
            @Suppress("DEPRECATION")
            val addresses = Geocoder(context, Locale.getDefault())
                .getFromLocation(location.latitude, location.longitude, 1)
            val address = addresses?.firstOrNull()
            address?.locality
                ?: address?.subAdminArea
                ?: address?.adminArea
                ?: formatCoordinates(location)
        } catch (_: Exception) {
            formatCoordinates(location)
        }
    }

    private fun formatCoordinates(location: Location): String =
        String.format(Locale.getDefault(), "%.2f, %.2f", location.latitude, location.longitude)
}

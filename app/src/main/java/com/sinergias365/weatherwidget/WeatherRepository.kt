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

    private const val BASE_URL = "https://api.open-meteo.com/v1/forecast"

    suspend fun fetchWeather(context: Context, location: Location): WeatherData = withContext(Dispatchers.IO) {
        val json = requestCurrentWeather(location.latitude, location.longitude)
        val current = json.getJSONObject("current")

        WeatherData(
            locationName = resolveLocationName(context, location),
            temperatureC = current.getDouble("temperature_2m"),
            weatherCode = current.getInt("weather_code"),
            isDay = current.optInt("is_day", 1) == 1,
            updatedAtMillis = System.currentTimeMillis()
        )
    }

    private fun requestCurrentWeather(latitude: Double, longitude: Double): JSONObject {
        val url = URL(
            "$BASE_URL?latitude=$latitude&longitude=$longitude" +
                "&current=temperature_2m,weather_code,is_day&timezone=auto"
        )
        val connection = url.openConnection() as HttpURLConnection
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

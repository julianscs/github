package com.sinergias365.weatherwidget

data class WeatherData(
    val locationName: String,
    val temperatureC: Double,
    val weatherCode: Int,
    val isDay: Boolean,
    val europeanAqi: Int?,
    val uvIndex: Double?,
    val updatedAtMillis: Long
)

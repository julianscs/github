package com.sinergias365.weatherwidget

/**
 * Severity colors for the European Air Quality Index and the WHO UV Index scale.
 * Colors follow the commonly used traffic-light convention for each scale.
 */
object AirQualityLevel {

    // European AQI: https://open-meteo.com/en/docs/air-quality-api (0-20 good ... 100+ extremely poor)
    fun colorForEuropeanAqi(aqi: Int): Int = when {
        aqi <= 20 -> 0xFF4CAF50.toInt()  // Buena
        aqi <= 40 -> 0xFF8BC34A.toInt()  // Aceptable
        aqi <= 60 -> 0xFFFFC107.toInt()  // Moderada
        aqi <= 80 -> 0xFFFF7043.toInt()  // Mala
        aqi <= 100 -> 0xFFE53935.toInt() // Muy mala
        else -> 0xFF8E24AA.toInt()       // Extremadamente mala
    }

    fun descriptionResForEuropeanAqi(aqi: Int): Int = when {
        aqi <= 20 -> R.string.aqi_good
        aqi <= 40 -> R.string.aqi_fair
        aqi <= 60 -> R.string.aqi_moderate
        aqi <= 80 -> R.string.aqi_poor
        aqi <= 100 -> R.string.aqi_very_poor
        else -> R.string.aqi_extremely_poor
    }

    // WHO UV Index scale: 0-2 low ... 11+ extreme
    fun colorForUvIndex(uv: Double): Int = when {
        uv < 3 -> 0xFF4CAF50.toInt()   // Bajo
        uv < 6 -> 0xFFFFC107.toInt()   // Moderado
        uv < 8 -> 0xFFFF7043.toInt()   // Alto
        uv < 11 -> 0xFFE53935.toInt()  // Muy alto
        else -> 0xFF8E24AA.toInt()     // Extremo
    }

    fun descriptionResForUvIndex(uv: Double): Int = when {
        uv < 3 -> R.string.uv_low
        uv < 6 -> R.string.uv_moderate
        uv < 8 -> R.string.uv_high
        uv < 11 -> R.string.uv_very_high
        else -> R.string.uv_extreme
    }
}

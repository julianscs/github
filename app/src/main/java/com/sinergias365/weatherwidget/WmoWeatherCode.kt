package com.sinergias365.weatherwidget

/**
 * Maps Open-Meteo's WMO weather codes to a description string and an icon.
 * Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
object WmoWeatherCode {

    data class Presentation(val descriptionRes: Int, val iconRes: Int)

    fun present(code: Int, isDay: Boolean): Presentation = when (code) {
        0 -> Presentation(
            R.string.weather_clear,
            if (isDay) R.drawable.ic_weather_sunny else R.drawable.ic_weather_clear_night
        )
        1, 2 -> Presentation(
            R.string.weather_partly_cloudy,
            if (isDay) R.drawable.ic_weather_partly_cloudy else R.drawable.ic_weather_partly_cloudy_night
        )
        3 -> Presentation(R.string.weather_overcast, R.drawable.ic_weather_cloudy)
        45, 48 -> Presentation(R.string.weather_fog, R.drawable.ic_weather_fog)
        51, 53, 55, 56, 57 -> Presentation(R.string.weather_drizzle, R.drawable.ic_weather_rain)
        61, 63, 65, 66, 67, 80, 81, 82 -> Presentation(R.string.weather_rain, R.drawable.ic_weather_rain)
        71, 73, 75, 77, 85, 86 -> Presentation(R.string.weather_snow, R.drawable.ic_weather_snow)
        95, 96, 99 -> Presentation(R.string.weather_storm, R.drawable.ic_weather_storm)
        else -> Presentation(R.string.weather_unknown, R.drawable.ic_weather_cloudy)
    }
}

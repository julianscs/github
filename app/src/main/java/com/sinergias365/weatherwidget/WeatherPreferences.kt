package com.sinergias365.weatherwidget

import android.content.Context

/** Small persistence layer so the widget can render the last known reading instantly. */
object WeatherPreferences {

    private const val PREFS_NAME = "weather_widget_prefs"
    private const val KEY_LOCATION_NAME = "location_name"
    private const val KEY_TEMPERATURE = "temperature_c"
    private const val KEY_WEATHER_CODE = "weather_code"
    private const val KEY_IS_DAY = "is_day"
    private const val KEY_AQI = "european_aqi"
    private const val KEY_UV_INDEX = "uv_index"
    private const val KEY_UPDATED_AT = "updated_at"
    private const val NO_VALUE = Int.MIN_VALUE

    fun save(context: Context, data: WeatherData) {
        prefs(context).edit()
            .putString(KEY_LOCATION_NAME, data.locationName)
            .putFloat(KEY_TEMPERATURE, data.temperatureC.toFloat())
            .putInt(KEY_WEATHER_CODE, data.weatherCode)
            .putBoolean(KEY_IS_DAY, data.isDay)
            .putInt(KEY_AQI, data.europeanAqi ?: NO_VALUE)
            .putFloat(KEY_UV_INDEX, data.uvIndex?.toFloat() ?: Float.NaN)
            .putLong(KEY_UPDATED_AT, data.updatedAtMillis)
            .apply()
    }

    fun load(context: Context): WeatherData? {
        val p = prefs(context)
        if (!p.contains(KEY_UPDATED_AT)) return null
        val uv = p.getFloat(KEY_UV_INDEX, Float.NaN)
        val aqi = p.getInt(KEY_AQI, NO_VALUE)
        return WeatherData(
            locationName = p.getString(KEY_LOCATION_NAME, null) ?: return null,
            temperatureC = p.getFloat(KEY_TEMPERATURE, 0f).toDouble(),
            weatherCode = p.getInt(KEY_WEATHER_CODE, 0),
            isDay = p.getBoolean(KEY_IS_DAY, true),
            europeanAqi = if (aqi == NO_VALUE) null else aqi,
            uvIndex = if (uv.isNaN()) null else uv.toDouble(),
            updatedAtMillis = p.getLong(KEY_UPDATED_AT, 0L)
        )
    }

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
}

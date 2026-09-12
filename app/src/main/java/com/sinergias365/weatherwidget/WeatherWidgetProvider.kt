package com.sinergias365.weatherwidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.text.format.DateFormat
import android.widget.RemoteViews
import java.util.Date

class WeatherWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        WeatherUpdateWorker.schedulePeriodic(context)
        for (appWidgetId in appWidgetIds) {
            renderWidget(context, appWidgetManager, appWidgetId)
        }
        WeatherUpdateWorker.requestImmediateUpdate(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            WeatherUpdateWorker.requestImmediateUpdate(context)
        }
    }

    companion object {
        const val ACTION_REFRESH = "com.sinergias365.weatherwidget.ACTION_REFRESH"

        fun refreshAllWidgets(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, WeatherWidgetProvider::class.java))
            for (id in ids) {
                renderWidget(context, manager, id)
            }
        }

        private fun renderWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.weather_widget)
            val data = WeatherPreferences.load(context)

            if (data == null) {
                views.setTextViewText(R.id.widget_temperature, context.getString(R.string.widget_no_data_temp))
                views.setTextViewText(R.id.widget_location, context.getString(R.string.widget_no_data_location))
                views.setTextViewText(R.id.widget_updated_at, context.getString(R.string.widget_tap_to_open))
                views.setImageViewResource(R.id.widget_icon, R.drawable.ic_weather_cloudy)
            } else {
                val presentation = WmoWeatherCode.present(data.weatherCode, data.isDay)
                views.setTextViewText(
                    R.id.widget_temperature,
                    context.getString(R.string.widget_temperature_format, Math.round(data.temperatureC))
                )
                views.setTextViewText(R.id.widget_location, data.locationName)
                views.setImageViewResource(R.id.widget_icon, presentation.iconRes)

                val time = DateFormat.getTimeFormat(context).format(Date(data.updatedAtMillis))
                views.setTextViewText(
                    R.id.widget_updated_at,
                    context.getString(
                        R.string.widget_updated_at_format,
                        context.getString(presentation.descriptionRes),
                        time
                    )
                )
            }

            views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent(context))
            views.setOnClickPendingIntent(R.id.widget_root, openAppPendingIntent(context))

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun refreshPendingIntent(context: Context): PendingIntent {
            val intent = Intent(context, WeatherWidgetProvider::class.java).apply { action = ACTION_REFRESH }
            return PendingIntent.getBroadcast(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        private fun openAppPendingIntent(context: Context): PendingIntent {
            val intent = Intent(context, MainActivity::class.java)
            return PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }
}

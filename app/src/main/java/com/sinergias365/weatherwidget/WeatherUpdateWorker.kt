package com.sinergias365.weatherwidget

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

class WeatherUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        if (!LocationHelper.hasLocationPermission(applicationContext)) {
            return Result.failure()
        }

        val location = LocationHelper.getCurrentLocation(applicationContext)
            ?: return if (runAttemptCount < 2) Result.retry() else Result.failure()

        return try {
            val weather = WeatherRepository.fetchWeather(applicationContext, location)
            WeatherPreferences.save(applicationContext, weather)
            WeatherWidgetProvider.refreshAllWidgets(applicationContext)
            Result.success()
        } catch (_: Exception) {
            if (runAttemptCount < 2) Result.retry() else Result.failure()
        }
    }

    companion object {
        private const val PERIODIC_WORK_NAME = "weather_periodic_refresh"
        private const val ONE_TIME_WORK_NAME = "weather_immediate_refresh"

        fun schedulePeriodic(context: Context) {
            val request = PeriodicWorkRequestBuilder<WeatherUpdateWorker>(30, TimeUnit.MINUTES).build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }

        fun requestImmediateUpdate(context: Context) {
            val request = OneTimeWorkRequestBuilder<WeatherUpdateWorker>().build()
            WorkManager.getInstance(context).enqueueUniqueWork(
                ONE_TIME_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                request
            )
        }
    }
}

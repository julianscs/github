package com.sinergias365.weatherwidget

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import androidx.core.content.ContextCompat
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

/**
 * Resolves the device's current location without depending on Google Play Services,
 * so the widget also works on devices without Play Services (e.g. AOSP, some China ROMs).
 */
object LocationHelper {

    private const val FRESH_LOCATION_TIMEOUT_MS = 10_000L
    private const val MAX_CACHED_LOCATION_AGE_MS = 15 * 60 * 1000L

    fun hasLocationPermission(context: Context): Boolean {
        val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
        return fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED
    }

    suspend fun getCurrentLocation(context: Context): Location? {
        if (!hasLocationPermission(context)) return null
        val manager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null

        val cached = bestCachedLocation(manager)
        if (cached != null && System.currentTimeMillis() - cached.time < MAX_CACHED_LOCATION_AGE_MS) {
            return cached
        }

        val fresh = requestSingleUpdate(manager)
        return fresh ?: cached
    }

    private fun bestCachedLocation(manager: LocationManager): Location? {
        val providers = manager.allProviders
        var best: Location? = null
        for (provider in providers) {
            val location = try {
                manager.getLastKnownLocation(provider)
            } catch (_: SecurityException) {
                null
            } ?: continue
            if (best == null || location.time > best!!.time) {
                best = location
            }
        }
        return best
    }

    private suspend fun requestSingleUpdate(manager: LocationManager): Location? {
        val provider = when {
            manager.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
            manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
            else -> return null
        }

        return suspendCancellableCoroutine { continuation ->
            val listener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    manager.removeUpdates(this)
                    if (continuation.isActive) continuation.resume(location)
                }

                @Deprecated("Deprecated in Java")
                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) = Unit
                override fun onProviderEnabled(provider: String) = Unit
                override fun onProviderDisabled(provider: String) = Unit
            }

            try {
                manager.requestLocationUpdates(provider, 0L, 0f, listener, Looper.getMainLooper())
            } catch (_: SecurityException) {
                if (continuation.isActive) continuation.resume(null)
                return@suspendCancellableCoroutine
            }

            continuation.invokeOnCancellation { manager.removeUpdates(listener) }

            val timeoutRunnable = Runnable {
                manager.removeUpdates(listener)
                if (continuation.isActive) continuation.resume(null)
            }
            android.os.Handler(Looper.getMainLooper()).postDelayed(timeoutRunnable, FRESH_LOCATION_TIMEOUT_MS)
        }
    }
}

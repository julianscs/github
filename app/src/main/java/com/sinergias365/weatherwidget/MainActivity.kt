package com.sinergias365.weatherwidget

import android.Manifest
import android.os.Bundle
import android.text.format.DateFormat
import android.widget.Button
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.util.Date
import kotlin.math.roundToInt

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
            val granted = grants.values.any { it }
            if (granted) {
                WeatherUpdateWorker.schedulePeriodic(this)
                WeatherUpdateWorker.requestImmediateUpdate(this)
            }
            refreshStatus()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.status_text)

        findViewById<Button>(R.id.grant_permission_button).setOnClickListener {
            requestPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }

        findViewById<Button>(R.id.refresh_button).setOnClickListener {
            if (LocationHelper.hasLocationPermission(this)) {
                WeatherUpdateWorker.requestImmediateUpdate(this)
                statusText.text = getString(R.string.status_updating)
            } else {
                requestPermissionLauncher.launch(
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        refreshStatus()
    }

    private fun refreshStatus() {
        if (!LocationHelper.hasLocationPermission(this)) {
            statusText.text = getString(R.string.status_no_permission)
            return
        }

        val data = WeatherPreferences.load(this)
        if (data == null) {
            statusText.text = getString(R.string.status_permission_ok_no_data)
            return
        }

        val time = DateFormat.getTimeFormat(this).format(Date(data.updatedAtMillis))
        val builder = StringBuilder(
            getString(R.string.status_last_update_format, data.locationName, Math.round(data.temperatureC), time)
        )
        data.europeanAqi?.let {
            builder.append("\n").append(
                getString(R.string.status_aqi_format, it, getString(AirQualityLevel.descriptionResForEuropeanAqi(it)))
            )
        }
        data.uvIndex?.let {
            builder.append("\n").append(
                getString(
                    R.string.status_uv_format,
                    it.roundToInt(),
                    getString(AirQualityLevel.descriptionResForUvIndex(it))
                )
            )
        }
        statusText.text = builder.toString()
    }
}

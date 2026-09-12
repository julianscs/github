Mi Clima — widget de clima para Android
========================================

Widget para pantalla de inicio de Android que muestra el clima y la
temperatura actuales del lugar donde te encuentres, usando la ubicación del
dispositivo.

## Cómo funciona

- **Ubicación**: usa `LocationManager` (GPS/red), sin depender de Google Play
  Services, para que funcione también en dispositivos sin GMS.
- **Clima**: consulta la API pública de [Open-Meteo](https://open-meteo.com/)
  (gratuita, sin API key) con la latitud/longitud del dispositivo.
- **Lugar**: resuelve un nombre de localidad legible con el `Geocoder` del
  sistema (con fallback a coordenadas si no está disponible).
- **Actualización**: un `WorkManager` periódico (cada 30 min) mantiene el
  widget al día; también se puede refrescar al toque desde el propio widget
  o desde la app.

## Estructura

- `MainActivity`: pide el permiso de ubicación y muestra el estado.
- `WeatherWidgetProvider`: `AppWidgetProvider` que pinta el `RemoteViews` del
  widget a partir del último dato cacheado.
- `WeatherUpdateWorker`: obtiene ubicación + clima en segundo plano y
  actualiza el widget.
- `WeatherRepository` / `LocationHelper` / `WeatherPreferences`: acceso a red,
  ubicación y caché local respectivamente.

## Compilar

Requiere Android Studio (o el SDK de Android instalado) — este entorno no
tiene el SDK de Android ni acceso a `dl.google.com`, así que no se pudo
compilar aquí; el proyecto se generó y revisó manualmente.

```
./gradlew assembleDebug
```

Luego, en el dispositivo: abre la app, concede el permiso de ubicación y
añade el widget "Clima actual" desde el selector de widgets de la pantalla
de inicio.

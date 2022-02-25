# BuffsControl

![BuffsControl App Logo](./cropped.png)

<hr>

## About

BuffsControl is a mobile app for real-time streaming and telemetry.

Current features include:

* Streaming Data to Grafana
  * GPS Coordinates
  * Data from OBD-2 using OBD2REST
* Live Streaming
  * Any RTMP URL (Tested with Twitch)

## Screenshots

<details>
<summary>Click to open</summary>
<br>
![iOS Screenshot 01](./docs/assets/ios-ss-01.png)
</details>

## Building

Dependencies can be installed using yarn

```
yarn install
```

### Android

```
npx react-native run-android
```

### iOS

```
npx react-native run-ios --device
```

## Misc

### Generating app logo

```
npx react-native set-icon --path ./cropped.png --background white --platform <android/ios>
```

### macOS Specific Shenanigans

Install 




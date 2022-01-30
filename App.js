/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  Button,
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Platform
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';
import { Buffer } from "buffer"
import { FFmpegKit,ReturnCode } from 'ffmpeg-kit-react-native';


const grafana_url = "***REMOVED***grafana.net/graphite/metrics"
const grafana_api_key = "***REMOVED***";
const grafana_data_for = "blueline"

const cameraPattern = "ralphiecam-00";

/*
const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        Permissions.Android.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ] 
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Camera permission granted");
    }
  } catch (err) {
    console.warn(err)
  }
};
*/



const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA,PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
      {
        title: "Cool Photo App Camera And Microphone Permission",
        message:
          "Cool Photo App needs access to your camera " +
          "so you can take awesome pictures.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera");
    } else {
      console.log("Camera permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestBluetoothPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE],
      {
        title: "Cool Photo App Bluetooth Permission",
        message:
          "Cool Photo App needs access to your bluetooth " +
          "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
          })
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the bluetooth");
    } else {
      console.log("Bluetooth permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};


const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Location permission granted");
      Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
        },
        (error) => {
          console.log(error.code,error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  } catch (err) {
    console.warn(err)
  }
};

const getLocation = (setDeviceLatitude,setDeviceLongitude) => {
  try {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        setDeviceLatitude(position.coords.latitude);
        setDeviceLongitude(position.coords.longitude);
      }
    ),
    (error) => {
      console.log(error.code,error.message);
    }
  }
  catch (err) {
    console.warn(err)
  }
};

const sendLocation = (deviceLatitude,deviceLongitude,props) => {
  var metrics = [{
    "name": "cubrt.blueline.latitude",
    "value": deviceLatitude,
    "interval": 1,
    "metric": "cubrt.blueline.latitude",
    time: Math.round(Date.now() / 1000)
  },
  {
    "name": "cubrt.blueline.longitude",
    "value": deviceLongitude,
    "interval": 1,
    "metric": "cubrt.blueline.longitude",
    time: Math.round(Date.now() / 1000)
  }]

  var username = "208418";

  const token = `${username}:${grafana_api_key}`;
  const base64 = Buffer.from(token).toString('base64');

  const headers = {
    "Authorization": `Basic ${base64}`
  }
  console.log(`https://${grafana_url}`)
  fetch(`https://${grafana_url}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': 'Basic '+ base64
    },
    body: JSON.stringify(metrics)
  })
  .then(res => res.json())
  .then(
    res => {
      console.log(res);
      Toast.show({
        type: 'success',
        text1: 'Grafana',
        text2: `Published ${res.Published}`
      })
    }
    
    )
  .catch(function(error) {
    console.log('There has been a problem with your fetch operation: ' + error.message);
     // ADD THIS THROW error
      throw error;
    });

}

const testStreamTwitch = (props) => {
  FFmpegKit.execute('-v verbose -t 05:00 -f lavfi -i testsrc -f lavfi -i testsrc -f lavfi -i testsrc -f lavfi -i testsrc -ar 44100 -r 30 -g 60 -keyint_min 60 -b:v 400000 -c:v libx264 -preset medium -bufsize 400k -maxrate 400k -f flv "rtmp://den.contribute.live-video.net/app/***REMOVED***"').then(async (session) => {
    const returnCode = await session.getReturnCode();
  
    if (ReturnCode.isSuccess(returnCode)) {
  
      // SUCCESS
  
    } else if (ReturnCode.isCancel(returnCode)) {
  
      // CANCEL
  
    } else {
  
      // ERROR
  
    }
  });
};

const experiment = (props) => {
  FFmpegKit.execute('-f android_camera -video_size 1280x720 -i discarded -r 30 -c:v libx264 -f flv "rtmp://den.contribute.live-video.net/app/***REMOVED***"').then(async (session) => {
    const returnCode = await session.getReturnCode();
  
    if (ReturnCode.isSuccess(returnCode)) {
  
      // SUCCESS
  
    } else if (ReturnCode.isCancel(returnCode)) {
  
      // CANCEL
  
    } else {
  
      // ERROR
  
    }
  });
};

const testLocation = (props) => {
  Geolocation.getCurrentPosition(
    (position) => {
      var positionCoords = position.coords;
      console.log(positionCoords);
      console.log(positionCoords.latitude);
      Toast.show({
        type: 'success',
        text1: 'Your Latitude and Longitude',
        text2: `${positionCoords.latitude}, ${positionCoords.longitude}`
      })
    },
    (error) => {
      console.log(error.code,error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error.code}, ${error.message}`
      })
    }
    )};

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};


const bluetoothStuff = () => {
  console.log("test");
}

const discoverCameras = () => {
  no_sleep = true;
  var patternToCheck = cameraPattern;
  while (no_sleep) {
    fetch(`http://${patternToCheck}`, {method: 'HEAD'}).then((result) => {
      console.log(result)
      no_sleep = false;
    })
  }
}

const App: () => Node = () => {

  var [deviceLatitude, setDeviceLatitude] = React.useState(0.0);
  var [deviceLongitude, setDeviceLongitude] = React.useState(0.0);
  var [isStreaming, setStreaming] = React.useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  
  

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>You only need to grant permissions when you <Text style={styles.highlight}>initially install</Text> the app.</Text>
          <Section title="Permissions">
          <Button title="Location Permissions" onPress={requestLocationPermission} />
          <Text>{"\n"}</Text>
          <Button title="Camera Permissions" onPress={requestCameraPermission} />
          <Text>{"\n"}</Text>
          <Button title="Bluetooth Permissions" onPress={requestBluetoothPermission} />
          </Section>
          <Section title="Test Settings">
            
            <Button title="Test Location" onPress={() => testLocation()}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test Location => Grafana" onPress={() => {getLocation(setDeviceLatitude, setDeviceLongitude); sendLocation(deviceLatitude,deviceLongitude)}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test FFMPEG" onPress={() => testStreamTwitch()}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test Stream" onPress={() => {experiment()}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Kill FFMPEG" onPress={() => {FFmpegKit.cancel();}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test Bluetooth" onPress={() => {bluetoothStuff()}}></Button>
            <Text>{"\n"}</Text>
            <Button 
                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                onPress={() => startScan() } 
              />            
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  }
});

export default App;

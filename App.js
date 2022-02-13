/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Node} from 'react';
import {
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Button,
  useColorScheme,
  View,
  Platform,
  Switch, 
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import { TextInput } from 'react-native-paper'; // TextInput component provided by react-native does not render, and I cannot waste more time on this weirdass bug.

import Header from "./components/header";

import styles from './components/styles';

import Modal from "react-native-modal";

import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';
import { Buffer } from "buffer"
import { FFmpegKit,ReturnCode } from 'ffmpeg-kit-react-native';

import RNBluetoothClassic, {
  BluetoothDevice
} from 'react-native-bluetooth-classic';


import DefaultPreference from 'react-native-default-preference';


import KeepAwake from '@sayem314/react-native-keep-awake';

import Section from "./components/layoutStuff.js";


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

const toastMessage = (title,message,type="success") => {
  Toast.show({
    type: type,
    position: "top",
    text1: title,
    text2: message
})
}

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA,PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
      {
        title: "BuffsControl Camera And Microphone Permission",
        message:
          "Buffs Control App needs access to your camera " +
          "so you can stream your camera.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted["android.permission.CAMERA"] === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera");
      toastMessage("Camera Permission","Already Granted")
    } else {
      console.log("Camera permission denied");
      toastMessage("Camera Permission","Denied","error")
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestBluetoothPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE],
      {
        title: "Buffs Control App Bluetooth Permission",
        message:
          "Buffs Control App needs access to your bluetooth " +
          "so you can connect to ELM327 Adapters.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
          })
    if (granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the bluetooth");
      toastMessage("Bluetooth Permission","Already Granted")
    } else {
      toastMessage("Bluetooth Permission","Denied","error")
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
      toastMessage("Location Permission","Already Granted")
      Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
        },
        (error) => {
          console.log(error.code,error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      console.log("Location permission denied");
      toastMessage("Location Permission","Denied","error")
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



const testSendLocation = (deviceLatitude,deviceLongitude,grafanaKey,grafanaHost,grafanaUser,props) => {
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

  var username = grafanaUser;

  const token = `${username}:${grafanaKey}`;
  const base64 = Buffer.from(token).toString('base64');

  const headers = {
    "Authorization": `Basic ${base64}`
  }
  console.log(`https://${grafanaHost}`)
  fetch(`https://${grafanaHost}`, {
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
      toastMessage("Grafana",`Published ${res.Published}`)
    }
    
    )
  .catch(function(error) {
    console.log('There has been a problem with your fetch operation: ' + error.message);
     // ADD THIS THROW error
      throw error;
    });

}

const testStreamTwitch = (rtmpURL, props) => {
  FFmpegKit.execute(`-v verbose -t 05:00 -f lavfi -i testsrc -f lavfi -i testsrc -f lavfi -i testsrc -f lavfi -i testsrc -ar 44100 -r 30 -g 60 -keyint_min 60 -b:v 400000 -c:v libx264 -preset medium -bufsize 400k -maxrate 400k -f flv "${rtmpURL}"`).then(async (session) => {
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

const experiment = (rtmpURL, props) => {
  FFmpegKit.execute(`-f android_camera -video_size 640x480 -i discarded -r 30 -c:v libx264 -f flv "${rtmpURL}"`).then(async (session) => {
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
      toastMessage("Your Latitude and Longitude",`${positionCoords.latitude}, ${positionCoords.longitude}`, "info")
    },
    (error) => {
      console.log(error.code,error.message);
      toastMessage("Location Error",error.message, "error")
    }
    )};

const OGSection = ({children, title}) => {
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
  try {
    connected = RNBluetoothClassic.getConnectedDevices().then(console.log({connected}))

} catch (err) {
  console.log(err)
    // Error if Bluetooth is not enabled
    // Or there are any issues requesting paired devices
}
  
}

const experimentalStuff = () => {
  FFmpegKit.execute('-f android_camera -list_formats all').then(async (session) => {
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

var getAndSendLocation = (grafana_username,grafana_key,grafana_host) => {
  try {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        var latitude = position.coords.latitude
        var longitude = position.coords.longitude
        var gpsSpeed = position.coords.speed
        var metrics = [{
          "name": "cubrt.blueline.latitude",
          "value": latitude,
          "interval": 1,
          "metric": "cubrt.blueline.latitude",
          "time": Math.round(Date.now() / 1000)
        },
        {
          "name": "cubrt.blueline.longitude",
          "value": longitude,
          "interval": 1,
          "metric": "cubrt.blueline.longitude",
          "time": Math.round(Date.now() / 1000)
        },
        {
          "name": "cubrt.blueline.gpsSpeed",
          "value": gpsSpeed,
          "interval": 1,
          "metric": "cubrt.blueline.gpsSpeed",
          "time": Math.round(Date.now() / 1000)
        }]
        console.log("what the fuck", metrics)
        console.log(metrics)
      
        var username = grafana_username
        const token = `${username}:${grafana_key}`
        const base64 = Buffer.from(token).toString('base64')
      
        fetch(`https://${grafana_host}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${base64}`
          },
          body: JSON.stringify(metrics)
        }).then(res => res.json())
        .then(
          res => {
            console.log(res);
          }
        )
        .catch(function(error) {
          console.log(error);
        })
      }
    ),
  (error) => {
    console.log(error.code,error.message);
  }
  } catch (err) {
    console.warn(err)
  }
}

const StartTelemetry = (isTelemetry,loopID, setLoopID,grafana_key,grafana_host,grafana_user, props) => {
  console.log(isTelemetry);
  if (isTelemetry) { // idk why but for our case isTelemetry = true means switch is off
    clearInterval(loopID);
    console.log("cleared loop")
  } else {
    const tempLoopID = setInterval(() => {getAndSendLocation(grafana_user,grafana_key,grafana_host)} , 1000);
    setLoopID(tempLoopID);
    console.log("nothing")
  }
}

function Welcome(props) {
  return <Text>Hello, {props.name}</Text>;
}

function SeperatorWithHeader(props) {
  return <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={{flex: 1, height: 1, backgroundColor: 'black'}} /><View><Text style={{fontSize: 24, fontWeight: '600', width: 150, textAlign: 'center'}}>{props.name}</Text></View><View style={{flex: 1, height: 1, backgroundColor: 'black'}} /></View>
}

const logStuff = (isCountedTo, setCountedTo, props) => {
    console.log(isCountedTo);
    setCountedTo(isCountedTo => isCountedTo + 1);
  }

const App: () => Node = () => {

  var [deviceLatitude, setDeviceLatitude] = React.useState(0.0);
  var [deviceLongitude, setDeviceLongitude] = React.useState(0.0);
  var [isStreaming, setStreaming] = React.useState(false);
  var [isTelemetry, setTelemetry] = React.useState(false);
  var [isCountedTo, setCountedTo] = React.useState(0);
  var [loopID, setLoopID] = React.useState(0);
  const [text, setText] = React.useState('');
  var [showingModal, setShowingModal] = React.useState(false);

  var [grafanaKey, setGrafanaKey] = React.useState('your_grafana_key_here');
  var [rtmpURL, setRTMPURL] = React.useState('rtmp://your_rtmp_url_here');
  var [grafanaUser, setGrafanaUser] = React.useState('your_grafana_user_here');
  var [grafanaHost, setGrafanaHost] = React.useState('your_grafana_host_here');
  var [grafanaDataFor, setGrafanaDataFor] = React.useState('your_grafana_data_for_here');

  DefaultPreference.get('grafana_key').then(value => {
    if (value === null) {
      DefaultPreference.set('grafana_key', "your_grafana_key_here")
    } else {
      setGrafanaKey(value)
    }
  })

  DefaultPreference.get('rtmp_url').then(value => {
    if (value === null) {
      DefaultPreference.set('rtmp_url', "rtmp://your_rtmp_url_here")
    } else {
      setRTMPURL(value)
    }
  })

  DefaultPreference.get('grafana_user').then(value => {
    if (value === null) {
      DefaultPreference.set('grafana_user', "your_grafana_user_here")
    } else {
      setGrafanaUser(value)
    }
  })

  DefaultPreference.get('grafana_host').then(value => {
    if (value === null) {
      DefaultPreference.set('grafana_host', "your_grafana_host_here")
    } else {
      setGrafanaHost(value)
    }
  })


  const isDarkMode = useColorScheme() === 'dark';
  const toggleSwitch = () => setTelemetry(previousState => !previousState);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  //const loopFunction = setInterval(logStuff(isCountedTo, setCountedTo), 1000);
  var loopFunction = null;
  const [number, onChangeNumber] = React.useState(null);
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <KeepAwake />
        <View
          style={[{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }]}>

<Modal isVisible={showingModal} backdropColor={isDarkMode ? Colors.black : Colors.white}>
        <View style={{ flex: 1, }}>
        <Section title="Configuration" >
          <Text>Grafana API Key:</Text>
          <TextInput
        onChangeText={value => {setGrafanaKey(value); DefaultPreference.set('grafana_key', value)}}
        value={grafanaKey}
        placeholder="useless placeholder"
      />
      <Text>{"\n"}</Text>
      <Text>Grafana Username:</Text>
          <TextInput
        onChangeText={value => {setGrafanaUser(value); DefaultPreference.set('grafana_user', value)}}
        value={grafanaUser}
        placeholder="useless placeholder"
      />
      <Text>{"\n"}</Text>
      <Text>Grafana Host:</Text>
          <TextInput
        onChangeText={value => {setGrafanaHost(value); DefaultPreference.set('grafana_host', value)}}
        value={grafanaHost}
        placeholder="useless placeholder"
      />
      <Text>{"\n"}</Text>
      <Text>RTMP URL:</Text>
          <TextInput
        onChangeText={value => {setRTMPURL(value); DefaultPreference.set('rtmp_url', value)}}
        value={rtmpURL}
        placeholder="useless placeholder"
      />
      <Text>{"\n"}</Text>
          <Button onPress={() => {setShowingModal(false)}}  title="Close" />
          </Section>
        </View>
      </Modal>
          
          <Section title="Permissions">
          <Button title="Location Permissions" onPress={requestLocationPermission} />
          <Text>{"\n"}</Text>
          <Button title="Camera Permissions" onPress={requestCameraPermission} />
          <Text>{"\n"}</Text>
          <Button title="Bluetooth Permissions" onPress={requestBluetoothPermission} />
          </Section>
           
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          
          <Section title="Test Settings">
            
            <Button title="Test Location" onPress={() => testLocation()}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test Location => Grafana" onPress={() => {getLocation(setDeviceLatitude, setDeviceLongitude); testSendLocation(deviceLatitude,deviceLongitude,grafanaKey,grafanaHost,grafanaUser)}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test FFMPEG" onPress={() => testStreamTwitch(rtmpURL)}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test Stream" onPress={() => {experiment(rtmpURL)}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Kill FFMPEG" onPress={() => {FFmpegKit.cancel();}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Test Bluetooth" onPress={() => {bluetoothStuff()}}></Button>
            <Text>{"\n"}</Text>
            <Button title="Experiment" onPress={() => experimentalStuff()}></Button>          
          </Section>

          <Section title="Configuration">
            <Button title="Manage API Keys" onPress={() => setShowingModal(true)}></Button>
          </Section>

          <Section title="Run">
            <Text>{"\n"}</Text>
            <Button title={isTelemetry ? 'Stop Telemetry ' : 'Start Telemetry '} onPress={() => {setTelemetry(isTelemetry => !isTelemetry);StartTelemetry(isTelemetry,loopID, setLoopID,grafanaKey,grafanaHost,grafanaUser)}}></Button>
            <Text>{"\n"}</Text>
    
            </Section>

          <Section title="Useless Padding" />
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};


export default App;

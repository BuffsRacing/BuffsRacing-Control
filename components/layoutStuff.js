import React from 'react';

import {
    StyleSheet,
    Text,
    View,
    useColorScheme
  } from 'react-native';

import {
    Colors
  } from 'react-native/Libraries/NewAppScreen';

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

  const Section = ({children, title}) => {
    const isDarkMode = useColorScheme() === 'dark';
    return (
      <View style={styles.sectionContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={{flex: 1, height: 1, backgroundColor: isDarkMode ? Colors.white : Colors.black}} /><View><Text style={{fontSize: 24, fontWeight: '600', width: 150, textAlign: 'center', color: isDarkMode ? Colors.white : Colors.black}}>{title}</Text></View><View style={{flex: 1, height: 1, backgroundColor: isDarkMode ? Colors.white : Colors.black}} /></View>
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

export default Section
import React from 'react';
import { View, StyleSheet, SafeAreaView, Text, ScrollView } from 'react-native';
import DataIN from './components/DataIN';
import SetState from './components/SetState';
import TempControl from './components/TempControl';
import HouseLogo from './components/HouseLogo';

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <HouseLogo />
          
          <View style={styles.headerContainer}>
            <Text style={styles.titleMain}>CONTROL</Text>
            <Text style={styles.titleSub}>ESP32</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.componentsContainer}>
            <DataIN />
            <SetState />
            <TempControl />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
  },
  titleMain: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E90FF',
    letterSpacing: 2,
    textShadowColor: 'rgba(30, 144, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleSub: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1E90FF',
    letterSpacing: 3,
    marginTop: -5,
    textShadowColor: 'rgba(30, 144, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  underline: {
    width: 100,
    height: 4,
    backgroundColor: '#1E90FF',
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.7,
  },
  componentsContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default App;
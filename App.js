import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import DataIN from './components/DataIN';
import SetState from './components/SetState';
import HouseLogo from './components/HouseLogo';

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HouseLogo />
        <Text style={styles.title}>Control ESP32</Text>
        <View style={styles.componentsContainer}>
          <DataIN />
          <SetState />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF', // Azul mediterráneo muy claro
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1E90FF', // Azul mediterráneo más oscuro
  },
  componentsContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default App;
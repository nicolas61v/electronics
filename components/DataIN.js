import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DataIN = () => {
  const [temperature, setTemperature] = useState('--');
  const [humidity, setHumidity] = useState('--');

  const fetchData = () => {
    setTemperature((Math.random() * 30 + 10).toFixed(1));
    setHumidity((Math.random() * 60 + 30).toFixed(1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <Ionicons name="thermometer-outline" size={24} color="#1E90FF" />
          <Text style={styles.dataValue}>{temperature}°C</Text>
          <Text style={styles.dataLabel}>Temperatura</Text>
        </View>
        <View style={styles.dataItem}>
          <Ionicons name="water-outline" size={24} color="#1E90FF" />
          <Text style={styles.dataValue}>{humidity}%</Text>
          <Text style={styles.dataLabel}>Humedad</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={fetchData}>
        <Text style={styles.buttonText}>Obtener Datos</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    width: '100%',
    maxWidth: 350,
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#1E90FF',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DataIN;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';

const DataIN = () => {
  const [temperature1, setTemperature1] = useState('--');
  const [temperature2, setTemperature2] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [progress] = useState(new Animated.Value(0));

  const startProgress = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 20000, // 20 segundos
      useNativeDriver: false,
    }).start(() => {
      fetchData();
      startProgress();
    });
  };

  const fetchData = async () => {
    console.log("Actualizando datos automáticamente...");
    setLastUpdate(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    console.log("Iniciando escucha de datos...");
    startProgress();
    
    const lecturasRef = ref(database, 'sensores/lecturas/inicial');
    const unsubscribe = onValue(lecturasRef, (snapshot) => {
      console.log("Datos recibidos:", snapshot.val());
      
      if (snapshot.exists()) {
        const lectura = snapshot.val();
        
        if (lectura.lm35_temperatura || lectura.dht11_temperatura || lectura.dht11_humedad) {
          setTemperature1(lectura.lm35_temperatura.toFixed(1));
          setTemperature2(lectura.dht11_temperatura.toFixed(1));
          setHumidity(lectura.dht11_humedad.toFixed(1));
          setLastUpdate(new Date().toLocaleTimeString());
        } else {
          console.log("Valores en 0 o nulos recibidos");
        }
      }
    });

    const estadoRef = ref(database, 'dispositivos/esp32_1/estado');
    const unsubscribeEstado = onValue(estadoRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val() === 'offline') {
        setTemperature1('--');
        setTemperature2('--');
        setHumidity('--');
      }
    });

    return () => {
      unsubscribe();
      unsubscribeEstado();
    };
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width
            }
          ]} 
        />
      </View>
      
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#1E90FF" />
          </View>
          <Text style={styles.dataValue}>
            {temperature1 === '0.0' ? '--' : `${temperature1}°C`}
          </Text>
          <Text style={styles.dataLabel}>LM35</Text>
        </View>
        
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#1E90FF" />
          </View>
          <Text style={styles.dataValue}>
            {temperature2 === '0.0' ? '--' : `${temperature2}°C`}
          </Text>
          <Text style={styles.dataLabel}>DHT11 Temp</Text>
        </View>
        
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="water-outline" size={24} color="#1E90FF" />
          </View>
          <Text style={styles.dataValue}>
            {humidity === '0.0' ? '--' : `${humidity}%`}
          </Text>
          <Text style={styles.dataLabel}>Humedad</Text>
        </View>
      </View>
      
      <Text style={styles.updateText}>
        Última actualización: {lastUpdate || '--:--:--'}
      </Text>
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
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E90FF',
    borderRadius: 2,
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginVertical: 5,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  updateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default DataIN;
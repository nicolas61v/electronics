import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';

const DataIN = () => {
  const [temperature1, setTemperature1] = useState('--');
  const [temperature2, setTemperature2] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [progress] = useState(new Animated.Value(0));
  
  // Nuevas animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [rotateAnim] = useState(new Animated.Value(0));

  const startProgress = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 20000, // Mantenemos los 20 segundos
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

  // Animación de entrada
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Animación de actualización de datos
  const animateUpdate = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    console.log("Iniciando escucha de datos...");
    startProgress();
    animateIn();
    
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
          animateUpdate(); // Activamos la animación de actualización
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const renderDataItem = (value, label, icon) => (
    <Animated.View 
      style={[
        styles.dataItem,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: spin }
          ]
        }
      ]}
    >
      <View style={[styles.iconContainer, { transform: [{ scale: 1.1 }] }]}>
        <Ionicons name={icon} size={24} color="#1E90FF" />
      </View>
      <Animated.Text 
        style={[
          styles.dataValue,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {value === '0.0' ? '--' : `${value}${label === 'Humedad' ? '%' : '°C'}`}
      </Animated.Text>
      <Text style={styles.dataLabel}>{label}</Text>
    </Animated.View>
  );

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width,
              backgroundColor: '#1E90FF',
              shadowColor: '#1E90FF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }
          ]} 
        />
      </View>
      
      <View style={styles.dataContainer}>
        {renderDataItem(temperature1, 'LM35', 'thermometer-outline')}
        {renderDataItem(temperature2, 'DHT11 Temp', 'thermometer-outline')}
        {renderDataItem(humidity, 'Humedad', 'water-outline')}
      </View>
      
      <Animated.Text 
        style={[
          styles.updateText,
          {
            opacity: fadeAnim
          }
        ]}
      >
        Última actualización: {lastUpdate || '--:--:--'}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.1)',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
    padding: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#1E90FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginVertical: 5,
    textShadowColor: 'rgba(30, 144, 255, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  updateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DataIN;
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';

const SetState = () => {
  const [isOn, setIsOn] = useState(false);
  const [containerColor] = useState(new Animated.Value(0));
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Escuchar cambios en el estado del relé
    const releRef = ref(database, 'dispositivos/esp32_1/rele');
    const estadoRef = ref(database, 'dispositivos/esp32_1/estado');
    const tiempoRef = ref(database, 'dispositivos/esp32_1/ultima_conexion');

    const unsubscribeRele = onValue(releRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsOn(snapshot.val());
      }
    });

    const unsubscribeEstado = onValue(estadoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDeviceStatus(snapshot.val());
      }
    });

    const unsubscribeTiempo = onValue(tiempoRef, (snapshot) => {
      if (snapshot.exists()) {
        setLastUpdate(new Date().toLocaleTimeString());
      }
    });

    return () => {
      unsubscribeRele();
      unsubscribeEstado();
      unsubscribeTiempo();
    };
  }, []);

  const toggleSwitch = async () => {
    if (deviceStatus !== 'online') return;

    setIsLoading(true);
    const newState = !isOn;
    const releRef = ref(database, 'dispositivos/esp32_1/rele');
    
    try {
      await set(releRef, newState);
      setIsOn(newState);
      Animated.timing(containerColor, {
        toValue: newState ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error("Error toggling relay:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundColor = containerColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#E6F3FF']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isOn ? "bulb" : "bulb-outline"} 
            size={28} 
            color={isOn ? "#1E90FF" : "#666"}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.label, isOn && styles.labelOn]}>
            {isOn ? 'ENCENDIDO' : 'APAGADO'}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, 
              { backgroundColor: deviceStatus === 'online' ? '#4CAF50' : '#FF5252' }
            ]} />
            <Text style={styles.statusText}>
              {deviceStatus === 'online' ? 'Dispositivo conectado' : 'Dispositivo desconectado'}
            </Text>
          </View>
          {lastUpdate && (
            <Text style={styles.updateText}>
              Última actualización: {lastUpdate}
            </Text>
          )}
        </View>

        <View style={styles.controlContainer}>
          {isLoading ? (
            <ActivityIndicator color="#1E90FF" />
          ) : (
            <Switch
              trackColor={{ false: "#767577", true: "#1E90FF" }}
              thumbColor={isOn ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isOn}
              disabled={deviceStatus !== 'online'}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 350,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  labelOn: {
    color: '#1E90FF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  updateText: {
    fontSize: 10,
    color: '#999',
  },
  controlContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SetState;
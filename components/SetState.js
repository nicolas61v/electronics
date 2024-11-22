import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Animated, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';

const SetState = () => {
  const [isOn, setIsOn] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Solo animaciones nativas
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pressAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const releRef = ref(database, 'dispositivos/esp32_1/rele');
    const estadoRef = ref(database, 'dispositivos/esp32_1/estado');
    const tiempoRef = ref(database, 'dispositivos/esp32_1/ultima_conexion');

    const unsubscribeRele = onValue(releRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsOn(snapshot.val());
        startPulseAnimation();
      }
    });

    const unsubscribeEstado = onValue(estadoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDeviceStatus(snapshot.val());
        animateStatusChange(snapshot.val());
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

  const startPulseAnimation = () => {
    if (isOn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const animateStatusChange = (status) => {
    Animated.timing(rotateAnim, {
      toValue: status === 'online' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(pressAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSwitch = async () => {
    if (deviceStatus !== 'online') {
      animatePress();
      return;
    }

    setIsLoading(true);
    const newState = !isOn;
    const releRef = ref(database, 'dispositivos/esp32_1/rele');
    
    try {
      await set(releRef, newState);
      setIsOn(newState);
      
      // Efecto de resplandor
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      animatePress();
    } catch (error) {
      console.error("Error cambiando estado del relé:", error);
      animatePress();
    } finally {
      setIsLoading(false);
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.outerContainer}>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: isOn ? 1.02 : 1 }],
          }
        ]}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ scale: pressAnim }]
            }
          ]}
        >
          <Pressable 
            onPress={toggleSwitch}
            style={[
              styles.pressableContent,
              isOn && styles.pressableContentOn
            ]}
          >
            <Animated.View 
              style={[
                styles.iconContainer,
                isOn && styles.iconContainerOn,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: rotateInterpolate }
                  ],
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.8],
                  }),
                }
              ]}
            >
              <Ionicons 
                name={isOn ? "bulb" : "bulb-outline"} 
                size={28} 
                color={isOn ? "#1E90FF" : "#666"}
              />
            </Animated.View>

            <View style={styles.infoContainer}>
              <Text style={[styles.label, isOn && styles.labelOn]}>
                {isOn ? 'ENCENDIDO' : 'APAGADO'}
              </Text>
              
              <View style={styles.statusRow}>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: deviceStatus === 'online' ? '#4CAF50' : '#FF5252',
                    }
                  ]} 
                />
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
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  container: {
    flexDirection: 'column',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    width: '100%',
  },
  pressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
  },
  pressableContentOn: {
    backgroundColor: '#F8FBFF',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: "#1E90FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainerOn: {
    backgroundColor: '#E6F3FF',
    shadowColor: "#1E90FF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    textShadowColor: 'rgba(30, 144, 255, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  updateText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  controlContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SetState;
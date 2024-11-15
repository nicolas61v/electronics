import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../lib/firebase';

const DataIN = () => {
  const [temperature1, setTemperature1] = useState('--');
  const [temperature2, setTemperature2] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Obtener la última lectura
      const lecturasRef = ref(database, 'sensores/lecturas');
      const snapshot = await get(lecturasRef);
      
      if (snapshot.exists()) {
        // Convertir el objeto de lecturas en un array y ordenar por timestamp
        const lecturas = Object.values(snapshot.val());
        const ultimaLectura = lecturas[lecturas.length - 1];
        
        setTemperature1(ultimaLectura.lm35_temperatura.toFixed(1));
        setTemperature2(ultimaLectura.dht11_temperatura.toFixed(1));
        setHumidity(ultimaLectura.dht11_humedad.toFixed(1));
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Configurar listener para actualizaciones en tiempo real
    const lecturasRef = ref(database, 'sensores/lecturas');
    const unsubscribe = onValue(lecturasRef, (snapshot) => {
      if (snapshot.exists()) {
        const lecturas = Object.values(snapshot.val());
        const ultimaLectura = lecturas[lecturas.length - 1];
        
        setTemperature1(ultimaLectura.lm35_temperatura.toFixed(1));
        setTemperature2(ultimaLectura.dht11_temperatura.toFixed(1));
        setHumidity(ultimaLectura.dht11_humedad.toFixed(1));
        setLastUpdate(new Date().toLocaleTimeString());
      }
    });

    // Limpiar listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#1E90FF" />
          </View>
          <Text style={styles.dataValue}>{temperature1}°C</Text>
          <Text style={styles.dataLabel}>LM35</Text>
        </View>
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#1E90FF" />
          </View>
          <Text style={styles.dataValue}>{temperature2}°C</Text>
          <Text style={styles.dataLabel}>DHT11 Temp</Text>
        </View>
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="water-outline" size={24} color="#1E90FF" />
          </View>
          <Text style={styles.dataValue}>{humidity}%</Text>
          <Text style={styles.dataLabel}>Humedad</Text>
        </View>
      </View>
      <Text style={styles.updateText}>
        Última actualización: {lastUpdate || '--:--:--'}
      </Text>
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={fetchData}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Actualizando...' : 'Actualizar Datos'}
        </Text>
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
  button: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default DataIN;
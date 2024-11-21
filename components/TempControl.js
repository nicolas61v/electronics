import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';

const TempControl = () => {
  const [tempLimit, setTempLimit] = useState('25');
  const [currentTemp, setCurrentTemp] = useState(0);

  useEffect(() => {
    // Escuchar cambios en la temperatura
    const tempRef = ref(database, 'sensores/lecturas/inicial/dht11_temperatura');
    const unsubscribeTemp = onValue(tempRef, async (snapshot) => {
      if (snapshot.exists()) {
        const temp = snapshot.val();
        setCurrentTemp(temp);
        
        // Controlar el relé basado en la temperatura
        const releRef = ref(database, 'dispositivos/esp32_1/rele');
        const shouldTurnOn = temp >= parseFloat(tempLimit);
        await set(releRef, shouldTurnOn);
      }
    });

    return () => unsubscribeTemp();
  }, [tempLimit]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Temperatura</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Temperatura Límite:</Text>
        <TextInput
          style={styles.input}
          value={tempLimit}
          onChangeText={setTempLimit}
          keyboardType="numeric"
          placeholder="25"
        />
        <Text style={styles.unit}>°C</Text>
      </View>
      <Text style={styles.description}>
        El relé se encenderá cuando la temperatura supere {tempLimit}°C
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  input: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  unit: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default TempControl;
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SetState = () => {
  const [isOn, setIsOn] = useState(false);
  const [containerColor] = useState(new Animated.Value(0));

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    Animated.timing(containerColor, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = containerColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#E6F3FF']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={isOn ? "bulb" : "bulb-outline"} size={24} color={isOn ? "#1E90FF" : "#666"} />
      </View>
      <Text style={styles.label}>{isOn ? 'ENCENDIDO' : 'APAGADO'}</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#1E90FF" }}
        thumbColor={isOn ? "#f5dd4b" : "#f4f3f4"}
        onValueChange={toggleSwitch}
        value={isOn}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 350,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#1E90FF',
  },
});

export default SetState;
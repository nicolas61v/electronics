import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';

const SLIDER_HEIGHT = 150;
const HANDLE_SIZE = 35;
const MIN_TEMP = 15;
const MAX_TEMP = 35;
const TEMP_RANGE = MAX_TEMP - MIN_TEMP;

const TempControl = () => {
  const [currentTemp, setCurrentTemp] = useState(0);
  const [tempLimit, setTempLimit] = useState(25);
  const [sliderHeight, setSliderHeight] = useState(SLIDER_HEIGHT);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [warningAnim] = useState(new Animated.Value(0));
  const translateY = useState(new Animated.Value(
    sliderHeight - ((25 - MIN_TEMP) / TEMP_RANGE) * sliderHeight
  ))[0];

  const onSliderLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    setSliderHeight(height);
    translateY.setValue(height - ((tempLimit - MIN_TEMP) / TEMP_RANGE) * height);
  }, []);

  const updateTempFromPosition = useCallback((position) => {
    const adjustedPosition = position - HANDLE_SIZE/2;
    const normalizedPosition = (adjustedPosition / (sliderHeight - HANDLE_SIZE)) * sliderHeight;
    const invertedPosition = sliderHeight - normalizedPosition;
    const temp = (invertedPosition / sliderHeight) * TEMP_RANGE + MIN_TEMP;
    return Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(temp)));
  }, [sliderHeight]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (_, gesture) => {
        const newPosition = Math.min(
          sliderHeight - HANDLE_SIZE/2,
          Math.max(HANDLE_SIZE/2, gesture.dy + translateY._offset)
        );
        translateY.setValue(newPosition - translateY._offset);
        
        const newTemp = updateTempFromPosition(newPosition);
        setTempLimit(newTemp);
      },
      onPanResponderRelease: () => {
        translateY.flattenOffset();
      }
    })
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const tempRef = ref(database, 'sensores/lecturas/inicial/dht11_temperatura');
    const unsubscribeTemp = onValue(tempRef, async (snapshot) => {
      if (snapshot.exists()) {
        const temp = snapshot.val();
        setCurrentTemp(temp);
        
        const releRef = ref(database, 'dispositivos/esp32_1/rele');
        const shouldTurnOn = temp >= tempLimit;
        
        Animated.timing(warningAnim, {
          toValue: shouldTurnOn ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        try {
          await set(releRef, shouldTurnOn);
        } catch (error) {
          console.error('Error al actualizar el relé:', error);
        }
      }
    });

  return () => unsubscribeTemp();
  }, [tempLimit]);

  const sliderColor = translateY.interpolate({
    inputRange: [0, sliderHeight / 2, sliderHeight],
    outputRange: ['#FF6B6B', '#1E90FF', '#4CAF50']
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.headerContainer}>
        <Ionicons name="thermometer-outline" size={20} color="#1E90FF" />
        <Text style={styles.title}>Control de Temperatura</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.sliderMainContainer}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderMarks}>
              <Text style={styles.markText}>{MAX_TEMP}°C</Text>
              <Text style={styles.markText}>{MIN_TEMP}°C</Text>
            </View>
            
            <View style={styles.sliderTrackContainer}>
              <View 
                style={styles.sliderTrack}
                onLayout={onSliderLayout}
              >
                <Animated.View 
                  style={[
                    styles.sliderFill,
                    {
                      height: Animated.subtract(sliderHeight, translateY),
                      backgroundColor: sliderColor,
                    }
                  ]}
                />
              </View>
              
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.sliderHandle,
                  {
                    transform: [{ translateY }],
                    backgroundColor: sliderColor,
                  }
                ]}
              >
                <Text style={styles.handleText}>{tempLimit}°C</Text>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.currentTempContainer}>
            <Text style={styles.currentTempLabel}>Actual:</Text>
            <Text style={styles.currentTempValue}>{currentTemp.toFixed(1)}°C</Text>
          </View>

          <Animated.View 
            style={[
              styles.warningContainer,
              { opacity: warningAnim }
            ]}
          >
            <Ionicons name="warning-outline" size={16} color="#FF6B6B" />
            <Text style={styles.warningText}>Límite excedido</Text>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.1)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginLeft: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: HANDLE_SIZE / 2, // Añadimos padding inferior para el handle
  },
  sliderMainContainer: {
    height: SLIDER_HEIGHT + HANDLE_SIZE, // Aumentamos la altura para acomodar el handle
    paddingVertical: HANDLE_SIZE / 2, // Añadimos padding vertical para centrar
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 50,
  },
  sliderMarks: {
    justifyContent: 'space-between',
    height: '100%',
    marginRight: 8,
  },
  markText: {
    fontSize: 12,
    color: '#555',
  },
  sliderTrackContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  sliderTrack: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    width: 8,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  sliderHandle: {
    position: 'absolute',
    left: -HANDLE_SIZE / 2 + 4,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  handleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 30,
    justifyContent: 'center',
  },
  currentTempContainer: {
    backgroundColor: '#F8FBFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  currentTempLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currentTempValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 8,
    borderRadius: 8,
  },
  warningText: {
    color: '#FF6B6B',
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '500',
  },
});

export default TempControl;
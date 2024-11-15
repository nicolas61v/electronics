#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <addons/RTDBHelper.h> // Ayudante para RTDB

// Definiciones de pines
#define LM35_PIN 36      // Pin ADC para el sensor LM35
#define DHTPIN 4         // Pin digital para DHT11
#define RELE_PIN 2       // Pin digital para el relé
#define DHTTYPE DHT11    // Tipo de sensor DHT

// Credenciales WiFi
#define WIFI_SSID "mainAzir"
#define WIFI_PASSWORD "saitamadepelos"

// Credenciales Firebase
#define DATABASE_URL "https://helpesp32-sensors-33628-default-rtdb.firebaseio.com"

// Define objetos Firebase
FirebaseData fbdo;
FirebaseConfig config;

// Define objeto DHT
DHT dht(DHTPIN, DHTTYPE);

// Variables para control de tiempo
unsigned long sendDataPrevMillis = 0;
unsigned long heartbeatPrevMillis = 0;
const long INTERVALO_ENVIO = 5000;     // Intervalo para enviar datos (5 segundos)
const long INTERVALO_HEARTBEAT = 2000;  // Intervalo para actualizar estado (2 segundos)

// Variables para almacenar lecturas
float lm35Temp = 0.0;
float dhtTemp = 0.0;
float dhtHum = 0.0;
bool releEstado = false;

void setup() {
  Serial.begin(115200);

  // Configurar pines
  pinMode(RELE_PIN, OUTPUT);
  pinMode(LM35_PIN, INPUT);
  digitalWrite(RELE_PIN, LOW);  // Inicialmente apagado

  // Iniciar DHT
  dht.begin();

  // Conectar WiFi
  conectarWiFi();

  // Configurar Firebase
  config.database_url = DATABASE_URL;
  Firebase.begin(&config, nullptr);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
  }

  // Si Firebase está listo
  if (Firebase.ready()) {
    
    // Actualizar heartbeat y estado del dispositivo
    if (millis() - heartbeatPrevMillis > INTERVALO_HEARTBEAT) {
      heartbeatPrevMillis = millis();
      actualizarEstadoDispositivo();
    }

    // Leer y enviar datos de sensores
    if (millis() - sendDataPrevMillis > INTERVALO_ENVIO) {
      sendDataPrevMillis = millis();
      leerSensores();
      enviarDatosFirebase();
    }

    // Verificar estado del relé
    verificarRele();
  }
}

void conectarWiFi() {
  Serial.println("Conectando a WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConectado a WiFi");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFallo al conectar WiFi");
  }
}

void leerSensores() {
  // Leer LM35
  int rawValue = analogRead(LM35_PIN);
  lm35Temp = (rawValue * 3.3 / 4095.0) * 100.0;  // Convertir a temperatura

  // Leer DHT11
  dhtHum = dht.readHumidity();
  dhtTemp = dht.readTemperature();

  // Verificar lecturas DHT
  if (isnan(dhtHum) || isnan(dhtTemp)) {
    Serial.println("Error leyendo DHT11");
    dhtHum = -1;
    dhtTemp = -1;
  }

  // Imprimir lecturas en Serial
  Serial.printf("LM35: %.2f°C, DHT11: %.2f°C, %.2f%%\n", lm35Temp, dhtTemp, dhtHum);
}

void enviarDatosFirebase() {
  // Crear JSON con los datos
  FirebaseJson json;
  String timestamp = String(millis());

  json.set("lm35_temperatura", lm35Temp);
  json.set("dht11_temperatura", dhtTemp);
  json.set("dht11_humedad", dhtHum);
  json.set("timestamp", timestamp);

  // Enviar a Firebase
  String path = "/sensores/lecturas/" + timestamp;
  
  if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
    Serial.println("Datos enviados correctamente");
  } else {
    Serial.println("Error enviando datos");
    Serial.println(fbdo.errorReason());
  }
}

void actualizarEstadoDispositivo() {
  String estadoPath = "/dispositivos/esp32_1/estado";
  String tiempoPath = "/dispositivos/esp32_1/ultima_conexion";
  
  if (Firebase.RTDB.setString(&fbdo, estadoPath, "online") &&
      Firebase.RTDB.setString(&fbdo, tiempoPath, String(millis()))) {
    Serial.println("Estado actualizado");
  } else {
    Serial.println("Error actualizando estado");
  }
}

void verificarRele() {
  if (Firebase.RTDB.getBool(&fbdo, "/dispositivos/esp32_1/rele")) {
    bool nuevoEstado = fbdo.boolData();
    if (nuevoEstado != releEstado) {
      releEstado = nuevoEstado;
      digitalWrite(RELE_PIN, releEstado);
      Serial.printf("Estado del relé cambiado a: %s\n", releEstado ? "ON" : "OFF");
    }
  }
}

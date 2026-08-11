#include <OneWire.h>
#include <DallasTemperature.h>

namespace {

constexpr uint8_t DOOR_PIN = 8;
constexpr uint8_t TEMPERATURE_PIN = 4;

constexpr unsigned long DOOR_DEBOUNCE_MS = 150;
constexpr unsigned long TEMPERATURE_INTERVAL_MS = 5000;
constexpr unsigned long TEMPERATURE_CONVERSION_MS = 750;


// ================================
// TEMPERATURA
// ================================

OneWire oneWire(TEMPERATURE_PIN);
DallasTemperature temperatureSensor(&oneWire);


// ================================
// PUERTA
// ================================

int closedElectricalLevel = LOW;
int stableDoorLevel = LOW;
int candidateDoorLevel = LOW;

unsigned long candidateSince = 0;


// ================================
// TEMPERATURA - CONTROL
// ================================

bool temperatureConversionPending = false;

unsigned long conversionStartedAt = 0;
unsigned long lastTemperatureRequestAt = 0;


// ================================
// CALIBRAR PUERTA CERRADA
// ================================

int calibrateClosedDoor() {

  int highCount = 0;
  int lowCount = 0;

  // Mantener la puerta CERRADA durante el arranque
  for (int i = 0; i < 30; i++) {

    int value = digitalRead(DOOR_PIN);

    if (value == HIGH) {
      highCount++;
    } else {
      lowCount++;
    }

    delay(10);
  }

  return (highCount > lowCount) ? HIGH : LOW;
}


// ================================
// ACTUALIZAR PUERTA
// ================================

void updateDoor(unsigned long now) {

  int currentLevel = digitalRead(DOOR_PIN);


  // Apareció un posible cambio
  if (currentLevel != candidateDoorLevel) {

    candidateDoorLevel = currentLevel;
    candidateSince = now;

    return;
  }


  // Ya estamos en ese estado
  if (candidateDoorLevel == stableDoorLevel) {
    return;
  }


  // Esperamos que permanezca estable 150 ms
  if (now - candidateSince < DOOR_DEBOUNCE_MS) {
    return;
  }


  // Cambio confirmado
  stableDoorLevel = candidateDoorLevel;


  if (stableDoorLevel == closedElectricalLevel) {

    Serial.println("DOOR_CLOSED");

  } else {

    Serial.println("DOOR_OPEN");
  }
}


// ================================
// ACTUALIZAR TEMPERATURA
// ================================

void updateTemperature(unsigned long now) {

  if (
    !temperatureConversionPending &&
    now - lastTemperatureRequestAt >= TEMPERATURE_INTERVAL_MS
  ) {

    temperatureSensor.requestTemperatures();

    temperatureConversionPending = true;

    conversionStartedAt = now;
    lastTemperatureRequestAt = now;
  }


  if (
    !temperatureConversionPending ||
    now - conversionStartedAt < TEMPERATURE_CONVERSION_MS
  ) {
    return;
  }


  temperatureConversionPending = false;

  float temperatureC =
    temperatureSensor.getTempCByIndex(0);


  if (
    temperatureC != DEVICE_DISCONNECTED_C &&
    temperatureC >= -55.0 &&
    temperatureC <= 125.0
  ) {

    Serial.print("TEMP:");
    Serial.println(temperatureC, 2);
  }
}

}


// ================================
// SETUP
// ================================

void setup() {

  Serial.begin(115200);

  // IMPORTANTE:
  // KY-025 usa su propia salida digital.
  pinMode(DOOR_PIN, INPUT);


  temperatureSensor.begin();

  temperatureSensor.setWaitForConversion(false);


  delay(500);


  // Debe arrancar con la puerta cerrada
  closedElectricalLevel = calibrateClosedDoor();

  stableDoorLevel = closedElectricalLevel;
  candidateDoorLevel = closedElectricalLevel;

  candidateSince = millis();


  lastTemperatureRequestAt =
    millis() - TEMPERATURE_INTERVAL_MS;


  Serial.println("READY");

  Serial.println("DOOR_CLOSED");
}


// ================================
// LOOP
// ================================

void loop() {

  unsigned long now = millis();

  updateDoor(now);

  updateTemperature(now);
}
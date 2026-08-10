#include <OneWire.h>
#include <DallasTemperature.h>

namespace {
constexpr uint8_t DOOR_PIN = 8;
constexpr uint8_t TEMPERATURE_PIN = 4;
constexpr unsigned long DOOR_DEBOUNCE_MS = 150;
constexpr unsigned long TEMPERATURE_INTERVAL_MS = 5000;
constexpr unsigned long TEMPERATURE_CONVERSION_MS = 750;

OneWire oneWire(TEMPERATURE_PIN);
DallasTemperature temperatureSensor(&oneWire);
int closedElectricalLevel = LOW;
int stableDoorLevel = LOW;
int candidateDoorLevel = LOW;
unsigned long candidateSince = 0;
bool temperatureConversionPending = false;
unsigned long conversionStartedAt = 0;
unsigned long lastTemperatureRequestAt = 0;

void updateDoor(unsigned long now) {
  const int currentLevel = digitalRead(DOOR_PIN);
  if (currentLevel != candidateDoorLevel) {
    candidateDoorLevel = currentLevel;
    candidateSince = now;
    return;
  }
  if (candidateDoorLevel == stableDoorLevel || now - candidateSince < DOOR_DEBOUNCE_MS) return;

  stableDoorLevel = candidateDoorLevel;
  Serial.println(stableDoorLevel == closedElectricalLevel ? "DOOR_CLOSED" : "DOOR_OPEN");
}

void updateTemperature(unsigned long now) {
  if (!temperatureConversionPending && now - lastTemperatureRequestAt >= TEMPERATURE_INTERVAL_MS) {
    temperatureSensor.requestTemperatures();
    temperatureConversionPending = true;
    conversionStartedAt = now;
    lastTemperatureRequestAt = now;
  }
  if (!temperatureConversionPending || now - conversionStartedAt < TEMPERATURE_CONVERSION_MS) return;

  temperatureConversionPending = false;
  const float temperatureC = temperatureSensor.getTempCByIndex(0);
  if (temperatureC != DEVICE_DISCONNECTED_C && temperatureC >= -55.0f && temperatureC <= 125.0f) {
    Serial.print("TEMP:");
    Serial.println(temperatureC, 2);
  }
}
}  // namespace

void setup() {
  Serial.begin(115200);
  pinMode(DOOR_PIN, INPUT);
  temperatureSensor.begin();
  temperatureSensor.setWaitForConversion(false);

  delay(50);
  closedElectricalLevel = digitalRead(DOOR_PIN);
  stableDoorLevel = closedElectricalLevel;
  candidateDoorLevel = closedElectricalLevel;
  candidateSince = millis();
  lastTemperatureRequestAt = millis() - TEMPERATURE_INTERVAL_MS;
  Serial.println("READY");
}

void loop() {
  const unsigned long now = millis();
  updateDoor(now);
  updateTemperature(now);
}

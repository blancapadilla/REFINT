"""Receive and dispatch the ESP32 serial protocol used by REFINT."""

from __future__ import annotations

import argparse
import os
import time
from collections.abc import Callable

import serial
from serial import SerialException

from .door_state_machine import DoorStateMachine

DoorCallback = Callable[[], None]
TemperatureCallback = Callable[[float], None]
ReadyCallback = Callable[[], None]


class SerialListener:
    """Reconnectable listener for READY, door, and temperature messages."""

    def __init__(self, port: str = "COM5", baudrate: int = 115200,
                 reconnect_delay: float = 2.0,
                 on_ready: ReadyCallback | None = None,
                 on_door_open: DoorCallback | None = None,
                 on_door_closed: DoorCallback | None = None,
                 on_temperature: TemperatureCallback | None = None) -> None:
        self.port = port
        self.baudrate = baudrate
        self.reconnect_delay = reconnect_delay
        self.on_ready = on_ready
        self.on_door_open = on_door_open
        self.on_door_closed = on_door_closed
        self.on_temperature = on_temperature
        self._running = False

    def stop(self) -> None:
        self._running = False

    def handle_message(self, message: str) -> bool:
        """Dispatch one protocol line; return False for an invalid line."""
        message = message.strip()
        callbacks = {
            "READY": self.on_ready,
            "DOOR_OPEN": self.on_door_open,
            "DOOR_CLOSED": self.on_door_closed,
        }
        if message in callbacks:
            callback = callbacks[message]
            if callback:
                callback()
            return True
        if message.startswith("TEMP:"):
            try:
                temperature = float(message.removeprefix("TEMP:"))
            except ValueError:
                return False
            if self.on_temperature:
                self.on_temperature(temperature)
            return True
        return False

    def listen_forever(self) -> None:
        """Listen until stop() or Ctrl+C, reconnecting after serial errors."""
        self._running = True
        while self._running:
            try:
                with serial.Serial(self.port, self.baudrate, timeout=1) as connection:
                    while self._running:
                        raw_line = connection.readline()
                        if raw_line:
                            self.handle_message(raw_line.decode("utf-8", errors="replace"))
            except SerialException as error:
                print(f"[SERIAL] {error}")
                if self._running:
                    time.sleep(self.reconnect_delay)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the REFINT hardware listener")
    parser.add_argument("--port", default="COM5", help="ESP32 COM port")
    parser.add_argument("--baudrate", type=int, default=115200)
    parser.add_argument("--camera-index", type=int, default=0)
    parser.add_argument("--capture-delay", type=float, default=1.5)
    parser.add_argument(
        "--refrigerator-id",
        default=os.getenv("REFRIGERATOR_ID", "595494f8-76ea-418f-af92-d16ca17d2613"),
    )
    args = parser.parse_args()

    from .cloud_bridge import CloudBridge

    cloud = CloudBridge(args.refrigerator_id)

    def capture_after_valid_close() -> None:
        print("SCAN_REQUESTED")
        time.sleep(max(0.0, args.capture_delay))
        try:
            from iA.main import run_scan

            scan = run_scan(
                refrigerator_id=args.refrigerator_id,
                camera_index=args.camera_index,
            )
        except Exception as error:
            print(f"[SCAN] Error: {error}")
            return
        print(f'SCAN_COMPLETED:{scan["id"]}')

    def save_temperature(value: float) -> None:
        print(f"TEMP:{value:.2f}")
        try:
            cloud.save_temperature(value)
        except Exception as error:
            print(f"[SUPABASE] No se guardó la temperatura: {error}")

    state_machine = DoorStateMachine(
        on_scan_requested=capture_after_valid_close,
        cooldown_seconds=5.0,
    )
    listener = SerialListener(
        port=args.port,
        baudrate=args.baudrate,
        on_ready=lambda: print("READY"),
        on_door_open=lambda: (
            print("DOOR_OPEN"),
            state_machine.door_opened(),
        ),
        on_door_closed=lambda: (
            print("DOOR_CLOSED"),
            state_machine.door_closed(),
        ),
        on_temperature=save_temperature,
    )
    try:
        listener._running = True
        while listener._running:
            try:
                with serial.Serial(listener.port, listener.baudrate, timeout=1) as connection:
                    while listener._running:
                        raw_line = connection.readline()
                        if raw_line:
                            listener.handle_message(raw_line.decode("utf-8", errors="replace"))
                        try:
                            cloud.process_next_scan_command(args.camera_index)
                        except Exception as error:
                            print(f"[SUPABASE] No se pudo consultar órdenes: {error}")
            except SerialException as error:
                print(f"[SERIAL] {error}")
                time.sleep(listener.reconnect_delay)
    except KeyboardInterrupt:
        listener.stop()
        print("\nListener detenido.")


if __name__ == "__main__":
    main()

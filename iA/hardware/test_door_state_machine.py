"""Tests for the REFINT door-cycle state machine."""

import unittest

from iA.hardware.door_state_machine import DoorState, DoorStateMachine


class DoorStateMachineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.now = 100.0
        self.scan_count = 0
        self.machine = DoorStateMachine(
            on_scan_requested=self._record_scan,
            cooldown_seconds=5.0,
            clock=lambda: self.now,
        )

    def _record_scan(self) -> None:
        self.scan_count += 1

    def test_close_without_open_does_not_scan(self) -> None:
        self.assertFalse(self.machine.door_closed())
        self.assertEqual(self.scan_count, 0)

    def test_open_close_requests_exactly_one_scan(self) -> None:
        self.assertTrue(self.machine.door_opened())
        self.assertTrue(self.machine.door_closed())
        self.assertFalse(self.machine.door_closed())
        self.assertEqual(self.scan_count, 1)
        self.assertIs(self.machine.state, DoorState.CLOSED)

    def test_duplicate_open_is_ignored(self) -> None:
        self.assertTrue(self.machine.door_opened())
        self.assertFalse(self.machine.door_opened())
        self.assertTrue(self.machine.door_closed())
        self.assertEqual(self.scan_count, 1)

    def test_second_cycle_inside_cooldown_does_not_scan(self) -> None:
        self.machine.door_opened()
        self.machine.door_closed()
        self.now += 2.0
        self.machine.door_opened()
        self.assertFalse(self.machine.door_closed())
        self.assertEqual(self.scan_count, 1)

    def test_second_cycle_after_cooldown_scans(self) -> None:
        self.machine.door_opened()
        self.machine.door_closed()
        self.now += 5.0
        self.machine.door_opened()
        self.assertTrue(self.machine.door_closed())
        self.assertEqual(self.scan_count, 2)


if __name__ == "__main__":
    unittest.main()

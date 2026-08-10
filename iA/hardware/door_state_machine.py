"""Door-cycle state machine for REFINT."""

from __future__ import annotations

import time
from collections.abc import Callable
from enum import Enum, auto


class DoorState(Enum):
    CLOSED = auto()
    OPEN = auto()
    SCAN = auto()


class DoorStateMachine:
    """Allow one scan request for each real open-to-close cycle."""

    def __init__(
        self,
        on_scan_requested: Callable[[], None],
        cooldown_seconds: float = 5.0,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.state = DoorState.CLOSED
        self.cooldown_seconds = cooldown_seconds
        self.on_scan_requested = on_scan_requested
        self._clock = clock
        self._last_scan_at: float | None = None

    def door_opened(self) -> bool:
        """Record an opening; return True only for a state transition."""
        if self.state is not DoorState.CLOSED:
            return False
        self.state = DoorState.OPEN
        return True

    def door_closed(self) -> bool:
        """Request a scan only after an opening and outside the cooldown."""
        if self.state is not DoorState.OPEN:
            return False

        now = self._clock()
        self.state = DoorState.CLOSED
        if (
            self._last_scan_at is not None
            and now - self._last_scan_at < self.cooldown_seconds
        ):
            return False

        self.state = DoorState.SCAN
        self._last_scan_at = now
        try:
            self.on_scan_requested()
        finally:
            self.state = DoorState.CLOSED
        return True

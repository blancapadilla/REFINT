"""Supabase bridge for physical sensor data and frontend scan commands."""

from __future__ import annotations

import time
from datetime import datetime, timezone

from iA.services.supabase_service import supabase


class CloudBridge:
    def __init__(self, refrigerator_id: str, poll_interval: float = 2.0) -> None:
        self.refrigerator_id = refrigerator_id
        self.poll_interval = poll_interval
        self._last_poll = 0.0

    def save_temperature(self, temperature_c: float) -> None:
        supabase.table("temperature_readings").insert({
            "refrigerator_id": self.refrigerator_id,
            "temperature_c": temperature_c,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        print(f"TEMPERATURE_SAVED:{temperature_c:.2f}")

    def process_next_scan_command(self, camera_index: int = 0) -> bool:
        now = time.monotonic()
        if now - self._last_poll < self.poll_interval:
            return False
        self._last_poll = now

        response = (
            supabase.table("hardware_commands")
            .select("id,refrigerator_id,status")
            .eq("refrigerator_id", self.refrigerator_id)
            .eq("command", "scan")
            .eq("status", "pending")
            .order("created_at")
            .limit(1)
            .execute()
        )
        if not response.data:
            return False

        command_id = response.data[0]["id"]
        supabase.table("hardware_commands").update({
            "status": "processing",
            "started_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", command_id).eq("status", "pending").execute()

        try:
            from iA.main import run_scan

            scan = run_scan(
                refrigerator_id=self.refrigerator_id,
                camera_index=camera_index,
            )
            supabase.table("hardware_commands").update({
                "status": "completed",
                "scan_id": scan["id"],
                "finished_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", command_id).execute()
        except Exception as error:
            supabase.table("hardware_commands").update({
                "status": "failed",
                "error_message": str(error),
                "finished_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", command_id).execute()
            print(f"[SCAN] {error}")
        return True

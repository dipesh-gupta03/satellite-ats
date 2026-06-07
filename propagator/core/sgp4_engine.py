"""
SGP4/SDP4 orbit propagator.
Given a TLE pair, returns ECI position & velocity at a given UTC datetime.
"""
from sgp4.api import Satrec, jday
from datetime import datetime, timezone


def propagate(tle_line1: str, tle_line2: str, dt: datetime) -> dict:
    """Propagate a satellite to the given UTC datetime."""
    sat = Satrec.twoline2rv(tle_line1, tle_line2)
    jd, fr = jday(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second + dt.microsecond / 1e6)
    e, r, v = sat.sgp4(jd, fr)
    if e != 0:
        raise ValueError(f"SGP4 propagation error code {e}")
    return {
        "position_eci_km": list(r),   # [x, y, z] km
        "velocity_eci_kms": list(v),  # [vx, vy, vz] km/s
        "epoch_utc": dt.isoformat(),
    }


def propagate_batch(tle_line1: str, tle_line2: str, datetimes: list[datetime]) -> list[dict]:
    """Propagate over a list of datetimes (for orbit path rendering)."""
    return [propagate(tle_line1, tle_line2, dt) for dt in datetimes]

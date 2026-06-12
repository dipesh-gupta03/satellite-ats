import math
from datetime import datetime, timezone

def eci_to_geodetic(position_eci: list, epoch_utc: datetime) -> dict:
    x, y, z = position_eci

    # Greenwich Sidereal Time (GST) — accounts for Earth's rotation
    J2000 = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    t = (epoch_utc.replace(tzinfo=timezone.utc) - J2000).total_seconds() / 86400.0
    gst_deg = (280.46061837 + 360.98564736629 * t) % 360
    gst_rad = math.radians(gst_deg)

    # ECI → ECEF
    cos_g, sin_g = math.cos(gst_rad), math.sin(gst_rad)
    x_ecef =  x * cos_g + y * sin_g
    y_ecef = -x * sin_g + y * cos_g
    z_ecef = z

    # ECEF → lat/lon/alt
    a = 6378.137        # Earth equatorial radius km
    e2 = 0.00669437999014

    lon = math.degrees(math.atan2(y_ecef, x_ecef))
    p = math.sqrt(x_ecef**2 + y_ecef**2)

    lat = math.degrees(math.atan2(z_ecef, p * (1 - e2)))
    for _ in range(5):
        sin_lat = math.sin(math.radians(lat))
        N = a / math.sqrt(1 - e2 * sin_lat**2)
        lat = math.degrees(math.atan2(z_ecef + e2 * N * sin_lat, p))

    sin_lat = math.sin(math.radians(lat))
    N = a / math.sqrt(1 - e2 * sin_lat**2)
    alt = p / math.cos(math.radians(lat)) - N

    return {"lat": round(lat, 4), "lon": round(lon, 4), "alt_km": round(alt, 2)}
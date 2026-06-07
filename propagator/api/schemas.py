from pydantic import BaseModel
from datetime import datetime


class PropagateRequest(BaseModel):
    tle_line1: str
    tle_line2: str
    epoch_utc: datetime


class ConjunctionRequest(BaseModel):
    tle1_line1: str
    tle1_line2: str
    tle2_line1: str
    tle2_line2: str
    start_utc: datetime
    duration_hours: float = 24.0
    step_seconds: float = 60.0


class CoverageRequest(BaseModel):
    tle_line1: str
    tle_line2: str
    station_lat: float
    station_lon: float
    station_alt_m: float
    start_utc: datetime
    duration_hours: float = 24.0
    elevation_mask_deg: float = 5.0

from fastapi import APIRouter
from api.schemas import PropagateRequest, ConjunctionRequest, CoverageRequest
from core.sgp4_engine import propagate
from core.conjunction import check_conjunction
from core.coverage import predict_passes
from core.transforms import eci_to_geodetic

router = APIRouter()

@router.post("/propagate")
def propagate_satellite(req: PropagateRequest):
    result = propagate(req.tle_line1, req.tle_line2, req.epoch_utc)
    result["geodetic"] = eci_to_geodetic(result["position_eci_km"], req.epoch_utc)
    return result

@router.post("/conjunction")
def conjunction_check(req: ConjunctionRequest):
    return check_conjunction(req)

@router.post("/coverage")
def ground_coverage(req: CoverageRequest):
    return predict_passes(req)
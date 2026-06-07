from fastapi import APIRouter
from api.schemas import PropagateRequest, ConjunctionRequest, CoverageRequest
from core.sgp4_engine import propagate
from core.conjunction import check_conjunction
from core.coverage import predict_passes

router = APIRouter()


@router.post("/propagate")
def propagate_satellite(req: PropagateRequest):
    return propagate(req.tle_line1, req.tle_line2, req.epoch_utc)


@router.post("/conjunction")
def conjunction_check(req: ConjunctionRequest):
    return check_conjunction(req)


@router.post("/coverage")
def ground_coverage(req: CoverageRequest):
    return predict_passes(req)

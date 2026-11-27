from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AtendimentoCreate(BaseModel):
    consulta_id: int
    diagnostico: str
    observacoes: str | None = None
    procedimentos: str | None = None


class AtendimentoOut(AtendimentoCreate):
    id: int
    registrado_em: datetime
    model_config = ConfigDict(from_attributes=True)
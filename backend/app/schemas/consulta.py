from datetime import date, time
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

StatusConsulta = Literal["aguardando", "confirmada", "em_atendimento", "concluida", "cancelada"]


class ConsultaCreate(BaseModel):
    animal_id: int
    tutor_id: int
    veterinario_id: int
    data: date
    hora_inicio: time
    duracao_min: int = Field(default=30, ge=15, le=240)
    tipo: str = "Consulta"
    observacoes: str | None = None


class ConsultaCancelar(BaseModel):
    motivo: str | None = None


class ConsultaOut(BaseModel):
    id: int
    animal_id: int
    animal_nome: str
    tutor_id: int
    tutor_nome: str
    veterinario_id: int
    data: date
    hora_inicio: time
    duracao_min: int
    tipo: str
    observacoes: str | None = None
    status: StatusConsulta
    motivo_cancelamento: str | None = None
    model_config = ConfigDict(from_attributes=True)

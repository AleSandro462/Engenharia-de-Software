from datetime import date, time
from pydantic import BaseModel


class AnimalBusca(BaseModel):
    id: int
    nome: str
    especie: str
    raca: str | None = None
    tutor_nome: str


class RegistroProntuario(BaseModel):
    atendimento_id: int
    data: date
    hora: time
    tipo: str
    veterinario_nome: str
    diagnostico: str
    observacoes: str | None = None
    procedimentos: str | None = None


class ProntuarioOut(BaseModel):
    animal: AnimalBusca
    atendimentos: list[RegistroProntuario]
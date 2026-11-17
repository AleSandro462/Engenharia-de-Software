import re
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class VeterinarioCreate(BaseModel):
    nome: str
    crmv: str
    telefone: str
    email: EmailStr
    especialidade: Optional[str] = None

    @field_validator("crmv")
    @classmethod
    def validar_crmv(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.match(r"^([A-Z]{2}-)?\d{4,6}$", v):
            raise ValueError("CRMV inválido")
        return v

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, v: str) -> str:
        apenas_numeros = re.sub(r"\D", "", v)
        if len(apenas_numeros) not in (10, 11):
            raise ValueError("Telefone inválido: informe DDD + número")
        return v.strip()

class VeterinarioResponse(BaseModel):
    id: int
    nome: str
    crmv: str
    telefone: str
    email: str
    especialidade: Optional[str] = None

    class Config:
        from_attributes = True
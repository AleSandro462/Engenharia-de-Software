from pydantic import BaseModel, EmailStr
from typing import Optional

class VeterinarioCreate(BaseModel):
    nome: str
    crmv: str
    telefone: str 
    email: EmailStr
    especialidade: Optional[str] = None

class VeterinarioResponse(BaseModel):
    id: int 
    nome: str
    crmv: str
    telefone: str
    email: str
    especialidade: Optional[str] = None

    class Config:
        from_attributes = True
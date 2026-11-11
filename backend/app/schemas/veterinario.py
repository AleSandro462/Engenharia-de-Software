from pydantic import BaseModel, EmailStr
from typing import Optional

class VeterinarioCreate(BaseModel):
    nome: str
    crmv: str
    telefone: str 
    email: EmailStr
    especialidade: Optional[str] = None
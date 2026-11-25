from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Literal

Perfilcadastro = Literal["recepcionista", "veterinario"]


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=6, max_length=72)
    perfil: Perfilcadastro


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    perfil: str
    model_config = ConfigDict(from_attributes=True)

class RecuperarSenhaIn(BaseModel):
    email: EmailStr


class RedefinirSenhaIn(BaseModel):
    token: str
    nova_senha: str = Field(min_length=6, max_length=72)
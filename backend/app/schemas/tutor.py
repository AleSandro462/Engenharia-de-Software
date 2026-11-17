from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr


class AnimalBase(BaseModel):
    nome: str
    especie: str
    raca: str | None = None
    sexo: Literal["M", "F"]
    data_nascimento: date | None = None


class AnimalCreate(AnimalBase):
    pass


class AnimalUpdate(BaseModel):
    nome: str | None = None
    especie: str | None = None
    raca: str | None = None
    sexo: Literal["M", "F"] | None = None
    data_nascimento: date | None = None


class AnimalOut(AnimalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class TutorBase(BaseModel):
    nome: str
    cpf: str
    telefone: str
    email: EmailStr | None = None
    endereco: str | None = None


class TutorCreate(TutorBase):
    animais: list[AnimalCreate] = []


class TutorUpdate(BaseModel):
    nome: str | None = None
    cpf: str | None = None
    telefone: str | None = None
    email: EmailStr | None = None
    endereco: str | None = None


class TutorOut(TutorBase):
    id: int
    animais: list[AnimalOut] = []
    model_config = ConfigDict(from_attributes=True)
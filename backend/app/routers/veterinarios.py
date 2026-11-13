from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db # Puxa a função que conecta no banco
from ..models import Veterinario # Puxa a sua tabela
from ..schemas.veterinario import VeterinarioCreate, VeterinarioResponse # Puxa as suas validações

# Cria o "grupo" de URLs para veterinários
router = APIRouter(
    prefix="/veterinarios",
    tags=["Veterinários"]
)
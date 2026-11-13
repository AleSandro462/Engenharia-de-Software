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

@router.post("/", response_model=VeterinarioResponse)
def criar_veterinario(vet: VeterinarioCreate, db: Session = Depends(get_db)):
    db_vet = db.query(Veterinario).filter(Veterinario.crmv == vet.crmv).first()
    if db_vet:
        raise HTTPException(status_code=400, detail="CRMV já cadastrado.")

    novo_vet = Veterinario(**vet.model_dump()) 
    
    db.add(novo_vet)
    db.commit()
    db.refresh(novo_vet) 
    return novo_vet

@router.get("/", response_model=list[VeterinarioResponse])
def listar_veterinarios(db: Session = Depends(get_db)):
    veterinarios = db.query(Veterinario).all()
    return veterinarios
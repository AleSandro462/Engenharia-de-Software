from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db # Puxa a função que conecta no banco
from ..models import Veterinario # Puxa a sua tabela
from ..schemas.veterinario import VeterinarioCreate, VeterinarioResponse # Puxa as suas validações


router = APIRouter(
    prefix="/veterinarios",
    tags=["Veterinários"]
)


@router.post("/", response_model=VeterinarioResponse)
def criar_veterinario(vet: VeterinarioCreate, db: Session = Depends(get_db)):
    if db.query(Veterinario).filter(Veterinario.crmv == vet.crmv).first():
        raise HTTPException(status_code=400, detail="CRMV já cadastrado.")
    if db.query(Veterinario).filter(Veterinario.email == vet.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    novo_vet = Veterinario(**vet.model_dump())
    db.add(novo_vet)
    db.commit()
    db.refresh(novo_vet)
    return novo_vet


@router.get("/", response_model=list[VeterinarioResponse])
def listar_veterinarios(db: Session = Depends(get_db)):
    veterinarios = db.query(Veterinario).all()
    return veterinarios


@router.put("/{vet_id}", response_model=VeterinarioResponse)
def atualizar_veterinario(vet_id: int, vet_atualizado: VeterinarioCreate, db: Session = Depends(get_db)):
    db_vet = db.query(Veterinario).filter(Veterinario.id == vet_id).first()
    if not db_vet:
        raise HTTPException(status_code=404, detail="Veterinário não encontrado.")

    for key, value in vet_atualizado.model_dump().items():
        setattr(db_vet, key, value)

    db.commit()
    db.refresh(db_vet)
    return db_vet


@router.delete("/{vet_id}")
def deletar_veterinario(vet_id: int, db: Session = Depends(get_db)):
    db_vet = db.query(Veterinario).filter(Veterinario.id == vet_id).first()
    if not db_vet:
        raise HTTPException(status_code=404, detail="Veterinário não encontrado.")

    db.delete(db_vet)
    db.commit()
    return {"mensagem": "Veterinário deletado."}
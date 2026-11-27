from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas.atendimento import AtendimentoCreate, AtendimentoOut

router = APIRouter(prefix="/atendimentos", tags=["Atendimentos"])


@router.post("/", response_model=AtendimentoOut, status_code=status.HTTP_201_CREATED)
def registrar_atendimento(dados: AtendimentoCreate, db: Session = Depends(get_db)):
    consulta = db.get(models.Consulta, dados.consulta_id)
    if not consulta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Consulta não encontrada")

    ja_existe = db.query(models.Atendimento).filter_by(consulta_id=dados.consulta_id).first()
    if ja_existe:
        if consulta.status != "concluida":
            consulta.status = "concluida"
            db.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Esta consulta já tem atendimento registrado")

    atendimento = models.Atendimento(**dados.model_dump())
    consulta.status = "concluida"
    db.add(atendimento)
    db.commit()
    db.refresh(atendimento)
    return atendimento
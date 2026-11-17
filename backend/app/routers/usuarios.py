import hashlib
import hmac
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioResponse

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def gerar_hash(senha: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt.encode(), 200_000)
    return f"{salt}${h.hex()}"


def conferir_senha(senha: str, armazenado: str) -> bool:
    salt, hash_salvo = armazenado.split("$")
    h = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt.encode(), 200_000)
    return hmac.compare_digest(h.hex(), hash_salvo)


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def cadastrar(dados: UsuarioCreate, db: Session = Depends(get_db)):
    email = dados.email.strip().lower()
    if db.query(models.Usuario).filter(func.lower(models.Usuario.email) == email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "E-mail já cadastrado")

    vet_cadastrado = (
        db.query(models.Veterinario)
        .filter(func.lower(models.Veterinario.email) == email)
        .first()
    )

    novo_usuario = {
        "nome": dados.nome,
        "email": email,
        "senha_hash": gerar_hash(dados.senha),
    }
    if vet_cadastrado:
        novo_usuario["perfil"] = "veterinario"

    usuario = models.Usuario(**novo_usuario)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=UsuarioResponse)
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    email = dados.email.strip().lower()
    usuario = db.query(models.Usuario).filter(func.lower(models.Usuario.email) == email).first()
    if not usuario or not conferir_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail ou senha incorretos")
    return usuario
import hashlib
import hmac
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app import models
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioResponse, RecuperarSenhaIn, RedefinirSenhaIn

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

    usuario = models.Usuario(
        nome=dados.nome,
        email=email,
        senha_hash=gerar_hash(dados.senha),
        perfil=dados.perfil,
    )
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


def agora():
    return datetime.now(timezone.utc).replace(tzinfo=None)


@router.post("/recuperar-senha")
def recuperar_senha(dados: RecuperarSenhaIn, db: Session = Depends(get_db)):
    email = dados.email.strip().lower()
    usuario = db.query(models.Usuario).filter(func.lower(models.Usuario.email) == email).first()

    if usuario:
        token = secrets.token_urlsafe(32)
        db.add(models.RecuperacaoSenha(
            usuario_id=usuario.id,
            token_hash=hashlib.sha256(token.encode()).hexdigest(),
            expira_em=agora() + timedelta(minutes=30),
        ))
        db.commit()
        # SIMULAÇÃO DE E-MAIL: o link aparece no terminal do backend
        print(f"\n[RECUPERAÇÃO DE SENHA] {usuario.email}: http://localhost:4200/redefinir-senha?token={token}\n")

    return {"mensagem": "Se o e-mail estiver cadastrado, enviamos as instruções de recuperação."}


@router.post("/redefinir-senha")
def redefinir_senha(dados: RedefinirSenhaIn, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(dados.token.encode()).hexdigest()
    pedido = db.query(models.RecuperacaoSenha).filter_by(token_hash=token_hash, usado=False).first()

    if not pedido or pedido.expira_em < agora():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Link inválido ou expirado")

    usuario = db.get(models.Usuario, pedido.usuario_id)
    usuario.senha_hash = gerar_hash(dados.nova_senha)
    pedido.usado = True
    db.commit()

    return {"mensagem": "Senha alterada com sucesso."}
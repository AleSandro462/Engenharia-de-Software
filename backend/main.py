from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app import models
from app.routers import consultas, tutores, usuarios, veterinarios
from app.routers.usuarios import gerar_hash

Base.metadata.create_all(bind=engine)
ADMIN_EMAIL = "admin@vetcare.com"
ADMIN_SENHA = "321321"


def criar_admin():
    db = SessionLocal()
    try:
        existe = db.query(models.Usuario).filter_by(perfil="administrador").first()
        if not existe:
            db.add(models.Usuario(
                nome="Administrador",
                email=ADMIN_EMAIL,
                senha_hash=gerar_hash(ADMIN_SENHA),
                perfil="administrador",
            ))
            db.commit()
    finally:
        db.close()


criar_admin()

app = FastAPI(title="Vetcare - API")

# Libera o acesso para o Angular
origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutores.router)
app.include_router(usuarios.router)
app.include_router(consultas.router)
app.include_router(veterinarios.router)


@app.get("/")
def home():
    return {"mensagem": "Vetcare API no ar"}
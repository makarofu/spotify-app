import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import RedirectResponse
import spotipy
from fastapi.middleware.cors import CORSMiddleware
from spotipy.oauth2 import SpotifyOAuth

app = FastAPI()

# Configuração CORS
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações do Spotify a partir de variáveis de ambiente
CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI")

# Escopo de permissões que vamos solicitar ao usuário
SCOPE = "user-read-private user-read-email user-top-read playlist-read-private user-library-read"

# Objeto de autenticação do Spotipy
sp_oauth = SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=REDIRECT_URI, scope=SCOPE)

@app.get("/")
def read_root():
    return {"message": "Spotify App Backend"}

@app.get("/login")
def login():
    """Redireciona o usuário para a página de autorização do Spotify."""
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get("/callback")
def callback(code: str):
    """Endpoint que o Spotify chama após a autorização. Troca o código por um token de acesso."""
    token_info = sp_oauth.get_access_token(code)
    access_token = token_info["access_token"]
    # Redireciona o usuário para o dashboard do frontend, passando o token como parâmetro
    # O frontend irá extrair este token da URL para fazer chamadas à API.
    return RedirectResponse(f"http://localhost:3000/dashboard?access_token={access_token}")

@app.get("/me")
def get_current_user(authorization: str = Header(None)):
    """Obtém informações do usuário atualmente autenticado usando o token de acesso."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    
    token = authorization.split(" ")[1]
    
    try:
        sp = spotipy.Spotify(auth=token)
        user_info = sp.current_user()
        return user_info
    except spotipy.exceptions.SpotifyException as e:
        # Se o token for inválido ou expirado, o Spotipy levantará uma exceção
        raise HTTPException(status_code=e.http_status, detail=str(e))

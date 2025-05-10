from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# Permitir CORS (React + FastAPI comunicação)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para dev, use "*" ou especifique seu frontend depois
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimuladorInput(BaseModel):
    valor_inicial: float
    aporte_mensal: float
    taxa_juros_mensal: float
    meta_final: float

class AnoValor(BaseModel):
    ano: str
    valor: float

class SimuladorOutput(BaseModel):
    anos: int
    meses: int
    tabela: List[AnoValor]

@app.post("/simular", response_model=SimuladorOutput)
def simular(input: SimuladorInput):
    saldo = input.valor_inicial
    saldos = [saldo]
    meses = 0

    while saldo < input.meta_final:
        saldo *= (1 + input.taxa_juros_mensal)
        saldo += input.aporte_mensal
        meses += 1
        saldos.append(saldo)

    tabela = []
    for i in range(0, len(saldos), 12):
        ano = i // 12
        valor = round(saldos[i], 2)
        tabela.append(AnoValor(ano=f"Ano {ano}", valor=valor))

    return SimuladorOutput(anos=meses // 12, meses=meses % 12, tabela=tabela)

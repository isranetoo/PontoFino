# simulador_investimentos_avancado.py

import pandas as pd
import matplotlib.pyplot as plt

def simulador(valor_inicial, aporte_mensal, taxa_juros_mensal, meta_final,
              inflacao_anual=0.0, crescimento_aporte_anual=0.0, aliquota_ir=0.0):
    saldo = valor_inicial
    saldos = [saldo]
    meses = 0
    tabela_mensal = []
    aporte_atual = aporte_mensal
    inflacao_mensal = (1 + inflacao_anual) ** (1 / 12) - 1
    total_juros = 0
    total_aportes = valor_inicial
    total_ir = 0

    while saldo < meta_final:
        juros = saldo * taxa_juros_mensal
        ir = juros * aliquota_ir
        saldo += juros - ir + aporte_atual

        saldo_corrigido = saldo / ((1 + inflacao_mensal) ** meses) if inflacao_anual > 0 else saldo

        total_juros += juros
        total_aportes += aporte_atual
        total_ir += ir

        tabela_mensal.append({
            "Mês": meses + 1,
            "Saldo Bruto (R$)": round(saldo, 2),
            "Saldo Corrigido (R$)": round(saldo_corrigido, 2),
            "Aporte (R$)": round(aporte_atual, 2),
            "Juros (R$)": round(juros, 2),
            "IR (R$)": round(ir, 2),
            "Total Aportado (R$)": round(total_aportes, 2),
            "Total Juros (R$)": round(total_juros, 2),
            "Total IR Pago (R$)": round(total_ir, 2)
        })

        meses += 1
        saldos.append(saldo)

        if meses % 12 == 0:
            aporte_atual *= (1 + crescimento_aporte_anual)

    anos_labels = []
    valores_anuais = []
    for i in range(0, len(saldos), 12):
        ano = i // 12
        anos_labels.append(f"Ano {ano}")
        valores_anuais.append(round(saldos[i], 2))

    df_ano = pd.DataFrame({"Ano": anos_labels, "Valor acumulado (R$)": valores_anuais})
    df_mes = pd.DataFrame(tabela_mensal)

    # Exportação
    df_mes.to_csv("tabela_mensal.csv", index=False)
    df_ano.to_csv("tabela_anual.csv", index=False)
    df_mes.to_excel("tabela_mensal.xlsx", index=False)
    df_ano.to_excel("tabela_anual.xlsx", index=False)

    # Gráficos adicionais
    plt.figure(figsize=(10, 5))
    plt.plot(df_mes["Mês"], df_mes["Saldo Bruto (R$)"], label="Saldo Bruto")
    if inflacao_anual > 0:
        plt.plot(df_mes["Mês"], df_mes["Saldo Corrigido (R$)"], label="Saldo Corrigido (inflação)")
    plt.title("Evolução do Investimento com Juros Compostos")
    plt.xlabel("Meses")
    plt.ylabel("Valor acumulado (R$)")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

    plt.figure(figsize=(10, 5))
    plt.plot(df_mes["Mês"], df_mes["Total Aportado (R$)"], label="Total Aportado")
    plt.plot(df_mes["Mês"], df_mes["Total Juros (R$)"], label="Total Juros")
    plt.plot(df_mes["Mês"], df_mes["Total IR Pago (R$)"], label="Total IR Pago")
    plt.title("Composição do Patrimônio Acumulado")
    plt.xlabel("Meses")
    plt.ylabel("Valores acumulados (R$)")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

    anos = meses // 12
    meses_restantes = meses % 12
    return df_mes, df_ano, anos, meses_restantes


def obter_valor(prompt, default):
    entrada = input(f"{prompt} [Padrão: {default}]: ").strip()
    return float(entrada) if entrada else default


if __name__ == "__main__":
    print("\n💰 Simulador Avançado de Investimentos 💰\n")

    usar_padrao = input("Usar valores padrão? (s/n): ").lower().startswith("s")

    if usar_padrao:
        params = {
            "valor_inicial": 100_000,
            "aporte_mensal": 1000,
            "taxa_juros_mensal": 0.01,
            "meta_final": 1_000_000,
            "inflacao_anual": 0.04,
            "crescimento_aporte_anual": 0.05,
            "aliquota_ir": 0.15
        }
    else:
        params = {
            "valor_inicial": obter_valor("Valor inicial (R$)", 100_000),
            "aporte_mensal": obter_valor("Aporte mensal (R$)", 1000),
            "taxa_juros_mensal": obter_valor("Taxa de juros mensal (%)", 1) / 100,
            "meta_final": obter_valor("Meta final (R$)", 1_000_000),
            "inflacao_anual": obter_valor("Inflação anual (%)", 4) / 100,
            "crescimento_aporte_anual": obter_valor("Crescimento anual do aporte (%)", 5) / 100,
            "aliquota_ir": obter_valor("Alíquota de IR sobre juros (%)", 15) / 100
        }

    df_mes, df_ano, anos, meses_restantes = simulador(**params)

    print(f"\n📅 Tempo para atingir a meta: {anos} anos e {meses_restantes} meses\n")
    print("📊 Tabela Anual:\n")
    print(df_ano.to_string(index=False))
    print("\n📋 Primeiros meses detalhados:\n")
    print(df_mes.head(12).to_string(index=False))

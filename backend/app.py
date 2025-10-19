from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__) #criação da API
CORS(app)  #aqui é um caminho para se conectar com o react

@app.route('/')
def home():
    return jsonify({"mensagem": "API funcionando!"}) # ve se a api esta pegando normal, ela retorna (o que esta dentro do jsonify)

@app.route('/nl-cpc', methods=['POST']) #lugar onde a api principal vai rodar \\ methodos = recebe uma frase via POST e retorna 

def analiseFrase():
    dados = request.get_json()
    frase = dados.get("frase", "").lower().strip()

    frase = frase.replace(",", " ")
    #pega a "frase" vindo do frontEnd e coverte para minusculo e tira os espaços extras e as virgulas

    if "se" in frase and "então" in frase:
        partes = re.split(r"\bse\b|\bentão\b", frase)
        # usa o re para separar o "se" e o "então"
        if len(partes) >= 3:
            antes = partes[1].strip()
            depois = partes[2].strip()
        elif len(partes) == 2:
            antes = partes[0].replace("se", "").strip()
            depois = partes[1].strip()
        else:
            return jsonify({"erro": "Frase incompleta ou formato incorreto."})
            
             # o "e" esta pegando normal, o "mas" não esta lendo
        if " e " in antes or " mas " in antes:
            subpartes = re.split(r"\b(?:e|mas)\b", antes)
            if len(subpartes) >= 2:
                p = subpartes[0].strip()
                q = subpartes[1].strip()
                r = depois
                resultado = f"(P ∧ Q) → R\nP = {p}\nQ = {q}\nR = {r}"

        elif " ou " in antes:
            subpartes = antes.split(" ou ")
            p = subpartes[0].strip()
            q = subpartes[1].strip()
            r = depois
            resultado = f"(P ∨ Q) → R\nP = {p}\nQ = {q}\nR = {r}"
        elif " não " in antes:
            p = antes.replace("não", "").strip()
            r = depois
            resultado = f"(¬P) → Q\nP = {p}\nQ = {r}"
        else:
            p = antes
            q = depois
            resultado = f"P → Q\nP = {p}\nQ = {q}"

        return jsonify({"resultado": resultado})
     #corrigir a função mas
    elif " e " in frase or " mas " in frase:
        partes = re.split(r"\b(?:e|mas)\b", frase)
        if len(partes) >= 2:
            p = partes[0].strip()
            q = partes[1].strip()
            resultado = f"P ∧ Q\nP = {p}\nQ = {q}"
            return jsonify({"resultado": resultado})


    elif " ou " in frase:
        partes = frase.split(" ou ")
        p = partes[0].strip()
        q = partes[1].strip()
        resultado = f"P ∨ Q\nP = {p}\nQ = {q}"
        return jsonify({"resultado": resultado})

    elif "não" in frase:
        p = frase.replace("não", "").strip()
        resultado = f"¬P\nP = {p}"
        return jsonify({"resultado": resultado})

    else:
        resultado = f"P = {frase}"
        return jsonify({"resultado": resultado})
       
    
@app.route('/cpc-nl', methods=['POST'])
def linguagem():
    dados = request.get_json()
    logica = dados.get("logica", "").upper().strip()
    
    logica = logica.replace(",", "")
    
    logica = logica.strip("()")
    
    if logica.startswith("¬"):
        p = logica[1:].strip()  # Remove o símbolo ¬ e pega o resto
        frase = f"Não {p}"
        return jsonify({"frase": frase})


    
    elif " → " in logica:
        partes = logica.split(" → ")
        if len(partes) == 2:
            antecedente = partes[0].strip("()") #remover os parentes internos caso houver
            consequente = partes[1].strip("()")
            
            
            if " ∧ " in antecedente:
                subpartes = antecedente.split(" ∧ ")
                p = subpartes[0].strip("()")
                q = subpartes[1].strip("()")
                frase = f"Se {p} e {q} então {consequente}"
            elif " ∨ " in antecedente:
                subpartes = antecedente.split(" ∨ ")
                p = subpartes[0].strip("()")
                q = subpartes[1].strip("()")
                frase = f"Se {p} ou {q} então {consequente}"
            else:
                frase = f"Se {antecedente} então {consequente}"
            
            return jsonify({"frase": frase})

        
    elif " ∨ " in logica:
        partes = logica.split(" ∨ ")
        if len (partes) == 2:
            p= partes[0].strip("()")
            q= partes[1].strip ("()")
            
            frase = f"{p} ou {q}"
            
            return jsonify({"frase": frase})

        
    elif " ∧ " in logica:
        partes = logica.split(" ∧ ")
        
        if len(partes)== 2: #se a parte for igual a 2, ele vai analisar as duas partes
            p= partes[0].strip("()")
            q= partes [1].strip("()")
            
            frase = f"{p} e {q}"
            return jsonify({"frase": frase})

    else:
        frase= logica
        return jsonify({"frase": frase})

    
if __name__ == '__main__':
    app.run(debug=True)
    # inicia o servidor usando o flask

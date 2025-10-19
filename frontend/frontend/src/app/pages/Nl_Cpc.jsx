"use client";

import { useState } from "react";

export default function Inicio() {
  const [frase, setFrase] = useState("");
  const [resultado, setResultado] = useState("");

  const enviarFrase = async () => { //função assincrona basica para conseguirmos chamar a api 
    try {
      const resp = await fetch("http://127.0.0.1:5000/nl-cpc", { //url onde a api esta, portando vamos chamar ela por aqui
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frase }),
      });


      const data = await resp.json();
      setResultado(data.resultado);
    } catch (erro) {
      console.error("Erro ao conectar à API:", erro);
      setResultado("Erro: não foi possível conectar ao servidor Flask.");
    }
  };

  return ( 
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <h1 className="text-2xl font-bold mb-4">Conversor</h1>
      
      <textarea // area para o usuario digitar (html basico)
        className="border border-gray-300 p-2 w-96 h-24 rounded-md mb-4"
        placeholder="Digite uma frase (ex: Se chover, então a grama ficará molhada)"
        value={frase} 
        onChange={(e) => setFrase(e.target.value)} //pega o evento e armazena para modificar o estado
      />

      <button
        onClick={enviarFrase}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Converter
      </button>

      {resultado && (
        <div className="mt-4 p-3 bg-white border rounded-md w-96 whitespace-pre-line">
          <strong>Resultado:</strong>
          <p>{resultado}</p>
        </div>
      )}
    </div>
  );
}
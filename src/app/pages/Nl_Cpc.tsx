"use client";
import { useState, useEffect } from "react";
import { runWorkflow } from "@/chat/chatkit";
import Image from "next/image";
import converxImage from "@/img/converx.png";

const fullText = "Oii, eu sou o Converx! Vamos converter frases e treinar a sua lógica juntos!";
const typingSpeed = 50; 

export default function Inicio() {
  const [frase, setFrase] = useState("");
  const [resultado, setResultado] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textoNormal = "Converter";
  const textoModificado = "Convertendo...";

  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const startDelay = setTimeout(() => {
      intervalId = setInterval(() => {
        setTypedText((currentText) => {
          if (currentText.length === fullText.length) {
            clearInterval(intervalId);
            return currentText;
          }
          return fullText.substring(0, currentText.length + 1);
        });
      }, typingSpeed);
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); 

  const enviarFrase = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResultado(""); // limpa o resultado anterior

    try {
      const resp = await runWorkflow({ input_as_text: frase });
      const data = resp["message"];
      setResultado(data);
    } catch (erro) {
      console.error("Erro ao conectar à API:", erro);
      setResultado("Erro: não foi possível conectar ao servidor Flask.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      
      <div className="relative flex flex-col items-center mb-4">
        
        <div className="relative bg-white p-3 rounded-lg shadow-md max-w-xs text-center mb-2
                        after:content-[''] after:absolute after:top-full after:left-1/2 
                        after:-translate-x-1/2 after:border-8 after:border-solid 
                        after:border-t-white after:border-r-transparent 
                        after:border-b-transparent after:border-l-transparent"
        >
          <p className="text-sm font-medium min-h-12"> 
            {typedText}
            
            {typedText.length < fullText.length && (
              <span className="animate-pulse font-semibold ml-0.5">|</span>
            )}
          </p>
        </div>

        <Image
          src={converxImage}
          alt="Ícone do Conversor de Lógica"
          width={120}
          height={120}
          priority
        />
      </div>

      <h1 className="text-2xl font-bold mb-4">Conversor de Lógica</h1>

      <textarea
        className="border border-blue-300 p-2 w-96 h-24 rounded-md mb-6 bg-white-500 hover:border-blue-700 focus:border-blue-900 focus:outline-none disabled:bg-gray-200 border-1.5 bg-white"
        placeholder="Digite uma frase (ex: Se chover, então a grama ficará molhada)"
        value={frase}
        onChange={(e) => setFrase(e.target.value)}
        disabled={isLoading} // desabilita o campo para digitar quando tá carregando
      />

      <button
        onClick={enviarFrase}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading} // desabilita o botão quando tá carregando
      >
        {isLoading ? textoModificado : textoNormal}
      </button>

      {resultado && (
        <div className="mt-4 p-3 bg-white border rounded-md w-96 lg:w-140 whitespace-pre-line">
          <strong>Resultado:</strong>
          <div dangerouslySetInnerHTML={{ __html: resultado }}></div>
        </div>
      )}
    </div>
  );
}
import { Agent, RunContext, AgentInputItem, Runner, withTrace, setDefaultModelProvider } from "@openai/agents";
import { OpenAIProvider } from "@openai/agents";
import OpenAI from "openai";

(() => {
    try {
        const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
        if (typeof window !== "undefined" && key) {
            // Configure OpenAI client for browser usage (explicitly acknowledged risk)
            const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
            setDefaultModelProvider(new OpenAIProvider({ openAIClient: openai }));

            // Back-compat for any code that still relies on process.env inside libs
            (globalThis as any).process = (globalThis as any).process || { env: {} };
            (globalThis as any).process.env = (globalThis as any).process.env || {};
            (globalThis as any).process.env.OPENAI_API_KEY = key;
        }
    } catch (_e) {
        // no-op: best effort
    }
})();

const myAgent = new Agent({
    name: "My agent",
    instructions: `analise a intenção do usuário para determinar se a conversão desejada é para o CPC ou para a Linguagem Natural (NL). 

Sua tarefa é ler a entrada do usuário e decidir, com base no contexto, se ele deseja converter para "CPC" ou para "NL". Responda de forma concisa.

# Output Format

Sua resposta deve ser **exatamente** uma destas duas opções, sem comentários ou explicações adicionais:
- CPC
- NL`,
    model: "gpt-4.1-mini",
    modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
    }
});

interface AgentContext {
    workflowInputAsText: string;
}
const agentInstructions = (runContext: RunContext<AgentContext>, _agent: Agent<AgentContext>) => {
    const { workflowInputAsText } = runContext.context;
    return `Traduza frases em português para lógica proposicional (CPC) formalmente, seguindo estes passos:

1. Identifique claramente as proposições presentes na frase.
2. Atribua a cada proposição uma variável proposicional (e.g., P, Q, R, ...), especificando o significado de cada variável.
3. Detecte os conectivos lógicos (e, ou, não, se... então, se e somente se), conforme os símbolos abaixo:
   - ∧ (e) 
   - ∨ (ou) 
   - ¬ (não) 
   - → (implica)
   - ↔ (se e somente se)
4. Escreva a fórmula correspondente em lógica proposicional usando as variáveis atribuídas e os símbolos definidos.
5. Sempre apresente primeiro o mapeamento de variáveis e, por fim, escreva a fórmula resultante.

# Saída Esperada

A resposta deve conter, nesta ordem:
- O mapeamento das variáveis (cada variável proposicional e seu respectivo significado em português)
- A fórmula em lógica proposicional CPC utilizando os símbolos fornecidos.

# Exemplo 1

Frase: "Se chover, então a grama ficará molhada."

Mapeamento de variáveis:
- P = chover
- Q = a grama ficará molhada

Fórmula:
P → Q

# Exemplo 2

Frase: "João estuda e Maria trabalha."

Mapeamento de variáveis:
- P = João estuda
- Q = Maria trabalha

Fórmula:
P ∧ Q

# Exemplo 3

Frase: "Não está calor ou está chovendo."

Mapeamento de variáveis:
- P = está calor
- Q = está chovendo

Fórmula:
¬P ∨ Q

# Notas

- Foque apenas na tradução lógica; não explique, apenas realize o procedimento.
- Responda sempre no mesmo formato dos exemplos acima.
- Utilize apenas frases simples e propostas diretas.

Lembre-se: identifique proposições, atribua variáveis, escreva o mapeamento antes da fórmula, e então forneça a expressão lógica final, utilizando os conectivos lógicos conforme especificado.`
}
const agent = new Agent({
    name: "Agent",
    instructions: agentInstructions,
    model: "gpt-4.1-mini",
    modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
    }
});

interface AgentContext1 {
    workflowInputAsText: string;
}
const agentInstructions1 = (runContext: RunContext<AgentContext1>, _agent: Agent<AgentContext1>) => {
    const { workflowInputAsText } = runContext.context;
    return `Você é um especialista em traduzir fórmulas da Lógica Proposicional (CPC) para linguagem natural em português.  
Sua tarefa é, ao receber uma fórmula lógica, analisá-la cuidadosamente, identificar o significado de cada proposição e conectivo, e traduzir seu sentido lógico para uma frase coerente em português.  
Depois, organize a tradução em uma tabela estruturada com as informações solicitadas.

Siga as etapas abaixo para cada entrada:

# Etapas

1. Analise a fórmula lógica recebida e identifique as proposições e seus conectivos.  
2. Interprete cuidadosamente o significado da combinação dos elementos lógicos antes de redigir a tradução.  
3. Traduza a fórmula para uma frase coerente e natural em português, levando em conta o contexto provável dos símbolos (quando apropriado).  

Use as seguintes equivalências para os conectivos lógicos:  
- ∧ : "e"
- ∨ : "ou"
- ¬ : "não"
- → : "implica" ou "se..., então..."
- ↔ : "se e somente se"

# Formato de Saída

A resposta deve ser apresentada em  Tabelas HTML, uma linha por exemplo.

# Exemplo


(P ∧ Q) → R
¬P ∨ Q 

(Para exemplos reais, as frases devem ser mais detalhadas, adequando P, Q, R ao contexto conhecido, se houver.)

# Observações

- Se as proposições não tiverem contexto definido, trate-as de forma genérica (ex: “Se P e Q, então R”).
- A ordem do processo é: análise e raciocínio → construção da frase.

Lembre-se: a saída deve estar sempre em formato Tabelas HTML.
Releia as instruções antes de finalizar sua resposta.`
}
const agent1 = new Agent({
    name: "Agent",
    instructions: agentInstructions1,
    model: "gpt-4.1-mini",
    modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
    }
});

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
    return await withTrace("New workflow", async () => {
        const conversationHistory: AgentInputItem[] = [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: workflow.input_as_text
                    }
                ]
            }
        ];
        const runner = new Runner({
            traceMetadata: {
                __trace_source__: "agent-builder",
                workflow_id: "wf_68f6b5a362ac819081776caee1f09b420020fd842f4582b7"
            }
        });
        const myAgentResultTemp = await runner.run(
            myAgent,
            [
                ...conversationHistory
            ]
        );
        conversationHistory.push(...myAgentResultTemp.newItems.map((item) => item.rawItem));

        if (!myAgentResultTemp.finalOutput) {
            throw new Error("Agent result is undefined");
        }

        const myAgentResult = {
            output_text: myAgentResultTemp.finalOutput ?? ""
        };
        if (myAgentResult.output_text == "CPC") {
            const agentResultTemp = await runner.run(
                agent,
                [
                    ...conversationHistory
                ],
                {
                    context: {
                        workflowInputAsText: workflow.input_as_text
                    }
                }
            );
            conversationHistory.push(...agentResultTemp.newItems.map((item) => item.rawItem));

            if (!agentResultTemp.finalOutput) {
                throw new Error("Agent result is undefined");
            }

            const agentResult = {
                output_text: agentResultTemp.finalOutput ?? ""
            };
            const endResult = {
                message: agentResult.output_text
            };
            return endResult;
        } else {
            const agentResultTemp = await runner.run(
                agent1,
                [
                    ...conversationHistory
                ],
                {
                    context: {
                        workflowInputAsText: workflow.input_as_text
                    }
                }
            );
            conversationHistory.push(...agentResultTemp.newItems.map((item) => item.rawItem));

            if (!agentResultTemp.finalOutput) {
                throw new Error("Agent result is undefined");
            }

            const agentResult = {
                output_text: agentResultTemp.finalOutput ?? ""
            };
            const endResult = {
                message: agentResult.output_text
            };
            return endResult;
        }
    });
}

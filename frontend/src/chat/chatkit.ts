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
    instructions: `Voce deve entender se o usuario quer traduzir da linguagem natural para o CPC ou do CPC para a Linguagem natural
Sua resposta deve ser apenas uma dessas duas opções: \"CPC\" | \"NL\"`,
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
    return `Voce é especialista em traduzir da linguagem natural para CPC.
Voce deve realizar a tradução e retornar a resposta.

O agente recebe frases simples em português (ex: \"Se chover, então a grama ficará molhada.\")
Ele converte para a fórmula correspondente em lógica proposicional: P → Q, onde P = chover, Q = a grama ficará molhada.

∧ (e), ∨ (ou), ¬ (não), → (implica), ↔ (se e somente se) 

# Output
{resposta} | {codigo da resposta}

${workflowInputAsText}`
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
    return `Voce é especialista em traduzir do CPC para Linguagem natural em Portugues
Voce deve realizar a tradução e retornar a tabela com as informacoes necessárias.

O agente recebe uma fórmula lógica (ex: (P ∧ Q) → R)
Ele traduz para uma frase coerente em português (ex: \"Se chover e fizer frio, então a aula será cancelada.\")

# Output
{resposta} | {codigo da resposta}
∧ (e), ∨ (ou), ¬ (não), → (implica), ↔ (se e somente se) 

${workflowInputAsText}`
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

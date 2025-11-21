# Agente de IA -- Tradução NL ↔ CPC

## 1. Arquitetura do Sistema e Explicação de Funcionamento

O sistema realiza tradução entre Linguagem Natural (NL) e Lógica
Proposicional (CPC) em dois modos: NL → CPC e CPC → NL. O fluxo inclui
interface web, controlador, módulos de tradução e um banco de
significados definido pelo usuário.

### Diagrama da Arquitetura

                                   +----------------------------+
                                   |        Interface Web       |
                                   |----------------------------|
                                   | - Entrada: NL ou fórmula   |
                                   | - Botão de tradução        |
                                   | - Exibe o resultado        |
                                   +-------------+--------------+
                                                 |
                                                 v
                            +--------------------+---------------------+
                            |          Controlador da Aplicação       |
                            |------------------------------------------|
                            | - Verifica o modo selecionado (NL↔CPC)   |
                            | - Normaliza o texto                      |
                            | - Chama o módulo de processamento        |
                            +--------------------+---------------------+
                                                 |
                    +----------------------------+-------------------------------+
                    |                                                            |
                    v                                                            v
    +-------------------------------+                         +-------------------------------+
    |     Módulo NL → CPC           |                         |        Módulo CPC → NL        |
    |-------------------------------|                         |-------------------------------|
    | - Regras de detecção:         |                         | - Parser da fórmula           |
    |     * "Se... então..."        |                         | - Interpretação dos           |
    |     * "e", "ou", "não"        |                         |   conectivos                  |
    | - Extração das proposições    |                         | - Conversão da fórmula        |
    | - Geração da fórmula lógica   |                         |   para estruturas NL          |
    | - LLM opcional para casos     |                         | - Geração textual final       |
    |   complexos                   |                         | - LLM opcional para maior     |
    +-------------------------------+                         |   naturalidade                |
                    |                                             +---------------------------+
                    |                                                            |
                    v                                                            v
    +------------------------------------------------------------------------------------------+
    |                              Banco de Significados (P, Q, R...)                           |
    |-------------------------------------------------------------------------------------------|
    | - Armazena os significados atribuídos pelo usuário                                        |
    | - Mapeia proposições ↔ frases                                                             |
    +-------------------------------------------------------------------------------------------+
                                                 |
                                                 v
                                    +----------------------------+
                                    |     Resposta ao Usuário    |
                                    | - Exibe fórmula lógica     |
                                    | - Ou frase natural         |
                                    +----------------------------+

------------------------------------------------------------------------

## 2. Estratégia de Tradução

A tradução usa três etapas principais:

###  NL → CPC

-   Identificação de padrões como "se... então...", "e", "ou", "não".
-   Extração de proposições simples.
-   Atribuição automática de P, Q, R... ou conforme definido pelo
    usuário.
-   Aplicação de regras de lógica proposicional.
-   Uso de LLM como fallback em frases mais complexas.

###  CPC → NL

-   Parsing da estrutura lógica.
-   Conversão dos conectivos para linguagem natural.
-   Substituição dos símbolos pelos significados definidos pelo usuário.
-   Geração de frase natural usando LLM quando necessário.

### Exemplos de Input/Output

**Exemplo 1 --- NL → CPC**\
Entrada: *"Se chover, então a grama ficará molhada."*\
Saída: **P → Q**

**Exemplo 2 --- CPC → NL**\
Entrada: **(P ∧ Q) → R**\
Saída: *"Se P e Q forem verdadeiros, então R acontecerá."*

------------------------------------------------------------------------

## 3. Limitações e Possibilidades de Melhoria

### Limitações

-   LLM pode gerar pequenas variações na frase final.
-   Regras simples podem falhar em frases ambíguas.
-   O sistema não mantém contexto entre traduções.
-   Complexidade sintática ainda limitada.

### Melhorias Futuras

-   Regras linguísticas mais avançadas.
-   Expansão do banco de significados.
-   Detecção automática de idioma.
-   Aperfeiçoamento do parser lógico.
-   Redução da dependência de LLM para casos simples.

------------------------------------------------------------------------

## 4. Vídeo Demonstração

📹 Link do vídeo demonstrando o agente de IA:\
**\[INSERIR LINK AQUI\]**

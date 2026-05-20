# Aula_Agente_IA

Projeto acadêmico de um Agente de IA com backend em Node.js e frontend em React/Vite.

## Funcionalidades

- Chat com o agente de IA
- Ferramentas `getTime` e `calculate`
- Sessões em memória
- Testes automatizados com Jest e Supertest

## Como executar

### Backend

```bash
cd Aula_Agente_IA
npm install
npm start
```

O backend sobe em `http://localhost:3001`.

### Frontend

```bash
cd Aula_Agente_IA/front/agente
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

## Testes

```bash
cd Aula_Agente_IA
npm test
```

## Observação

Se a variável `GROQ_API_KEY` estiver vazia, a aplicação entra em modo local e responde sem chamar a API da Groq.
Se quiser usar a API real, configure a variável `GROQ_API_KEY` no arquivo `.env`.
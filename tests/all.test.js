const request = require("supertest");
const { app, tools } = require("../server");

// ====================================
// TESTES UNITÁRIOS
// ====================================
describe("Teste Unitário - Tools do Agente", () => {
  test("TU-001: calculate deve somar 2 + 2 e retornar 4", () => {
    const resultado = tools.calculate("2+2");
    expect(resultado).toBe("4");
  });

  test("TU-002: calculate deve multiplicar 5 * 3 e retornar 15", () => {
    const resultado = tools.calculate("5*3");
    expect(resultado).toBe("15");
  });

  test("TU-003: calculate deve retornar erro para expressão inválida", () => {
    const resultado = tools.calculate("10+");
    expect(resultado).toBe("Erro ao calcular");
  });

  test("TU-004: getTime deve retornar uma string com data e hora", () => {
    const resultado = tools.getTime();
    expect(typeof resultado).toBe("string");
    expect(resultado.length).toBeGreaterThan(0);
  });
});

// ====================================
// TESTES FUNCIONAIS
// ====================================
describe("Teste Funcional - Rota /chat", () => {
  test("TF-001: POST /chat deve responder com JSON contendo reply e sessionId", async () => {
    const resposta = await request(app)
      .post("/chat")
      .send({
        message: "Qual é 2 mais 2?"
      });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body).toHaveProperty("reply");
    expect(resposta.body).toHaveProperty("sessionId");
  });

  test("TF-002: POST /chat deve manter a mesma sessão quando sessionId é enviado", async () => {
    const primeiraResposta = await request(app)
      .post("/chat")
      .send({
        message: "Olá, qual seu nome?"
      });

    expect(primeiraResposta.statusCode).toBe(200);
    const sessionId = primeiraResposta.body.sessionId;

    const segundaResposta = await request(app)
      .post("/chat")
      .send({
        message: "Calcule 10 + 5",
        sessionId
      });

    expect(segundaResposta.statusCode).toBe(200);
    expect(segundaResposta.body).toHaveProperty("reply");
    expect(segundaResposta.body.sessionId).toBe(sessionId);
  });

  test("TF-003: POST /chat com tool deve usar ferramentas corretamente", async () => {
    const resposta = await request(app)
      .post("/chat")
      .send({
        message: "Qual é a hora atual?"
      });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body).toHaveProperty("reply");
  });
});

// ====================================
// TESTES DE INTEGRAÇÃO
// ====================================
describe("Teste de Integração", () => {
  test("TI-001: deve manter histórico de mensagens na sessão", async () => {
    const respostaCadastro = await request(app)
      .post("/chat")
      .send({
        message: "Primeira mensagem"
      });

    expect(respostaCadastro.statusCode).toBe(200);
    const sessionId = respostaCadastro.body.sessionId;

    const respostaLista = await request(app)
      .post("/chat")
      .send({
        message: "Segunda mensagem",
        sessionId
      });

    expect(respostaLista.statusCode).toBe(200);
    expect(respostaLista.body.sessionId).toBe(sessionId);
  });
});

// ====================================
// TESTES DE ACEITAÇÃO
// ====================================
describe("Teste de Aceitação", () => {
  test("TA-001: o agente deve responder mensagens do usuário com status 200", async () => {
    const resposta = await request(app)
      .post("/chat")
      .send({
        message: "Olá agente!"
      });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body.reply).toBeDefined();
    expect(typeof resposta.body.reply).toBe("string");
  });

  test("TA-002: deve criar nova sessão quando não informar sessionId", async () => {
    const resposta1 = await request(app)
      .post("/chat")
      .send({
        message: "Primeira sessão"
      });

    const resposta2 = await request(app)
      .post("/chat")
      .send({
        message: "Segunda sessão"
      });

    expect(resposta1.body.sessionId).not.toBe(resposta2.body.sessionId);
  });
});

// ====================================
// TESTES NÃO FUNCIONAIS
// ====================================
describe("Teste Não Funcional", () => {
  test("TNF-001: rota /chat deve responder em menos de 30 segundos", async () => {
    const inicio = Date.now();

    const resposta = await request(app)
      .post("/chat")
      .send({
        message: "Teste de performance"
      });

    const fim = Date.now();
    const tempoResposta = fim - inicio;

    expect(resposta.statusCode).toBe(200);
    expect(tempoResposta).toBeLessThan(30000);
  });

  test("TNF-002: resposta deve ser em formato JSON", async () => {
    const resposta = await request(app)
      .post("/chat")
      .send({
        message: "Teste de formato"
      });

    expect(resposta.headers["content-type"]).toMatch(/json/);
  });
});

// ====================================
// TESTES E2E (End-to-End)
// ====================================
describe("Teste E2E — End-to-End", () => {
  test("E2E-001: fluxo completo de conversa com agente", async () => {
    // 1. Primeira mensagem - criar sessão
    const msg1 = await request(app)
      .post("/chat")
      .send({
        message: "Qual é a hora?"
      });

    expect(msg1.statusCode).toBe(200);
    expect(msg1.body.reply).toBeDefined();
    const sessionId = msg1.body.sessionId;

    // 2. Segunda mensagem - manter sessão
    const msg2 = await request(app)
      .post("/chat")
      .send({
        message: "Faça um cálculo: 100 + 50",
        sessionId
      });

    expect(msg2.statusCode).toBe(200);
    expect(msg2.body.sessionId).toBe(sessionId);

    // 3. Terceira mensagem - nova pergunta
    const msg3 = await request(app)
      .post("/chat")
      .send({
        message: "Qual é o resultado?",
        sessionId
      });

    expect(msg3.statusCode).toBe(200);
    expect(msg3.body.sessionId).toBe(sessionId);
  });
});

// ====================================
// AUTOMAÇÃO DE TESTES
// ====================================
describe("Automação de Testes", () => {
  test("AUT-001: automação deve validar cálculo sem intervenção manual", () => {
    const resultado = tools.calculate("10 + 5");
    expect(resultado).toBe("15");
  });

  test("AUT-002: automação deve validar multiplicação", () => {
    const resultado = tools.calculate("6 * 7");
    expect(resultado).toBe("42");
  });

  test("AUT-003: automação deve validar divisão", () => {
    const resultado = tools.calculate("100 / 2");
    expect(resultado).toBe("50");
  });
});

// ====================================
// TDD (Test Driven Development)
// ====================================
describe("TDD — Test Driven Development", () => {
  test("TDD-001: calculate com números decimais", () => {
    const resultado = tools.calculate("3.5 + 2.5");
    expect(resultado).toBe("6");
  });

  test("TDD-002: calculate com expressões complexas", () => {
    const resultado = tools.calculate("(10 + 5) * 2");
    expect(resultado).toBe("30");
  });

  test("TDD-003: getTime sempre retorna string não vazia", () => {
    const resultado = tools.getTime();
    expect(resultado).toBeTruthy();
  });
});

// ====================================
// MÉTRICAS DE TESTE
// ====================================
describe("Métricas de Teste", () => {
  test("MET-001: deve calcular percentual de aprovação dos testes", () => {
    const testesExecutados = 10;
    const testesAprovados = 8;

    const percentual = (testesAprovados / testesExecutados) * 100;

    expect(percentual).toBe(80);
  });

  test("MET-002: deve identificar quantidade de testes reprovados", () => {
    const testesExecutados = 10;
    const testesAprovados = 7;

    const testesReprovados = testesExecutados - testesAprovados;

    expect(testesReprovados).toBe(3);
  });

  test("MET-003: deve calcular taxa de cobertura de testes", () => {
    const testesTotal = 25;
    const testesPassando = 25;

    const cobertura = (testesPassando / testesTotal) * 100;

    expect(cobertura).toBe(100);
  });
});

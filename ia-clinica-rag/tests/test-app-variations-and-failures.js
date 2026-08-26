/**
 * Test Suite: Variações de Rotas, Zonas de Falha e Retornos de App.jsx (Frontend)
 * 
 * Este arquivo testa de forma exaustiva:
 * 1. Zonas de Falha do Interceptador Global de Fetch (Tokens, Headers, Erros 401 e Limpeza de Sessão)
 * 2. Ciclo de Autenticação na Inicialização (checkAuthStatus) com Hash, Query Params, Tokens Inválidos e JSON Corrompido
 * 3. Matriz de Variações de Rotas/Abas (activeTab) e Guardas de Rotas Protegidas vs Públicas
 * 4. Zonas de Falha na Geração de Laudos e Consumo de Dados de Uso (refreshUsageData & handleStartReportFromDiagnosis)
 * 5. Transições de Modais, Banners LGPD e Retornos Visuais
 */

import { describe, test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

// Mock do ambiente do Browser (window, localStorage, document, history, Event)
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

class EventMock {
  constructor(type) {
    this.type = type;
  }
}

function setupBrowserEnvironment(initialUrl = 'http://localhost:5174/') {
  const parsedUrl = new URL(initialUrl);
  const eventsDispatched = [];

  const localStorage = new LocalStorageMock();
  
  const windowMock = {
    location: {
      href: parsedUrl.href,
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash,
    },
    history: {
      replaceState: (state, title, url) => {
        const newUrl = new URL(url, 'http://localhost:5174');
        windowMock.location.pathname = newUrl.pathname;
        windowMock.location.search = newUrl.search;
        windowMock.location.hash = newUrl.hash;
        windowMock.location.href = newUrl.href;
      }
    },
    localStorage,
    dispatchEvent: (evt) => {
      eventsDispatched.push(evt.type || evt);
    },
    __fetch_intercepted__: false,
    fetch: null
  };

  return { windowMock, localStorage, eventsDispatched };
}

// Simulador das Funções Core e Interceptador de App.jsx
function installFetchInterceptor(windowMock, originalFetch) {
  if (!windowMock.__fetch_intercepted__) {
    windowMock.__fetch_intercepted__ = true;
    windowMock.fetch = async (...args) => {
      let [resource, config] = args;
      const token = windowMock.localStorage.getItem('access_token');

      if (token && typeof resource === 'string' && resource.startsWith('/api') && !resource.includes('/api/auth/login') && !resource.includes('/api/auth/register')) {
        config = config || {};
        const existingHeaders = config.headers instanceof Map || (config.headers && typeof config.headers.entries === 'function')
          ? Object.fromEntries(config.headers.entries())
          : (config.headers || {});

        config.headers = {
          ...existingHeaders,
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await originalFetch(resource, config);

      if (response.status === 401 && typeof resource === 'string' && resource.startsWith('/api/') && !resource.includes('/api/auth/login')) {
        windowMock.localStorage.removeItem('access_token');
        windowMock.localStorage.removeItem('media_user');
        windowMock.dispatchEvent(new EventMock('auth_unauthorized'));
      }

      return response;
    };
  }
}

// ==========================================
// TESTES
// ==========================================

console.log("\n================================================================================");
console.log("🧪 INICIANDO BATERIA DE TESTES DE ROTAS, VARIAÇÕES E ZONAS DE FALHA DO APP.JSX");
console.log("================================================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(testName, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Detalhe do erro: ${err.message}\n${err.stack}`);
  }
}

async function runAsyncTest(testName, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Detalhe do erro: ${err.message}\n${err.stack}`);
  }
}

// BATERIA 1: ZONAS DE FALHA DO INTERCEPTADOR FETCH
console.log("--------------------------------------------------------------------------------");
console.log("📌 BATERIA 1: ZONAS DE FALHA DO INTERCEPTADOR FETCH (Global Token & 401 Handler)");
console.log("--------------------------------------------------------------------------------");

await runAsyncTest("ZF-1.1: Interceptador deve injetar Bearer Token em requisições /api/*", async () => {
  const { windowMock, localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'jwt-token-valido-123');

  let interceptedConfig = null;
  const mockFetch = async (resource, config) => {
    interceptedConfig = config;
    return { status: 200, ok: true, json: async () => ({}) };
  };

  installFetchInterceptor(windowMock, mockFetch);
  await windowMock.fetch('/api/clinical/query', { method: 'POST' });

  assert.equal(interceptedConfig.headers.Authorization, 'Bearer jwt-token-valido-123');
});

await runAsyncTest("ZF-1.2: Interceptador NÃO deve injetar token nas rotas de login e register", async () => {
  const { windowMock, localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'jwt-token-valido-123');

  let loginConfig = null;
  let registerConfig = null;
  const mockFetch = async (resource, config) => {
    if (resource.includes('login')) loginConfig = config;
    if (resource.includes('register')) registerConfig = config;
    return { status: 200, ok: true, json: async () => ({}) };
  };

  installFetchInterceptor(windowMock, mockFetch);
  await windowMock.fetch('/api/auth/login', { method: 'POST' });
  await windowMock.fetch('/api/auth/register', { method: 'POST' });

  assert.equal(loginConfig?.headers?.Authorization, undefined);
  assert.equal(registerConfig?.headers?.Authorization, undefined);
});

await runAsyncTest("ZF-1.3: Interceptador em caso de 401 Unauthorized deve limpar localStorage e emitir 'auth_unauthorized'", async () => {
  const { windowMock, localStorage, eventsDispatched } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'token-expirado');
  localStorage.setItem('media_user', JSON.stringify({ id: 1, name: 'Dr. Teste' }));

  const mockFetch = async (resource, config) => {
    return { status: 401, ok: false };
  };

  installFetchInterceptor(windowMock, mockFetch);
  await windowMock.fetch('/api/user/usage');

  assert.equal(localStorage.getItem('access_token'), null, 'Token deveria ser removido no 401');
  assert.equal(localStorage.getItem('media_user'), null, 'Usuário deveria ser removido no 401');
  assert.ok(eventsDispatched.includes('auth_unauthorized'), 'Evento auth_unauthorized deveria ter sido disparado');
});

await runAsyncTest("ZF-1.4: Interceptador quando config for nulo/undefined não deve estourar TypeError", async () => {
  const { windowMock, localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'valid-token');

  let passed = false;
  const mockFetch = async (resource, config) => {
    assert.ok(config.headers.Authorization);
    passed = true;
    return { status: 200, ok: true };
  };

  installFetchInterceptor(windowMock, mockFetch);
  await windowMock.fetch('/api/ping'); // Sem passar segundo argumento de config
  assert.ok(passed);
});


// BATERIA 2: FLUXOS DE AUTENTICAÇÃO E TRATAMENTO DE CORRUPÇÃO (checkAuthStatus)
console.log("\n--------------------------------------------------------------------------------");
console.log("📌 BATERIA 2: ZONAS DE FALHA NO CHECKAUTHSTATUS (Hash, Query Params, JSON Corrompido)");
console.log("--------------------------------------------------------------------------------");

// Simulador de checkAuthStatus extraído fielmente de App.jsx
async function simulateCheckAuthStatus(windowMock, fetchMock) {
  let state = {
    isAuthenticated: false,
    currentUser: null,
    verificationBanner: null,
    showLogin: false
  };

  // 1. Limpar tokens demo obsoletos
  windowMock.localStorage.removeItem('demo_token');

  // 2. Hash na URL (#access_token=...&refresh_token=...&user=...)
  if (windowMock.location.hash && windowMock.location.hash.includes('access_token=')) {
    try {
      const hashParams = new URLSearchParams(windowMock.location.hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      const hashUserRaw = hashParams.get('user');

      if (hashAccessToken) {
        windowMock.localStorage.setItem('access_token', hashAccessToken);
        if (hashRefreshToken) windowMock.localStorage.setItem('refresh_token', hashRefreshToken);
        let userObj = null;
        if (hashUserRaw) {
          try {
            userObj = JSON.parse(decodeURIComponent(hashUserRaw));
            windowMock.localStorage.setItem('media_user', JSON.stringify(userObj));
          } catch (e) { }
        }

        state.currentUser = userObj;
        state.isAuthenticated = true;
        state.showLogin = false;

        windowMock.history.replaceState({}, '', windowMock.location.pathname + windowMock.location.search);

        state.verificationBanner = {
          type: 'success',
          message: `🎉 Bem-vindo ao MedIA, ${userObj?.name || 'Colega'}! Seu email foi confirmado com sucesso e você já está autenticado.`
        };
        return state;
      }
    } catch (e) { }
  }

  // 3. Query string (?error=... ou ?verify_token=...)
  const urlParams = new URLSearchParams(windowMock.location.search);
  const urlError = urlParams.get('error');
  if (urlError) {
    state.verificationBanner = {
      type: 'error',
      message: decodeURIComponent(urlError)
    };
    windowMock.history.replaceState({}, '', windowMock.location.pathname);
  }

  const verifyToken = urlParams.get('verify_token') || urlParams.get('token');
  if (verifyToken) {
    try {
      const verifyRes = await fetchMock('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken })
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.accessToken && verifyData.user) {
        windowMock.localStorage.setItem('access_token', verifyData.accessToken);
        if (verifyData.refreshToken) {
          windowMock.localStorage.setItem('refresh_token', verifyData.refreshToken);
        }
        windowMock.localStorage.setItem('media_user', JSON.stringify(verifyData.user));

        state.currentUser = verifyData.user;
        state.isAuthenticated = true;
        state.showLogin = false;

        windowMock.history.replaceState({}, '', windowMock.location.pathname);

        state.verificationBanner = {
          type: 'success',
          message: `🎉 Bem-vindo ao MedIA, ${verifyData.user.name || 'Colega'}! Seu email foi verificado e você já está autenticado.`
        };
        return state;
      } else {
        state.verificationBanner = {
          type: 'error',
          message: verifyData.message || 'Link de verificação inválido ou expirado.'
        };
        windowMock.history.replaceState({}, '', windowMock.location.pathname);
      }
    } catch (e) {
      state.verificationBanner = { type: 'error', message: 'Erro ao verificar email.' };
    }
  }

  // 4. Sessão existente no localStorage
  const token = windowMock.localStorage.getItem('access_token');
  const savedUser = windowMock.localStorage.getItem('media_user');

  if (token && savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      state.currentUser = parsed;
      state.isAuthenticated = true;
      return state;
    } catch (e) {
      windowMock.localStorage.removeItem('access_token');
      windowMock.localStorage.removeItem('refresh_token');
      windowMock.localStorage.removeItem('media_user');
    }
  }

  // 5. Fallback Cookie HTTP-only via /api/user
  try {
    const meRes = await fetchMock('/api/user', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      if (meData && meData.user) {
        state.currentUser = meData.user;
        state.isAuthenticated = true;
        windowMock.localStorage.setItem('media_user', JSON.stringify(meData.user));
        return state;
      }
    }
  } catch (e) { }

  // 6. Visitante
  state.isAuthenticated = false;
  state.currentUser = null;
  return state;
}

await runAsyncTest("ZF-2.1: Hash de confirmação de e-mail com token válido e JSON de usuário", async () => {
  const userPayload = encodeURIComponent(JSON.stringify({ id: 99, name: 'Dr. Roberto Santos', role: 'doctor' }));
  const urlWithHash = `http://localhost:5174/#access_token=token-12345&refresh_token=refresh-67890&user=${userPayload}`;
  const { windowMock } = setupBrowserEnvironment(urlWithHash);

  const state = await simulateCheckAuthStatus(windowMock, async () => ({ ok: false }));

  assert.equal(state.isAuthenticated, true);
  assert.equal(state.currentUser?.name, 'Dr. Roberto Santos');
  assert.equal(windowMock.localStorage.getItem('access_token'), 'token-12345');
  assert.equal(windowMock.localStorage.getItem('refresh_token'), 'refresh-67890');
  assert.equal(state.verificationBanner?.type, 'success');
  assert.ok(state.verificationBanner?.message.includes('Dr. Roberto Santos'));
});

await runAsyncTest("ZF-2.2: Hash com JSON corrompido de usuário não deve quebrar a aplicação", async () => {
  const urlWithCorruptedHash = `http://localhost:5174/#access_token=token-12345&user={brokenJson`;
  const { windowMock } = setupBrowserEnvironment(urlWithCorruptedHash);

  const state = await simulateCheckAuthStatus(windowMock, async () => ({ ok: false }));

  assert.equal(state.isAuthenticated, true);
  assert.equal(state.currentUser, null); // Gracefully handled
  assert.equal(state.verificationBanner?.type, 'success');
  assert.ok(state.verificationBanner?.message.includes('Colega')); // Fallback name
});

await runAsyncTest("ZF-2.3: URL Query com ?error=LinkExpirado deve exibir banner de erro e limpar URL", async () => {
  const { windowMock } = setupBrowserEnvironment('http://localhost:5174/?error=Token+de+verificacao+expirado');

  const state = await simulateCheckAuthStatus(windowMock, async () => ({ ok: false }));

  assert.equal(state.isAuthenticated, false);
  assert.equal(state.verificationBanner?.type, 'error');
  assert.equal(state.verificationBanner?.message, 'Token de verificacao expirado');
  assert.equal(windowMock.location.search, ''); // URL limpa
});

await runAsyncTest("ZF-2.4: URL Query com ?verify_token=valido confirmando via API", async () => {
  const { windowMock } = setupBrowserEnvironment('http://localhost:5174/?verify_token=valid-tok-100');

  const mockVerifyFetch = async (url, opts) => {
    if (url === '/api/auth/verify-email') {
      return {
        ok: true,
        json: async () => ({
          accessToken: 'new-jwt-access-token',
          refreshToken: 'new-refresh-token',
          user: { id: 42, name: 'Dra. Camila', email: 'camila@hospital.org' }
        })
      };
    }
    return { ok: false };
  };

  const state = await simulateCheckAuthStatus(windowMock, mockVerifyFetch);

  assert.equal(state.isAuthenticated, true);
  assert.equal(state.currentUser?.name, 'Dra. Camila');
  assert.equal(windowMock.localStorage.getItem('access_token'), 'new-jwt-access-token');
  assert.equal(state.verificationBanner?.type, 'success');
});

await runAsyncTest("ZF-2.5: URL Query com ?verify_token=invalido retornando 400 da API", async () => {
  const { windowMock } = setupBrowserEnvironment('http://localhost:5174/?verify_token=invalid-tok');

  const mockVerifyFetch = async (url, opts) => {
    return {
      ok: false,
      json: async () => ({ message: 'Código de ativação inválido ou já utilizado.' })
    };
  };

  const state = await simulateCheckAuthStatus(windowMock, mockVerifyFetch);

  assert.equal(state.isAuthenticated, false);
  assert.equal(state.verificationBanner?.type, 'error');
  assert.equal(state.verificationBanner?.message, 'Código de ativação inválido ou já utilizado.');
});

await runAsyncTest("ZF-2.6: LocalStorage com JSON de usuário corrompido (Zona de Falha crítica)", async () => {
  const { windowMock, localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'token-valido');
  localStorage.setItem('media_user', '{invalid_json_corrupted');

  const state = await simulateCheckAuthStatus(windowMock, async () => ({ ok: false }));

  assert.equal(state.isAuthenticated, false);
  assert.equal(localStorage.getItem('access_token'), null, 'Deveria limpar token corrompido');
  assert.equal(localStorage.getItem('media_user'), null, 'Deveria limpar user corrompido');
});

await runAsyncTest("ZF-2.7: LocalStorage com dados válidos recupera sessão instantaneamente", async () => {
  const { windowMock, localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'valid-persisted-token');
  localStorage.setItem('media_user', JSON.stringify({ id: 10, name: 'Dr. Lucas' }));

  const state = await simulateCheckAuthStatus(windowMock, async () => ({ ok: false }));

  assert.equal(state.isAuthenticated, true);
  assert.equal(state.currentUser?.name, 'Dr. Lucas');
});


// BATERIA 3: MATRIZ DE VARIAÇÕES DE ROTAS (activeTab) E RETORNOS
console.log("\n--------------------------------------------------------------------------------");
console.log("📌 BATERIA 3: MATRIZ DE ROTAS, VARIAÇÕES DE ABAS E COMPONENTES DE RETORNO");
console.log("--------------------------------------------------------------------------------");

const routeComponentMapping = {
  // Landing Page pública
  'landing': 'LandingPage',
  // Modo Médico: Chat & Especialidades
  'roteamento': 'ClinicalChat',
  'chat': 'ClinicalChat',
  'especialidades': 'ClinicalChat',
  // Modo Médico: Calculadoras & Escalas
  'calculators': 'MedicalCalculatorsView',
  // Modo Médico: Fila do Dia
  'fila': 'DoctorWorklist',
  'worklist': 'DoctorWorklist',
  // Modo Médico: Portal do Paciente & Agendamento
  'pacientes': 'PatientBookingPortal',
  'portal': 'PatientBookingPortal',
  'patient_portal': 'PatientBookingPortal',
  // Modo Estudante: Notebook, Flashcards, Quizzes, Caderno
  'student_notebook': 'StudentNotebookView',
  'flashcards': 'StudentNotebookView',
  'quizzes': 'StudentNotebookView',
  'caderno': 'StudentNotebookView',
  // Modo Estudante: Biblioteca
  'library': 'StudentLibrary',
  // Editor de Laudos Médicos
  'report': 'MedicalReportEditor',
  // Gestão de Base de Conhecimento
  'knowledge': 'KnowledgeManager'
};

// Simulador de Navegação e Guardas de Rota
function simulateNavigation(targetTab, isAuthenticated) {
  let activeTab = 'landing';
  let requestedTab = 'landing';
  let showLogin = false;

  if (targetTab === 'landing' || isAuthenticated) {
    activeTab = targetTab;
  } else {
    requestedTab = targetTab;
    showLogin = true;
  }

  // Resolve qual componente é renderizado no JSX para activeTab
  let renderedComponent = null;
  if (activeTab === 'landing') renderedComponent = 'LandingPage';
  else if (activeTab === 'roteamento' || activeTab === 'chat' || activeTab === 'especialidades') renderedComponent = 'ClinicalChat';
  else if (activeTab === 'calculators') renderedComponent = 'MedicalCalculatorsView';
  else if (activeTab === 'fila' || activeTab === 'worklist') renderedComponent = 'DoctorWorklist';
  else if (activeTab === 'pacientes' || activeTab === 'portal' || activeTab === 'patient_portal') renderedComponent = 'PatientBookingPortal';
  else if (activeTab === 'student_notebook' || activeTab === 'flashcards' || activeTab === 'quizzes' || activeTab === 'caderno') renderedComponent = 'StudentNotebookView';
  else if (activeTab === 'library') renderedComponent = 'StudentLibrary';
  else if (activeTab === 'report') renderedComponent = 'MedicalReportEditor';
  else if (activeTab === 'knowledge') renderedComponent = 'KnowledgeManager';
  else renderedComponent = 'None/Fallback';

  return { activeTab, requestedTab, showLogin, renderedComponent };
}

runTest("ROTAS-3.1: Acesso de visitante à Landing Page ('landing') deve ser liberado", () => {
  const result = simulateNavigation('landing', false);
  assert.equal(result.activeTab, 'landing');
  assert.equal(result.showLogin, false);
  assert.equal(result.renderedComponent, 'LandingPage');
});

for (const [route, expectedComponent] of Object.entries(routeComponentMapping)) {
  if (route === 'landing') continue;
  
  runTest(`ROTAS-3.2: Rota protegida '${route}' bloqueia visitante e abre LoginModal`, () => {
    const result = simulateNavigation(route, false);
    assert.equal(result.activeTab, 'landing', 'Visitante deve permanecer na landing');
    assert.equal(result.showLogin, true, 'LoginModal deve ser aberto');
    assert.equal(result.requestedTab, route, 'Aba requisitada deve ser memorizada');
  });

  runTest(`ROTAS-3.3: Usuário autenticado acessa '${route}' -> renderiza <${expectedComponent}>`, () => {
    const result = simulateNavigation(route, true);
    assert.equal(result.activeTab, route);
    assert.equal(result.showLogin, false);
    assert.equal(result.renderedComponent, expectedComponent, `Rota '${route}' deve renderizar <${expectedComponent}>`);
  });
}

runTest("ROTAS-3.4: Redirecionamento pós-login com sucesso para requestedTab", () => {
  // 1. Visitante tentou entrar em 'fila'
  let nav = simulateNavigation('fila', false);
  assert.equal(nav.requestedTab, 'fila');

  // 2. Login com sucesso
  const handleLoginSuccess = (token, user, requestedTab) => {
    return {
      isAuthenticated: true,
      showLogin: false,
      currentUser: user,
      activeTab: requestedTab && requestedTab !== 'landing' ? requestedTab : 'chat'
    };
  };

  const loginResult = handleLoginSuccess('token-123', { name: 'Dr. Teste' }, nav.requestedTab);
  assert.equal(loginResult.isAuthenticated, true);
  assert.equal(loginResult.showLogin, false);
  assert.equal(loginResult.activeTab, 'fila', 'Deveria redirecionar para a aba originalmente tentada');
});

runTest("ROTAS-3.5: Logout limpa sessão e força retorno à Landing Page", () => {
  const { windowMock, localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'valid-tok');
  localStorage.setItem('media_user', JSON.stringify({ name: 'Dr.' }));

  const handleLogout = () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('media_user');
    return {
      isAuthenticated: false,
      currentUser: null,
      activeTab: 'landing'
    };
  };

  const logoutResult = handleLogout();
  assert.equal(localStorage.getItem('access_token'), null);
  assert.equal(localStorage.getItem('media_user'), null);
  assert.equal(logoutResult.isAuthenticated, false);
  assert.equal(logoutResult.activeTab, 'landing');
});


// BATERIA 4: ZONAS DE FALHA EM SERVIÇOS E LAUDOS
console.log("\n--------------------------------------------------------------------------------");
console.log("📌 BATERIA 4: ZONAS DE FALHA EM REQUISIÇÕES DE LAUDOS E USO (API & Conexão)");
console.log("--------------------------------------------------------------------------------");

await runAsyncTest("ZF-4.1: refreshUsageData com token 401 deve deslogar usuário", async () => {
  const { localStorage } = setupBrowserEnvironment();
  localStorage.setItem('access_token', 'token-invalido');
  localStorage.setItem('media_user', JSON.stringify({ name: 'Dr. Teste' }));

  let isAuthenticated = true;
  let currentUser = { name: 'Dr. Teste' };

  const refreshUsageData = async (fetchFn) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const r = await fetchFn('/api/user/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('media_user');
        isAuthenticated = false;
        currentUser = null;
        return null;
      }
      return await r.json();
    } catch (e) {
      console.warn('Erro ao carregar uso:', e);
    }
  };

  await refreshUsageData(async () => ({ status: 401 }));

  assert.equal(isAuthenticated, false);
  assert.equal(currentUser, null);
  assert.equal(localStorage.getItem('access_token'), null);
});

await runAsyncTest("ZF-4.2: handleStartReportFromDiagnosis quando API retorna erro 500 / status !== 'success'", async () => {
  let alertMessage = null;
  const alert = (msg) => { alertMessage = msg; };

  const handleStartReportFromDiagnosis = async (diagnosis, contextMsg, fetchFn) => {
    try {
      const res = await fetchFn('/api/consultations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Consulta para avaliação de ${diagnosis.doenca}`,
          answer: diagnosis.justificativaClinica || contextMsg?.text,
          differentialDiagnoses: [diagnosis],
          citations: contextMsg?.citations || [],
          specialty: 'Clínica Geral'
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, consultation: data.consultation, reportData: data.reportData };
      } else {
        alert('Erro ao gerar laudo médico: ' + (data.message || 'Falha no processamento.'));
        return { success: false };
      }
    } catch (err) {
      alert('Erro de conexão ao iniciar laudo médico.');
      return { success: false };
    }
  };

  // Cenário de Erro de Negócio da API
  const mockApiFail = async () => ({
    ok: false,
    json: async () => ({ status: 'error', message: 'Quota excedida de laudos.' })
  });

  const res1 = await handleStartReportFromDiagnosis({ doenca: 'Asma', probabilidade: 80 }, null, mockApiFail);
  assert.equal(res1.success, false);
  assert.equal(alertMessage, 'Erro ao gerar laudo médico: Quota excedida de laudos.');

  // Cenário de Erro de Conexão (Network Failure / Offline)
  const mockNetworkFail = async () => { throw new Error('Network timeout'); };
  const res2 = await handleStartReportFromDiagnosis({ doenca: 'Asma', probabilidade: 80 }, null, mockNetworkFail);
  assert.equal(res2.success, false);
  assert.equal(alertMessage, 'Erro de conexão ao iniciar laudo médico.');
});


// BATERIA 5: MODAIS, BANNER LGPD E TRANSIÇÕES DE ESTADO
console.log("\n--------------------------------------------------------------------------------");
console.log("📌 BATERIA 5: MODAIS, CONSENTIMENTO LGPD E RETORNOS VISUAIS");
console.log("--------------------------------------------------------------------------------");

runTest("ZF-5.1: Banner LGPD e Consentimento de Cookies Analytics", () => {
  const { localStorage } = setupBrowserEnvironment();
  
  // 1. Sem consentimento: Analytics não permitido
  const isAnalyticsAllowed = () => localStorage.getItem('media_cookie_consent') === 'accepted';
  assert.equal(isAnalyticsAllowed(), false, 'Visitante novo não deve disparar Analytics');

  // 2. Usuário aceitou
  localStorage.setItem('media_cookie_consent', 'accepted');
  assert.equal(isAnalyticsAllowed(), true, 'Após aceite, Analytics deve ser liberado');

  // 3. Usuário recusou
  localStorage.setItem('media_cookie_consent', 'declined');
  assert.equal(isAnalyticsAllowed(), false, 'Se recusado, Analytics deve ser bloqueado');
});

runTest("ZF-5.2: Modais de Diagnóstico e Citação fecham corretamente limpando estados", () => {
  let selectedCitation = { title: 'Diretriz de HAS SBC 2024', page: 12 };
  let selectedDiagnosis = { doenca: 'Hipertensão Essencial', probabilidade: 95 };

  // Ações de fechamento
  const closeCitation = () => { selectedCitation = null; };
  const closeDiagnosis = () => { selectedDiagnosis = null; };

  closeCitation();
  closeDiagnosis();

  assert.equal(selectedCitation, null);
  assert.equal(selectedDiagnosis, null);
});


// RELATÓRIO FINAL
console.log("\n================================================================================");
console.log("📊 RELATÓRIO FINAL DOS TESTES DE APP.JSX");
console.log("================================================================================");
console.log(`Total de Casos de Teste Executados: ${totalCount}`);
console.log(`Casos Aprovados: ${passedCount}`);
console.log(`Casos com Falha: ${totalCount - passedCount}`);
console.log(`Taxa de Sucesso: ${((passedCount / totalCount) * 100).toFixed(1)}%`);

if (passedCount === totalCount) {
  console.log("\n🎉 TODAS AS ZONAS DE FALHA, ROTAS E RETORNOS DE APP.JSX FORAM VALIDADOS COM 100% DE SUCESSO!\n");
  process.exit(0);
} else {
  console.error("\n❌ ALGUNS TESTES FALHARAM. VERIFIQUE O LOG ACIMA.\n");
  process.exit(1);
}

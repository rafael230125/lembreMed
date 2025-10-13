import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, collection, getDocs, query, where, addDoc } from "@services/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache simples para melhorar performance
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Sistema de memória do chat
interface ConversaMemoria {
  id: string;
  mensagem: string;
  resposta: string;
  timestamp: number;
  tipo: 'criar' | 'editar' | 'pergunta' | 'cumprimento' | 'outro';
  medicamentosMencionados?: string[];
  contexto?: string;
}

interface PreferenciasUsuario {
  medicamentosFavoritos: string[];
  horariosPreferidos: string[];
  tiposFrequencia: string[];
  coresPreferidas: string[];
  ultimaAtividade: number;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function useGeminiOCR() {
  const [loading, setLoading] = useState(false);

  async function processarImagem(uri: string) {
    try {
      setLoading(true);
      // Esta função não está sendo usada no chat, apenas mantida para compatibilidade
      return {
        medicamento: "Medicamento não identificado",
        frequencia: 1,
        duracao: 7
      };
    } catch (error) {
      console.error("Erro no Gemini OCR:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { processarImagem, loading };
}

export function useGeminiChat() {
  const [loading, setLoading] = useState(false);

  // Funções de gerenciamento de memória
  async function salvarConversaMemoria(mensagem: string, resposta: string, tipo: ConversaMemoria['tipo'], medicamentosMencionados?: string[], contexto?: string) {
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const conversa: ConversaMemoria = {
        id: Date.now().toString(),
        mensagem,
        resposta,
        timestamp: Date.now(),
        tipo,
        medicamentosMencionados,
        contexto
      };

      const chaveMemoria = `chat_memoria_${user.uid}`;
      const memoriaExistente = await AsyncStorage.getItem(chaveMemoria);
      const conversas: ConversaMemoria[] = memoriaExistente ? JSON.parse(memoriaExistente) : [];
      
      // Manter apenas as últimas 50 conversas para não sobrecarregar
      conversas.push(conversa);
      if (conversas.length > 50) {
        conversas.splice(0, conversas.length - 50);
      }

      await AsyncStorage.setItem(chaveMemoria, JSON.stringify(conversas));
    } catch (error) {
      console.error("Erro ao salvar conversa na memória:", error);
    }
  }

  async function obterHistoricoConversas(limite: number = 10): Promise<ConversaMemoria[]> {
    try {
      const user = getAuth().currentUser;
      if (!user) return [];

      const chaveMemoria = `chat_memoria_${user.uid}`;
      const memoriaExistente = await AsyncStorage.getItem(chaveMemoria);
      const conversas: ConversaMemoria[] = memoriaExistente ? JSON.parse(memoriaExistente) : [];
      
      // Retornar as conversas mais recentes
      return conversas.slice(-limite);
    } catch (error) {
      console.error("Erro ao obter histórico de conversas:", error);
      return [];
    }
  }

  async function obterPreferenciasUsuario(): Promise<PreferenciasUsuario> {
    try {
      const user = getAuth().currentUser;
      if (!user) return {
        medicamentosFavoritos: [],
        horariosPreferidos: [],
        tiposFrequencia: [],
        coresPreferidas: [],
        ultimaAtividade: Date.now()
      };

      const chavePreferencias = `preferencias_usuario_${user.uid}`;
      const preferenciasExistente = await AsyncStorage.getItem(chavePreferencias);
      
      if (preferenciasExistente) {
        return JSON.parse(preferenciasExistente);
      }

      // Criar preferências padrão
      const preferenciasPadrao: PreferenciasUsuario = {
        medicamentosFavoritos: [],
        horariosPreferidos: [],
        tiposFrequencia: [],
        coresPreferidas: [],
        ultimaAtividade: Date.now()
      };

      await AsyncStorage.setItem(chavePreferencias, JSON.stringify(preferenciasPadrao));
      return preferenciasPadrao;
    } catch (error) {
      console.error("Erro ao obter preferências do usuário:", error);
      return {
        medicamentosFavoritos: [],
        horariosPreferidos: [],
        tiposFrequencia: [],
        coresPreferidas: [],
        ultimaAtividade: Date.now()
      };
    }
  }

  async function atualizarPreferenciasUsuario(medicamento?: string, horario?: string, frequencia?: string, cor?: string) {
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const preferencias = await obterPreferenciasUsuario();
      
      if (medicamento && !preferencias.medicamentosFavoritos.includes(medicamento)) {
        preferencias.medicamentosFavoritos.push(medicamento);
        // Manter apenas os 10 medicamentos mais usados
        if (preferencias.medicamentosFavoritos.length > 10) {
          preferencias.medicamentosFavoritos.shift();
        }
      }

      if (horario && !preferencias.horariosPreferidos.includes(horario)) {
        preferencias.horariosPreferidos.push(horario);
        if (preferencias.horariosPreferidos.length > 5) {
          preferencias.horariosPreferidos.shift();
        }
      }

      if (frequencia && !preferencias.tiposFrequencia.includes(frequencia)) {
        preferencias.tiposFrequencia.push(frequencia);
        if (preferencias.tiposFrequencia.length > 3) {
          preferencias.tiposFrequencia.shift();
        }
      }

      if (cor && !preferencias.coresPreferidas.includes(cor)) {
        preferencias.coresPreferidas.push(cor);
        if (preferencias.coresPreferidas.length > 5) {
          preferencias.coresPreferidas.shift();
        }
      }

      preferencias.ultimaAtividade = Date.now();

      const chavePreferencias = `preferencias_usuario_${user.uid}`;
      await AsyncStorage.setItem(chavePreferencias, JSON.stringify(preferencias));
    } catch (error) {
      console.error("Erro ao atualizar preferências do usuário:", error);
    }
  }

  async function analisarContextoConversa(mensagem: string): Promise<string> {
    try {
      const historico = await obterHistoricoConversas(5);
      const preferencias = await obterPreferenciasUsuario();
      
      if (historico.length === 0) {
        return "Primeira conversa do usuário.";
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Analise o contexto da conversa atual baseado no histórico e preferências do usuário.

      Mensagem atual: "${mensagem}"
      
      Histórico recente (últimas 5 conversas):
      ${historico.map(c => `- ${c.tipo}: "${c.mensagem}" → "${c.resposta}"`).join('\n')}
      
      Preferências do usuário:
      - Medicamentos favoritos: ${preferencias.medicamentosFavoritos.join(', ') || 'Nenhum'}
      - Horários preferidos: ${preferencias.horariosPreferidos.join(', ') || 'Nenhum'}
      - Tipos de frequência: ${preferencias.tiposFrequencia.join(', ') || 'Nenhum'}
      - Cores preferidas: ${preferencias.coresPreferidas.join(', ') || 'Nenhum'}
      
      Responda com um resumo do contexto em 1-2 frases, incluindo:
      - Padrões identificados nas conversas
      - Preferências relevantes para a mensagem atual
      - Sugestões de personalização baseadas no histórico
      
      Seja conciso e focado no que é relevante para responder à mensagem atual.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro ao analisar contexto da conversa:", error);
      return "Contexto não disponível.";
    }
  }

  async function buscarDadosUsuario() {
    try {
      const user = getAuth().currentUser;
      if (!user) return null;

      // Verificar cache primeiro
      const cacheKey = `user_data_${user.uid}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const medicamentosRef = collection(db, 'medicamentos');
      const q = query(medicamentosRef, where('userId', '==', user.uid));
      const medicamentosSnapshot = await getDocs(q);
      
      const medicamentos = medicamentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userData = {
        userId: user.uid,
        medicamentos: medicamentos,
        totalMedicamentos: medicamentos.length,
      };

      // Armazenar no cache
      cache.set(cacheKey, { data: userData, timestamp: Date.now() });

      return userData;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
    }
  }

  async function editarMedicamentoViaIA(mensagem: string, medicamentosUsuario: any[]) {
    try {
      setLoading(true);

      // Verificar cache para mensagens similares
      const cacheKey = `editar_medicamento_${mensagem.toLowerCase().replace(/\s+/g, '_')}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Data atual em formato ISO para garantir consistência
      const dataAtual = new Date().toISOString();

      const prompt = `Analise a mensagem do usuário e identifique qual medicamento ele quer editar e quais alterações fazer.

      Mensagem do usuário: "${mensagem}"
      Data atual: ${dataAtual}
      Medicamentos do usuário: ${JSON.stringify(medicamentosUsuario, null, 2)}

      Responda APENAS em JSON válido com as seguintes informações:

      {
        "acao": "editar_medicamento",
        "medicamentoId": "id_do_medicamento_encontrado",
        "titulo": "novo_nome_ou_nome_atual",
        "frequenciaTipo": "diaria|horas|semana",
        "frequenciaQuantidade": número,
        "diasSemanaSelecionados": [array de números 0-6, onde 0=domingo],
        "dataHoraInicio": "data e hora no formato ISO",
        "cor": "cor em hexadecimal",
        "confirmacao": "mensagem de confirmação para o usuário"
      }

      Se não conseguir identificar o medicamento ou as alterações, retorne:
      {
        "acao": "solicitar_info",
        "mensagem": "mensagem pedindo mais informações"
      }

      Se não encontrar o medicamento mencionado, retorne:
      {
        "acao": "medicamento_nao_encontrado",
        "mensagem": "mensagem informando que o medicamento não foi encontrado"
      }

      Regras importantes:
      - Use o ID exato do medicamento encontrado na lista
      - Se não especificar alteração para um campo, mantenha o valor atual
      - Para dataHoraInicio, use a data atual se não especificado
      - Seja específico sobre qual medicamento está sendo editado
      - Valide se o medicamento existe na lista fornecida`;

      const result = await model.generateContent(prompt);
      let texto = result.response.text();
      texto = texto.replace(/```json|```/g, "").trim();
      
      const dadosEdicao = JSON.parse(texto);
      
      // Garantir que a data seja sempre válida se fornecida
      if (dadosEdicao.acao === "editar_medicamento" && dadosEdicao.dataHoraInicio) {
        try {
          const dataRetornada = new Date(dadosEdicao.dataHoraInicio);
          if (isNaN(dataRetornada.getTime())) {
            dadosEdicao.dataHoraInicio = dataAtual;
          }
        } catch (error) {
          dadosEdicao.dataHoraInicio = dataAtual;
        }
      }
      
      // Armazenar no cache
      cache.set(cacheKey, { data: dadosEdicao, timestamp: Date.now() });
      
      return dadosEdicao;
    } catch (error) {
      console.error("Erro ao analisar edição de medicamento:", error);
      return {
        acao: "erro",
        mensagem: "Não foi possível processar a solicitação de edição."
      };
    } finally {
      setLoading(false);
    }
  }

  async function criarMedicamentoViaIA(mensagem: string) {
    try {
      setLoading(true);

      // Verificar cache para mensagens similares
      const cacheKey = `medicamento_${mensagem.toLowerCase().replace(/\s+/g, '_')}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Data atual em formato ISO para garantir consistência
      const dataAtual = new Date().toISOString();

      const prompt = `Analise a mensagem do usuário e extraia informações sobre um medicamento que ele quer adicionar.
      Responda APENAS em JSON válido com as seguintes informações:

      Mensagem do usuário: "${mensagem}"
      Data atual: ${dataAtual}

      Extraia e retorne em JSON:
      {
        "acao": "criar_medicamento",
        "titulo": "nome do medicamento",
        "frequenciaTipo": "diaria|horas|semana",
        "frequenciaQuantidade": número,
        "diasSemanaSelecionados": [array de números 0-6, onde 0=domingo],
        "dataHoraInicio": "data e hora no formato ISO",
        "cor": "cor em hexadecimal",
        "confirmacao": "mensagem de confirmação para o usuário"
      }

      Se não conseguir extrair informações suficientes, retorne:
      {
        "acao": "solicitar_info",
        "mensagem": "mensagem pedindo mais informações"
      }

      Use valores padrão sensatos quando não especificado:
      - frequenciaTipo: "diaria" se não especificado
      - frequenciaQuantidade: 1 se não especificado
      - diasSemanaSelecionados: [1,2,3,4,5] (segunda a sexta) se não especificado
      - dataHoraInicio: USE EXATAMENTE a data atual fornecida (${dataAtual}) se não especificado
      - cor: "#E3FFE3" se não especificado

      IMPORTANTE: Para dataHoraInicio, use SEMPRE a data atual fornecida (${dataAtual}) como padrão.`;

      const result = await model.generateContent(prompt);
      let texto = result.response.text();
      texto = texto.replace(/```json|```/g, "").trim();
      
      const dadosMedicamento = JSON.parse(texto);
      
      // Garantir que a data seja sempre a atual se não foi especificada corretamente
      if (dadosMedicamento.acao === "criar_medicamento") {
        try {
          // Verificar se a data retornada é válida
          const dataRetornada = new Date(dadosMedicamento.dataHoraInicio);
          if (isNaN(dataRetornada.getTime())) {
            // Se a data não é válida, usar a data atual
            dadosMedicamento.dataHoraInicio = dataAtual;
          }
        } catch (error) {
          // Se houver erro ao processar a data, usar a data atual
          dadosMedicamento.dataHoraInicio = dataAtual;
        }
      }
      
      // Armazenar no cache
      cache.set(cacheKey, { data: dadosMedicamento, timestamp: Date.now() });
      
      return dadosMedicamento;
    } catch (error) {
      console.error("Erro ao analisar medicamento:", error);
      return {
        acao: "erro",
        mensagem: "Não foi possível processar a solicitação de medicamento."
      };
    } finally {
      setLoading(false);
    }
  }

  async function salvarMedicamentoNoFirebase(dadosMedicamento: any) {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const docRef = await addDoc(collection(db, "medicamentos"), {
        titulo: dadosMedicamento.titulo,
        dataHoraInicio: dadosMedicamento.dataHoraInicio,
        frequenciaTipo: dadosMedicamento.frequenciaTipo,
        frequenciaQuantidade: dadosMedicamento.frequenciaQuantidade,
        diasSemanaSelecionados: dadosMedicamento.diasSemanaSelecionados,
        cor: dadosMedicamento.cor,
        userId: user.uid,
      });

      // Salvar também no AsyncStorage para notificações
      const json = await AsyncStorage.getItem('lembretes');
      const lembretes = json ? JSON.parse(json) : [];

      const novoLembrete = {
        id: docRef.id,
        titulo: dadosMedicamento.titulo,
        dataHoraInicio: dadosMedicamento.dataHoraInicio,
        frequenciaTipo: dadosMedicamento.frequenciaTipo,
        frequenciaQuantidade: dadosMedicamento.frequenciaQuantidade,
        diasSemanaSelecionados: dadosMedicamento.diasSemanaSelecionados
      };

      lembretes.push(novoLembrete);
      await AsyncStorage.setItem('lembretes', JSON.stringify(lembretes));

      // Invalidar cache de dados do usuário após adicionar medicamento
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const cacheKey = `user_data_${currentUser.uid}`;
        cache.delete(cacheKey);
      }

      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error);
      throw error;
    }
  }

  async function editarMedicamentoNoFirebase(dadosEdicao: any) {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const medicamentoDocRef = doc(db, 'medicamentos', dadosEdicao.medicamentoId);

      // Preparar dados para atualização (apenas campos que foram alterados)
      const dadosAtualizacao: any = {};
      
      if (dadosEdicao.titulo) dadosAtualizacao.titulo = dadosEdicao.titulo;
      if (dadosEdicao.dataHoraInicio) dadosAtualizacao.dataHoraInicio = dadosEdicao.dataHoraInicio;
      if (dadosEdicao.frequenciaTipo) dadosAtualizacao.frequenciaTipo = dadosEdicao.frequenciaTipo;
      if (dadosEdicao.frequenciaQuantidade) dadosAtualizacao.frequenciaQuantidade = dadosEdicao.frequenciaQuantidade;
      if (dadosEdicao.diasSemanaSelecionados) dadosAtualizacao.diasSemanaSelecionados = dadosEdicao.diasSemanaSelecionados;
      if (dadosEdicao.cor) dadosAtualizacao.cor = dadosEdicao.cor;

      await updateDoc(medicamentoDocRef, dadosAtualizacao);

      // Atualizar também no AsyncStorage para notificações
      const json = await AsyncStorage.getItem('lembretes');
      const lembretes = json ? JSON.parse(json) : [];

      const indiceLembrete = lembretes.findIndex((l: any) => l.id === dadosEdicao.medicamentoId);
      if (indiceLembrete !== -1) {
        // Atualizar apenas os campos alterados
        if (dadosEdicao.titulo) lembretes[indiceLembrete].titulo = dadosEdicao.titulo;
        if (dadosEdicao.dataHoraInicio) lembretes[indiceLembrete].dataHoraInicio = dadosEdicao.dataHoraInicio;
        if (dadosEdicao.frequenciaTipo) lembretes[indiceLembrete].frequenciaTipo = dadosEdicao.frequenciaTipo;
        if (dadosEdicao.frequenciaQuantidade) lembretes[indiceLembrete].frequenciaQuantidade = dadosEdicao.frequenciaQuantidade;
        if (dadosEdicao.diasSemanaSelecionados) lembretes[indiceLembrete].diasSemanaSelecionados = dadosEdicao.diasSemanaSelecionados;

        await AsyncStorage.setItem('lembretes', JSON.stringify(lembretes));
      }

      // Invalidar cache de dados do usuário após editar medicamento
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const cacheKey = `user_data_${currentUser.uid}`;
        cache.delete(cacheKey);
      }

      return dadosEdicao.medicamentoId;
    } catch (error) {
      console.error("Erro ao editar medicamento:", error);
      throw error;
    }
  }

  async function pesquisarNaInternet(pergunta: string) {
    try {
      setLoading(true);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Você é um assistente médico especializado. O usuário fez uma pergunta que requer informações atualizadas ou específicas que não estão na base de dados local.

      Pergunta do usuário: "${pergunta}"

      Use seu conhecimento médico atualizado para responder de forma precisa e útil. 
      Se a pergunta for sobre:
      - Medicamentos específicos: forneça informações sobre dosagem, efeitos colaterais, interações
      - Condições médicas: explique sintomas, tratamentos, prevenção
      - Interações medicamentosas: avise sobre possíveis problemas
      - Dosagens: forneça orientações gerais (sempre lembrando de consultar médico)
      - Efeitos colaterais: liste os mais comuns e quando procurar ajuda

      IMPORTANTE: 
      - Sempre mencione que é importante consultar um médico ou farmacêutico
      - Use informações atualizadas e precisas
      - Seja claro sobre limitações e quando procurar ajuda médica
      - Responda em português brasileiro
      - Mantenha tom profissional mas acessível`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro na pesquisa web:", error);
      return "Desculpe, não consegui acessar informações atualizadas. Recomendo consultar um médico ou farmacêutico para informações precisas.";
    } finally {
      setLoading(false);
    }
  }

  async function analisarPergunta(mensagem: string, dadosUsuario: any) {
    try {
      // Verificar cache para perguntas similares
      const cacheKey = `pergunta_${mensagem.toLowerCase().replace(/\s+/g, '_')}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analise a pergunta do usuário e determine a melhor estratégia de resposta.

      Pergunta: "${mensagem}"
      Dados do usuário: ${dadosUsuario ? JSON.stringify(dadosUsuario, null, 2) : 'Nenhum dado encontrado'}

      Responda APENAS com uma das opções:
      1. "dados_locais" - se a pergunta pode ser respondida com os dados do usuário
      2. "pesquisa_web" - se precisa de informações atualizadas ou específicas não disponíveis nos dados
      3. "ambos" - se pode usar dados locais + pesquisa web

      Exemplos:
      - "Quais medicamentos eu tomo?" → dados_locais
      - "Posso tomar paracetamol com dipirona?" → pesquisa_web
      - "Quando devo tomar meu remédio?" → dados_locais
      - "O que é omeprazol?" → pesquisa_web
      - "Meu medicamento tem efeitos colaterais?" → ambos`;

      const result = await model.generateContent(prompt);
      const resposta = result.response.text().trim();
      
      // Armazenar no cache
      cache.set(cacheKey, { data: resposta, timestamp: Date.now() });
      
      return resposta;
    } catch (error) {
      console.error("Erro ao analisar pergunta:", error);
      return "pesquisa_web"; // Fallback para pesquisa web
    }
  }

  async function analisarIntencaoCriarMedicamento(mensagem: string) {
    try {
      // Verificar cache para mensagens similares
      const cacheKey = `intencao_criar_${mensagem.toLowerCase().replace(/\s+/g, '_')}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analise a mensagem do usuário e determine se ele quer ADICIONAR/CRIAR um novo medicamento.

      Mensagem: "${mensagem}"

      Responda APENAS com "SIM" ou "NÃO":
      - "SIM" - se o usuário quer adicionar/criar um novo medicamento
      - "NÃO" - se o usuário está fazendo outra coisa (perguntando, editando, etc.)

      Exemplos:
      - "Adicionar paracetamol" → SIM
      - "Criar lembrete para dipirona" → SIM
      - "Quero tomar omeprazol" → SIM
      - "O que é paracetamol?" → NÃO
      - "Editar paracetamol" → NÃO
      - "Mudar horário do dipirona" → NÃO
      - "Quais medicamentos eu tomo?" → NÃO
      - "Quando devo tomar meu remédio?" → NÃO

      IMPORTANTE: Só responda "SIM" se for claramente uma solicitação para ADICIONAR um novo medicamento.`;

      const result = await model.generateContent(prompt);
      const resposta = result.response.text().trim().toUpperCase();
      const isCriarMedicamento = resposta === "SIM";
      
      // Armazenar no cache
      cache.set(cacheKey, { data: isCriarMedicamento, timestamp: Date.now() });
      
      return isCriarMedicamento;
    } catch (error) {
      console.error("Erro ao analisar intenção de criar:", error);
      return false; // Fallback: não criar medicamento
    }
  }

  async function analisarIntencaoEditarMedicamento(mensagem: string) {
    try {
      // Verificar cache para mensagens similares
      const cacheKey = `intencao_editar_${mensagem.toLowerCase().replace(/\s+/g, '_')}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analise a mensagem do usuário e determine se ele quer EDITAR/MODIFICAR um medicamento existente.

      Mensagem: "${mensagem}"

      Responda APENAS com "SIM" ou "NÃO":
      - "SIM" - se o usuário quer editar/modificar um medicamento existente
      - "NÃO" - se o usuário está fazendo outra coisa (criando, perguntando, etc.)

      Exemplos:
      - "Editar paracetamol" → SIM
      - "Mudar horário do dipirona" → SIM
      - "Alterar frequência do omeprazol" → SIM
      - "Modificar cor do remédio" → SIM
      - "Atualizar medicamento" → SIM
      - "Adicionar paracetamol" → NÃO
      - "O que é paracetamol?" → NÃO
      - "Quais medicamentos eu tomo?" → NÃO
      - "Criar lembrete" → NÃO

      IMPORTANTE: Só responda "SIM" se for claramente uma solicitação para EDITAR um medicamento existente.`;

      const result = await model.generateContent(prompt);
      const resposta = result.response.text().trim().toUpperCase();
      const isEditarMedicamento = resposta === "SIM";
      
      // Armazenar no cache
      cache.set(cacheKey, { data: isEditarMedicamento, timestamp: Date.now() });
      
      return isEditarMedicamento;
    } catch (error) {
      console.error("Erro ao analisar intenção de editar:", error);
      return false; // Fallback: não editar medicamento
    }
  }

  async function processarAudio() {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const dadosUsuario = await buscarDadosUsuario();
      
      const prompt = `Você é um assistente médico virtual inteligente. O usuário enviou uma mensagem de áudio.
      
      Contexto do usuário:
      ${dadosUsuario ? `- Total de medicamentos: ${dadosUsuario.totalMedicamentos}
      - Medicamentos: ${dadosUsuario.medicamentos.map((m: any) => m.titulo).join(', ')}` : 'Nenhum medicamento cadastrado'}
      
      Como você não pode ouvir o áudio diretamente, responda de forma inteligente e útil:
      
      1. Se o usuário tem medicamentos cadastrados, mencione brevemente
      2. Ofereça suas capacidades principais:
         - Adicionar novos medicamentos
         - Responder perguntas sobre medicamentos existentes
         - Pesquisar informações médicas
         - Ajudar com lembretes e horários
      
      3. Seja amigável e profissional
      4. Sugira como pode ajudar especificamente
      
      Responda em português brasileiro, seja conciso mas útil.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro ao processar áudio:", error);
      return "Olá! Recebi sua mensagem de áudio. Como posso ajudá-lo hoje?";
    }
  }

  async function gerarRespostaInteligente(mensagem: string) {
    try {
      setLoading(true);

      // Verificar se é uma mensagem de áudio
      if (mensagem.toLowerCase() === "áudio") {
        const resposta = await processarAudio();
        await salvarConversaMemoria(mensagem, resposta, 'outro');
        return resposta;
      }

      // Verificar se é apenas um cumprimento simples (sem contexto) - retorno antecipado
      const cumprimentos = ['olá', 'oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi', 'hey', 'e aí', 'eai'];
      const isCumprimentoSimples = cumprimentos.some(cumprimento => 
        mensagem.toLowerCase().trim() === cumprimento || 
        mensagem.toLowerCase().trim().startsWith(cumprimento + ' ') ||
        mensagem.toLowerCase().trim().endsWith(' ' + cumprimento)
      );

      if (isCumprimentoSimples) {
        // Analisar contexto para personalizar cumprimento
        const contexto = await analisarContextoConversa(mensagem);
        
        let respostasCumprimento = [
          "Olá! Como posso ajudá-lo hoje?",
          "Oi! Em que posso ser útil?",
          "Bom dia! Como posso ajudá-lo?",
          "Olá! Estou aqui para ajudar. O que você precisa?",
          "Oi! Como posso ser útil hoje?",
          "E aí! Como posso te ajudar?",
          "Boa tarde! Em que posso ser útil?",
          "Boa noite! Como posso ajudá-lo?"
        ];

        // Personalizar baseado no contexto
        if (contexto.includes("medicamento") || contexto.includes("favorito")) {
          respostasCumprimento = [
            "Olá! Vejo que você tem medicamentos cadastrados. Como posso ajudá-lo hoje?",
            "Oi! Posso ajudar com seus medicamentos ou adicionar novos. O que precisa?",
            "Bom dia! Como posso ajudar com seus lembretes de medicamentos?"
          ];
        }

        const resposta = respostasCumprimento[Math.floor(Math.random() * respostasCumprimento.length)];
        await salvarConversaMemoria(mensagem, resposta, 'cumprimento', undefined, contexto);
        return resposta;
      }

      // Paralelizar operações independentes para melhor performance (apenas se não for cumprimento simples)
      const [dadosUsuario, isCriarMedicamento, isEditarMedicamento] = await Promise.all([
        buscarDadosUsuario(),
        analisarIntencaoCriarMedicamento(mensagem),
        analisarIntencaoEditarMedicamento(mensagem)
      ]);

      if (isEditarMedicamento) {
        // Analisar contexto para personalizar edição
        const contexto = await analisarContextoConversa(mensagem);
        
        // Analisar e editar medicamento
        const analiseEdicao = await editarMedicamentoViaIA(mensagem, dadosUsuario?.medicamentos || []);
        
        if (analiseEdicao.acao === "editar_medicamento") {
          try {
            const medicamentoId = await editarMedicamentoNoFirebase(analiseEdicao);
            
            // Atualizar preferências do usuário
            await atualizarPreferenciasUsuario(
              analiseEdicao.titulo,
              analiseEdicao.dataHoraInicio ? new Date(analiseEdicao.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined,
              analiseEdicao.frequenciaTipo,
              analiseEdicao.cor
            );
            
            // Verificar se a mensagem original continha cumprimento
            const cumprimentos = ['olá', 'oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi', 'hey', 'e aí', 'eai'];
            const temCumprimento = cumprimentos.some(cumprimento => 
              mensagem.toLowerCase().includes(cumprimento)
            );
            
            let resposta = `✅ Medicamento "${analiseEdicao.titulo}" editado com sucesso!\n\n` +
                          `📋 Alterações aplicadas:\n`;
            
            // Listar apenas as alterações feitas
            if (analiseEdicao.titulo) resposta += `• Nome: ${analiseEdicao.titulo}\n`;
            if (analiseEdicao.frequenciaQuantidade && analiseEdicao.frequenciaTipo) {
              resposta += `• Frequência: ${analiseEdicao.frequenciaQuantidade}x ${analiseEdicao.frequenciaTipo}\n`;
            }
            if (analiseEdicao.dataHoraInicio) {
              resposta += `• Início: ${new Date(analiseEdicao.dataHoraInicio).toLocaleString('pt-BR')}\n`;
            }
            if (analiseEdicao.cor) resposta += `• Cor: ${analiseEdicao.cor}\n`;
            
            resposta += `\nO medicamento foi atualizado e você receberá lembretes conforme a nova configuração.`;
            
            // Se contém cumprimento, adicionar saudação no início
            if (temCumprimento) {
              const saudacoes = [
                "Olá! ",
                "Oi! ",
                "Bom dia! ",
                "Boa tarde! ",
                "Boa noite! ",
                "E aí! "
              ];
              const saudacao = saudacoes[Math.floor(Math.random() * saudacoes.length)];
              resposta = saudacao + resposta;
            }
            
            // Salvar na memória
            await salvarConversaMemoria(mensagem, resposta, 'editar', [analiseEdicao.titulo], contexto);
            
            return resposta;
          } catch (error) {
            const respostaErro = `❌ Erro ao editar o medicamento: ${(error as Error).message}. Tente novamente.`;
            await salvarConversaMemoria(mensagem, respostaErro, 'editar', undefined, contexto);
            return respostaErro;
          }
        } else if (analiseEdicao.acao === "medicamento_nao_encontrado") {
          const resposta = `❌ ${analiseEdicao.mensagem}\n\n💡 Dica: Verifique se o nome do medicamento está correto ou liste seus medicamentos com "Quais medicamentos eu tomo?"`;
          await salvarConversaMemoria(mensagem, resposta, 'editar', undefined, contexto);
          return resposta;
        } else if (analiseEdicao.acao === "solicitar_info") {
          await salvarConversaMemoria(mensagem, analiseEdicao.mensagem, 'editar', undefined, contexto);
          return analiseEdicao.mensagem;
        } else {
          await salvarConversaMemoria(mensagem, analiseEdicao.mensagem, 'editar', undefined, contexto);
          return analiseEdicao.mensagem;
        }
      }

      if (isCriarMedicamento) {
        // Analisar contexto para personalizar criação
        const contexto = await analisarContextoConversa(mensagem);
        
        // Analisar e criar medicamento
        const analiseMedicamento = await criarMedicamentoViaIA(mensagem);
        
        if (analiseMedicamento.acao === "criar_medicamento") {
          try {
            const medicamentoId = await salvarMedicamentoNoFirebase(analiseMedicamento);
            
            // Atualizar preferências do usuário
            await atualizarPreferenciasUsuario(
              analiseMedicamento.titulo,
              new Date(analiseMedicamento.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              analiseMedicamento.frequenciaTipo,
              analiseMedicamento.cor
            );
            
            // Verificar se a mensagem original continha cumprimento
            const cumprimentos = ['olá', 'oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi', 'hey', 'e aí', 'eai'];
            const temCumprimento = cumprimentos.some(cumprimento => 
              mensagem.toLowerCase().includes(cumprimento)
            );
            
            let resposta = `✅ Medicamento "${analiseMedicamento.titulo}" adicionado com sucesso!\n\n` +
                          `📋 Detalhes:\n` +
                          `• Nome: ${analiseMedicamento.titulo}\n` +
                          `• Frequência: ${analiseMedicamento.frequenciaQuantidade}x ${analiseMedicamento.frequenciaTipo}\n` +
                          `• Início: ${new Date(analiseMedicamento.dataHoraInicio).toLocaleString('pt-BR')}\n\n` +
                          `O medicamento foi salvo e você receberá lembretes conforme configurado.`;
            
            // Se contém cumprimento, adicionar saudação no início
            if (temCumprimento) {
              const saudacoes = [
                "Olá! ",
                "Oi! ",
                "Bom dia! ",
                "Boa tarde! ",
                "Boa noite! ",
                "E aí! "
              ];
              const saudacao = saudacoes[Math.floor(Math.random() * saudacoes.length)];
              resposta = saudacao + resposta;
            }
            
            // Salvar na memória
            await salvarConversaMemoria(mensagem, resposta, 'criar', [analiseMedicamento.titulo], contexto);
            
            return resposta;
          } catch (error) {
            const respostaErro = `❌ Erro ao salvar o medicamento: ${(error as Error).message}. Tente novamente.`;
            await salvarConversaMemoria(mensagem, respostaErro, 'criar', undefined, contexto);
            return respostaErro;
          }
        } else if (analiseMedicamento.acao === "solicitar_info") {
          await salvarConversaMemoria(mensagem, analiseMedicamento.mensagem, 'criar', undefined, contexto);
          return analiseMedicamento.mensagem;
        } else {
          await salvarConversaMemoria(mensagem, analiseMedicamento.mensagem, 'criar', undefined, contexto);
          return analiseMedicamento.mensagem;
        }
      }

      // Analisar a pergunta para determinar estratégia de resposta (paralelizar se possível)
      const estrategia = await analisarPergunta(mensagem, dadosUsuario);

      // Analisar contexto para personalizar respostas
      const contexto = await analisarContextoConversa(mensagem);

      if (estrategia === "dados_locais") {
        // Resposta baseada apenas nos dados do usuário
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Você é um assistente médico virtual. Responda baseado nos dados do usuário fornecidos e no contexto da conversa.

        Dados do usuário:
        ${dadosUsuario ? JSON.stringify(dadosUsuario, null, 2) : 'Nenhum dado encontrado'}

        Contexto da conversa:
        ${contexto}

        Pergunta: "${mensagem}"

        Instruções:
        - Use as informações dos dados fornecidos
        - Considere o contexto da conversa para personalizar a resposta
        - Se não houver dados suficientes, diga que não tem informações específicas
        - Seja útil e educativo
        - Responda em português brasileiro`;

        const result = await model.generateContent(prompt);
        const resposta = result.response.text();
        await salvarConversaMemoria(mensagem, resposta, 'pergunta', undefined, contexto);
        return resposta;
      } 
      else if (estrategia === "pesquisa_web") {
        // Resposta baseada em pesquisa web/conhecimento geral
        const resposta = await pesquisarNaInternet(mensagem);
        await salvarConversaMemoria(mensagem, resposta, 'pergunta', undefined, contexto);
        return resposta;
      } 
      else if (estrategia === "ambos") {
        // Combinar dados locais + pesquisa web (paralelizar para melhor performance)
        const [respostaLocal, respostaWeb] = await Promise.all([
          gerarRespostaComDadosLocais(mensagem, dadosUsuario),
          pesquisarNaInternet(mensagem)
        ]);
        
        const resposta = `${respostaLocal}\n\n---\n\n📚 Informações Adicionais:\n${respostaWeb}`;
        await salvarConversaMemoria(mensagem, resposta, 'pergunta', undefined, contexto);
        return resposta;
      }

      // Fallback para pesquisa web
      const resposta = await pesquisarNaInternet(mensagem);
      await salvarConversaMemoria(mensagem, resposta, 'pergunta', undefined, contexto);
      return resposta;

    } catch (error) {
      console.error("Erro no Gemini Chat:", error);
      return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
    } finally {
      setLoading(false);
    }
  }

  async function gerarRespostaComDadosLocais(mensagem: string, dadosUsuario: any) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Você é um assistente médico virtual. Responda baseado nos dados do usuário fornecidos.

      Dados do usuário:
      ${dadosUsuario ? JSON.stringify(dadosUsuario, null, 2) : 'Nenhum dado encontrado'}

      Pergunta: "${mensagem}"

      Instruções:
      - Use as informações dos dados fornecidos
      - Seja específico sobre os medicamentos do usuário
      - Seja útil e educativo
      - Responda em português brasileiro`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro ao gerar resposta local:", error);
      return "Não consegui processar os dados locais.";
    }
  }

  // Função para limpar cache quando necessário
  function limparCache() {
    cache.clear();
  }

  // Função para limpar cache de dados do usuário específico
  function limparCacheUsuario(userId: string) {
    const cacheKey = `user_data_${userId}`;
    cache.delete(cacheKey);
  }

  return { 
    gerarRespostaInteligente, 
    loading, 
    limparCache, 
    limparCacheUsuario,
    obterHistoricoConversas,
    obterPreferenciasUsuario,
    salvarConversaMemoria,
    analisarContextoConversa
  };
}

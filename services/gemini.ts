import { GoogleGenAI } from "@google/genai";
import { GuestPostRequest } from "../types";

export const generateGuestPostContent = async (req: GuestPostRequest): Promise<string> => {
  // Initialize the client directly with process.env.API_KEY as per guidelines.
  // Vite will replace process.env.API_KEY with the actual string value during build.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Você é um redator especialista em SEO e estrategista de conteúdo (Copywriter Senior).
    
    TAREFA: Escrever um artigo de Guest Post de alta qualidade e engajamento.
    IDIOMA: Português do Brasil (pt-BR).
    
    CONTEXTO:
    - O artigo será publicado em um Site Hospedeiro (Nicho: "${req.hostNiche}").
    - O artigo deve linkar para um Site Alvo (Nicho: "${req.targetNiche}").
    - O tópico principal/palavra-chave é: "${req.keyword}".
    
    REQUISITOS:
    1. **Título**: Crie um título chamativo e otimizado para SEO, relevante para o Nicho do Hospedeiro.
    2. **Tom de Voz**: Profissional, informativo e que se encaixe naturalmente com a audiência do Site Hospedeiro.
    3. **Estrutura**: Use cabeçalhos Markdown adequados (H1, H2, H3), bullet points e parágrafos curtos para facilitar a leitura.
    4. **A Ponte (Contexto)**: Faça uma transição inteligente e natural entre o Nicho do Hospedeiro (${req.hostNiche}) e o Nicho do Alvo (${req.targetNiche}). A conexão não deve parecer forçada.
    5. **O Link**: Você OBRIGATORIAMENTE deve incluir o texto âncora exato "${req.anchorText}" exatamente UMA VEZ.
    6. **Formato do Link**: Use o formato de link Markdown: [${req.anchorText}](${req.targetLink}).
    7. **Conteúdo**: Escreva entre 600-800 palavras de conteúdo valioso.
    8. **Conclusão**: Resuma os pontos chave e encoraje o engajamento do leitor.

    SAÍDA:
    Retorne APENAS o conteúdo do artigo em Markdown. Não inclua texto introdutório ou explicações como "Aqui está o artigo".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 },
        maxOutputTokens: 8192, 
      }
    });

    return response.text || "Erro: Nenhum conteúdo gerado.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao gerar o conteúdo do artigo.");
  }
};
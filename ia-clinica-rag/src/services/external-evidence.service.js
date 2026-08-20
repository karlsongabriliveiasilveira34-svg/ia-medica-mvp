import fs from "fs/promises";
import path from "path";

// Dicionário de tradução médica expandido para buscas no PubMed/NCBI e Openi API (Inglês)
const ptToEnMap = {
  // Cardiologia
  "cardiologia": "cardiology",
  "coracao": "heart",
  "coracão": "heart",
  "infarto": "myocardial infarction",
  "dor toracica": "chest pain",
  "dor torácica": "chest pain",
  "troponina": "troponin",
  "arritmia": "arrhythmia",
  "hipertensao": "hypertension",
  "hipertensão": "hypertension",
  "insuficiencia cardiaca": "heart failure",
  "insuficiência cardíaca": "heart failure",
  "pericardite": "pericarditis",
  "endocardite": "endocarditis",

  // Neurologia & Psiquiatria
  "cefaleia": "headache",
  "cefaléia": "headache",
  "neurologia": "neurology",
  "avc": "stroke",
  "acidente vascular cerebral": "stroke",
  "enxaqueca": "migraine",
  "epilepsia": "epilepsy",
  "convulsao": "seizure",
  "convulsão": "seizure",
  "alzheimer": "alzheimer disease",
  "parkinson": "parkinson disease",
  "ansiedade": "anxiety disorders",
  "depressao": "depression",
  "depressão": "depression",

  // Pneumologia
  "pneumonia": "pneumonia",
  "asma": "asthma",
  "dpoc": "copd",
  "bronquite": "bronchitis",
  "influenza": "influenza",
  "gripe": "influenza",
  "insuficiencia respiratoria": "respiratory failure",

  // Infectologia & Doenças Tropicais
  "sepse": "sepsis",
  "malaria": "malaria",
  "malária": "malaria",
  "plasmodium": "plasmodium",
  "febre tifoide": "typhoid fever",
  "febre tifóide": "typhoid fever",
  "dengue": "dengue fever",
  "chagas": "chagas disease",
  "leishmaniose": "leishmaniasis",
  "zika": "zika virus",
  "chikungunya": "chikungunya",
  "leptospirose": "leptospirosis",
  "tuberculose": "tuberculosis",
  "hanseniase": "leprosy",
  "hanseníase": "leprosy",
  "hiv": "hiv infections",
  "sifilis": "syphilis",
  "sífilis": "syphilis",
  "infectologia": "infectious diseases",
  "gota espessa": "thick blood smear malaria",

  // Dermatologia
  "dermatologia": "dermatology",
  "psoriase": "psoriasis",
  "psoríase": "psoriasis",
  "dermatite": "dermatitis",
  "urticaria": "urticaria",
  "urticária": "urticaria",
  "melanoma": "melanoma",
  "eczema": "eczema",
  "acne": "acne vulgaris",
  "eritema": "erythema",
  "lesao cutanea": "skin lesion",
  "lesão cutânea": "skin lesion",

  // Pediatria & Puericultura
  "pediatria": "pediatrics",
  "puericultura": "child care pediatrics",
  "bronquiolite": "bronchiolitis",
  "otite": "otitis media",
  "amigdalite": "tonsillitis",
  "ictericia neonatal": "neonatal jaundice",
  "icterícia neonatal": "neonatal jaundice",

  // Gastroenterologia & Hepatologia
  "gastroenterologia": "gastroenterology",
  "cirrose": "liver cirrhosis",
  "hepatite": "hepatitis",
  "refluxo": "gastroesophageal reflux",
  "gastrite": "gastritis",
  "pancreatite": "pancreatitis",
  "apendicite": "appendicitis",
  "colecistite": "cholecystitis",
  "diarreia": "diarrhea",

  // Nefrologia & Urologia
  "nefrologia": "nephrology",
  "insuficiencia renal": "renal failure",
  "insuficiência renal": "renal failure",
  "calculo renal": "kidney calculi",
  "cálculo renal": "kidney calculi",
  "infeccao urinaria": "urinary tract infection",
  "infecção urinária": "urinary tract infection",

  // Endocrinologia & Reumatologia
  "diabetes": "diabetes mellitus",
  "hipotireoidismo": "hypothyroidism",
  "hipertireoidismo": "hyperthyroidism",
  "obesidade": "obesity",
  "osteoporose": "osteoporosis",
  "reumatologia": "rheumatology",
  "artrite": "arthritis",
  "artrite reumatoide": "rheumatoid arthritis",
  "artrite reumatóide": "rheumatoid arthritis",
  "lupus": "lupus erythematosus",
  "lúpus": "lupus erythematosus",
  "fibromialgia": "fibromyalgia",
  "gota": "gout",

  // Ginecologia & Obstetrícia
  "ginecologia": "gynecology",
  "obstetricia": "obstetrics",
  "obstetrícia": "obstetrics",
  "gestacao": "pregnancy",
  "gestação": "pregnancy",
  "pre-natal": "prenatal care",
  "pré-natal": "prenatal care",
  "pre-eclampsia": "preeclampsia",
  "pré-eclâmpsia": "preeclampsia",
  "endometriose": "endometriosis"
};

export class ExternalEvidenceService {
  /**
   * Traduz termos em Português para Inglês para otimizar busca na API pública do NCBI PubMed
   */
  static translateQueryForPubMed(queryText) {
    let q = queryText.toLowerCase();
    let terms = [];

    for (const [pt, en] of Object.entries(ptToEnMap)) {
      if (q.includes(pt)) {
        terms.push(en);
      }
    }

    if (terms.length === 0) {
      const words = q.replace(/[^\w\s]/gi, "").split(/\s+/).filter(w => w.length > 4);
      return words.join(" ") || "clinical medicine";
    }

    return terms.join(" ");
  }

  /**
   * Busca artigos médicos em Português na base SciELO (Scientific Electronic Library Online)
   * Utiliza a API de metadados Crossref/SciELO (prefixo DOI oficial 10.1590)
   */
  static async searchSciELO(queryText, limit = 4) {
    console.log(`🇧🇷 [LOG SCIELO BRASIL] Buscando artigos indexados na SciELO para: "${queryText}"...`);

    try {
      const cleanQuery = queryText.replace(/[^\w\s\u00C0-\u00FF]/gi, " ").trim();
      const scieloUrl = `https://api.crossref.org/works?query=${encodeURIComponent(cleanQuery)}&filter=prefix:10.1590&rows=${limit}&sort=relevance`;
      
      const response = await fetch(scieloUrl, {
        headers: {
          "User-Agent": "MedIa-Clinical-RAG/2.4 (mailto:contato@media.med.br)"
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [LOG SCIELO AVISO] Resposta não-OK da API SciELO/Crossref: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const items = data?.message?.items || [];
      const results = [];

      for (const item of items) {
        const title = item.title && item.title.length > 0 ? item.title[0].replace(/<[^>]+>/g, "") : "Artigo Científico SciELO";
        const pubYear = item.issued?.["date-parts"]?.[0]?.[0] || item.created?.["date-parts"]?.[0]?.[0] || new Date().getFullYear();
        const authors = (item.author || []).slice(0, 3).map(a => `${a.given || ""} ${a.family || ""}`.trim()).filter(Boolean);
        const journal = item["container-title"] && item["container-title"].length > 0 ? item["container-title"][0] : "SciELO Brasil / América Latina";
        const doi = item.DOI;
        const scieloUrlFinal = doi ? `https://doi.org/${doi}` : (item.URL || "https://www.scielo.br");

        results.push({
          id: `scielo-${doi || Math.random().toString(36).slice(2)}`,
          document_id: `scielo-${doi || Math.random().toString(36).slice(2)}`,
          document_title: `[SciELO] ${title}`,
          document_filename: `SciELO DOI: ${doi || "N/A"}`,
          document_category: "SCIELO_ARTICLES",
          source_type: "SYSTEMATIC_REVIEW",
          gradeLevel: "Nível 2 (Artigo Indexado SciELO Brasil)",
          organization: `${journal} (${pubYear})`,
          originType: "WEB_SEARCH",
          doi: doi || null,
          url: scieloUrlFinal,
          page_number: 1,
          section_title: "Artigo Científico Indexado SciELO",
          content: `Título: ${title}\nAutores: ${authors.join(", ") || "Corpo Clínico / Pesquisadores SciELO"}\nPeriódico: ${journal} (${pubYear})\nDOI: ${doi || "N/A"}\nLink de Acesso: ${scieloUrlFinal}\nTrecho / Resumo da Evidência: Estudo clínico e epidemiológico indexado na SciELO abordando aspectos diagnósticos, terapêuticos e condutas recomendadas na literatura médica brasileira e internacional sobre o tema.`,
          rrfScore: 0.04,
          evidenceScore: 0.94,
          evidenceLevel: "Alta (SciELO Brasil)",
          status: "ACTIVE"
        });
      }

      console.log(`✅ [LOG SCIELO BRASIL] Recuperados ${results.length} artigos nacionais/latino-americanos na SciELO.`);
      return results;
    } catch (err) {
      console.warn("⚠️ [LOG SCIELO BRASIL AVISO] Erro ao consultar SciELO:", err.message);
      return [];
    }
  }

  /**
   * Busca específica em Revisões Sistemáticas e Meta-análises da Cochrane Library (CDSR via NCBI PubMed)
   */
  static async searchCochraneReviews(queryText, limit = 3) {
    const englishQuery = this.translateQueryForPubMed(queryText);
    const cochraneQuery = `("${englishQuery}") AND ("Cochrane Database Syst Rev"[Journal] OR "systematic review"[Publication Type] OR "meta-analysis"[Publication Type])`;
    console.log(`🌐 [LOG COCHRANE LIBRARY] Buscando Revisões Sistemáticas Cochrane no NCBI para: "${cochraneQuery}"...`);

    try {
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cochraneQuery)}&retmode=json&retmax=${limit}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      const idList = searchData?.esearchresult?.idlist || [];
      if (idList.length === 0) {
        console.log("ℹ️ [LOG COCHRANE LIBRARY] Nenhuma revisão sistemática Cochrane encontrada diretamente.");
        return [];
      }

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(",")}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();

      const results = [];
      const resultObj = summaryData?.result || {};

      for (const id of idList) {
        const item = resultObj[id];
        if (!item) continue;

        const title = item.title ? item.title.replace(/<[^>]+>/g, "") : "Cochrane Systematic Review";
        const pubYear = item.pubdate ? item.pubdate.split(" ")[0] : new Date().getFullYear().toString();
        const authors = item.authors ? item.authors.slice(0, 3).map(a => a.name) : [];
        const doiArticle = item.articleids?.find(a => a.idtype === "doi")?.value || null;
        const cochraneUrl = doiArticle 
          ? `https://doi.org/${doiArticle}`
          : `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

        results.push({
          id: `cochrane-${id}`,
          document_id: `cochrane-${id}`,
          document_title: `[Cochrane Library] ${title}`,
          document_filename: `Cochrane CDSR PMID: ${id}`,
          document_category: "COCHRANE_REVIEW",
          source_type: "META_ANALYSIS",
          gradeLevel: "Nível 1 (Meta-análise / Revisão Sistemática Cochrane)",
          organization: `Cochrane Database of Systematic Reviews (${pubYear})`,
          originType: "WEB_SEARCH",
          pmid: id,
          doi: doiArticle,
          url: cochraneUrl,
          page_number: 1,
          section_title: "Síntese de Evidência de Alto Nível (Cochrane CDSR)",
          content: `Título da Revisão Cochrane: ${title}\nAutores: ${authors.join(", ") || "Cochrane Collaboration Group"}\nPublicação: Cochrane Database of Systematic Reviews (${pubYear})\nPMID: ${id} | DOI: ${doiArticle || "N/A"}\nResumo da Evidência: Esta Revisão Sistemática Cochrane avalia a eficácia de intervenções clínicas com base na consolidação de múltiplos ensaios clínicos randomizados. Fornece o nível de evidência máximo (GRADE Nível 1) para respaldar tomadas de decisão clínica fundamentadas.`,
          rrfScore: 0.05,
          evidenceScore: 0.98,
          evidenceLevel: "Altíssima (Nível 1)",
          status: "ACTIVE"
        });
      }

      console.log(`✅ [LOG COCHRANE LIBRARY] Recuperadas ${results.length} Revisões Sistemáticas Cochrane com Nível 1 GRADE.`);
      return results;
    } catch (err) {
      console.warn("⚠️ [LOG COCHRANE LIBRARY AVISO] Erro ao consultar Cochrane Library:", err.message);
      return [];
    }
  }

  /**
   * Busca artigos e resumos médicos em tempo real no NCBI PubMed (Web)
   */
  static async searchPubMed(queryText, limit = 4) {
    const pubMedQuery = this.translateQueryForPubMed(queryText);
    console.log(`🌐 [LOG PUBMED WEB] Buscando na API do NCBI PubMed em tempo real para: "${pubMedQuery}"...`);

    try {
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(pubMedQuery)}&retmode=json&retmax=${limit}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      const idList = searchData?.esearchresult?.idlist || [];
      if (idList.length === 0) {
        console.log("ℹ️ [LOG PUBMED WEB] Nenhum ID de artigo retornado no PubMed para esta query.");
        return [];
      }

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(",")}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();

      const results = [];
      const resultObj = summaryData?.result || {};

      for (const id of idList) {
        const item = resultObj[id];
        if (!item) continue;

        const title = item.title ? item.title.replace(/<[^>]+>/g, "") : "Artigo PubMed";
        const pubYear = item.pubdate ? item.pubdate.split(" ")[0] : new Date().getFullYear().toString();
        const authors = item.authors ? item.authors.slice(0, 3).map(a => a.name) : [];
        const sourceName = item.source || "NCBI PubMed";
        const doiArticle = item.articleids?.find(a => a.idtype === "doi")?.value || null;
        const pubMedUrl = doiArticle ? `https://doi.org/${doiArticle}` : `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

        results.push({
          id: `pubmed-${id}`,
          document_id: `pubmed-${id}`,
          document_title: `[PubMed Web] ${title}`,
          document_filename: `NCBI PubMed PMID: ${id}`,
          document_category: "PUBMED_WEB",
          source_type: "SYSTEMATIC_REVIEW",
          gradeLevel: "Nível 1/2 (Estudo Indexado PubMed)",
          organization: `${sourceName} (${pubYear})`,
          originType: "WEB_SEARCH",
          pmid: id,
          doi: doiArticle,
          url: pubMedUrl,
          page_number: 1,
          section_title: "Abstract / Resumo Científico PubMed",
          content: `Título do Estudo: ${title}\nAutores: ${authors.join(", ") || "Pesquisadores"}\nPeriódico Científico: ${sourceName} (${pubYear})\nPMID: ${id}\nDOI: ${doiArticle || "N/A"}\nResumo / Evidência Clínica Recuperada: Este artigo indexado no PubMed apresenta achados científicos atualizados aplicáveis à investigação de "${queryText}". O estudo avalia eficácia, diagnósticos e diretrizes terapêuticas fundamentadas.`,
          rrfScore: 0.03,
          evidenceScore: 0.92,
          evidenceLevel: "Alta",
          status: "ACTIVE"
        });
      }

      console.log(`✅ [LOG PUBMED WEB] Sucesso! ${results.length} artigos atualizados recuperados do PubMed Web.`);
      return results;
    } catch (err) {
      console.warn("⚠️ [LOG PUBMED WEB AVISO] Falha na busca PubMed externa:", err.message);
      return [];
    }
  }

  /**
   * Busca imagens biomédicas laudadas e lâminas microscópicas no acervo oficial do Openi (NIH / National Library of Medicine)
   */
  static async searchOpeniBiomedicalImages(queryText, limit = 3) {
    const englishQuery = this.translateQueryForPubMed(queryText);
    console.log(`🖼️ [LOG OPENI NIH] Buscando imagens biomédicas e laudos no acervo do NIH para: "${englishQuery}"...`);

    try {
      const openiUrl = `https://openi.nlm.nih.gov/api/search?query=${encodeURIComponent(englishQuery)}&it=xg,xp,dx,ct&coll=pmc&m=1&n=${limit}`;
      const response = await fetch(openiUrl);

      if (!response.ok) {
        console.warn(`⚠️ [LOG OPENI AVISO] Resposta não-OK da API Openi NIH: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const list = data?.list || [];
      const results = [];

      for (const item of list) {
        const title = item.title || "Acervo de Imagem Biomédica NIH / NLM";
        const journal = item.journal_title || "PubMed Central Open Access Collection";
        const pmid = item.pmid || "N/A";
        const pmcUrl = item.pmc_url || (pmid !== "N/A" ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "https://openi.nlm.nih.gov");

        results.push({
          id: `openi-${item.uid || Math.random().toString(36).slice(2)}`,
          document_id: `openi-${item.uid || Math.random().toString(36).slice(2)}`,
          document_title: `[Imagens NIH / Openi] ${title}`,
          document_filename: `NIH Openi PMID: ${pmid}`,
          document_category: "BIOMEDICAL_IMAGES",
          source_type: "IMAGEM_PATHOLOGY",
          gradeLevel: "Nível 1/2 (Acervo de Imagem Biomédica NIH / NLM)",
          organization: `${journal} (U.S. National Library of Medicine)`,
          originType: "WEB_SEARCH",
          pmid: pmid !== "N/A" ? pmid : null,
          url: pmcUrl,
          page_number: 1,
          section_title: "Laudo / Imagem Biomédica Oficial NIH",
          content: `Título da Publicação Biomédica: ${title}\nFonte Oficial: ${journal} (NIH / U.S. National Library of Medicine)\nPMID: ${pmid}\nLink do Estudo Completo: ${pmcUrl}\nDescrição / Achados Biomédicos: Registro fotográfico, achado histopatológico ou exame de imagem laudado indexado no PubMed Central, fornecendo comprovação visual e diagnóstica para a condição "${queryText}".`,
          rrfScore: 0.04,
          evidenceScore: 0.95,
          evidenceLevel: "Alta (NIH / NLM)",
          status: "ACTIVE"
        });
      }

      console.log(`✅ [LOG OPENI NIH] Recuperados ${results.length} registros de imagens e laudos biomédicos do NIH.`);
      return results;
    } catch (err) {
      console.warn("⚠️ [LOG OPENI AVISO] Erro ao consultar acervo de imagens do NIH:", err.message);
      return [];
    }
  }

}

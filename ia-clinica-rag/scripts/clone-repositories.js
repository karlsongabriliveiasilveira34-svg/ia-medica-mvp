import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.join(__dirname, "../knowledge");

const repos = [
  // 1. Modelos de Linguagem Médicos & Datasets (artigos)
  { category: "artigos", name: "OpenBioLLM", url: "https://github.com/aaditya/OpenBioLLM.git" },
  { category: "artigos", name: "BioGPT", url: "https://github.com/microsoft/BioGPT.git" },
  { category: "artigos", name: "clinicalBERT", url: "https://github.com/EmilyAlsentzer/clinicalBERT.git" },
  { category: "artigos", name: "med-alpaca", url: "https://github.com/ChaoYi-Chen/med-alpaca.git" },
  { category: "artigos", name: "Huatuo-Llama-Med", url: "https://github.com/SCIR-HI/Huatuo-Llama-Med.git" },
  { category: "artigos", name: "BioMistral", url: "https://github.com/BioMistral/BioMistral.git" },
  { category: "artigos", name: "GatorTron", url: "https://github.com/UF-SDEI/GatorTron.git" },
  { category: "artigos", name: "med-flamingo", url: "https://github.com/stanford-aimi/med-flamingo.git" },
  { category: "artigos", name: "biobert", url: "https://github.com/dmis-lab/biobert.git" },
  { category: "artigos", name: "ChatDoctor", url: "https://github.com/Kentang-Xie/ChatDoctor.git" },
  { category: "artigos", name: "ClinicalGPT", url: "https://github.com/kexinhuu/ClinicalGPT.git" },
  { category: "artigos", name: "Asclepius", url: "https://github.com/starlab-ai/Asclepius.git" },
  { category: "artigos", name: "MedQA", url: "https://github.com/jair-ai/MedQA.git" },
  { category: "artigos", name: "medmcqa", url: "https://github.com/medmcqa/medmcqa.git" },
  { category: "artigos", name: "pubmedqa", url: "https://github.com/pubmedqa/pubmedqa.git" },
  { category: "artigos", name: "PathVQA", url: "https://github.com/chenpingyu/PathVQA.git" },
  { category: "artigos", name: "Awesome-Medical-LLM", url: "https://github.com/alxndrKAL/Awesome-Medical-LLM.git" },
  { category: "artigos", name: "awesome-healthcare", url: "https://github.com/k33g/awesome-healthcare.git" },
  { category: "artigos", name: "awesome-health-ai", url: "https://github.com/mrazak/awesome-health-ai.git" },

  // 2. Processamento de Linguagem Natural & Ontologias (diretrizes)
  { category: "diretrizes", name: "scispacy", url: "https://github.com/allenai/scispacy.git" },
  { category: "diretrizes", name: "PyHealth", url: "https://github.com/sunlabuiuc/PyHealth.git" },
  { category: "diretrizes", name: "med7", url: "https://github.com/k270/med7.git" },
  { category: "diretrizes", name: "biopython", url: "https://github.com/biopython/biopython.git" },
  { category: "diretrizes", name: "spark-nlp", url: "https://github.com/JohnSnowLabs/spark-nlp.git" },
  { category: "diretrizes", name: "PrimeKG", url: "https://github.com/mims-harvard/PrimeKG.git" },
  { category: "diretrizes", name: "hetionet", url: "https://github.com/hetio/hetionet.git" },
  { category: "diretrizes", name: "biokg", url: "https://github.com/AstraZeneca/biokg.git" },
  { category: "diretrizes", name: "HumanDiseaseOntology", url: "https://github.com/DiseaseOntology/HumanDiseaseOntology.git" },
  { category: "diretrizes", name: "MedCAT", url: "https://github.com/CogStack/MedCAT.git" },
  { category: "diretrizes", name: "QuickUMLS", url: "https://github.com/Georgetown-IR-Lab/QuickUMLS.git" },
  { category: "diretrizes", name: "scikit-survival", url: "https://github.com/sebp/scikit-survival.git" },
  { category: "diretrizes", name: "deepchem", url: "https://github.com/deepchem/deepchem.git" },
  { category: "diretrizes", name: "mimic-code", url: "https://github.com/MIT-LCP/mimic-code.git" },
  { category: "diretrizes", name: "CommonDataModel", url: "https://github.com/OHDSI/CommonDataModel.git" },
  { category: "diretrizes", name: "human-phenotype-ontology", url: "https://github.com/obophenotype/human-phenotype-ontology.git" },
  { category: "diretrizes", name: "opentargets-platform", url: "https://github.com/opentargets/platform.git" },

  // 3. Imagens Médicas & Interoperabilidade FHIR (protocolos)
  { category: "protocolos", name: "MONAI", url: "https://github.com/Project-MONAI/MONAI.git" },
  { category: "protocolos", name: "nnUNet", url: "https://github.com/MIC-DKFZ/nnUNet.git" },
  { category: "protocolos", name: "torchio", url: "https://github.com/fepegar/torchio.git" },
  { category: "protocolos", name: "MedCLIP", url: "https://github.com/Ryan-m-k/MedCLIP.git" },
  { category: "protocolos", name: "orthanc", url: "https://github.com/jodogne/orthanc.git" },
  { category: "protocolos", name: "hapi-fhir", url: "https://github.com/hapifhir/hapi-fhir.git" },
  { category: "protocolos", name: "medplum", url: "https://github.com/medplum/medplum.git" },
  { category: "protocolos", name: "openemr", url: "https://github.com/openemr/openemr.git" },
  { category: "protocolos", name: "fhir.js", url: "https://github.com/FHIR/fhir.js.git" },
  { category: "protocolos", name: "torchxrayvision", url: "https://github.com/mlmed/torchxrayvision.git" },
  { category: "protocolos", name: "pyradiomics", url: "https://github.com/AIM-HARVARD/pyradiomics.git" },
  { category: "protocolos", name: "MONAILabel", url: "https://github.com/Project-MONAI/MONAILabel.git" },
  { category: "protocolos", name: "Slicer", url: "https://github.com/Slicer/Slicer.git" },
  { category: "protocolos", name: "HealthMultimodal", url: "https://github.com/microsoft/HealthMultimodal.git" }
];

async function cloneAll() {
  console.log("🚀 Iniciando o download organizado dos repositórios médicos expandidos...");
  
  let successCount = 0;
  let errorCount = 0;

  for (const repo of repos) {
    const targetDir = path.join(knowledgePath, repo.category, repo.name);
    fs.mkdirSync(path.dirname(targetDir), { recursive: true });

    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      console.log(`ℹ️ Repositório '${repo.name}' já está presente em knowledge/${repo.category}/${repo.name}.`);
      successCount++;
      continue;
    }

    console.log(`\n📥 Clonando [${repo.category.toUpperCase()}] ${repo.name}...`);
    try {
      execSync(`git clone --depth 1 ${repo.url} "${targetDir}"`, { stdio: "inherit" });
      console.log(`✅ Clonado com sucesso: ${repo.name}`);
      successCount++;
    } catch (err) {
      console.error(`⚠️ Erro ao clonar ${repo.name}:`, err.message);
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log(`✨ Processo de clonagem finalizado.`);
  console.log(`Concluídos: ${successCount}/${repos.length}`);
  console.log("========================================");
}

cloneAll();

import { preAnamneseService } from "../services/pre-anamnese.service.js";

/**
 * Controller de Interoperabilidade HL7 FHIR e Webhooks de ERPs Hospitalares (Módulo 7)
 */
export async function fhirEncounterHandler(req, res) {
  try {
    const encounterResource = req.body || {};

    // Validação mínima de ResourceType FHIR
    if (encounterResource.resourceType !== "Encounter") {
      return res.status(400).json({
        resourceType: "OperationOutcome",
        issue: [
          {
            severity: "error",
            code: "invalid",
            diagnostics: "Esperado resourceType 'Encounter' no payload HL7 FHIR."
          }
        ]
      });
    }

    const patientName = encounterResource.subject?.display || "Paciente FHIR";
    const doctorName = encounterResource.participant?.[0]?.individual?.display || "Médico Responsável";
    const scheduledPeriod = encounterResource.period?.start || new Date().toISOString();
    const scheduledTime = new Date(scheduledPeriod).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const isPediatric = Boolean(encounterResource.extension?.find((e) => e.url?.includes("pediatric"))?.valueBoolean);

    const session = await preAnamneseService.createPreAnamneseSession({
      patientName,
      patientAge: encounterResource.extension?.find((e) => e.url?.includes("patientAge"))?.valueString || "Não informado",
      isPediatric,
      phone: encounterResource.extension?.find((e) => e.url?.includes("phone"))?.valueString || "",
      scheduledTime,
      doctorName,
      clinicName: "Hospital / ERP Integrado"
    });

    const portalUrl = `${req.protocol}://${req.get("host")}/portal?token=${session.token}`;

    // Resposta padrão FHIR R4 Bundle / Encounter gerado
    return res.status(201).json({
      resourceType: "Encounter",
      id: session.id,
      status: "planned",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB",
        display: "Ambulatório / Consulta Eletiva"
      },
      subject: {
        display: patientName
      },
      participant: [
        {
          individual: {
            display: doctorName
          }
        }
      ],
      extension: [
        {
          url: "https://media.med.br/fhir/StructureDefinition/preAnamneseToken",
          valueString: session.token
        },
        {
          url: "https://media.med.br/fhir/StructureDefinition/preAnamneseLink",
          valueUri: portalUrl
        }
      ]
    });
  } catch (err) {
    return res.status(500).json({
      resourceType: "OperationOutcome",
      issue: [{ severity: "fatal", code: "exception", diagnostics: err.message }]
    });
  }
}

export async function webhookAgendamentoCriadoHandler(req, res) {
  try {
    const { paciente_nome, paciente_idade, telefone, horario, medico_nome, eh_crianca, clinica_nome } = req.body || {};

    const session = await preAnamneseService.createPreAnamneseSession({
      patientName: paciente_nome || "Paciente",
      patientAge: paciente_idade || "",
      isPediatric: Boolean(eh_crianca),
      phone: telefone || "",
      scheduledTime: horario || "Hoje",
      doctorName: medico_nome || "Médico Assistente",
      clinicName: clinica_nome || "Hospital / Clínica"
    });

    const linkAnamnese = `${req.protocol}://${req.get("host")}/portal?token=${session.token}`;
    const mensagemWhatsAppPronta = `Olá, ${session.patientName}! Sua consulta na ${session.clinicName} está agendada para às ${session.scheduledTime}. Para agilizar seu atendimento e preparar a ficha para o médico, preencha sua anamnese prévia no link seguro: ${linkAnamnese}`;

    return res.status(200).json({
      status: "success",
      message: "Evento de agendamento processado pelo middleware medIa.",
      data: {
        id: session.id,
        token: session.token,
        linkAnamnese,
        mensagemWhatsAppPronta
      }
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

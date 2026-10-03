import type { IntakeTranslation } from './index';

// ============================================
// SPANISH (ESPAÑOL) TRANSLATIONS
// ============================================

export const ES: IntakeTranslation = {
  steps: {
    contact: {
      title: 'Información de contacto',
      description: 'Comencemos con su información básica',
    },
    goals: {
      title: 'Sus objetivos de bienestar',
      description: '¿Qué le gustaría lograr?',
    },
    basic_health: {
      title: 'Información básica de salud',
      description: 'Ayúdenos a comprender su estado de salud actual',
    },
    weight_loss: {
      title: 'Evaluación de control de peso',
      description: 'Preguntas específicas sobre tratamientos para perder peso',
    },
    serious_conditions: {
      title: 'Antecedentes médicos',
      description: 'Condiciones de salud importantes a revisar',
    },
    mental_health: {
      title: 'Salud mental',
      description:
        'Estas preguntas nos ayudan a garantizar que los tratamientos sean seguros para usted',
    },
    recovery: {
      title: 'Recuperación y curación',
      description: 'Cuéntenos qué busca sanar',
    },
    cognitive: {
      title: 'Objetivos cognitivos y de ánimo',
      description: 'Ayúdenos a comprender sus necesidades de bienestar cognitivo',
    },
    anti_aging: {
      title: 'Antienvejecimiento y longevidad',
      description: 'Cuéntenos sobre sus objetivos antienvejecimiento',
    },
    allergies: {
      title: 'Alergias y medicamentos',
      description: 'Información de seguridad importante',
    },
    confirmation: {
      title: 'Revisar y confirmar',
      description: '¡Casi terminamos!',
    },
  },

  questions: {
    firstName: {
      text: 'Nombre',
      placeholder: 'Ingrese su nombre',
    },
    lastName: {
      text: 'Apellido',
      placeholder: 'Ingrese su apellido',
    },
    email: {
      text: 'Correo electrónico',
      placeholder: 'su@correo.com',
      helpText: 'Lo usaremos para enviarle la información de su consulta',
    },
    phone: {
      text: 'Número de teléfono',
      placeholder: '(555) 123-4567',
      helpText:
        'Para confirmaciones de citas, contacto con el proveedor y verificación de identidad',
    },
    dateOfBirth: {
      text: 'Fecha de nacimiento',
      helpText: 'Debe tener 18 años o más para calificar',
    },
    state: {
      text: 'Estado de residencia',
      helpText: 'Los servicios de telesalud están disponibles en estados seleccionados',
    },
    biologicalSex: {
      text: 'Sexo asignado al nacer',
      helpText:
        'Esta información ayuda a nuestros proveedores médicos a determinar opciones de tratamiento seguras. Si es transgénero, seleccione el sexo asignado al nacer; puede discutir sus necesidades de salud específicas con su proveedor.',
      options: {
        male: 'Masculino',
        female: 'Femenino',
        intersex: 'Intersexual',
        prefer_not_to_say: 'Prefiero no decirlo',
      },
    },
    goals: {
      text: '¿Cuáles son sus objetivos de bienestar?',
      helpText:
        'Seleccione todos los que correspondan: esto nos ayuda a determinar qué tratamientos pueden ser adecuados para usted',
      options: {
        weight_loss:
          'Control de peso — Apoyo para una pérdida de peso saludable y sostenible',
        anti_aging:
          'Antienvejecimiento y longevidad — Salud celular y rejuvenecimiento de la piel',
        energy_wellness:
          'Energía y bienestar — Aumente la energía y la vitalidad general',
        recovery_healing:
          'Recuperación y curación — Recuperación más rápida de las lesiones',
        cognitive_mood:
          'Cognitivo y de ánimo — Claridad mental y bienestar emocional',
      },
    },
    heightFeet: {
      text: 'Altura (pies)',
      placeholder: '5',
    },
    heightInches: {
      text: 'Altura (pulgadas)',
      placeholder: '6',
    },
    currentWeight: {
      text: 'Peso actual (lbs)',
      placeholder: '180',
      helpText: 'Esto nos ayuda a comprender su perfil de salud general',
    },
    pregnantOrBreastfeeding: {
      text:
        '¿Está actualmente embarazada, amamantando o planea quedar embarazada en los próximos 6 meses?',
    },
    weightLossAttempts: {
      text: '¿Ha intentado perder peso con dieta y ejercicio en el pasado?',
      options: {
        never: 'No, este es mi primer intento',
        some: 'Sí, algunas veces con éxito limitado',
        many: 'Sí, muchas veces sin resultados duraderos',
        currently: 'Sí, actualmente estoy trabajando en ello',
      },
    },
    diabetesStatus: {
      text: '¿Tiene diabetes?',
      options: {
        none: 'No',
        prediabetes: 'Prediabetes',
        type2_controlled: 'Diabetes tipo 2 (bien controlada)',
        type2_uncontrolled: 'Diabetes tipo 2 (no bien controlada)',
        type1: 'Diabetes tipo 1',
      },
    },
    weightRelatedConditions: {
      text: '¿Tiene alguna de estas condiciones de salud relacionadas con el peso?',
      helpText:
        'Estas condiciones pueden respaldar la elegibilidad para ciertos tratamientos con un IMC más bajo',
      options: {
        high_blood_pressure: 'Presión arterial alta (hipertensión)',
        high_cholesterol: 'Colesterol alto (dislipidemia)',
        sleep_apnea: 'Apnea del sueño',
        fatty_liver: 'Hígado graso (NAFLD)',
        pcos: 'Síndrome de ovario poliquístico (SOP)',
        joint_pain: 'Dolor articular por exceso de peso',
        none: 'Ninguna de las anteriores',
      },
    },
    thyroidHistory: {
      text:
        '¿Usted o algún familiar consanguíneo tienen antecedentes de cáncer de tiroides o síndrome de Neoplasia Endocrina Múltiple tipo 2 (MEN 2)?',
      options: {
        no: 'No',
        personal_mtc: 'Sí, tengo/tuve carcinoma medular de tiroides',
        family_mtc: 'Sí, un familiar tiene/tuvo carcinoma medular de tiroides',
        men2: 'Sí, síndrome MEN 2 en mí o en mi familia',
        other_thyroid: 'Otra condición tiroidea (no cáncer)',
        unsure: 'No estoy seguro',
      },
    },
    pancreatitisHistory: {
      text: '¿Ha tenido alguna vez pancreatitis (inflamación del páncreas)?',
    },
    giConditions: {
      text: '¿Tiene alguna de estas condiciones gastrointestinales?',
      helpText:
        'Algunos tratamientos pueden no ser adecuados para ciertas condiciones GI',
      options: {
        gastroparesis: 'Gastroparesia (vaciamiento gástrico retrasado)',
        ibd: 'Enfermedad inflamatoria intestinal (Crohn, colitis ulcerosa)',
        severe_gerd: 'ERGE/reflujo ácido severo',
        gallbladder: 'Problemas de vesícula o antecedentes de cálculos biliares',
        none: 'Ninguna de las anteriores',
      },
    },
    cancerHistory: {
      text: '¿Alguna vez le han diagnosticado cáncer?',
      options: {
        never: 'No, nunca',
        active: 'Sí, actualmente en tratamiento',
        remission_recent: 'Sí, en remisión (menos de 5 años)',
        remission_long: 'Sí, en remisión (más de 5 años)',
      },
    },
    kidneyDisease: {
      text: '¿Tiene enfermedad renal o función renal reducida?',
      options: {
        none: 'Sin problemas renales',
        mild: 'Leve (Etapa 1-2, eGFR > 60)',
        moderate: 'Moderada (Etapa 3, eGFR 30-60)',
        severe: 'Severa (Etapa 4-5, eGFR < 30)',
        dialysis: 'En diálisis',
        unknown: 'No lo sé',
      },
    },
    liverDisease: {
      text: '¿Tiene enfermedad hepática?',
      options: {
        none: 'Sin problemas hepáticos',
        fatty_liver: 'Hígado graso (NAFLD)',
        hepatitis: 'Hepatitis (activa o crónica)',
        cirrhosis: 'Cirrosis o enfermedad hepática severa',
        unknown: 'No lo sé',
      },
    },
    mentalHealthConditions: {
      text: '¿Tiene alguna de estas condiciones de salud mental?',
      options: {
        depression: 'Depresión',
        anxiety: 'Trastorno de ansiedad',
        bipolar: 'Trastorno bipolar',
        schizophrenia: 'Esquizofrenia o trastorno psicótico',
        ptsd: 'TEPT',
        none: 'Ninguna de las anteriores',
      },
    },
    suicidalHistory: {
      text:
        'En el último año, ¿ha tenido pensamientos de hacerse daño o de suicidio?',
      helpText:
        'Esto se pregunta porque algunos tratamientos para perder peso requieren evaluación de salud mental',
    },
    currentInjury: {
      text: '¿Qué tipo de lesión o condición busca sanar?',
      options: {
        muscle_strain: 'Distensión o desgarro muscular',
        tendon: 'Lesión de tendón (tendinitis, desgarro parcial)',
        ligament: 'Lesión de ligamento (esguince, desgarro parcial)',
        joint: 'Dolor o inflamación articular',
        post_surgery: 'Recuperación posquirúrgica',
        chronic_pain: 'Condición de dolor crónico',
        skin_wound: 'Curación de heridas o cicatrices en la piel',
        general_recovery: 'Recuperación y bienestar general',
      },
    },
    autoimmune: {
      text: '¿Tiene alguna condición autoinmune?',
      helpText:
        'Algunos tratamientos curativos pueden afectar la función inmunológica',
      options: {
        none: 'No',
        ra: 'Artritis reumatoide',
        lupus: 'Lupus',
        ms: 'Esclerosis múltiple',
        hashimotos: 'Tiroiditis de Hashimoto',
        psoriasis: 'Psoriasis/artritis psoriásica',
        other: 'Otra condición autoinmune',
      },
    },
    activeInfection: {
      text: '¿Tiene actualmente una infección activa?',
    },
    cognitiveGoals: {
      text: '¿Qué mejoras cognitivas o de ánimo está buscando?',
      options: {
        focus: 'Mejor enfoque y concentración',
        memory: 'Memoria mejorada',
        brain_fog: 'Reducir la niebla mental',
        anxiety: 'Reducir la ansiedad',
        mood: 'Mejor estabilidad del ánimo',
        motivation: 'Mayor motivación',
        stress: 'Mejor resiliencia al estrés',
      },
    },
    seizureHistory: {
      text: '¿Tiene antecedentes de convulsiones o epilepsia?',
    },
    bloodPressure: {
      text: '¿Tiene presión arterial alta (hipertensión)?',
      options: {
        normal: 'Presión arterial normal',
        elevated: 'Elevada (120-129 / <80)',
        stage1: 'Hipertensión etapa 1 (130-139 / 80-89)',
        stage2: 'Hipertensión etapa 2 (140+ / 90+)',
        severe: 'Severa / no controlada',
        unknown: 'No lo sé',
      },
    },
    antiAgingGoals: {
      text: '¿Qué beneficios antienvejecimiento le interesan más?',
      options: {
        skin: 'Salud y apariencia de la piel',
        energy: 'Mayor energía y vitalidad',
        sleep: 'Mejor calidad del sueño',
        muscle: 'Mantener la masa muscular',
        longevity: 'Salud celular y longevidad',
        hair: 'Salud del cabello',
        immune: 'Apoyo al sistema inmunológico',
      },
    },
    thyroidCondition: {
      text: '¿Tiene una condición tiroidea?',
      options: {
        none: 'Sin problemas tiroideos',
        hypothyroid_treated: 'Hipotiroidismo (tratado/controlado)',
        hypothyroid_untreated: 'Hipotiroidismo (no tratado)',
        hyperthyroid: 'Hipertiroidismo',
        nodules: 'Nódulos tiroideos',
        other: 'Otra condición tiroidea',
      },
    },
    wilsonDisease: {
      text:
        '¿Tiene enfermedad de Wilson o algún trastorno del metabolismo del cobre?',
    },
    allergies: {
      text: '¿Tiene alguna de estas alergias?',
      options: {
        b_vitamins: 'Vitaminas B',
        cobalt: 'Cobalto',
        sulfur: 'Compuestos de azufre',
        copper: 'Cobre',
        none: 'Ninguna de las anteriores',
      },
    },
    asthma: {
      text: '¿Tiene asma o condiciones respiratorias?',
    },
    currentMedications: {
      text: '¿Está actualmente tomando algún medicamento recetado?',
      helpText: 'Nuestros proveedores revisarán todos los medicamentos por interacciones',
      options: {
        none: 'Ningún medicamento recetado',
        diabetes: 'Medicamentos para la diabetes (insulina, metformina, etc.)',
        blood_thinners:
          'Anticoagulantes (warfarina, aspirina, etc.)',
        thyroid: 'Medicamentos tiroideos',
        psychiatric: 'Medicamentos psiquiátricos (antidepresivos, etc.)',
        other: 'Otros medicamentos recetados',
        multiple: 'Varios de los anteriores',
      },
    },
    healthcareProvider: {
      text: '¿Tiene un médico de atención primaria o proveedor de salud?',
    },
    understandDisclaimer: {
      text:
        'Entiendo que completar este cuestionario no garantiza la aprobación de ningún tratamiento, y que un proveedor médico autorizado tomará la determinación final basándose en mi perfil de salud completo.',
    },
    consentToContact: {
      text:
        'Consiento ser contactado por un proveedor médico para discutir mis objetivos de bienestar y posibles opciones de tratamiento.',
    },
  },

  reasons: {
    age_under_18: 'Debe tener 18 años o más',
    bmi_borderline: 'El IMC está en el límite; el proveedor evaluará',
    bmi_below_minimum:
      'Un IMC de {bmi} no cumple con los requisitos mínimos (típicamente IMC ≥ 27 con comorbilidades o ≥ 30)',
    pregnancy_unsafe: 'No es seguro durante el embarazo o la lactancia',
    pregnancy_limited_data: 'Datos de seguridad limitados durante el embarazo',
    type1_diabetes: 'No indicado para diabetes tipo 1',
    diabetes_uncontrolled: 'La diabetes debe estar bien controlada',
    mtc_personal: 'Contraindicado con antecedentes personales de MTC',
    mtc_family: 'Contraindicado con antecedentes familiares de MTC',
    men2_syndrome: 'Contraindicado con síndrome MEN 2',
    pancreatitis_history: 'Los antecedentes de pancreatitis son una contraindicación',
    cancer_active_treatment: 'No recomendado durante el tratamiento activo de cáncer',
    cancer_active: 'No recomendado durante cáncer activo',
    cancer_active_contraindicated: 'Contraindicado con cáncer activo',
    oncologist_review: 'Consultar primero con su oncólogo',
    severe_kidney_disease: 'No recomendado para enfermedad renal severa',
    dialysis: 'No recomendado para pacientes en diálisis',
    kidney_caution: 'Precaución con enfermedad renal severa',
    severe_liver_disease: 'No recomendado para enfermedad hepática severa',
    bipolar_mania_risk:
      'Puede desencadenar episodios maníacos en el trastorno bipolar',
    bipolar_contraindicated: 'No recomendado para trastorno bipolar',
    psychotic_disorders: 'No recomendado para trastornos psicóticos',
    mental_health_eval_required:
      'Requiere evaluación de salud mental antes de comenzar',
    active_infection: 'Debe resolver la infección antes de comenzar',
    seizure_history: 'No recomendado con antecedentes de convulsiones',
    blood_pressure_caution:
      'Algunos tratamientos pueden afectar la presión arterial',
    thyroid_untreated: 'La tiroides debe ser tratada antes de comenzar',
    wilsons_disease:
      'Los péptidos de cobre están contraindicados con la enfermedad de Wilson',
    allergy_b_vitamins: 'Contiene vitaminas B',
    allergy_cobalt: 'La B12 contiene cobalto',
    allergy_sulfur: 'Contiene azufre',
    allergy_copper: 'Contiene cobre',
    asthma_trigger: 'Puede desencadenar síntomas de asma',
  },

  productDescriptions: {
    tirzepatide: 'Agonista de doble receptor para el control de peso',
    semaglutide: 'Agonista del receptor para el control de peso',
    aod9604:
      'Péptido derivado de la hormona del crecimiento para apoyar el metabolismo',
    lipo_b: 'MIC + B12 para apoyo metabólico y energético',
    nad_plus: 'Apoyo de energía celular y antienvejecimiento',
    sermorelin:
      'Péptido liberador de hormona del crecimiento para antienvejecimiento y bienestar',
    glutathione:
      'Antioxidante maestro para la desintoxicación y la salud de la piel',
    mots_c:
      'Péptido mitocondrial para la salud metabólica y el rendimiento deportivo',
    ghk_cu: 'Péptido para rejuvenecimiento de la piel y reparación de tejidos',
    bpc157_tb500: 'Péptidos para la recuperación de lesiones y reparación de tejidos',
    semax_selank:
      'Péptidos nootrópicos para mejora cognitiva y apoyo del estado de ánimo',
  },

  ui: {
    stepProgress: 'Paso {current} de {total}',
    percentComplete: '{percent}% completado',
    previous: 'Anterior',
    continue: 'Continuar',
    seeResults: 'Ver resultados',
    yes: 'Sí',
    no: 'No',
    selectOption: 'Seleccione una opción...',
    smsPreferencesTitle: 'Preferencias de comunicación por SMS',
    smsTransactionalConsent:
      'Acepto recibir mensajes SMS de InfinityU Med Spa para recordatorios de citas, actualizaciones de cuenta y atención al cliente. Pueden aplicar tarifas de mensajes y datos. Responda STOP para darse de baja.',
    smsMarketingConsent:
      'Acepto recibir mensajes SMS promocionales de InfinityU Med Spa sobre ofertas especiales, consejos de salud y actualizaciones de programa. Pueden aplicar tarifas de mensajes y datos. Responda STOP para darse de baja.',
    verifyTitle: 'Verifique su teléfono',
    verifySubtitle: 'Enviamos un código de 6 dígitos a {phone}',
    verifyExplain:
      'Esta verificación ayuda a garantizar que su información de salud sea segura y le pertenezca.',
    verifyCodeLabel: 'Código de verificación',
    verifyButton: 'Verificar y continuar',
    verifying: 'Verificando...',
    changeNumber: '← Cambiar número',
    resendCode: 'Reenviar código',
    resendCountdown: 'Reenviar en {seconds}s',
    verifyFooter:
      'Esta verificación ayuda a proteger su información de salud y crea su cuenta de paciente.',
    resultsTitle: 'Sus resultados de evaluación',
    resultsBmiLabel: 'IMC calculado',
    resultsEligibleHeading: 'Tratamientos potencialmente elegibles',
    resultsEligibleIntro: 'Según sus respuestas, puede ser candidato para:',
    resultsReviewHeading: 'Requiere revisión del proveedor',
    resultsIneligibleHeading: 'No recomendado en este momento',
    resultsIneligibleIntro:
      'Según sus respuestas, lo siguiente puede no ser apropiado:',
    resultsDisclaimer:
      'Esta es solo una evaluación preliminar. Un proveedor médico autorizado revisará su perfil de salud completo para hacer recomendaciones finales de tratamiento.',
    resultsReadyToProceed: '¿Listo para continuar, {firstName}?',
    resultsContactNotice:
      'Haga clic abajo para enviar su evaluación. Lo contactaremos a {email} para discutir sus opciones y agendar una consulta con un proveedor médico autorizado.',
    startOver: 'Comenzar de nuevo',
    submit: 'Enviar y comenzar',
    submitting: 'Enviando...',
    submittedTitle: '¡Evaluación enviada!',
    submittedThanks:
      'Gracias, {firstName}. Hemos recibido su evaluación de salud.',
    submittedNotice:
      'Un proveedor médico autorizado revisará su información y lo contactará a {email} dentro de 24-48 horas para discutir sus opciones.',
    submittedFooter:
      '¿Preguntas? Contáctenos en services@infinity-u.com',
  },
};

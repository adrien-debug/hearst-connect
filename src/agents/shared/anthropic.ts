/**
 * Anthropic Claude SDK client — text analysis + managed tool-use agents
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── Tool definitions ────────────────────────────────────────────────────

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'fetch_market_data',
    description: 'Récupère le dernier snapshot de marché (BTC price, 24h/7d change, USDC/USDT APY, BTC APY, Fear & Greed, mining hashprice). Appelle toujours cet outil en premier.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_signals',
    description: 'Récupère les signaux de rebalance récents avec leur statut (pending, approved, rejected, blocked, executed).',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'blocked', 'executed', 'all'], description: 'Filtre par statut. Utilise "all" pour tout voir.' },
        limit: { type: 'number', description: 'Nombre max de signaux. Défaut: 10' },
      },
      required: [],
    },
  },
  {
    name: 'create_signal',
    description: 'Crée un signal de rebalance. Utilise UNIQUEMENT si les conditions le justifient fortement. Types valides: TAKE_PROFIT, REBALANCE, YIELD_ROTATE, INCREASE_BTC, REDUCE_RISK.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['TAKE_PROFIT', 'REBALANCE', 'YIELD_ROTATE', 'INCREASE_BTC', 'REDUCE_RISK'] },
        description: { type: 'string', description: 'Description claire de l\'action recommandée avec les chiffres justificatifs' },
        riskScore: { type: 'number', description: '0-100. 0-25=faible, 25-50=modéré, 50-75=élevé, 75-100=critique' },
        paramsJson: { type: 'string', description: 'JSON des paramètres supplémentaires (ex: {"pctToSell": 15, "targetPrice": 109250})' },
      },
      required: ['type', 'description', 'riskScore'],
    },
  },
  {
    name: 'update_signal_risk',
    description: 'Met à jour le risk score et les notes d\'un signal existant. Utilise pour bloquer ou ajouter un warning.',
    input_schema: {
      type: 'object' as const,
      properties: {
        signalId: { type: 'string', description: 'ID du signal' },
        status: { type: 'string', enum: ['pending', 'blocked'], description: 'Nouveau statut' },
        riskScore: { type: 'number', description: 'Nouveau score 0-100' },
        riskNotes: { type: 'string', description: 'Explication de la décision' },
      },
      required: ['signalId', 'status', 'riskScore', 'riskNotes'],
    },
  },
  {
    name: 'get_agent_config',
    description: 'Récupère la configuration des agents (prix d\'entrée BTC, paliers de profit, seuils Fear & Greed, yield drift threshold, etc.).',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
]

// Tool selector by agent role
export const AGENT_TOOL_SETS: Record<string, string[]> = {
  watcher: ['fetch_market_data', 'get_agent_config'],
  strategy: ['fetch_market_data', 'get_signals', 'create_signal', 'get_agent_config'],
  audit: ['fetch_market_data', 'get_signals', 'update_signal_risk', 'get_agent_config'],
}

// ── Event types for streaming ───────────────────────────────────────────

export type AgentRunEvent =
  | { type: 'start'; agent: string }
  | { type: 'tool_call'; tool: string; input: unknown }
  | { type: 'tool_result'; tool: string; result: unknown }
  | { type: 'thinking'; text: string }
  | { type: 'signal_created'; signalType: string; riskScore: number }
  | { type: 'signal_updated'; signalId: string; status: string }
  | { type: 'done'; report: string; durationMs: number }
  | { type: 'error'; message: string }

// ── Managed agent runner ───────────────────────────────────────────────

export async function runManagedAgent(
  agent: 'watcher' | 'strategy' | 'audit',
  executeTool: (name: string, input: unknown) => Promise<unknown>,
  onEvent: (event: AgentRunEvent) => void,
  extraSystemPrompt?: string
): Promise<{ report: string; durationMs: number }> {
  const start = Date.now()
  onEvent({ type: 'start', agent })

  let systemPrompt = SYSTEM_PROMPTS[agent]
  if (extraSystemPrompt) {
    systemPrompt += `\n\n## Instructions additionnelles (configurées par l'admin)\n${extraSystemPrompt}`
  }
  systemPrompt += `\n\n## Mode d'exécution managé
Tu as accès à des outils. Commence TOUJOURS par fetch_market_data pour avoir les données actuelles.
Appelle les outils dans l'ordre logique, analyse les résultats, prends des décisions, et termine par un rapport concis.
Ne crée des signaux que si les conditions le justifient selon tes règles.`

  const allowedTools = new Set(AGENT_TOOL_SETS[agent] ?? [])
  const tools = AGENT_TOOLS.filter(t => allowedTools.has(t.name))

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Lance ton cycle d'analyse. Tu es l'agent ${agent} de Hearst Connect. Commence par collecter les données, analyse-les, prends les actions nécessaires (signaux si warranted), et fournis un rapport de synthèse.`,
    },
  ]

  let report = ''
  let iterations = 0
  const MAX_ITERATIONS = 10

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: AGENT_TEMPERATURES[agent] ?? 0.3,
      system: systemPrompt,
      tools,
      messages,
    })

    // Collect text for report
    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        onEvent({ type: 'thinking', text: block.text })
        report = block.text
      }
    }

    if (response.stop_reason === 'end_turn') break

    if (response.stop_reason !== 'tool_use') break

    // Execute all tool calls
    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (toolUseBlocks.length === 0) break

    // Add assistant message
    messages.push({ role: 'assistant', content: response.content })

    // Process each tool call
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const toolCall of toolUseBlocks) {
      onEvent({ type: 'tool_call', tool: toolCall.name, input: toolCall.input })
      try {
        const result = await executeTool(toolCall.name, toolCall.input)
        onEvent({ type: 'tool_result', tool: toolCall.name, result })

        // Emit semantic events
        if (toolCall.name === 'create_signal') {
          const inp = toolCall.input as { type: string; riskScore: number }
          onEvent({ type: 'signal_created', signalType: inp.type, riskScore: inp.riskScore })
        }
        if (toolCall.name === 'update_signal_risk') {
          const inp = toolCall.input as { signalId: string; status: string }
          onEvent({ type: 'signal_updated', signalId: inp.signalId, status: inp.status })
        }

        toolResults.push({ type: 'tool_result', tool_use_id: toolCall.id, content: JSON.stringify(result) })
      } catch (e) {
        const errMsg = String(e)
        toolResults.push({ type: 'tool_result', tool_use_id: toolCall.id, content: `Error: ${errMsg}`, is_error: true })
      }
    }

    messages.push({ role: 'user', content: toolResults })
  }

  const durationMs = Date.now() - start
  onEvent({ type: 'done', report, durationMs })
  return { report, durationMs }
}

const PRODUCT_CONTEXT = `
## Hearst Connect — Produit
Hearst Connect est un vault structuré crypto composé de 4 poches :
1. **BTC Spot** — Performance directionnelle. Achat BTC au prix d'entrée, vente progressive par paliers.
2. **Mining** — Rendement opérationnel (~8-15%/an net). Dépend du hashprice et du prix BTC.
3. **Stablecoins (USDC/USDT)** — Rendement DeFi défensif via Aave v3 sur Ethereum. Poche la plus sûre.
4. **Réserve** — Cash/liquidité. Coussin de sécurité, rendement ~3%/an. Absorbe les frais et sert aux rebalances.

Durée standard : 36 mois. Profils d'allocation prédéfinis (Conservateur à Agressif).
Les décisions de rebalance sont semi-automatiques : les agents proposent, un humain approuve.

## Règles de gestion strictes
- Ne JAMAIS vendre plus de 20% de la poche BTC en une seule opération.
- Ne pas prendre de profit BTC si Fear & Greed < 40 (risque de vendre dans la peur).
- Rotation stablecoin seulement si le spread de yield > 2% ET que les deux protocoles sont sur Aave/Compound (TVL > $500M).
- Seuil de rebalance : quand l'allocation réelle drift de plus de 5% par rapport à la cible.
- En cas de depeg stablecoin (yield > 25% anormal ou prix < $0.98), BLOQUER tout signal touchant les stablecoins.
- En cas de crash BTC (> -15% en 24h), BLOQUER tout signal TAKE_PROFIT et tout signal INCREASE_BTC.

## Format de sortie
Tu ne donnes JAMAIS de conseil financier. Tu génères des SIGNAUX INTERNES pour review humaine.
Sois factuel, concis, et toujours justifié par des données.
`

const SYSTEM_PROMPTS: Record<string, string> = {
  watcher: `Tu es l'agent Market Watcher de Hearst Connect.
${PRODUCT_CONTEXT}

## Ton rôle spécifique
Tu observes le marché en continu et rédiges des micro-analyses factuelles.

### Ce que tu dois faire :
- Analyser le snapshot de marché (BTC prix, variation 24h/7j, yields DeFi, Fear & Greed, mining hashprice).
- Identifier les mouvements notables et les anomalies.
- Comparer avec les données historiques si fournies.
- Signaler les divergences (ex: BTC monte mais F&G baisse = divergence bearish).

### Format de réponse :
2-3 phrases maximum. Factuelles. Pas de spéculation.
Structure : [Observation principale] + [Contexte/comparaison] + [Point d'attention s'il y en a un].

### Exemples de bonnes réponses :
- "BTC stable à $95,200 (+0.3% 24h) avec un F&G à 62 (Greed). Le spread USDT-USDC s'est resserré à 0.8%, suggérant un retour à la normale des marchés stablecoin."
- "Chute BTC de 4.2% en 24h à $78,300. F&G à 28 (Fear) en baisse de 15 points. Mining hashprice sous $40/PH/day — les mineurs marginaux sont sous pression."
`,

  strategy: `Tu es l'agent Strategy Optimizer de Hearst Connect.
${PRODUCT_CONTEXT}

## Ton rôle spécifique
Tu analyses les conditions de marché et l'état du portfolio pour proposer des signaux de rebalance.

### Types de signaux (strictement limité à) :
- **TAKE_PROFIT** — BTC a atteint un palier de profit. Vendre X% de la poche BTC vers USDC/Réserve.
- **REBALANCE** — L'allocation a drifté significativement (>5%) par rapport à la cible. Rééquilibrer.
- **YIELD_ROTATE** — Un stablecoin offre un meilleur yield qu'un autre (spread > 2%). Proposer rotation.
- **INCREASE_BTC** — Fear & Greed extrême (<20) = zone d'achat historique. Proposer d'augmenter BTC.
- **REDUCE_RISK** — Fear & Greed extrême (>80) ou conditions de marché dangereuses. Réduire exposition.

### Avant de proposer un signal, vérifie :
1. Qu'il n'y a PAS déjà un signal du même type en pending (éviter les doublons).
2. Que les conditions sont suffisamment claires pour justifier l'action.
3. Que le risk score est calibré : 0-25 = faible risque, 25-50 = modéré, 50-75 = élevé, 75-100 = critique.

### Conservatisme :
Tu es CONSERVATEUR par défaut. Tu ne proposes un signal QUE quand les données le justifient fortement.
Si tu hésites, tu ne proposes RIEN. Un faux positif coûte plus cher qu'un signal manqué.
Quand tu reçois le feedback de tes signaux passés (approuvés/rejetés), adapte ta sensibilité.

### Format de description du signal :
[TYPE] — [Action concrète avec chiffres] — [Justification en 1 phrase avec les données]
`,

  audit: `Tu es l'agent Audit & Risk Monitor de Hearst Connect.
${PRODUCT_CONTEXT}

## Ton rôle spécifique
Tu es la dernière ligne de défense avant exécution. Tu audites chaque signal pending.

### Checklist de risques à vérifier pour chaque signal :
1. **Cohérence marché** — Le signal est-il cohérent avec les conditions actuelles ? (ex: TAKE_PROFIT pendant un crash = incohérent)
2. **Depeg stablecoin** — Les yields stablecoins sont-ils anormalement hauts (>25%) ? Signe de stress.
3. **Concentration** — Le signal ne crée-t-il pas une sur-concentration dans une poche (>60%) ?
4. **Timing** — Y a-t-il eu un signal similaire récemment qui a été rejeté ? Si oui, pourquoi reproposer ?
5. **Magnitude** — Le % proposé est-il raisonnable (<20% de la poche BTC par opération) ?
6. **Corrélation** — Plusieurs signaux en même temps = risque systémique. Faut-il en bloquer certains ?

### Actions possibles :
- **Approuver** — Risk score < 30, pas de warning.
- **Ajouter un warning** — Risk score 30-60, signal OK mais avec une note de prudence.
- **Bloquer** — Risk score > 60, ou règle de gestion violée. Le signal ne sera pas exécutable.

### Rapport quotidien :
Résume en 3-5 bullets : état du marché, signaux traités, risques actifs, recommandations.
`,
}

const AGENT_TEMPERATURES: Record<string, number> = {
  watcher: 0.3,
  strategy: 0.5,
  audit: 0.2,
}

export async function analyzeWithClaude(
  agent: 'watcher' | 'strategy' | 'audit',
  prompt: string,
  maxTokens = 500,
  extraSystemPrompt?: string
): Promise<string> {
  try {
    let systemPrompt = SYSTEM_PROMPTS[agent]
    if (extraSystemPrompt) {
      systemPrompt += `\n\n## Instructions additionnelles (configurées par l'admin)\n${extraSystemPrompt}`
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      temperature: AGENT_TEMPERATURES[agent] ?? 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock?.text ?? ''
  } catch (e) {
    console.error(`[${agent}] Claude analysis error:`, e)
    return ''
  }
}

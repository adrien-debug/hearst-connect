'use client'

interface Scenario {
  label: string
  months: number
  description: string
  color: string
}

interface ScenarioCardsProps {
  scenarios: Record<string, Scenario>
  selected: string
  onSelect: (key: string) => void
}

// Type guard for scenario keys
function isValidScenario(key: string): key is 'bull' | 'sideways' | 'bear' {
  return ['bull', 'sideways', 'bear'].includes(key)
}

export function ScenarioCards({ scenarios, selected, onSelect }: ScenarioCardsProps) {
  return (
    <div className="scenario-cards">
      {Object.entries(scenarios).map(([key, scenario]) => (
        <button
          key={key}
          type="button"
          className={`scenario-card ${selected === key ? 'active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <div className="scenario-card-indicator" style={{ background: scenario.color }} />
          <div className="scenario-card-content">
            <span className="scenario-card-label">{scenario.label}</span>
            <span className="scenario-card-months">M{scenario.months}</span>
            <span className="scenario-card-desc">{scenario.description}</span>
          </div>
          {/* Mini allocation bar */}
          <div className="scenario-card-bar">
            <div
              className="scenario-card-bar-fill"
              style={{
                width: key === 'bull' ? '80%' : key === 'sideways' ? '60%' : '40%',
                background: scenario.color,
              }}
            />
          </div>
        </button>
      ))}
    </div>
  )
}

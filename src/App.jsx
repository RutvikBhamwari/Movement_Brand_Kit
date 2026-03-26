import { useState } from "react"

// ── Colour palette — Earth and Water ─────────────────────────────
// These CSS variables define your entire brand palette
// Used consistently throughout the component
const colors = {
  soil: "#2C1810",
  gold: "#8B6914",
  river: "#4A90A4",
  sand: "#D4956A",
  linen: "#F5ECD7",
  white: "#FAFAF8",
}

// ── Input Field Component ─────────────────────────────────────────
// Reusable component — this is the React way
// Write once, use everywhere, consistent styling
function InputField({ label, placeholder, value, onChange, multiline, help }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ color: colors.soil }}
        className="text-sm font-semibold tracking-wide uppercase">
        {label}
      </label>
      {help && (
        <p style={{ color: colors.gold }}
          className="text-xs mb-1">{help}</p>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none
            focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: colors.white,
            border: `1.5px solid ${colors.sand}`,
            color: colors.soil,
            fontFamily: "inherit",
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl text-sm
            focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: colors.white,
            border: `1.5px solid ${colors.sand}`,
            color: colors.soil,
            fontFamily: "inherit",
          }}
        />
      )}
    </div>
  )
}

// ── Section Tab Component ─────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 text-sm font-semibold tracking-wide
        uppercase transition-all rounded-t-xl"
      style={{
        backgroundColor: active ? colors.white : "transparent",
        color: active ? colors.soil : colors.gold,
        borderBottom: active ? `3px solid ${colors.gold}` : "none",
      }}
    >
      {label}
    </button>
  )
}

// ── Brand Kit Result Section ──────────────────────────────────────
function BrandSection({ content }) {
  if (!content) return null
  return (
    <div className="prose max-w-none">
      {content.split('\n').map((line, i) => {
        // Section headers
        if (line.match(/^[A-Z][A-Za-z\s]+:$/)) {
          return (
            <h3 key={i} className="text-sm font-bold uppercase tracking-widest mt-6 mb-2"
              style={{ color: colors.gold }}>
              {line.replace(':', '')}
            </h3>
          )
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={i} className="text-sm leading-relaxed mb-1 pl-4"
              style={{ color: colors.soil }}>
              · {line.replace(/^[-•]\s/, '')}
            </p>
          )
        }
        // Hex colours — highlight them
        if (line.includes('#') && line.match(/#[0-9A-Fa-f]{6}/)) {
          const hex = line.match(/#[0-9A-Fa-f]{6}/)[0]
          return (
            <div key={i} className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: hex, border: `1px solid ${colors.sand}` }} />
              <p className="text-sm leading-relaxed"
                style={{ color: colors.soil }}>{line}</p>
            </div>
          )
        }
        // Empty lines
        if (!line.trim()) return <div key={i} className="h-2" />
        // Regular text
        return (
          <p key={i} className="text-sm leading-relaxed mb-1"
            style={{ color: colors.soil }}>{line}</p>
        )
      })}
    </div>
  )
}

// ── Main App Component ────────────────────────────────────────────
export default function App() {
  // Form state — one value per input field
  const [discipline, setDiscipline] = useState("")
  const [oneWord, setOneWord] = useState("")
  const [style, setStyle] = useState("")
  const [audience, setAudience] = useState("")
  const [goals, setGoals] = useState("")
  const [philosophy, setPhilosophy] = useState("")

  // UI state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState("visual")
  const [error, setError] = useState(null)

  // Parse Claude's response into four sections
  function parseResult(text) {
    const sections = {}
    let current = null
    let lines = []

    for (const line of text.split('\n')) {
      if (line.startsWith('VISUAL IDENTITY:')) {
        current = 'visual'; lines = []
      } else if (line.startsWith('TONE OF VOICE:')) {
        if (current) sections[current] = lines.join('\n')
        current = 'tone'; lines = []
      } else if (line.startsWith('CONTENT STRATEGY:')) {
        if (current) sections[current] = lines.join('\n')
        current = 'content'; lines = []
      } else if (line.startsWith('BRAND POSITIONING:')) {
        if (current) sections[current] = lines.join('\n')
        current = 'positioning'; lines = []
      } else if (line.trim() === '---') {
        // skip dividers
      } else if (current) {
        lines.push(line)
      }
    }
    if (current) sections[current] = lines.join('\n')
    return sections
  }

  // Generate brand kit — calls our Node.js server
  async function generateBrandKit() {
    if (!discipline || !oneWord) {
      setError("Please fill in at least your discipline and one word.")
      return
    }
    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("http://localhost:3001/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline,
          oneWord,
          style,
          audience,
          goals,
          philosophy,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setResult(parseResult(data.result))
      setActiveTab("visual")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "visual", label: "🎨 Visual Identity" },
    { id: "tone", label: "✍️ Tone of Voice" },
    { id: "content", label: "📱 Content Strategy" },
    { id: "positioning", label: "🎯 Positioning" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.linen }}>

      {/* ── Header ── */}
      <div className="px-8 py-6" style={{ backgroundColor: colors.soil }}>
        <h1 className="text-2xl font-bold tracking-tight"
          style={{ color: colors.linen }}>
          🌊 Movement Brand Kit
        </h1>
        <p className="text-xs tracking-widest uppercase mt-1"
          style={{ color: colors.sand }}>
          Powered by Claude AI — Your Identity, Distilled
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* ── Intro ── */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-3"
            style={{ color: colors.soil, fontFamily: "Georgia, serif" }}>
            Tell us about your movement
          </h2>
          <p className="text-base" style={{ color: colors.gold }}>
            Answer honestly — the more specific you are,
            the more precise your brand kit will be.
          </p>
        </div>

        {/* ── Form ── */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="flex flex-col gap-6">
            <InputField
              label="Your movement discipline(s)"
              placeholder="e.g. calisthenics, acrobatics, contemporary dance"
              value={discipline}
              onChange={setDiscipline}
              help="What physical practices do you do?"
            />
            <InputField
              label="One word that describes how you move"
              placeholder="e.g. water, fire, earth, wind, light"
              value={oneWord}
              onChange={setOneWord}
              help="First instinct is usually right"
            />
            <InputField
              label="Who do you want to reach?"
              placeholder="e.g. People who feel stuck in their bodies..."
              value={audience}
              onChange={setAudience}
              multiline
              help="Describe them in human terms, not demographics"
            />
          </div>

          <div className="flex flex-col gap-6">
            <InputField
              label="Describe your aesthetic"
              placeholder="e.g. Fluid, organic, warm tones, linen clothing..."
              value={style}
              onChange={setStyle}
              multiline
              help="How does your movement feel visually?"
            />
            <InputField
              label="What do you want your brand to do?"
              placeholder="e.g. inspire people to move, build community..."
              value={goals}
              onChange={setGoals}
              help="What's the purpose of building this brand?"
            />
            <InputField
              label="Your movement philosophy"
              placeholder="e.g. Movement without borders. Flow like water."
              value={philosophy}
              onChange={setPhilosophy}
              multiline
              help="What do you believe about movement?"
            />
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
            {error}
          </div>
        )}

        {/* ── Generate Button ── */}
        <button
          onClick={generateBrandKit}
          disabled={loading}
          className="px-10 py-4 rounded-xl font-bold text-sm tracking-widest
            uppercase transition-all disabled:opacity-50"
          style={{
            backgroundColor: loading ? colors.gold : colors.soil,
            color: colors.linen,
          }}
        >
          {loading ? "Claude is distilling your identity..." : "Generate My Brand Kit"}
        </button>

        {/* ── Results ── */}
        {result && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8"
              style={{ color: colors.soil, fontFamily: "Georgia, serif" }}>
              Your Brand Kit
            </h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-0 border-b"
              style={{ borderColor: colors.sand }}>
              {tabs.map(tab => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>

            {/* Tab content */}
            <div className="p-8 rounded-b-2xl rounded-tr-2xl"
              style={{ backgroundColor: colors.white,
                border: `1px solid ${colors.sand}` }}>
              <BrandSection content={result[activeTab]} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
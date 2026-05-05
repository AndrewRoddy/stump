type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'brain'

function getBadgeTier(count: number): BadgeTier {
  if (count >= 100) return 'brain'
  if (count >= 50)  return 'diamond'
  if (count >= 5)   return 'gold'
  if (count >= 2)   return 'silver'
  return 'bronze'
}

function getNextHint(count: number, tier: BadgeTier): string | null {
  if (tier === 'brain') return null
  if (tier === 'diamond') {
    const n = 100 - count
    return `Complete ${n} more time${n === 1 ? '' : 's'} for Brain`
  }
  if (tier === 'gold') {
    const n = 50 - count
    return `Complete ${n} more time${n === 1 ? '' : 's'} for Diamond`
  }
  if (tier === 'silver') {
    const n = 5 - count
    return `Complete ${n} more time${n === 1 ? '' : 's'} for Gold`
  }
  return 'Complete 1 more time for Silver'
}

const MEDAL_COLORS: Record<BadgeTier, { body: string; shine: string; dark: string; ribbon: string; glow?: string }> = {
  bronze:  { body: '#CD7F32', shine: '#e8a050', dark: '#8B4513', ribbon: '#7B3F00' },
  silver:  { body: '#C0C0C0', shine: '#e8e8e8', dark: '#888888', ribbon: '#606060' },
  gold:    { body: '#FFD700', shine: '#ffe84d', dark: '#B8960C', ribbon: '#CC8800', glow: 'rgba(255,215,0,0.4)' },
  diamond: { body: '#A8EDFF', shine: '#ffffff', dark: '#3BBCDC', ribbon: '#1A8FB0', glow: 'rgba(168,237,255,0.6)' },
  brain:   { body: '#CC44FF', shine: '#ee88ff', dark: '#7700AA', ribbon: '#4400AA', glow: 'rgba(204,68,255,0.7)' },
}

const BADGE_LABEL: Record<BadgeTier, string> = {
  bronze:  'Bronze Badge',
  silver:  'Silver Badge',
  gold:    'Gold Badge',
  diamond: 'Diamond Badge',
  brain:   'Brain Badge',
}

function Medal({ tier }: { tier: BadgeTier }) {
  const c = MEDAL_COLORS[tier]
  const isDiamond = tier === 'diamond'
  const isBrain = tier === 'brain'
  const isShiny = tier === 'gold' || isDiamond || isBrain
  return (
    <svg width="90" height="108" viewBox="0 0 90 108" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={c.glow
        ? { filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.4)) drop-shadow(0 0 16px ${c.glow})` }
        : { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
      {/* Ribbon */}
      <rect x="30" y="0" width="30" height="26" rx="6" fill={c.ribbon} />
      <rect x="38" y="0" width="14" height="26" fill={c.ribbon} opacity="0.55" />
      <rect x="32" y="2" width="4" height="22" rx="2" fill="white" opacity="0.18" />
      {/* Connector */}
      <rect x="40" y="23" width="10" height="14" fill={c.dark} />
      {/* Outer glow ring for special tiers */}
      {isShiny && <circle cx="45" cy="73" r="36" fill={c.body} opacity="0.12" />}
      {/* Drop shadow */}
      <circle cx="45" cy="76" r="33" fill={c.dark} opacity="0.3" />
      {/* Medal body */}
      <circle cx="45" cy="73" r="33" fill={c.body} />
      {/* Inner rings */}
      <circle cx="45" cy="73" r="27" fill="none" stroke={c.shine} strokeWidth="2.5" opacity="0.55" />
      <circle cx="45" cy="73" r="20" fill="none" stroke={c.shine} strokeWidth="1.5" opacity="0.3" />
      {/* Diamond facet lines */}
      {isDiamond && <>
        <line x1="45" y1="40" x2="45" y2="106" stroke="white" strokeWidth="0.8" opacity="0.25" />
        <line x1="12" y1="73" x2="78" y2="73" stroke="white" strokeWidth="0.8" opacity="0.25" />
        <line x1="22" y1="50" x2="68" y2="96" stroke="white" strokeWidth="0.8" opacity="0.2" />
        <line x1="68" y1="50" x2="22" y2="96" stroke="white" strokeWidth="0.8" opacity="0.2" />
      </>}
      {/* Brain starburst rays */}
      {isBrain && [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <line key={i}
            x1={45 + 16 * Math.cos(rad)} y1={73 + 16 * Math.sin(rad)}
            x2={45 + 25 * Math.cos(rad)} y2={73 + 25 * Math.sin(rad)}
            stroke="white" strokeWidth="1.2" opacity="0.3"
          />
        )
      })}
      {/* Top shine arc */}
      <ellipse cx="35" cy="60" rx="10" ry="6" fill="white" opacity={isDiamond || isBrain ? 0.4 : 0.2} transform="rotate(-30 35 60)" />
      {/* Tier shape symbol */}
      {tier === 'bronze'  && <circle cx="45" cy="73" r="12" fill="white" opacity="0.85" />}
      {tier === 'silver'  && <rect x="34" y="62" width="22" height="22" rx="2" fill="white" opacity="0.85" />}
      {tier === 'gold'    && <text x="45" y="83" textAnchor="middle" fontSize="30" fill="white" opacity="0.9" fontFamily="serif">★</text>}
      {tier === 'diamond' && <text x="45" y="83" textAnchor="middle" fontSize="30" fill="white" opacity="0.9" fontFamily="serif">◆</text>}
      {tier === 'brain'   && <text x="45" y="85" textAnchor="middle" fontSize="32" fill="white" opacity="0.95" fontFamily="serif" fontWeight="bold">Ψ</text>}
    </svg>
  )
}

interface Props {
  deckName: string
  totalQuestions: number
  blockNumber: number
  badgeCount: number
  onRestart: () => void
}

export default function Complete({ deckName, totalQuestions, blockNumber, badgeCount, onRestart }: Props) {
  const tier = getBadgeTier(badgeCount)
  const nextHint = getNextHint(badgeCount, tier)

  return (
    <div className="screen">
      <div className="card complete-card">
        <div className="medal-wrap">
          <Medal tier={tier} />
        </div>
        <p className={`badge-earned-label badge-${tier}`}>{BADGE_LABEL[tier]} Earned</p>
        <h2 className="complete-title">Deck Mastered</h2>
        <p className="complete-deck">{deckName}</p>
        <div className="complete-stats">
          <div className="stat">
            <span className="stat-value">{totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat">
            <span className="stat-value">{blockNumber}</span>
            <span className="stat-label">Rounds</span>
          </div>
          <div className="stat">
            <span className="stat-value">{badgeCount}</span>
            <span className="stat-label">Completions</span>
          </div>
        </div>
        {nextHint && <p className="badge-next-hint">{nextHint}</p>}
        <button className="btn-primary" onClick={onRestart}>Study Another Deck</button>
      </div>
    </div>
  )
}

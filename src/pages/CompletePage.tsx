import { useParams, useNavigate, Navigate } from 'react-router-dom'
import Complete from '../components/Complete'
import { getCompleteInfo, getBadgeCount } from '../storage'

export default function CompletePage() {
  const deckId = useParams()['*'] ?? ''
  const navigate = useNavigate()

  const info = getCompleteInfo(deckId)

  if (!info) return <Navigate to="/" replace />

  return (
    <Complete
      deckName={info.deckName}
      totalQuestions={info.totalQuestions}
      blockNumber={info.blockNumber}
      badgeCount={getBadgeCount(deckId)}
      onRestart={() => navigate('/')}
    />
  )
}

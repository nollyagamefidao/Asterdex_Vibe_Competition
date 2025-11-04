import { useState } from 'react'
import ExitPlanDialog from '../ExitPlanDialog'
import { Button } from '@/components/ui/button'

export default function ExitPlanDialogExample() {
  const [open, setOpen] = useState(false)

  const mockMessages = [
    {
      id: "1",
      botName: "DEEPSEEK CHAT V3.1",
      timestamp: "10/31 16:27:24",
      message: "I'm currently holding all my open positions in ETH, SOL, XRP, BTC, DOGE, and BNB because none of their invalidation conditions have been met, even though DOGE is giving me a bit of a headache as a short position.",
    },
    {
      id: "2",
      botName: "DEEPSEEK CHAT V3.1",
      timestamp: "10/31 10:30:45",
      message: "XRP showing weakness despite positive crypto market sentiment. Considering short position if it breaks below $0.52 support level. Waiting for confirmation with increased volume.",
    },
  ]

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>
        Open XRP Exit Plan
      </Button>
      <ExitPlanDialog
        open={open}
        onOpenChange={setOpen}
        coin="XRP"
        side="LONG"
        relatedMessages={mockMessages}
      />
    </div>
  )
}

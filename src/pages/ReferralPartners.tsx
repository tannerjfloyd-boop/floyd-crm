import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDate } from '../lib/utils'
import { mockPartners } from '../lib/mockData'
import type { Partner } from '../lib/mockData'
import { MessageSquare, Calendar } from 'lucide-react'

const tierColors = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
} as const

export function ReferralPartners() {
  const [partners] = useState<Partner[]>(mockPartners)

  const getPartnersByTier = (tier: Partner['tier']) => {
    return partners.filter(p => p.tier === tier)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Partners</h1>
        <p className="text-muted-foreground">Manage relationships with your referral network</p>
      </div>

      {(['A', 'B', 'C'] as const).map((tier) => (
        <div key={tier}>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Tier {tier}</h2>
            <Badge variant={tierColors[tier]}>{getPartnersByTier(tier).length} partners</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getPartnersByTier(tier).map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{partner.company}</p>
                    </div>
                    <Badge variant={tierColors[partner.tier]}>
                      Tier {partner.tier}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">{partner.partner_type}</p>
                    <p className="font-semibold">{partner.deals_closed} deals closed</p>
                    {partner.last_deal_date && (
                      <p className="text-xs text-muted-foreground">
                        Last deal: {formatDate(partner.last_deal_date)}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-muted p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Next touchpoint:</span>
                    </div>
                    <p className="mt-1">{formatDate(partner.next_touchpoint)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Log Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

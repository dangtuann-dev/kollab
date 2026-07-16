import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function usePresence(channelName: string, currentUserProfile: Profile | null) {
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([])

  useEffect(() => {
    if (!currentUserProfile || !channelName) return

    const channel = supabase.channel(channelName)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: Profile[] = []
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.userProfile) {
              users.push(p.userProfile)
            }
          })
        })

        // Deduplicate profiles
        const uniqueUsers = users.filter(
          (u, index, self) => self.findIndex((t) => t.id === u.id) === index
        )
        setOnlineUsers(uniqueUsers)
      })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userProfile: currentUserProfile,
          onlineAt: new Date().toISOString(),
        })
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [channelName, currentUserProfile])

  return onlineUsers
}

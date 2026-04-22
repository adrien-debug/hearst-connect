'use client'

import { Canvas } from '@/components/connect/canvas'
import { NavigationProvider } from '@/components/connect/use-connect-routing'

export function AppClient() {
  return (
    <NavigationProvider>
      <Canvas />
    </NavigationProvider>
  )
}

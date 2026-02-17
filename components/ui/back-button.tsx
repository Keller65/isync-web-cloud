'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from '@phosphor-icons/react'

export function BackButton() {
  const router = useRouter()

  return (
    <Button variant="ghost" onClick={() => router.back()} className="cursor-pointer text-sm text-muted-foreground hover:text-current">
      <ArrowLeft size={20} className="mr-2" />
      Regresar
    </Button>
  )
}

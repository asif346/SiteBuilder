'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

export default function PlaygroundHeader() {
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <Image src={'logo.svg'} alt='logo.svg' width={35} height={35}/>
      <Button>Save</Button>
    </div>
  )
}

'use client'
import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext'
import Image from 'next/image'
import React, { useContext } from 'react'

export default function PlaygroundHeader() {
  const {onSaveData,setOnSaveData}=useContext(OnSaveContext);
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <Image src={'logo.svg'} alt='logo.svg' width={35} height={35}/>
      <Button onClick={()=>setOnSaveData(Date.now())}>Save</Button>
    </div>
  )
}

'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

export default function AppHeader() {
  return (
    <div className='flex justify-between items-center shadow'>
      <SidebarTrigger></SidebarTrigger>
      <UserButton/>

    </div>
  )
}

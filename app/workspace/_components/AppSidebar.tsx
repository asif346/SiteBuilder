'use client'
import React, { useContext, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserDetailContext } from '@/app/provider'
import { Progress } from '@/components/ui/progress'
import { UserButton } from '@clerk/nextjs'

export default function AppSidebar() {
  const [projectlist, setProjectlist] = useState<any[]>([]);
  const {userDetail, setUserDetail} = useContext(UserDetailContext);
  return (
    <Sidebar>
      <SidebarHeader>
       <div className='flex items-center gap-2'><Image src={'/logo.svg'} alt='logo.png' width={35} height={35}></Image>
       <h2 className='font-bold text-xl'>SiteBuilder</h2>
       </div>
       <Link href={'/workspace'} className='mt-5 w-full'>
       <Button className='w-full'>+ Add New Project</Button>
       </Link>
       
      </SidebarHeader>
      <SidebarContent className='p-2'>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          {projectlist.length === 0 && <h2 className='text-sm px-2 text-gray-500'>No Project found</h2>}
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className='p-2'>
        <div className='p-3 border rounded-xl space-y-3 bg-secondary'>
          <h2 className='flex justify-between items-center'>
            Remaining Credits <span className='font-bold'>{userDetail?.credits}</span>
          </h2>
          <Progress value={33}/>
          <Button className='w-full'>Upgrade for more creation</Button>
          
        </div>
        <div className='flex items-center gap-2'>
          <UserButton></UserButton>
          <Button variant={'ghost'}>Settings</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

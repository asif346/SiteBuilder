"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

const menuOption = [
  {
    name: "pricing",
    path: "/pricing",
  },
  {
    name: "Contact us",
    path: "/contact-us",
  },
];

export default function Header() {
  return (
    <div className="flex items-center justify-between p-3 shadow">
      <div className="flex gap-2 items-center">
        {/* logo */}
        <Image src={"/logo.svg"} alt="logo" width={35} height={35} />
        <h2 className="font-bold text-xl">SiteBuilder</h2>
      </div>
      {/* menuOption */}
      <div className="flex gap-3">
        {menuOption.map((menu,index)=>(
            <Button variant={'ghost'} key={index}>{menu.name}</Button>
        ))}
      </div>
      {/* get started Button */}
      <div>
        <SignInButton mode="modal" forceRedirectUrl={'/workspace'}>
         <Button>Get Started <ArrowRight/></Button>
        </SignInButton>
      </div>
    </div>
  );
}

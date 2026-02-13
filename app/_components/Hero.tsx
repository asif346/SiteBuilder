'use client'
import { Button } from "@/components/ui/button";
import { SignIn, SignInButton } from "@clerk/nextjs";
import { ImagePlus } from "lucide-react";
import { ArrowUp } from "lucide-react";
import React, { useState } from "react";

export default function Hero() {
  const [userInput, setUserInput] = useState<string>();
  return (
    <div className="flex flex-col items-center h-[80vh] justify-center">
      {/* header and description */}
      <h2 className="font-bold  text-5xl">What should be Design</h2>
      <p className="mt-2 text-xl text-gray-600">
        Generate, Edit and Explore design with Ai, Export code as well
      </p>
      {/* imput box */}
      <div className="w-full max-w-2xl p-5 border mt-5 rounded-2xl">
        <textarea className="w-full focus:outline-none focus:ring-0 resize-none" 
        placeholder="Desribe your Page Design" value={userInput}
        onChange={(event)=> setUserInput(event.target.value)}>
        </textarea>

        <div className="flex justify-between items-center">
            <Button variant={'ghost'} size={'icon'}><ImagePlus/></Button>
            <SignInButton mode="modal" forceRedirectUrl={'/workspace'}>
             <Button disabled={!userInput} ><ArrowUp/></Button>
            </SignInButton>
        </div>
      </div>
      {/* suggestion list */}
    </div>
  );
}

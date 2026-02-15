'use client'
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import axios from "axios";
import { ImagePlus, Loader2Icon, ArrowUp } from "lucide-react";
import { useRouter } from 'next/navigation'
import React, { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export default function Hero() {

  const [userInput, setUserInput] = useState("");
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const CreatNewProject = async () => {

    if (!user) return;

    setLoading(true);

    const projectId = uuidv4();
    const frameId = GenerateRandomFrameNumber();

    const messages = [
      {
        role: 'user',
        content: userInput
      }
    ];
    // console.log('projectId: ',projectId);
    // console.log('frameId: ',frameId);
    // console.log('messages: ',messages);
    try {

      const result = await axios.post('/api/project', {
        projectId,
        frameId,
        messages
      });
      console.log(result);

      toast.success('Project Created Successfully');

      router.push(`/playground/${projectId}?frame=${frameId}`);

    } catch (e) {

      toast.error('Internal Server Error');
      console.log(e);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-[80vh] justify-center">

      <h2 className="font-bold text-5xl">What should we Design?</h2>

      <p className="mt-2 text-xl text-gray-600">
        Generate, Edit and Explore design with AI
      </p>

      <div className="w-full max-w-2xl p-5 border mt-5 rounded-2xl">

        <textarea
          className="w-full focus:outline-none resize-none"
          placeholder="Describe your Page Design"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        <div className="flex justify-between items-center">

          <Button variant="ghost" size="icon">
            <ImagePlus />
          </Button>

          {!user ? (
            <SignInButton mode="modal" forceRedirectUrl={'/workspace'}>
              <Button disabled={!userInput}>
                <ArrowUp />
              </Button>
            </SignInButton>
          ) : (
            <Button
              disabled={!userInput || loading}
              onClick={CreatNewProject}
            >
              {loading
                ? <Loader2Icon className="animate-spin" />
                : <ArrowUp />
              }
            </Button>
          )}

        </div>
      </div>

    </div>
  );
}

const GenerateRandomFrameNumber = () =>
  Math.floor(Math.random() * 10000);

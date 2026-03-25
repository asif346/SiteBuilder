'use client'
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'

export type Frame = {
  projectId: string,
  frameId: string,
  designCode: string,
  chatMessages: Messages[]
}

export type Messages = {
  role: string,
  content: string
}

const Prompt = `userInput: {userInput}

Instructions:

1. If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

   - Generate a complete HTML Tailwind CSS code using Flowbite UI components.  
   - Use a modern design with **blue as the primary color theme**.  
   - Only include the <body> content (do not add <head> or <title>).  
   - Make it fully responsive for all screen sizes.  
   - All primary components must match the theme color.  
   - Add proper padding and margin for each element.  
   - Components should be independent; do not connect them.  
   - Use placeholders for all images.  

2. If the user input is general text or greetings, respond with a simple message.`

export default function PlayGround() {

  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frame');

  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  useEffect(() => {
    if (frameId) GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    try {
      const result = await axios.get(`/api/frames?frameId=${frameId}&projectId=${projectId}`);

      setFrameDetail(result.data);

      if (result.data?.chatMessages?.length === 1) {
        const userMsg = result.data.chatMessages[0].content;
        SendMessage(userMsg);
      } else {
        setMessages(result.data?.chatMessages || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const SendMessage = async (userInput: string) => {
    try {
      setLoading(true);
      setGeneratedCode(''); // ✅ reset code before new generation

      // ✅ prevent duplicate user message
      setMessages(prev => {
        if (prev[prev.length - 1]?.content === userInput) return prev;
        return [...prev, { role: 'user', content: userInput }];
      });

      const result = await fetch('/api/ai-model', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: Prompt.replace('{userInput}', userInput) }]
        })
      });

      if (!result.body) {
        setLoading(false);
        return;
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      let aiResponse = '';
      let isCode = false;
      let codeBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // ✅ detect start of code block
        if (!isCode && aiResponse.includes('```html')) {
          isCode = true;
          const startIndex = aiResponse.indexOf('```html') + 7;
          codeBuffer = aiResponse.slice(startIndex);
          setGeneratedCode(codeBuffer);
          continue;
        }

        // ✅ collect code
        if (isCode) {
          codeBuffer += chunk;

          // ✅ detect end of code block
          if (codeBuffer.includes('```')) {
            const endIndex = codeBuffer.indexOf('```');
            const finalCode = codeBuffer.slice(0, endIndex);
            setGeneratedCode(finalCode);
            break;
          } else {
            setGeneratedCode(codeBuffer);
          }
        }
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: isCode ? 'Your code is ready' : aiResponse
        }
      ]);

      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      SaveMessages();
    }
  }, [messages, loading]);

  const SaveMessages = async () => {
    try {
      await axios.put('/api/chats', {
        messages: messages,
        frameId: frameId
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <PlaygroundHeader />

      <div className='flex'>
        <ChatSection
          messages={messages}
          onSend={(input: string) => SendMessage(input)}
          loading={loading}
        />

        <WebsiteDesign generatedCode={generatedCode} />
      </div>
    </div>
  )
}
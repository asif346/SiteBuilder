'use client'
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'

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
   - Use placeholders for all images:  
       - Light mode: https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg
       - Dark mode: https://www.cibaky.com/wp-content/uploads/2015/12/placeholder-3.jpg
       - Add alt tag describing the image prompt.  
   - Use the following libraries/components where appropriate:  
       - FontAwesome icons (fa fa-)  
       - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.  
       - Chart.js for charts & graphs  
       - Swiper.js for sliders/carousels  
       - Tippy.js for tooltips & popovers  
   - Include interactive components like modals, dropdowns, and accordions.  
   - Ensure proper spacing, alignment, hierarchy, and theme consistency.  
   - Ensure charts are visually appealing and match the theme color.  
   - Header menu options should be spread out and not connected.  
   - Do not include broken links.  
   - Do not add any extra text before or after the HTML code.  

2. If the user input is **general text or greetings** (e.g., "Hi", "Hello", "How are you?") **or does not explicitly ask to generate code**, then:

   - Respond with a simple, friendly text message instead of generating any code.  

Example:

- User: "Hi" → Response: "Hello! How can I help you today?"  
- User: "Build a responsive landing page with Tailwind CSS" → Response: [Generate full HTML code as per instructions above]
`

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

      const designCode = result.data?.designCode || '';
      if (designCode.includes("```html")) {
        const start = designCode.indexOf("```html") + 7;
        const end = designCode.indexOf("```", start);
        setGeneratedCode(designCode.slice(start, end));
      } else {
        setGeneratedCode(designCode);
      }

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
      setGeneratedCode('');

      setMessages(prev => {
        if (prev[prev.length - 1]?.content === userInput) return prev;
        return [...prev, { role: 'user', content: userInput }];
      });

      const result = await fetch('/api/ai-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // ✅ FIX
        },
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

        if (!isCode && aiResponse.includes('```html')) {
          isCode = true;
          const startIndex = aiResponse.indexOf('```html') + 7;
          codeBuffer = aiResponse.slice(startIndex);
          setGeneratedCode(codeBuffer);
          continue;
        }

        if (isCode) {
          codeBuffer += chunk;

          if (codeBuffer.includes('```')) {
            const endIndex = codeBuffer.indexOf('```');
            const finalCode = codeBuffer.slice(0, endIndex);
            setGeneratedCode(finalCode);

            // ✅ SAVE ONLY ONCE (FINAL)
            await SaveGeneratedCode(finalCode);

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

  const SaveGeneratedCode = async (code: string) => {
    try {
      await axios.put('/api/frames', {
        designCode: code,
        frameId: frameId,
        projectId: projectId
      });

      toast.success('Website is Ready!'); // ✅ now fires once
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
"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import WebPageTools from "./WebPageTools";
import ElementSettingSection from "./ElementSettingSection";
import ImageSettingSection from "./ImageSettingSection";
import { OnSaveContext } from "@/context/OnSaveContext";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useSearchParams } from "next/navigation";

type Props = {
  generatedCode: string;
};

const HTML_CODE = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
          <title>AI Website Builder</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>

          <!-- Flowbite CSS & JS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

          <!-- Font Awesome / Lucide -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

          <!-- Chart.js -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body id="root"></body>
      </html>`;

export default function WebsiteDesign({ generatedCode }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState("web");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>();

  const { onSaveData, setOnSaveData } = useContext(OnSaveContext);

  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frame");

  // Initialize iframe shell once
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(HTML_CODE);
    doc.close();

    let hoverEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      if (selectedEl) return;
      const target = e.target as HTMLElement;
      if (hoverEl && hoverEl !== target) {
        hoverEl.style.outline = "";
      }
      hoverEl = target;
      hoverEl.style.outline = "2px dotted blue";
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (selectedEl) return;
      if (hoverEl) {
        hoverEl.style.outline = "";
        hoverEl = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;

      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
      }

      selectedEl = target;
      selectedEl.style.outline = "2px solid red";
      selectedEl.setAttribute("contenteditable", "true");
      selectedEl.focus();
      console.log("Selected element:", selectedEl);

      setSelectedElement(selectedEl);
    };

    const handleBlur = () => {
      if (selectedEl) {
        console.log("Final edited element:", selectedEl.outerHTML);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
        selectedEl.removeEventListener("blur", handleBlur);
        selectedEl = null;
      }
    };

    doc.body?.addEventListener("mouseover", handleMouseOver);
    doc.body?.addEventListener("mouseout", handleMouseOut);
    doc.body?.addEventListener("click", handleClick);
    doc?.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      doc.body?.removeEventListener("mouseover", handleMouseOver);
      doc.body?.removeEventListener("mouseout", handleMouseOut);
      doc.body?.removeEventListener("click", handleClick);
      doc?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update body only when code changes
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const root = doc.getElementById("root");
    if (root) {
      root.innerHTML =
        generatedCode
          ?.replaceAll("```html", "")
          .replaceAll("```", "")
          .replace("html", "") ?? "";
    }
  }, [generatedCode]);

  useEffect(() => {
    onSaveData && onSaveCode();
  }, [onSaveData]);

  const onSaveCode = async () => {
    if (iframeRef.current) {
      try {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const cloneDoc = iframeDoc.documentElement.cloneNode(
            true,
          ) as HTMLElement;
          // remove all outlines
          const AllEls = cloneDoc.querySelectorAll<HTMLElement>("*");
          AllEls.forEach((el) => {
            el.style.outline = "";
            el.style.cursor = "";
          });
          const html = cloneDoc.outerHTML;
          console.log("html to save", html);

          const result = await axios.put("/api/frames", {
            designCode: html,
            frameId: frameId,
            projectId: projectId,
          });
          console.log(result.data);
          toast.success("Saved!");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <div className="p-5 w-full flex items-center flex-col">
        <iframe
          ref={iframeRef}
          className={`${selectedScreenSize == "web" ? "w-full" : "w-120"} h-150 border-2 rounded-xl`}
          sandbox="allow-scripts allow-same-origin"
        />
        <WebPageTools
          selectedScreenSize={selectedScreenSize}
          setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)}
          generatedCode={generatedCode}
        />
      </div>
      <div>
        {/* Settings Panel */}
        {selectedElement?.tagName == "IMG" ? (
          //@ts-ignore
          <ImageSettingSection selectedEl={selectedElement} />
        ) : selectedElement ? (
          <ElementSettingSection
            selectedEl={selectedElement}
            clearSelection={() => setSelectedElement(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

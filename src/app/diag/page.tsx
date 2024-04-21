"use client";

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon } from "@radix-ui/react-icons";
import { KeyboardEvent, useRef, useState } from "react";
import Link from "next/link";

interface Message {
  message: String;
  type: "bot" | "user";
}

export default function Chat() {
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setConversation((oldArray: Message[]) => [...oldArray, message]);
    if (message.type === "user") {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const messageEndPosition =
        messagesEndRef.current?.getBoundingClientRect()?.top || 0;
      const scrollAreaPosition =
        scrollRef.current?.getBoundingClientRect()?.top || 0;
      const scrollAreaHeight = scrollRef.current?.clientHeight || 0;
      const scrollPosition = messageEndPosition - scrollAreaPosition;
      if (scrollAreaHeight - scrollPosition >= -200) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const sendMessage = () => {
    if (userInput) {
      addMessage({ message: userInput, type: "user" });
      setUserInput(""); // clear the textarea

      // Here's is where you would put your request to the
      // chat bot server, a reply from the server should be
      // added using the function: addMessage({ message: "ok", type: "bot" });
      // for now we will only simulate the reply
      setTimeout(() => {
        addMessage({ message: "ok", type: "bot" });
      }, (Math.floor(Math.random() * (15 - 10 + 1)) + 10) * 100);
    }
  };

  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="h-screen flex flex-col bg-background">

      {/* Header */}
      <div className="flex justify-between h-20 m-4 items-center">
        <div>
          <Link href="/">
            <img className = "w-16 h-16 m-4" src="/pathosLogo.png" alt="Logo" />
          </Link>
        </div>
      </div>

      {/* Conversation */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-x-hidden">
        <div className="flex flex-col gap-1 p-2 max-w-3xl mx-auto">
          {conversation.map((msg, i) => {
            return (
              <div key={i} className="flex gap-2 first:mt-2">
                {msg.type === "bot" && (
                  <>
                    {conversation[i - 1] &&
                    conversation[i - 1].type === "bot" ? (
                      <div className={`w-6 h-6`}></div>
                    ) : (
                      <Avatar className={`w-6 h-6 bg-background`}>
                        <AvatarImage src="avatar/02.png" />
                        <AvatarFallback>.ˍ.</AvatarFallback>
                      </Avatar>
                    )}
                  </>
                )}
                <div
                  className={`break-words whitespace-normal bg-white rounded-full border gap-2 m-4 px-4 py-3 text-md max-w-[60%] ${
                    msg.type === "bot"
                      ? "bg-white text-primary mr-auto"
                      : "text-secondary bg-foreground ml-auto"
                  } whitespace-pre-wrap `}
                >
                  {msg.message}
                </div>
                {msg.type === "user" && (
                  <>
                    {conversation[i - 1] &&
                    conversation[i - 1].type === "user" ? (
                      <div className={`w-6 h-6`}></div>
                    ) : (
                      <Avatar className={`w-6 h-6 bg-gray-200`}>
                        <AvatarImage src="avatar/01.png" />
                        <AvatarFallback>.ˍ.</AvatarFallback>
                      </Avatar>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} className="mb-2"></div>
      </ScrollArea>

      {/* Chat input */}
      <div className="w-full sm:max-w-3xl mx-auto">
        <div className="bg-white rounded-t-xl border-t sm:border shadow-lg">
          <div className="p-4">
            <div className="flex flex-row gap-3 p-4 border rounded-full">
              {/* <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <div className="h-8 w-8 p-0 rounded-full shadow-sm border flex items-center justify-center">
                      <PlusIcon className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" alignOffset={-10}>
                    <DropdownMenuLabel>More options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Reset</DropdownMenuItem>
                    <DropdownMenuItem>
                      Attach <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
              <AutosizeTextarea
                className="flex-1 bg-white outline-none border-0 text-md"
                placeholder="Respond to Nosie..."
                minHeight={25}
                maxHeight={55}
                rows={1}
                onKeyDown={(e) => handleEnter(e)}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <Button onClick={() => sendMessage()} className="h-8 w-8 p-0 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

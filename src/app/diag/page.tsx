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
import { TypeAnimation } from 'react-type-animation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ScrollArea } from "@/components/ui/scroll-area";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon } from "@radix-ui/react-icons";
import { KeyboardEvent, useRef, createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";

import React from 'react';
import ReactTypingEffect from 'react-typing-effect';

import  { useDiagnosis } from '@/app/global'; 

// interface Message {
//   message: String;
//   type: "bot" | "user";
// }


const TwoCards = () => {
  return (
    <div className="flex justify-center items-end" style={
      {height: "50%", width: "100%"}
    }>
      {/* First Card */}
      <div className="mr-4 h-full text-lg " style={
        {width: "40%"}}>
        <Card>
          <div className="p-4">
            <h2 className="text-3xl font-bold mb-2">Treatments:</h2>
            <p className="text-gray-600">This is the content of Card 1.</p>


          </div>
        </Card>
      </div>

      {/* Second Card */}
      <div className="ml-4 h-full text-lg" style={
        {width: "40%"}}>
        <Card>
          <div className="p-4">
            <h2 className="text-3xl font-bold mb-2">Symptoms:</h2>
            <p className="text-gray-600">This is the content of Card 2.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};


export default function Diagnose() {

  const[treatments, addTreatments] = useState({});
  const[symptoms, addSymptoms] = useState({});


  const { diagnosis } = useDiagnosis();

  useEffect(() => {
    // Update diagnosis asynchronously after component has mounted
    setDiagnosis("aidasdfadsfasas");
  }, []);
  console.log("hello!!");
  useEffect(() => {
    console.log("Diagnosis updated:", diagnosis);
  }, [diagnosis]);

  return (
    <DiagnosisProvider>
    <main className="h-screen flex flex-col bg-background">

      {/* Header */}
      <div className="flex justify-between bg-white h-16 gap-3 items-center px-3">
        <div>
          <Link href="/">
            <img className = "w-10 h-10 m-1" src="/noseLogo.png" alt="Logo" />
          </Link>
        </div>
        <h1 className="text-5xl font-bold text-primary">Diagnosis</h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="w-6 h-6 bg-background">
              <AvatarImage src="avatar/01.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={-5}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-8"></div>
      <div className="h-8"></div>
      <div className="h-8"></div>
      <div className="content-end flex bg-background p-6 justify-center flex-end">


      {/* <ReactTypingEffect
        text={["You most likely have... "]}
        eraseSpeed={0}
        cursorRenderer={cursor => <h1>{cursor}</h1>}
        eraseDelay={10000000000000000000000000000000000000000}
        displayTextRenderer={(text, i) => {
          return (
            <h1>
              {text.split('').map((char, i) => {
                const key = `${i}`;
                return (
                  <span
                    key={key}
                    style={i%2 === 0 ? { color: 'magenta'} : {}}
                  >{char}</span>
                );
              })}
            </h1>
          );
        }}        
      /> */}


        <div className="text-3xl md:text-3xl lg:text-4xl bg-background text-center text-gray-800 content-end mr-3">
          <p>you most likely have... </p>
        </div>
          <div className="text-3xl md:text-3xl lg:text-6xl text-center text-primary">
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                diagnosis,
                1000,

              ]}
              speed={30}
              repeat={Infinity}
            />
          </div>
        
      </div>

      <div className="h-8"></div>

      <TwoCards />

    </main>
    </DiagnosisProvider>
  );
}

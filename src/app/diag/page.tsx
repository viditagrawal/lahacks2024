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
import { GoogleGenerativeAI } from "@google/generative-ai";

import { useMyContext } from "../providers";



const GOOGLE_API_KEY = "AIzaSyDY2jojcob55W7G03r_-4eCs0isb5PLsNo";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || GOOGLE_API_KEY);


const generateResponse = async (userInput: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "You are a doctor and I have a disease/illness. Give me 5 treatments for it, and then 5 symptoms of it. Respond in the format of the treatments first split by a hashtag character, then the symptoms split by a hashtag character.  I don't want numbers with the list and nothing else. An example response is \"# Topical corticosteroids # Corticosteroids injections # Immunotherapy # Minoxidil # Anthralin # # Sudden, round patches of hair loss # Smooth, round, bald patches # Itching or burning sensation # Exclamation mark hairs # Brittle nails #\". The disease is " + userInput;

  console.log("Question Prompt: ", prompt);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log(text);

  return text;
}


// interface Message {
//   message: String;
//   type: "bot" | "user";
// }

interface TwoCardsProps {
  treatmentsList: string[];
  symptomList: string[];
}

const TwoCards: React.FC<TwoCardsProps> = ({ treatmentsList, symptomList }) => {

  const renderBulletPoints = (items: string[] | undefined) => {
    if (!Array.isArray(items)) {
      // Handle empty or invalid items
      return (
        <ul className="list-disc pl-4">
          <li className="text-gray-600">No items to display</li>
        </ul>
      );
    }
  
    return (
      <div className="list-container list-disc pl-4 justify-between flex flex-col" style={{height: "80%", flexDirection: 'column' }}>
          {items.map((item, index) => (

            <li key={index} className="list-item text-gray-600 text-2xl">
              <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                500 * (index),
                item,
                1000,
              ]}
              speed={30}
              repeat={Infinity}
              cursor = {false}
            />
            </li>
          ))}
      </div>  
    );
  };
  return (
    <div className="flex justify-center items-end" style={
      {height: "50%", width: "100%"}
    }>
      {/* First Card */}
      <div className="mr-4 h-full text-lg drop-shadow-xl" style={
        {width: "40%"}}>
        <Card>
          <div className="p-4 h-full">
            <h2 className="text-3xl font-bold mb-2 text-center  ">Treatments</h2>
            <div className="h-3 flex justify-center mb-2">
              <h3 className="w-80 h-1 border-color border-2 "> </h3>

            </div>
            
            {renderBulletPoints(treatmentsList)}


          </div>
        </Card>
      </div>

      {/* Second Card */}
      <div className="ml-4 h-full text-lg drop-shadow-xl" style={
        {width: "40%"}}>
        <Card>
          <div className="p-4 h-full">
            <h2 className="text-3xl font-bold mb-2 text-center">Symptoms</h2>
            <div className="h-3 flex justify-center mb-2">
              <h3 className="w-80 h-1 border-color border-2 "> </h3>

            </div>

            {renderBulletPoints(symptomList)}

          </div>
        </Card>
      </div>
    </div>
  );
};

const ScrollArrow = () => {
    return (
        <svg className="animate-bounce" fill="#2b8388"  height="50" width="50" viewBox="0 0 330 330">
            <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
        </svg>
    );
  }

const parseResponse = (response: string) => {
  const lines = response.split('#').map(line => line.trim());  

  const treatmentsList: string[] = [];
  const symptomsList: string[] = [];
  let count = 0;
  console.log("lines;" + lines);
  lines.forEach(line => {
    if (line.length > 2) {
      if(count < 5){
        treatmentsList.push(line);
        count = count+1;
      }
      else{
        symptomsList.push(line);
      }
    }
  });


  return { treatments: treatmentsList, symptoms: symptomsList };
};

export default function Diagnose() {

  const {diag1, setDiag1} = useMyContext();
  const {diag2, setDiag2} = useMyContext();
  const {diagStory1, setDiagStory1} = useMyContext();
  const {diagStory2, setDiagStory2} = useMyContext();

  const[treatments, setTreatments] = useState<string[]>([]);
  const[symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await generateResponse(diag1);
        console.log("Your response: " + response)
        const { treatments: newTreatments, symptoms: newSymptoms } = parseResponse(response);

        // Update treatments and symptoms state with new values

        console.log(newTreatments)
        console.log(newSymptoms)

        setTreatments(newTreatments);
        setSymptoms(newSymptoms);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error if needed
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // This effect will run whenever treatments or symptoms change
    console.log('Updated treatments:', treatments);
    console.log('Updated symptoms:', symptoms);
  }, [treatments, symptoms]); // List dependencies: treatments and symptoms


  // useEffect(() => {
  //   // Update diagnosis asynchronously after component has mounted
  // }, []);
  // console.log("hello!!");
  // useEffect(() => {
  //   console.log("Diagnosis updated:", diagnosis);
  // }, [diagnosis]);

  return (
    <div>
        <main className="h-screen flex flex-col bg-background">

            {/* Header */}
            <div className="flex flex-row justify-between bg-background sticky top-0 items-center">
                <div>
                <Link href="/">
                    <img className = "w-24 h-24 m-8" src="/pathosLogo.png" alt="Logo" />
                </Link>
                </div>
            </div>
            <div className="content-end flex bg-background p-2 justify-center flex-end">

            <div className="p-2 text-3xl md:text-3xl lg:text-4xl bg-background text-center text-gray-800 content-end mr-3">
            <p>you most likely have... </p>
            </div>
        
            <div className = "p-2 rounded-3xl border-2 border-color">
            <div className="text-3xl md:text-3xl lg:text-6xl text-center text-primary box-border">
                <TypeAnimation
                sequence={[
                    // Same substring at the start will only be typed out once, initially
                    diag1,
                    1000,

                ]}
                speed={30}
                repeat={Infinity}
                cursor={false}
                />
            </div>
            </div>
            </div>

            <div className="h-8"></div>
            <div className="h-8"></div>
            <div className="h-8"></div>
            
            <TwoCards treatmentsList={treatments} symptomList={symptoms} />

            <div className="p-2 text-3xl md:text-3xl lg:text-4xl bg-background text-center text-gray-800 content-end mr-3">
            <div className="flex justify-center space-x-5 mt-6">
                <p>scroll to see a graph of all story embeddings, and their corresponding diagnoses</p>
                {ScrollArrow()}
            </div>
            </div>
        </main>

        <iframe className="m-auto w-4/5 h-svh"src="http://projector.tensorflow.org/?config=https://gist.githubusercontent.com/kylebkumar/3aeb08fca2552acca5a9fb9c3ac73202/raw/2a2c91d7f25e5959a7ace91eefe65ff70c187133/template_projector_config.json"/>
    </div>
  );
}

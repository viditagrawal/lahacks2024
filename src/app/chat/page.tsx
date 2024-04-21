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
import RedditEmbed from "./RedditEmbed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect, KeyboardEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useMyContext } from "../providers";

const GOOGLE_API_KEY = "AIzaSyDY2jojcob55W7G03r_-4eCs0isb5PLsNo";
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || GOOGLE_API_KEY
);

interface Message {
  message: String;
  type: "bot" | "user";
  embed?: string;
}

type PastStories = {
  [key: string]: number;
};

export default function Chat() {
  const router = useRouter();
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);

  const {diag1, setDiag1} = useMyContext();
  const {diag2, setDiag2} = useMyContext();
  const {diagStory1, setDiagStory1} = useMyContext();
  const {diagStory2, setDiagStory2} = useMyContext();
  const [shownStoryIds, setShownStoryIds] = useState(new Set());
  const [diagReady, setDiagStatus] = useState(false);
  const [pastStories, setPastStories] = useState<PastStories>({});
  const [mostRecentStory, setMostRecentStory] = useState("");
  const [summaryReady, setSummaryReady] = useState(false);

  const [globalSummary, setSummary] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialMessage = async () => {
      try {
        setTimeout(() =>  {
          addMessage({
            message:
              "Hello! My name is Nosie... Please write a quick story/summary of how you're feeling?",
            type: "bot",
          });}, 1000)
      } catch (error) {
        console.log(error);
      }
    };

    initialMessage();
  }, []);

  const generateResponse = async (userInput: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      "Analyze the provided patient narrative describing their symptoms and health experiences. Identify the critical aspects of their illness story. Generate a single, clear question aimed at obtaining specific additional details or context necessary for a more precise diagnosis. This question should directly probe into aspects such as symptom patterns, potential triggers, and impacts on daily activities. Return only the question without any prefixes or additional text. \n Summary: " +
      userInput;

    console.log("Question Prompt: ", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    return text;
  };

  const calculateSentiment = async (userInput: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      "You are given a user's response to how much they relate to a story. Return 1 if the user agrees and relates to the story and 0 if the user disagrees and does not relate to the story. \n Response: " +
      userInput; 

    console.log("Question Prompt: ", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("TEXT: ", text);

    return text;
  };

  const calculateMaxDiagnose = async (userInput: string) => {
    console.log("Calculating max diag: " + userInput);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    if (userInput !== '{}') {
      const prompt =
      "Given a dictionary where each entry is a diagnosis with its corresponding count, please identify and return the name of the diagnosis that has the highest total count after grouping similar entries. The response should be the name of the diagnosis only, without any counts or additional data." + 
        "\n Dictionary: " + userInput; 

      // console.log("Question Prompt: ", prompt);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("FINAL DISEASE: ", text);

      await setDiag1(text);
      router.push("/diag");

      return text;
    }

      router.push("/diag");
    // console.log(text);
    return null;
  };

  const addStoryToConversation = async (data: any, summary: string) => {
    if (!shownStoryIds.has(data.post_url)) {
      // Story ID not shown before, display it
      await setMostRecentStory(data["text"]);
      if(shownStoryIds.size == 0)
      {
        await addMessage({ message: "I hope you feel better soon! Someone else had a very similar story to yours where you might be able to find some help.", type: "bot" });
      }
      else
      {
        await addMessage({ message: "Thanks for letting me know. Here is another experience someone else faced:", type: "bot" });
      }
      await addMessage({ message: data.text, type: "bot" });
      await addMessageWithRedditEmbed({ message: "", type: "bot" }, data.post_url);
      await setShownStoryIds(prev => {
        const newSet = new Set(prev); // Create a new Set based on the previous one
        newSet.add(data.post_url);   // Add the new URL
        return newSet;               // Return the updated Set
      });
    } else {
      // Story ID has been shown before, fetch another or handle accordingly
      console.log("Story already shown, fetching a new one or skipping...");
      console.log(Array.from(shownStoryIds));
      try {
          const endpoint = 'http://18.224.93.12:5000/fetch-response';
          const requestBody = {
            message: summary,
            pastUrls: Array.from(shownStoryIds),
            count: 1,
          };
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data);
          var i = 0
          while(shownStoryIds.has(data[i].post_url))
          {
            i += 1
            console.log(i)
          }
          if (data[i] && data[i].post_url) {
            await addStoryToConversation(data[i], summary);
          } else {
            console.error("No story ID found in the fetched data");
          }
      }
      catch (error) {
        console.log(error);
      }
    } 
  };


  const summarizeConversation = async (userInput: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      "Analyze the conversation below, paying close attention to the explicit details provided by the user about their health concerns. Summarize the key points mentioned, focusing strictly on the information shared without inferring additional details or context. Your response should directly reflect the user's statements, ensuring accuracy and adherence to the provided data. The summary should help clarify the user's experience in a straightforward manner, suitable for understanding the situation without adding any assumed information. Write it in the first-person perspective of the user." +
      " \n Conversation: \n" +
      userInput;

    console.log("Summary Prompt: ", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("SUMMARY: ", text);

    return text;
  };

  const addMessage = async (message: Message) => {
    await setConversation((oldArray: Message[]) => [...oldArray, message]);
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

  const addMessageWithRedditEmbed = async (
    message: Message,
    embedHtml: string
  ) => {
    const newMessage = { ...message, embed: embedHtml };
    await setConversation((oldArray: Message[]) => [...oldArray, newMessage]);

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

  const updateDictionary = async (key:string, shouldIncrement:any) => {
    let temp = await Number(shouldIncrement)
    console.log("UPDATE DICT: ", key, shouldIncrement)
    await setPastStories(pastStories => ({
      ...pastStories,
      [key]: key in pastStories ? (temp == 1 ? pastStories[key] + 1 : pastStories[key] - 1) : (temp == 1 ? 1 : -1),
    }));
  };

  
  const sendMessage = async () => {
    console.log(pastStories);
    if (userInput) {
      await setLoading(true);
      await addMessage({ message: userInput, type: "user" });
      await setUserInput(""); // clear the textarea

      let aiInput = "";

      for (let i = 1; i < conversation.length; i++) {
        const ign = "Hello!";
        //if (conversation[i].type === "bot") {
        if (!conversation[i].message.includes(ign)) {
          aiInput +=
            conversation[i].type + ": " + conversation[i].message + "\n";
        }
        //}
      }

      aiInput += "user: " + userInput + "\n";

      if (mostRecentStory !== "") {
        let sentiment = await calculateSentiment(userInput);
        await updateDictionary(diag1, sentiment);
        await setMostRecentStory("");
      }

      let summary = globalSummary;
      if (globalSummary == ""){
        summary = await summarizeConversation(aiInput);
      }

      // console.log("SUMMARY: ", summary);

      //console.log(summary);

      try {
        const endpoint = "http://18.224.93.12:5000/fetch-response";
        const requestBody = {
          message: summary,
          pastUrls: Array.from(shownStoryIds),
          count: 1,
        };
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        //console.log('Received from server:', data['diagnosis'], data['text']);
        if (!data["diagnosis"]) {
          if (summaryReady) {
            let finalDiagnosis = await calculateMaxDiagnose(JSON.stringify(pastStories));
          }
          //prompt gemini ai for a question and then re-loop
          let response = await generateResponse(summary);
          //console.log("More information needed");
          await addMessage({ message: response, type: "bot" });
          await setLoading(false);
        } else {
          await setSummaryReady(true);
          if (globalSummary == ""){
            await setSummary(summary);
          }
          //console.log("found diagnosis")
          //show story or diagnosis
          if (data && data.post_url) {
            await addStoryToConversation(data, summary);
          } else {
            console.error("No story ID found in the fetched data");
          }
          await setDiag1(data['diagnosis']);
          await setDiagStory1(data['text']);
          await setDiagStatus(true);
          await setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDiagButton = () => {
    // console.log(diagReady);

    if (diagReady) {
      return (
          <Button onClick = {() => calculateMaxDiagnose(JSON.stringify(pastStories))} className={`text-3xl rounded p-5 bg-primary text-white font-bold transition-colors
                      ease-in-out delay-100 duration-1000 h-min w-min hover: drop-shadow-xl 
                      transition transform animate-bounce hover:bg-secondary 
                        hover:text-foreground hover:scale-110 hover:-translate-y-1`}>
            Get Diagnosis
          </Button>
      )
    }
    else {
      return (
          <Button 
          disabled = {true}
          className="text-3xl rounded p-5 bg-primary text-white font-bold transition-colors
          ease-in-out delay-100 duration-1000 h-min w-min hover: drop-shadow-xl ">
                Get Diagnosis
          </Button>
      )
    }
  }

  return (
    <main className="max-h-screen overflow-hidden w-full flex flex-col justify-center bg-background">
      {/* Header */}
      <div className="flex flex-row justify-between bg-background sticky top-0 items-center">
        <div className="bg-background">
          <Link href="/">
            <img className="w-24 h-24 m-8" src="/pathosLogo.png" alt="Logo" />
          </Link>
        </div>
        <div className="m-6 justify-end">
          {handleDiagButton()}
        </div>
      </div>

      {/* Conversation */}

      <div className={`pt-32 h-screen min-w-[70%] justify-center flex flex-col bg-background p-4`}>
        <ScrollArea ref={scrollRef}>
          <div className="flex flex-col gap-1 p-2 pb-32">
            {conversation.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                } items-end`}
              >
                <div
                  className={`flex flex-row break-words rounded-3xl border px-4 py-2 text-2xl max-w-[45%] drop-shadow-lg m-2 ${
                    msg.type === "bot"
                      ? "bg-white text-primary ml-56"
                      : "text-secondary bg-foreground mr-56"
                  }`}
                >
                  {/* Avatar inside the bubble */}
                  {msg.type === 'bot' && <Avatar className="w-6 h-6 m-3 shrink-0">
                    <AvatarImage src={`avatar/02.png`} />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>}
                  
                  {/* Text inside the bubble */}
                  {msg.embed ? (
                  <RedditEmbed post_url={msg.embed}/>
                ) : (
                  <span className="m-2 break-words overflow-hidden">{msg.message}</span>)}

                  {msg.type === 'user' && <Avatar className="w-6 h-6 m-3 shrink-0">
                    <AvatarImage src={`avatar/01.png`} />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} className="mb-2"></div>
        </ScrollArea>
      </div>

        {/* Chat input */}
      <div className="min-w-[70%] sm:max-w-3xl mx-auto fixed bottom-0 left-0 right-0">
        <div className="bg-white rounded-t-xl border-t sm:border shadow-lg">
          <div className="p-4">
            <div className="flex flex-row gap-3 p-4 border rounded-xl items-center">
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
                className="flex-1 bg-white outline-none border-0 text-2xl"
                placeholder="Respond to Nosie..."
                minHeight={25}
                maxHeight={55}
                rows={1}
                onKeyDown={(e) => handleEnter(e)}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              {!loading && 
              <Button onClick={() => sendMessage()} className="h-10 w-10 p-0 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 4v1M16.24 7.76l-0.7 0.7M20 12h-1M16.24 16.24l-0.7-0.7M12 20v-1M7.76 16.24l0.7-0.7M4 12h1M7.76 7.76l0.7 0.7" />
                </svg>
              </Button>}

              {loading && <Button onClick={() => sendMessage()} className="h-10 w-10 p-0 rounded-full" disabled={loading}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className={`animate-spin h-6 w-6`}
                  stroke="currentColor"
                >
                  {/* Example path for a spinner */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 4v1M16.24 7.76l-0.7 0.7M20 12h-1M16.24 16.24l-0.7-0.7M12 20v-1M7.76 16.24l0.7-0.7M4 12h1M7.76 7.76l0.7 0.7" />
                </svg>
              </Button>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

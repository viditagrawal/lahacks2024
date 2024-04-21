import Link from "next/link";
import { useContext } from 'react';
import Head from "next/head";

import ContextProvider from "./providers";

export default function Home() {

  return (
    <ContextProvider>
      <main className="font-abel flex flex-col max-h-screen overflow-hidden items-center justify-start text-center bg-gradient-to-r from-accent to-secondary">
      <div className = "justify-start h-24 w-full">
        <img className = "flex w-16 h-16 m-8" src="/pathosLogo.png" alt="Logo"></img>
      </div>
      <div className="flex flex-row overflow-hidden">
        <div className="flex flex-col justify-left text-left p-24">
          <h1 className="text-9xl font-bold mb-4">
            <span className="text-primary">Pathos</span>
          </h1>
          <p className="text-2xl mb-8">
            Feeling sick?
          </p>
          <p className="mb-8 text-2xl">
            No need to fear! Diagnose your illness with the help of others&apos; stories.
            <br />
            Whatever you&apos;re feeling, <span style={{fontStyle:"italic"}}>someone has felt before too</span>.
          </p>
          <Link href="/chat" legacyBehavior>
            <a className="bg-primary hover:bg-secondary text-white text-xl font-bold py-3 px-4 rounded-full w-28 transition-colors">
              Let&apos;s chat
            </a>
          </Link>
        </div>
      {/* Insert your SVG or image component for the logo here */}
        <img className = "w-min h-min m-8" src="/rain.png" alt="rain"></img>
      </div>
      </main>
    </ContextProvider>
  );
}

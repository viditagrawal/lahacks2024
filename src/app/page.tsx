import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-row min-h-screen items-center justify-center p-24 text-center bg-gradient-to-r from-accent to-secondary">
      <div className="flex-row justify-left text-left">
        <h1 className="text-9xl font-bold mb-4">
          <span className="text-primary">Diag<span style={{fontStyle:"italic"}}>nose</span></span>
        </h1>
        <p className="text-2xl mb-8">
          Feeling sick?
        </p>
        <p className="mb-8 text-2xl">
          No need to fear! Diagnose your illness with the help of other's stories.
          <br />
          Whatever you're feeling, <span style={{fontStyle:"italic"}}>someone has felt before too</span>.
        </p>
        <Link href="/chat" legacyBehavior>
          <a className="bg-primary hover:bg-secondary text-white text-xl font-bold py-3 px-4 rounded-full transition-colors">
            Let's chat
          </a>
        </Link>
      </div>
      {/* Insert your SVG or image component for the logo here */}
      <div className="ml-64">
        <img src="/noseLogo.png" alt="Logo" />
      </div>
    </main>
  );
}

# <img src="https://github.com/viditagrawal/lahacks2024/blob/main/public/pathosLogo.png" alt="Pathos" width="35"/>&nbsp; Pathos

Pathos is a web app that enables users to get medical information online from verified sources by simply telling the story of their experiences.

# Overview

Pathos is built with a `Next.js` and `Tailwind.css` frontend, contained in the `src` folder. Pathos contains a Flask backend contained in the `/server` folder. The backend reads from our Firebase Realtime Database 
to identify stories similar to a user's own experinces. 

To understand plaintext user inputs and online datasets, Pathos leverages Gemini's 
text-embedding methods to make sense of human written stories and LLM's to ask users clarifying questions and interpret user stories.


#CHANGE
prod = False
#------------
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import google.generativeai as genai
import os
from dotenv import load_dotenv
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# Initialize Firebase Admin SDK with service account credentials
cred = credentials.Certificate("./diagnose-420905-firebase-adminsdk-i5i0w-2dacf5ac9d.json")  # Path to your service account key file
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://diagnose-420905-default-rtdb.firebaseio.com/'
})

# Reference to your Firebase Realtime Database
ref = db.reference('/')

# Retrieve data
data = ref.get()
for ii in range(2, len(data)):
    data[ii]["embedding"] = np.array(data[ii]["embedding"]).reshape(1, -1)

load_dotenv()
GOOGLE_API_KEY=os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)


# Print just a part of the embedding to keep the output manageable

def getEmbedding(textStory):
    result = np.array(genai.embed_content(model="models/embedding-001", content=textStory)["embedding"]).reshape(1, -1)
    return result

# print(genai.embed_content(model="models/embedding-001", content="I (23F, 5'6, 150 lbs, white) have seen my general doctor, gynecologist, dermatologist, a cardiologist, a nephrologist, a neurologist, an endocrinologist, an allergist as well as my psychiatrist and therapist regarding these symptoms (each doctor sent me to the next, not in order). Every test comes back perfectly, they say on paper I am the healthiest person they have ever seen, and I look that way on the outside as well being a lifelong athlete, but...  Since I was 11 I have gotten my period twice a month (extremely heavy, terrible pain and symptoms, both periods lasting 7-9 days), my longest period was 26 days long.  At 14 I randomly become ""reactive"" to meat and sensitive to dairy, I have seen an allergist and nothing comes up, but if I eat meat (red or white - I have been tested for texas lone star tick) I need to go to the hospital (days of throwing up, fainting, stomach issues). I have been on a vegan diet because of this, but I eat extremely healthy and clean. I track my iron intake and protein, and generally eat very clean (saw a dietitian for a while, bloodwork also comes back great every time).  I drink 5+ gallons of water a day - yes, really that much, I track it - if I do not drink this much, I get overheated, dry mouth, and feel faint (thyroid has been tested).  When I became ""reactive"" to meat, I would break out in red hives if I ate it, now I avoid it at all costs (rash completely went away), but I still have a white rash that comes up. I am told it is remnants of an old rash/scarring, but the white spots appear and disappear seemingly randomly.  I have times where I will be extremely motivated and going to the gym every day for months, then there will be months where I can't get out of bed even for work, its more lethargy than depression, but naturally lying in bed for months will make you depressed.  I have had mental problems since I was a young kid (starting before elementary school), but my periods seem to bring on psychotic/schizophrenic tendencies - I have been diagnosed with anxiety, depression, bipolar 1 and 2, schizoaffective disorder etc. At its worst, I had brain scans done but everything looked good.  Honestly I'm tired of hearing that it is a mental thing when I have so many other issues that are going on physically and my mental issues are treatment resistant (I have probably been on every mental-related medication you can name, not currently on any). I can't help but feel like I was born broken and I'll have to live like this forever lol.  Hoping someone can at least point me in a new direction/give me some ideas of tests to request!"))
app = Flask(__name__)
CORS(app)
def write_result_to_db(result):
    print(list(result["embedding"].reshape(1, -1)[0]))
    data_to_add = {
        len(data): {
            "text" : result["text"],
            "diagnosis" : result["diagnosis"],
            "embedding" : list(result["embedding"].reshape(1, -1)[0])
        }
    }

    ref.update(data_to_add)

# Route that handles POST requests
@app.route('/fetch-response', methods=['POST'])
def post():
    #get embeddings for text
    # print("Request method:", request.method)
    # print("Request data:", request.data)  # Print raw request data
    user_story = request.get_json()['message'] # Decode request data from bytes to string
    count = request.get_json().get('count', 1) # 1 is the default value

    # print("Received data:", user_story)  # Print received data for debugging
    
    # call Gemini Endpoints2
    story_embed = getEmbedding(user_story)


    #get top story in database (make different diag)
    cosine_similarities = []
    for ii in range(2, len(data)):
        cosine_similarities.append((cosine_similarity(story_embed, data[ii]["embedding"])[0][0], ii))
    
    cosine_similarities.sort(key=lambda x : -x[0])

    most_similar_stories = []
    pos = 0
    seen_diagnoses = set()
    while len(most_similar_stories) < count and pos < len(cosine_similarities):
        idx = cosine_similarities[pos][1]
        diagnosis = data[idx]['diagnosis'].lower()
        if diagnosis not in seen_diagnoses:
            seen_diagnoses.add(diagnosis)
            most_similar_stories.append(cosine_similarities[pos])
        pos += 1
    
    # the following code will be used by the frontend to ask for more info if the best diagnosis is innacurate
    embedding_cuttoff = 0.75
    if most_similar_stories[0][0] < embedding_cuttoff:
        return {
            "diagnosis": None
           }
        
    result = {}

    for ii, (_, idx) in enumerate(most_similar_stories):
        comment_url = data[idx]['comments'][0]['url']
        post_url = comment_url[:comment_url.rfind('/', 0, -2)]
        result[ii] = {
            "text": data[idx]['text'],
            "diagnosis": data[idx]['diagnosis'],
            "post_url": post_url
        }

    # add new story to database
    if prod:
        new_db_entry = {
            "text": user_story,
            "embedding" : story_embed,
            "diagnosis" : result[0]["diagnosis"]
        }
        write_result_to_db(new_db_entry)

    # backwards compatibility
    if count == 1:
        return result[0]
    return result



if __name__ == '__main__':
    app.run(debug=True)
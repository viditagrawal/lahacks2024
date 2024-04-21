import React from 'react';
interface RedditEmbedProps {
    post_url: string;  // Ensure that url is of type string
}

function RedditEmbed( {post_url}: RedditEmbedProps ) {
    return (
        <React.Fragment>
            <blockquote className="reddit-embed-bq" style={{height: "316px", "data-embed-height": "316"}}>
                <a href={post_url}>Click here to view the post</a><br />
                by <a href="https://www.reddit.com/user/kindahipster/">u/kindahipster</a> in 
                <a href="https://www.reddit.com/r/AskDocs/">AskDocs</a>
            </blockquote>
            <script async src="https://embed.reddit.com/widgets.js" charSet="UTF-8"></script>
        </React.Fragment>
    );
}


export default RedditEmbed;

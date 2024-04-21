import React, { useEffect } from 'react';

interface RedditEmbedProps {
    post_url: string;  // Correctly declaring the type of `post_url`
}
function RedditEmbed( { post_url }: RedditEmbedProps ) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://embed.reddit.com/widgets.js";
    script.async = true;
    script.charset = 'UTF-8';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [post_url]);  // Re-run this effect if post_url changes

  return (
    <React.Fragment>
      <blockquote className="reddit-embed-bq" style={{height: "200px"}}>
        <a href={post_url}>{post_url}</a>
      </blockquote>
    </React.Fragment>
  );
}

export default RedditEmbed;

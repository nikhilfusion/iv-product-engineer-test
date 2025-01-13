import { createClient, gql } from 'urql';
import React, { useState, useEffect, useCallback } from 'react';
import { Button, message } from 'antd';
import './OddOneOutPage.css';

// Constants
const APIURL = 'http://localhost:8080';

let client = createClient({
  url: `${APIURL}/v1/graphql`,
});

const GIF_QUERY = gql`
  query Gifs($category: String!, $limit: Int!) {
    gifs(where: { category: { _ilike: $category } }, limit: $limit) {
      url
      category
    }
  }
`;

const categories = ['cat', 'dog', 'elephent', 'lion', 'monkey'];

export default function OddOneOutPage() {
  const [gifs, setGifs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [oddOneOutIndex, setOddOneOutIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(undefined);
  const [isDisabled, setIsDisabled] = useState(false)
  const [error, setError] = useState(null);
  // const history = useHistory();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchGifs = useCallback(async () => {
    console.log("fetch Gifs called");
    setIsLoading(true);
    setError(null);

    try {
      // Randomly select two categories
      const category1 = categories[Math.floor(Math.random() * categories.length)];
      let category2 = categories[Math.floor(Math.random() * categories.length)];

      // Ensure the second category is different
      while (category2 === category1) {
        category2 = categories[Math.floor(Math.random() * categories.length)];
      }

      // Fetch 9 GIFs from category1 and 1 GIF from category2
      const gifsFromCategory1 = await client
        .query(GIF_QUERY, { category: category1, limit: 9 })
        .toPromise();

      const gifFromCategory2 = await client
        .query(GIF_QUERY, { category: category2, limit: 1 })
        .toPromise();

      // Combine the GIFs and randomly position the odd one out
      const allGifs = [
        ...gifsFromCategory1.data.gifs,
        gifFromCategory2.data.gifs[0],
      ];


      // Randomly shuffle the order to place the odd one out
      const shuffledGifs = allGifs.sort(() => Math.random() - 0.5);
      console.log("shuffledGifs are ", shuffledGifs);
      // Find the index of the odd one out (the category that appears only once)
      setOddOneOutIndex(shuffledGifs.findIndex(gif => gif.category !== category1));

      setGifs(shuffledGifs);
      setIsLoading(false);
    } catch (err) {
      setError('Error fetching GIFs.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifs();
  }, [fetchGifs]);

  const handleRetry = () => {
    fetchGifs();
  };

  const handleSubmit = () => {
    setIsDisabled(true);
    if (selectedIndex === oddOneOutIndex) {
      messageApi.open({
        type: 'success',
        content: 'Well done!! You choose the right one ',
        duration: 10,
        onClose: () => {
          fetchGifs();
          setIsDisabled(false);
        }
      });
    } else {
      messageApi.open({
        type: 'error',
        content: 'Oho!! You choose the wrong one, Try next one ',
        duration: 10,
        onClose: () => {
          fetchGifs();
          setIsDisabled(false);
        }
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="odd-one-out-container">
      {contextHolder}
      <h2>Odd-One-Out: Can you find the different category?</h2>
      <div className="gifs-container">
        {gifs.map((gif, index) => (
          <div
            key={`${gif.url}-${index}`}
            className={index === selectedIndex ? 'gif-item-selected' : 'gif-item'}
          >
            <img className="gif-image" src={gif.url} alt="Odd One Out GIF" onClick={() => setSelectedIndex(index)} />
          </div>
        ))}
      </div>
      <Button type="primary" onClick={handleSubmit} disabled={isDisabled}>Submit</Button>
    </div>
  );
}

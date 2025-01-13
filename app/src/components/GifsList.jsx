import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createClient, gql, useQuery } from 'urql';
import './GifList.css';

const APIURL = 'http://localhost:8080';

const LIMIT = 20;

let client = createClient({
  url: `${APIURL}/v1/graphql`,
});

const GIF_QUERY = gql`
  query Gifs($category: String!, $limit: Int!, $offset: Int!) {
    gifs(where: { category: { _ilike: $category } }, limit: $limit, offset: $offset) {
      url
    }
  }
`;

export default function GifsList({ category }) {
  const [page, setPage] = useState(1);
  const [gifs, setGifs] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const loaderRef = useRef(null);

  const fetchMoreGifs = useCallback(
    async () => {
      if (isFetching) return;

      setIsFetching(true);
      const { data, error } = await client
        .query(GIF_QUERY, {
          category: `%${category}%`,
          limit: LIMIT,
          offset: (page - 1) * LIMIT,
        })
        .toPromise();

      if (error) {
        console.error('Error fetching gifs:', error);
      } else {
        if (data.gifs.length > 0) {
          setGifs((prevGifs) => [...prevGifs, ...data.gifs]);
          setPage((prevPage) => prevPage + 1); // Increment page only if new GIFs are fetched
        } else {
          // No more gifs to fetch, handle the case here (optional)
          console.log('No more GIFs to load');
        }
      }
      setIsFetching(false);
    },
    [category, page, isFetching]
  );

  useEffect(() => {
    setGifs([]); // Reset gifs when category changes
    setPage(1);
  }, [category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreGifs();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchMoreGifs]);

  return (
    <div className="gifs-container">
      {gifs.map((gif, index) => (
        <div key={`${gif.url}-${index}`} className="gif-item">
          <img className="gif-image" src={gif.url} alt={`${category} gif`} />
        </div>
      ))}
      <div ref={loaderRef} className="loader">
        {isFetching && (
          <div className="loading-icon">
            <img
              src="https://i.gifer.com/ZZ5H.gif"
              alt="Loading..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

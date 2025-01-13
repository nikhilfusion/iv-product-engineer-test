import React, { useState, useEffect } from 'react';
import { createClient, Provider } from 'urql';
import { Switch } from 'antd';

import GifsList from './components/GifsList';
import OddOneOutPage from './components/OddOneOut';
import './App.css';

const APIURL = 'http://localhost:8080';

let client = createClient({
  url: `${APIURL}/v1/graphql`,
});

function App() {
  const [category, setCategory] = useState('cat');
  const [debouncedCategory, setDebouncedCategory] = useState(category);
  const [isChecked, setIsChecked] = useState(false);
  const predefinedCategories = [{
    title: 'Cat',
    value: 'cat'
  }, {
    title: 'Dog',
    value: 'dog'
  }, {
    title: 'Elephant',
    value: 'elephant'
  }, {
    title: 'Lion',
    value: 'lion',
  }, {
    title: 'Monkey',
    value: 'monkey'
  }];

  // Debouncing the input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (category.length >= 3) {
        setDebouncedCategory(category);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [category]);

  const handleCategoryClick = (selectedCategory) => {
    setCategory(selectedCategory.toLowerCase());
    setDebouncedCategory(selectedCategory.toLowerCase());
  };

  return (
    <Provider value={client}>
      <div className="App">
        <div className='header-container'>
          <h1 className="header">Animal Gifs</h1>
          <div className="switch-container">
            <span style={{ paddinggRight: 8 }}>{isChecked ? '' : 'Category Search'}</span>
            <Switch checked={isChecked} onChange={(checked) => setIsChecked(checked)} />
            <span style={{ paddingLeft: 8 }}>{isChecked ? 'Odd on out' : ''}</span>

          </div>
          {
            isChecked ? <OddOneOutPage /> : <>

              {/* Predefined Category Buttons */}
              <div className="category-buttons">
                {predefinedCategories.map(({ value, title }) => (
                  <button
                    key={title}
                    className={`category-button ${value.toLowerCase() === debouncedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(value)}
                  >
                    {title}
                  </button>
                ))}
              </div>
              {/* Search Input */}
              <input
                type="text"
                className="search-input"
                placeholder="Search for an animal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              {/* GIFs List */}
              <GifsList category={debouncedCategory} />
            </>

          }
        </div>
      </div>
    </Provider>
  );
}

export default App;
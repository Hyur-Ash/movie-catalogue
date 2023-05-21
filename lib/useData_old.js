import { useState, useEffect } from 'react';

export function useData(filename, initialState) {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    // read the data from the API route on mount
    fetch(`/api/data?filename=${filename}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => {
        updateData(initialState);
      });
  }, [filename]);

  const updateData = (newData) => {
    // send a POST request to the API route to update the data
    fetch(`/api/data?filename=${filename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.log(error));
  };

  return [data, updateData];
}
  
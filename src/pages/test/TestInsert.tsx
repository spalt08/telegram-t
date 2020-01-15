import { ChangeEvent } from 'react';
import React, { FC, useState } from '../../lib/teact';

const TestInsert: FC<{}> = () => {
  const [items, setItems] = useState({});
  const [value, setValue] = useState('');

  const deleteData = (key: number) => {
    const newItems = { ...items };
    delete newItems[key];
    setItems(newItems);
  };

  const insertData = () => {
    setItems({ ...items, [value]: true });
    setValue('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const sortedItems = Object
    .keys(items)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div id="mainContainer">
      <div>
        <input type="text" value={value} onChange={handleChange} />
        <input type="submit" className="button" onClick={insertData} value="Insert Ordered" />
      </div>
      <ul teactChildrenKeyOrder="asc">
        {sortedItems.map((item) => (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <li key={item} onClick={() => deleteData(item)}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestInsert;

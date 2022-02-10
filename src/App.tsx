import './App.css';
import useThread from './use-thread';
import React, {useState, useEffect} from 'react';

const expensive = (limit: number) => {
  const arr = [];

  let i = 2;
  outer: while(i < limit) {
      
      for(let mod = 2; mod < i; mod++) {
          if(i % mod === 0) {
              i++;
              continue outer;
          }
      }

      arr.push(i++);
  };

  return arr;
}

function AsyncButton() {
  const {run, isRunning, data} = useThread(expensive);

  const handleClick = () => {
    run(100000);
  }

  return (
    <>
      <button onClick={handleClick}>Run on Thread</button>
      <div>Loading: {isRunning.toString()}</div>
      {data && <div>Async Result: {data.toString()}</div>}
    </>
  )
}

function App() {
  const [show, setShow] = useState(true);
  const [frame, setFrame] = useState(0);
  const [result, setResult] = useState<null | number[]>(null);

  const countFrame = () => {
    setFrame((state) => state + 1);
    window.requestAnimationFrame(countFrame);
  }

  useEffect(() => {
    countFrame()
  }, []);

  const handleSyncCall = () => {
    const result = expensive(100000);
    setResult(result);
  }


  return (
    <div className="App">
      <button onClick={() => setShow(!show)}>Toggle</button>
      <div>Frames: {frame}</div>
      {show && <AsyncButton /> }
      <button onClick={handleSyncCall}>Run on Main</button>
      {result && <div>Sync Result: {result.toString()}</div>}
    </div>
  );
}

export default App;

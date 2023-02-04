import React, { useState, useEffect, useCallback } from 'react';

import micIcon from './assets/microphone.svg';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

function Recorder(props) {
  const [isListening, setIsListening] = useState(false);

  const handleListen = useCallback(() => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        console.log('continue..');
        mic.start();
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log('Stopped Mic on Click');
      };
    }
    mic.onstart = () => {
      console.log('Mics on');
    };

    mic.onresult = (event) => {
      let transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      props.setBody(transcript);
      mic.onerror = (event) => {
        console.log(event.error);
      };
    };
  }, [isListening]);

  useEffect(() => {
    handleListen();
  }, [isListening, handleListen]);

  return (
    <>
      <div>
        <div>
          <button
            className={isListening && 'pulsing'}
            id='mic'
            onClick={() => setIsListening((prevState) => !prevState)}>
            <img src={micIcon} width='20' />
          </button>
        </div>
      </div>
    </>
  );
}

export default Recorder;

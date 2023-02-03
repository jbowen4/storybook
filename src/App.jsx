import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

import Lottie from 'lottie-react';
import wizardAnimation from './assets/wizard.json';

const baseURL = process.env.BASE_URL;
let testing_img = false;

function App() {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const getVideo = async () => {
    //{”scenes”: [{”scene”: “text of scene”, “image”: “image for scene”}]}
    const res = await fetch(`${baseURL}/api/v1/video`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify({
        scenes: [
          { scene: scenes[0], image: images[0] },
          { scene: scenes[1], image: images[1] },
          { scene: scenes[2], image: images[2] },
        ],
      }),
    });

    const results = await res.json();

    setVideo(results['video']);
  };

  const getImages = async () => {
    setImages([
      'https://replicate.delivery/pbxt/JzbZopDl4EbHDBWrdhAxNBbj3tNcEg6fkeIUruIHku8bYgaQA/out-0.png',
      'https://replicate.delivery/pbxt/TTJlNSoUHIqyK9XXsg7AXIxCtrs8Jfsi80PR7IzzKEPRMQNIA/out-0.png',
      'https://replicate.delivery/pbxt/KnNcj5S2kSYbM1RgA9Ux9PiZFXWUNxjqRSelz5mVZCTUMQNIA/out-0.png',
    ]);

    // setLoading2(true);
    // const res = await fetch(`${baseURL}/api/v1/images`, {
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     'Access-Control-Allow-Origin': '*',
    //   },
    //   method: 'POST',
    //   body: JSON.stringify({
    //     scenes: scenes,
    //   }),
    // });

    // const results = await res.json();

    // console.log(results);

    // setImages(results['images'].flat(1));
    // console.log(images);
    // setLoading2(false);
  };

  const getStory = async () => {
    if (body.length < 50) {
      const error = 'The prompt length needs to be at least 50 characters';
      return;
    }
    setLoading(true);
    const res = await fetch(`${baseURL}/api/v1/script`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify({
        text: body,
      }),
    });

    const results = await res.json();

    setScenes(results['scenes']);
    setLoading(false);
  };

  return (
    <div className='App'>
      <h1 class='header'>Storybook: The simplest way to make beautiful story videos</h1>
      <div class='container'>
        <div class='inner-box'>
          <textarea
            name='input'
            cols='40'
            rows='5'
            placeholder='Write your story prompt here...'
            value={body}
            onChange={(e) => setBody(e.target.value)}></textarea>
          <button onClick={() => getStory()}>Submit</button>
        </div>
        {loading && scenes.length == 0 ? (
          <div class='inner-box'>
            <Lottie animationData={wizardAnimation} loop={true} />
            <p class='text'>Loading...</p>
          </div>
        ) : (
          <div class='inner-box'>
            {scenes.map((scene, index) => (
              <p class='scene' key={index}>
                {scene}
              </p>
            ))}
            {scenes.length > 0 && <button onClick={() => getImages()}>Generate images</button>}
          </div>
        )}
        {}
      </div>
      {loading2 && <Lottie animationData={wizardAnimation} loop={true} />}
      {images.map((img) => {
        return <img src={img} alt='Image' width='300' height='400' />;
      })}
      <button onClick={() => getVideo()} />
      {video && <video src={video} width='750' height='500' controls></video>}
    </div>
  );
}

export default App;

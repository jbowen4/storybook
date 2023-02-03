import { useEffect, useState } from 'react';
import './App.css';
import  TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Unstable_Grid2';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import Lottie from 'lottie-react';
import wizardAnimation from './assets/wizard.json';
import {Box, Typography} from "@mui/material";

// const baseURL = process.env.BASE_URL;
const baseURL = "https://1hp4qvie0k.execute-api.us-east-1.amazonaws.com/production";
let testing_img = false;

const testScenes = [
        "The 3-head creepy creature attacked the small American village with no mercy. Everyone was running for their lives, but nobody could escape {monster growl}. People were screaming for help, but no one could hear them {male scream}. Everyone was so scared, their hearts were beating like crazy {heartbeat}. In a matter of minutes, the creature ate everyone in the village {glass smash}.",
      "The survivors were left in shock and disbelief. They were too afraid to go back, so they just stayed and watched from a distance as the creature was eating their loved ones {church bell}. It was a nightmare that seemed to last forever {squeak}.",
      "The creature finally left the village, leaving behind a trail of destruction and despair {thunder}. The villagers will never forget the terror they experienced, and the dark night will always haunt their dreams {wind}.",


    ]

const imagesInRow = 3

function StandardImageList({images, handleChosen, chosen}) {
  let rowImages = []
  for(let setIndex in images) {
    if (!images.hasOwnProperty(setIndex)) {
      continue
    }

    let imageSet = images[setIndex]
    for(let index in imageSet) {
      if (!imageSet.hasOwnProperty(index)) {
        continue
      }

      rowImages.push({
        img: imageSet[index],
        index: index,
        set: setIndex,
      })
    }
  }

  return (
      <ImageList cols={imagesInRow} >
        {rowImages ? rowImages.map((item) => {
              return <ImageListItem key={item.set + item.index}>
                <img
                    // src={`${item}?w=164&h=164&fit=crop&auto=format`}
                    src={`${item.img}?w=164&auto=format`}
                    // srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    srcSet={`${item.img}?w=164&auto=format&dpr=2 2x`}
                    alt="some image"
                    loading="lazy"
                    style={{
                      opacity: chosen && chosen[item.set] && chosen[item.set][item.index] === 1 ? 0.3 : 1
                    }}
                    onClick={(e) => {handleChosen(item.set, item.index)}}
                />
              </ImageListItem>
        }
        ): null}
      </ImageList>
  );
}

function App() {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [scenes, setScenes] = useState(testScenes);

  const [chosen, setChosen] = useState([
      [1, 0],
        [1, 0],
        [1, 0],
  ]);
  // [[
  //   'https://replicate.delivery/pbxt/JzbZopDl4EbHDBWrdhAxNBbj3tNcEg6fkeIUruIHku8bYgaQA/out-0.png',
  //   'https://replicate.delivery/pbxt/JzbZopDl4EbHDBWrdhAxNBbj3tNcEg6fkeIUruIHku8bYgaQA/out-0.png'
  // ],
  // [
  //   'https://replicate.delivery/pbxt/TTJlNSoUHIqyK9XXsg7AXIxCtrs8Jfsi80PR7IzzKEPRMQNIA/out-0.png',
  //   'https://replicate.delivery/pbxt/TTJlNSoUHIqyK9XXsg7AXIxCtrs8Jfsi80PR7IzzKEPRMQNIA/out-0.png',
  // ],
  // [
  //   'https://replicate.delivery/pbxt/KnNcj5S2kSYbM1RgA9Ux9PiZFXWUNxjqRSelz5mVZCTUMQNIA/out-0.png',
  //   'https://replicate.delivery/pbxt/KnNcj5S2kSYbM1RgA9Ux9PiZFXWUNxjqRSelz5mVZCTUMQNIA/out-0.png',
  // ]]
  const [images, setImages] = useState();
  const [video, setVideo] = useState();

  async function handleGenerateVideo() {
    let requestScenes = []
    for (let i = 0; i < chosen.length; i++) {
      let scene = {
        scene: scenes[i],
      }
        for (let j = 0; j < chosen[i].length; j++) {
            if (chosen[i][j] === 1) {
              console.log(images)
              console.log('picked image', images[i][j])
              scene.image = images[i][j]

              break
            }
        }

      requestScenes.push(scene)
    }

    let body = {scenes: requestScenes}
    console.log('body', body)

    const res = await fetch(`${baseURL}/api/v1/video`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify(body),
    });

    const videoResult = await res.json();
    console.log('videoResult', videoResult)
    setVideo(videoResult.video);
  }

  function handleChosen(set, index) {
    console.log("handleChosen", set, index)
    let rows = []
    for(let i = 0; i < images.length; i++){
      rows[i] = []
      for(let j = 0; j < images[i].length; j++) {
        if (i == set) {
          rows[i].push(j == index ? 1 : 0)

          continue
        }

        rows[i].push(chosen[i][j])
      }
    }

    setChosen(rows)
  }

  const getImages = async () => {
    setLoadingImages(true);
    try {
      // first, we need to generate image_scripts, after that push them one by one to get images
      // just because of fast made api, it has 30 second timeout and cannot be changed
      const resScripts = await fetch(`${baseURL}/api/v1/image_scripts`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        method: 'POST',
        body: JSON.stringify({
          scenes: scenes,
        }),
      });
      const scripts = await resScripts.json();
      console.log('scripts', scripts);

      let imageSets = []
      for(let i = 0; i < imagesInRow; i++) {
        const res = await fetch(`${baseURL}/api/v1/images`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          method: 'POST',
          body: JSON.stringify({
            scenes: scripts['scripts'],
          }),
        });
        const results = await res.json();

        const resImages = results['images']
        console.log(results);
        for(let resIndex in resImages) {
          if (!resImages.hasOwnProperty(resIndex)) {
            continue
          }

          if (!imageSets[resIndex]) {
            imageSets[resIndex] = []
          }
          imageSets[resIndex].push(...resImages[resIndex])
        }
      }


      setImages(imageSets);
      console.log(images);
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingImages(false);
    }
  };

  const getStory = async () => {
    if (body.length < 50) {
      const error = 'The prompt length needs to be at least 50 characters';
      return;
    }
    setLoading(true);
    try {
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

      setScenes(results['scenes'] ? results['scenes'] : []);
    } catch (e) {
        console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className='App'>
      <Grid
          container
          spacing={{xs: 0, sm: 2, md: 2}}
          alignItems="center"
          justifyContent="center"
      >
        <Grid paddingX={2} container alignItems="center" justifyContent="center" direction="column" item
              xs={12} sm={12} md={12}
              maxWidth={{xs: 600, sm: 600, md: 600}}
        >
          <Typography
              align="center"
              variant="h2"
              gutterBottom
              sx={{marginBottom: 2}}
          >
            Storybook
          </Typography>


          <Typography
              align="center"
              sx={{marginBottom: 5}}
              variant="h4"
              gutterBottom
          >
            The simplest way to make beautiful story videos
          </Typography>

          <TextField
              sx={{marginY: 1, minWidth: 200}}
              label="What the story is about?"
              fullWidth
              size="medium"
              placeholder="Write your story prompt here..."
              multiline
              value={body}
              onChange={(e) => setBody(e.target.value)}></TextField>

          <Button
              variant="contained"
              sx={{
                backgroundColor: '#ffc400',
                ":hover": {
                  backgroundColor: '#ffc400',
                },
                color: '#000000',
                marginY: 1,
                minWidth: 200
              }}
              onClick={() => getStory()}>
            Generate Script
          </Button>
        </Grid>
      </Grid>

      <Grid
          direction="column" item xs={4}
          display="flex"
          flexDirection="row"
          justifyContent='center'
      >
            <Grid
                item
                xs={12}
                sm={12}
                md={12}
                display='flex'
            >
                      {loading && scenes.length === 0 ? (
                        <Box className='inner-box'>
                          <Lottie animationData={wizardAnimation} loop={true} />
                          <p className='text'>Loading...</p>
                        </Box>
                      ) : (
                          <Box sx={{ width: '100%', maxWidth: 500 }}>

                          {scenes.map((scene, index) => (
                              <Typography
                                  align="left"
                                sx={{marginY: 5}}
                                  variant="body1" gutterBottom key={index}>
                                {scene}
                              </Typography>
                          ))}
                        </Box>
                      )}
            </Grid>
      </Grid>

      {scenes.length > 0 &&
          <Button
              variant="contained"
              sx={{
                backgroundColor: '#ffc400',
                ":hover": {
                  backgroundColor: '#ffc400',
                },
                color: '#000000',
                marginY: 1,
                minWidth: 200
              }}
              onClick={() => getImages()}>
            Generate images
          </Button>
      }

      <Grid
          direction="column" item xs={4}
          display="flex"
          flexDirection="row"
          justifyContent='center'
      >
        <Grid paddingX={2} container alignItems="center" justifyContent="center" direction="column" item
              xs={12} sm={12} md={12}
              maxWidth={{xs: 600, sm: 600, md: 600}}
        >
        {loadingImages && <Lottie animationData={wizardAnimation} loop={true} />}
        </Grid>
      </Grid>
      {images ?
          <Box>
            <StandardImageList handleChosen={handleChosen} chosen={chosen} images={images} />
            <Button
                variant="contained"
                sx={{
                  backgroundColor: '#ffc400',
                  ":hover": {
                    backgroundColor: '#ffc400',
                  },
                  color: '#000000',
                  marginY: 1,
                  minWidth: 200
                }}
                onClick={() => handleGenerateVideo()}>
              Generate Video
            </Button>
          </Box>
          : null}


      {/*{video ? <video src={video} width='750' height='500' controls></video> : null}*/}
      {video ? <a target="_blank" href={video} >Click here in several minutes to see the video</a> : null}

    </Box>
  );
}

export default App;

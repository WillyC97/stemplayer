// Single source of truth for the song catalogue.
//
// Each artist lists the song groups shown on its page. Routes, artist landing
// pages, and the home-screen buttons are all generated from this data, so
// adding a song means adding one entry here (plus its JSON file) — nothing
// else needs touching.

// Song data
import walkinOnSunshineData from './pages/ChoirCo/walkinOnSunshine.json';
import exileData from './pages/ChoirCo/exile.json';

import oneLastTimeData from './pages/TurdStory/oneLastTime.json';

import kissFromARoseData from './pages/Dovengers/kissFromARose.json';
import rockWithYouData from './pages/Dovengers/rockWithYou.json';
import rosannaData from './pages/Dovengers/rosanna.json';
import myLifeData from './pages/Dovengers/myLife.json';
import smackDownData from './pages/Dovengers/smackDown.json';
import smileOnYourFaceData from './pages/Dovengers/smileOnYourFace.json';
import pegData from './pages/Dovengers/peg.json';
import girlIsMineData from './pages/Dovengers/girlIsMine.json';
import holdTheLineData from './pages/Dovengers/holdTheLine.json';
import youCanCallMeAlData from './pages/Dovengers/youCanCallMeAl.json';
import twistAndShoutData from './pages/Dovengers/twistAndShout.json';
import freedomData from './pages/Dovengers/freedom.json';
import sledgehammerData from './pages/Dovengers/sledgehammer.json';
import easyData from './pages/Dovengers/easy.json';
import backpocketData from './pages/Dovengers/backpocket.json';
import oneOfTheseNightsData from './pages/Dovengers/oneOfTheseNights.json';
import dazzlingData from './pages/Dovengers/dazzling.json';
import youMakeLovinFunData from './pages/Dovengers/youMakeLovinFun.json';

// Artwork
import ChoirCoLogo from './components/assets/ChoirCoLogo.png';
import ChoirCoBackground from './components/assets/ChoirCoBackground.jpg';
import TurdStoryImg from './components/assets/TurdStory.jpg';
import DovengersLogo from './components/assets/DovengersLogo.png';
import DovengersBackground from './components/assets/BOTB22_Final-296.jpg';

export const catalog = [
  {
    key: 'ChoirCo',
    password: 'password1',
    logo: ChoirCoLogo,
    background: { image: ChoirCoBackground },
    groups: [
      {
        header: 'Season 6 - Mixed',
        songs: [
          { slug: 'walkinOnSunshine', title: "Walkin' On Sunshine", data: walkinOnSunshineData },
          { slug: 'exile', title: 'Exile', data: exileData },
          { slug: 'exile', title: 'Another song', data: exileData },
        ],
      },
      {
        header: 'Season 6 - Women',
        songs: [
          { slug: 'walkinOnSunshine', title: "Walkin' On Sunshine", data: walkinOnSunshineData },
          { slug: 'exile', title: 'Exile', data: exileData },
          { slug: 'exile', title: 'Another song', data: exileData },
        ],
      },
    ],
  },
  {
    key: 'TurdStory',
    password: 'turds',
    logo: TurdStoryImg,
    background: { color: 'rgba(252, 140, 3, 0.8)' },
    groups: [
      {
        header: 'Learning Tracks',
        songs: [
          { slug: 'oneLastTime', title: 'One Last Time', data: oneLastTimeData },
          { slug: 'freedom', title: 'Freedom', data: freedomData },
          { slug: 'sledgehammer', title: 'Sledgehammer', data: sledgehammerData },
        ],
      },
    ],
  },
  {
    key: 'Dovengers',
    password: 'murphy22',
    logo: DovengersLogo,
    background: { image: DovengersBackground },
    groups: [
      {
        header: 'Learning Tracks - Performed',
        songs: [
          { slug: 'rockWithYou', title: 'Rock with You', data: rockWithYouData },
          { slug: 'rosanna', title: 'Rosanna', data: rosannaData },
          { slug: 'myLife', title: 'My Life', data: myLifeData },
          { slug: 'smackDown', title: 'Smack Down', data: smackDownData },
          { slug: 'smileOnYourFace', title: 'Smile On Your Face', data: smileOnYourFaceData },
          { slug: 'peg', title: 'Peg', data: pegData },
        ],
      },
      {
        header: 'Learning Tracks - Murphys 2025',
        songs: [
          { slug: 'girlIsMine', title: 'Girl Is Mine', data: girlIsMineData },
          { slug: 'kissFromARose', title: 'Kiss From a Rose', data: kissFromARoseData },
          { slug: 'holdTheLine', title: 'Hold the Line', data: holdTheLineData },
          { slug: 'youCanCallMeAl', title: 'You Can Call Me Al', data: youCanCallMeAlData },
          { slug: 'twistAndShout', title: 'Twist and Shout', data: twistAndShoutData },
          { slug: 'freedom', title: 'Freedom', data: freedomData },
          { slug: 'sledgehammer', title: 'Sledgehammer', data: sledgehammerData },
          { slug: 'easy', title: 'Easy', data: easyData },
        ],
      },
      {
        header: 'Learning Tracks - 2026',
        songs: [
          { slug: 'backpocket', title: 'Backpocket', data: backpocketData },
          { slug: 'oneOfTheseNights', title: 'One of These Nights', data: oneOfTheseNightsData },
          { slug: 'dazzling', title: 'Dazzling', data: dazzlingData },
          { slug: 'youMakeLovinFun', title: "You Make Lovin' Fun", data: youMakeLovinFunData },
        ],
      },
    ],
  },
];

// Flattened, de-duplicated list of player routes ({ path, id, data }). A song
// slug may appear in more than one group (e.g. listed twice for display), so
// paths are de-duped to avoid registering the same route twice. `id` is a
// stable, Firestore-safe identifier used to persist per-song data such as
// custom track names.
export const songRoutes = (() => {
  const seen = new Set();
  const routes = [];

  for (const artist of catalog) {
    for (const group of artist.groups) {
      for (const song of group.songs) {
        const path = `/${artist.key}/${song.slug}`;
        if (seen.has(path)) continue;
        seen.add(path);
        routes.push({ path, id: `${artist.key}_${song.slug}`, data: song.data });
      }
    }
  }

  return routes;
})();

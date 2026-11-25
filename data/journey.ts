/**
 * THE JOURNEY (homepage scroll story)
 * One scene per step. As visitors scroll, each scene's clip plays forward
 * frame by frame — and backwards when they scroll up.
 *
 * - video: put the MP4 in /public/journey/ and write its path, e.g. "/journey/1-pack.mp4"
 *   (see JOURNEY-CLIPS.md for how to make the clips). Leave "" to show the photo.
 * - image: shown while the video loads, or instead of it when there's no video.
 */
import { photos as P } from "./photos";

export interface JourneyScene {
  id: string;
  word: string; // giant word behind the scene
  title: string;
  text: string;
  image: string;
  video: string;
}

export const journeyScenes: JourneyScene[] = [
  {
    id: "pack",
    word: "PACK",
    title: "Friday night",
    text: "Water, torch, raincoat, snacks. Alarm set for 4:30.",
    image: P.packFlatlay,
    video: "",
  },
  {
    id: "ride",
    word: "RIDE",
    title: "5:30 am, pickup from Pune",
    text: "Strangers in the car, chai at the ghat, one playlist for everyone.",
    image: P.carGreenRoad,
    video: "",
  },
  {
    id: "arrive",
    word: "ARRIVE",
    title: "Base village by breakfast",
    text: "Poha, a safety briefing, and your trek leader counts heads twice.",
    image: P.villageRoad,
    video: "",
  },
  {
    id: "climb",
    word: "CLIMB",
    title: "Three hours up",
    text: "Stone steps, fort gates and the first view over the clouds.",
    image: P.fortRidge,
    video: "",
  },
  {
    id: "summit",
    word: "SUMMIT",
    title: "The selfie",
    text: "You came alone. You're leaving with a group chat of twenty.",
    image: P.groupOnHill,
    video: "",
  },
];

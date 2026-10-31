export type VideoEntry = {
  id: string; // YouTube video ID: the part after v= in the link
  title: string;
  start?: number; // optional start time in seconds
};

export const CHANNEL = { name: "ThezISR (lolThez)", url: "https://www.youtube.com/@lolThez" };

// Add a video by copying one line to the top of the list. Newest first.
export const VIDEOS: VideoEntry[] = [
  { id: "wtyaNunasIA", title: "L2 REBORN - NB - ANTQUEEN PVP #1", start: 15 },
];

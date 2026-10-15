// Character avatars for profiles. Each is a circle zoomed in on one character's
// face in a still or poster from The Movie Database (TMDB), shown straight from TMDB.
// cx/cy: the face's centre as a fraction of the image's width/height.
// face: the face's width as a fraction of the image's width.
// aspect: the image's height divided by its width.

type CharacterAvatar = {
  id: string;
  name: string;
  from: string;
  file: string;
  size: "w780" | "w1280";
  aspect: number;
  cx: number;
  cy: number;
  face: number;
};

const POSTER = 1.5;
const BACKDROP = 9 / 16;

export const CHARACTER_AVATARS: CharacterAvatar[] = [
  { id: "jesus", name: "Jesus", from: "The Chosen", file: "fMd5Zq4NsSvdakmKIuXkGECaJLp.jpg", size: "w780", aspect: POSTER, cx: 0.7, cy: 0.45, face: 0.34 },
  { id: "mary-magdalene", name: "Mary Magdalene", from: "The Chosen", file: "dGLw1aT84LkaRs7GjRbJBAwhSN5.jpg", size: "w1280", aspect: BACKDROP, cx: 0.235, cy: 0.68, face: 0.06 },
  { id: "david", name: "David", from: "House of David", file: "bpbLG0aq1wahLw4lhkSDE0TyTBe.jpg", size: "w780", aspect: POSTER, cx: 0.47, cy: 0.53, face: 0.14 },
  { id: "saul", name: "King Saul", from: "House of David", file: "i4eskPIEI5sK0IibHhWqBU9Ts0k.jpg", size: "w780", aspect: POSTER, cx: 0.5, cy: 0.14, face: 0.25 },
  { id: "desmond-doss", name: "Desmond Doss", from: "Hacksaw Ridge", file: "1dyjqLjPmaRqYHKde8UzJ4Ffv7T.jpg", size: "w780", aspect: POSTER, cx: 0.5, cy: 0.25, face: 0.4 },
  { id: "louis-zamperini", name: "Louis Zamperini", from: "Unbroken", file: "8gGbfySRbrYf8fhJOMUzlvsrUPN.jpg", size: "w1280", aspect: BACKDROP, cx: 0.557, cy: 0.58, face: 0.2 },
  { id: "aslan", name: "Aslan", from: "Narnia", file: "pqECkkF9Eiv5GC5dmvM5VMgH66U.jpg", size: "w1280", aspect: BACKDROP, cx: 0.2, cy: 0.45, face: 0.3 },
  { id: "lucy", name: "Lucy Pevensie", from: "Narnia", file: "uOqKkR1gk1oPimEAH9KvRv40Sug.jpg", size: "w1280", aspect: BACKDROP, cx: 0.3, cy: 0.41, face: 0.066 },
  { id: "caspian", name: "Prince Caspian", from: "Narnia", file: "bb5syHBUEsqL9PguV8kKf3noTFl.jpg", size: "w1280", aspect: BACKDROP, cx: 0.48, cy: 0.31, face: 0.17 },
  { id: "gandalf", name: "Gandalf", from: "The Lord of the Rings", file: "w3NF110cyjqxkQD2azmUMyaFzhG.jpg", size: "w780", aspect: POSTER, cx: 0.5, cy: 0.45, face: 0.62 },
  { id: "frodo", name: "Frodo", from: "The Lord of the Rings", file: "9DeGfFIqjph5CBFVQrD6wv9S7rR.jpg", size: "w1280", aspect: BACKDROP, cx: 0.49, cy: 0.33, face: 0.2 },
  { id: "aragorn", name: "Aragorn", from: "The Lord of the Rings", file: "kWYfW2Re0rUDE6IHhy4CRuKWeFr.jpg", size: "w1280", aspect: BACKDROP, cx: 0.42, cy: 0.33, face: 0.17 },
  { id: "klaus", name: "Klaus", from: "Klaus", file: "2u1YG0pgm5bIOXO2OVWLNdMl23f.jpg", size: "w1280", aspect: BACKDROP, cx: 0.66, cy: 0.25, face: 0.13 },
  { id: "larry", name: "Larry the Cucumber", from: "VeggieTales", file: "96LHqRFOv8AH0E3GGFb9ZnxR1x3.jpg", size: "w780", aspect: POSTER, cx: 0.51, cy: 0.58, face: 0.6 },
  { id: "jonah", name: "Jonah", from: "VeggieTales", file: "yW9zGEmAlRz9sTh8cjrz3XWAqHq.jpg", size: "w1280", aspect: BACKDROP, cx: 0.3, cy: 0.3, face: 0.11 },
  { id: "beth", name: "Beth Bradley", from: "The Best Christmas Pageant Ever", file: "24FWQEXajiKKFp2dGc5DanLCzIf.jpg", size: "w1280", aspect: BACKDROP, cx: 0.27, cy: 0.49, face: 0.08 },
];

export const CHARACTER_AVATAR_IDS = CHARACTER_AVATARS.map((a) => a.id);

// How much of the circle's width the face should fill.
const FACE_FILL = 0.62;

// Background styles that put the character's face in the middle of a square box.
export function characterAvatarStyle(id: string) {
  const a = CHARACTER_AVATARS.find((c) => c.id === id);
  if (!a) return null;
  // k: the image's width as a multiple of the box's width (at least slightly larger,
  // so the image always covers the box).
  const k = Math.max(FACE_FILL / a.face, 1.05, 1.05 / a.aspect);
  // Centres the face, unless that would pull the image's edge inside the box;
  // faces near an edge then sit slightly off-centre instead of leaving a gap.
  const position = (centre: number, scale: number) =>
    Math.min(100, Math.max(0, ((0.5 - centre * scale) / (1 - scale)) * 100));
  return {
    backgroundImage: `url(https://image.tmdb.org/t/p/${a.size}/${a.file})`,
    backgroundSize: `${(k * 100).toFixed(1)}% auto`,
    backgroundPosition: `${position(a.cx, k).toFixed(1)}% ${position(a.cy, k * a.aspect).toFixed(1)}%`,
  };
}

# Journey clips — how to make the homepage character videos

The homepage opens with 5 full-screen scenes. As visitors scroll, each scene's
video plays forward frame by frame (and backward when they scroll up):

**1 PACK → 2 RIDE → 3 ARRIVE → 4 CLIMB → 5 SUMMIT (selfie)**

Until the clips are added, each scene shows a photo instead.

---

## Step 1 — Create the character once

Make one image of your character first, then use **that same image as the
reference / starting frame for every clip**, so the face and clothes stay the
same in all 5 videos.

```
3D animated character, Pixar-style render. A friendly Indian man, about 25,
slim build, short wavy black hair, light stubble, warm smile. Olive-green zip
hoodie with a small orange mountain patch on the chest, dark grey trek pants,
brown trail shoes, orange 30-litre trekking backpack. Full body, front view,
standing, plain light-grey studio background, soft lighting. Character sheet
for a video series.
```

(Change the description however you like — it's your brand's character.)

## Step 2 — Make 5 clips (image-to-video)

Rules for every clip:
- 16:9, 1280×720 or 1920×1080, 5–8 seconds, MP4
- One continuous shot, no cuts, slow camera
- Character in the **middle third** of the frame (phones crop the sides)
- Keep the **top third simple** (sky or plain wall) — the big word sits there
- No text, captions, logos or watermarks

**1 — PACK**
```
Same character sits on the floor of a cosy apartment bedroom at night, warm
lamp light, an open orange backpack in front of him. He packs a water bottle,
a torch and a raincoat into the bag, zips it shut and gives a happy thumbs up.
Static camera, full body, character centred, plain wall above his head.
5 seconds, 16:9, no text.
```

**2 — RIDE**
```
Same character sits by the open window in the back seat of a white car driving
on a winding green mountain road in the Western Ghats (Sahyadri) during the
monsoon, mist and small waterfalls outside. He smiles and looks out at the
view, wind in his hair. Camera slowly pushes in from outside the window.
Character centred, open sky at the top. 5 seconds, 16:9, no text.
```

**3 — ARRIVE**
```
A white car stops in a small village at the foot of a Sahyadri hill fort,
green hills and an old stone fort wall on the hilltop behind. Same character
steps out of the car, puts on his orange backpack, stretches and looks up at
the fort with a smile. Static wide shot, character centred, fort and sky in the
top half. 5 seconds, 16:9, no text.
```

**4 — CLIMB**
```
Same character climbs old stone steps up a Sahyadri fort with a small group of
young trekkers behind him, green monsoon hills and low clouds. He turns, smiles
and waves the group up. Camera follows from slightly behind and below,
character centred. 5 seconds, 16:9, no text.
```

**5 — SUMMIT (selfie)**
```
Sunrise on top of a Sahyadri fort, a saffron flag flying, clouds below. Same
character holds up a phone at arm's length for a selfie with six smiling young
trekkers (men and women) behind him; everyone squeezes in and laughs. Camera
faces the group, warm golden light, character centred. 5 seconds, 16:9, no text.
```

## Step 3 — Add them to the website

Easiest: send the 5 MP4 files to Claude in chat and ask to add them.

To do it yourself, each clip must be re-encoded so scrolling stays smooth
(a keyframe every 6 frames, no sound):

```bash
ffmpeg -i pack.mp4 -an -vf "scale=1280:-2" -c:v libx264 -g 6 -keyint_min 6 \
  -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart public/journey/1-pack.mp4
```

Then set the paths in `data/journey.ts`:

```ts
video: "/journey/1-pack.mp4",
```

You can also change each scene's big word, title and text in the same file.

# Custom Goal Overlay 

A lightweight **custom goal overlay** (HTML/CSS/JS). This overlay lets you set and track any goal (donations, followers, points, or any custom metric) and display progress with a bar and animated filling effect. It can be used in OBS or any browser.

---

## What’s in this ZIP

```
Custom Goal/
├─ index.html       # main page (overlay)
├─ style.css        # styles and animations
├─ script.js        # logic for progress updates
├─ BG_Frame.png     # optional background/frame asset
└─ readme.md        # original notes
```

---

## Quick start — run locally

1. Unzip the folder.
2. Open `index.html` in your browser.
3. You should see the overlay with a sample goal and progress.

To use in OBS as an overlay:

* Add a **Browser** source in OBS.
* Point it to the local file (`index.html`) or host it (see Hosting below).
* Adjust resolution to fit your scene.

---

## Configure your custom goal

Open `script.js` and update the variables at the top:

```js
let goalTitle = "Donation Goal";   // Title text shown above the bar
let goalAmount = 1000;             // Total target value
let currentAmount = 250;           // Starting value
```

* `goalTitle` — the text you want above the progress bar.
* `goalAmount` — the target number (e.g., 1000 subscribers, \$500 donations).
* `currentAmount` — how much progress is already made.

When you update `currentAmount`, the bar will animate to the new fill level.

---

## Updating progress manually

There are two ways:

1. **Edit `script.js`:** change `currentAmount` and refresh the page.
2. **Console input:** open browser DevTools console and set `updateGoal(value)` with a number:

   ```js
   updateGoal(750);
   ```

   This updates the bar instantly without editing files.

---

## Hosting & OBS setup

* **Local file:** load directly into OBS via Browser source (may need to enable local file access).
* **Local server:** run `python -m http.server 8000` and access `http://localhost:8000/`.
* **GitHub Pages:** push this project to GitHub, enable Pages, and use the hosted URL in OBS.

---

## Customization (what to change & where)

* `index.html` — structure and element IDs.
* `style.css` — colors, fonts, rounded corners, and filling animations.
* `script.js` — goal logic and update functions.
* `BG_Frame.png` — replace or remove for your own background frame.

---

## Troubleshooting

* **Bar not filling:** check if `goalAmount` > 0 and `currentAmount` ≤ `goalAmount`.
* **Overlay not showing in OBS:** enable local file access or use a local server.
* **Animation choppy:** lower file resolution or simplify CSS transitions.

---

## License

This project is released under the **MIT License**.

```
Copyright (c) 2025 Custom Goal Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Credits

Background and icon assets included are placeholders — feel free to replace them with your own.

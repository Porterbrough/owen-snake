# Owen Snake Game

A browser-based snake game inspired by Google's Snake Game, built with HTML, CSS, and JavaScript.

## Play the Game

You can play the game in two ways:

1. **Locally**: Open `index.html` in your web browser
2. **Online**: Visit [https://porterbrough.github.io/owen-snake/](https://porterbrough.github.io/owen-snake/)

## How to Play

- Click the "Start Game" button or press the Space bar to begin
- Control the snake using:
  - Arrow keys or WASD on desktop
  - Touch controls on mobile devices
- Eat the red food to grow longer and earn points
- Avoid running into your own tail
- The game ends when you collide with your own body
- The snake can pass through walls and appear on the opposite side

## Features

- Responsive design works on both desktop and mobile
- Touch controls for mobile devices
- Visual grid for better navigation
- Snake eyes that change direction with movement
- Score tracking
- Increasing difficulty (snake speeds up as you earn points)
- Game over screen with final score

## Development

This game is built with:
- HTML5 Canvas for rendering
- JavaScript for game logic
- CSS for styling

## Deployment

The game is deployed using GitHub Pages. When changes are pushed to the master branch, they are automatically deployed to the live site.

To deploy:
```bash
git add .
git commit -m "Your commit message"
git push origin master
```
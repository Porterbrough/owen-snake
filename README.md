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
- Game ends when snake hits walls or itself

## Features

- Responsive design works on both desktop and mobile
- Touch controls for mobile devices
- Visual grid for better navigation
- Realistic snake with connected body segments
- Customizable number of apples (1-10)
- Multiple apples on screen at once (new apple appears immediately when one is eaten)
- Option for moving apples that glide around the screen
- Ultra-smooth snake movement with advanced interpolation
- Speed selection (Slow, Normal, Fast)
- Realistic snake with textured skin that grows thicker as it gets longer
- Realistic snake head with rotating direction
- Realistic apples with stems and leaves
- Snake tongue animation
- High score tracking with local storage
- Enhanced game over screen with high score display

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
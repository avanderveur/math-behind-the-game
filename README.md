# The Math Behind the Game: Calculus Baseball Intelligence System

## Overview

**The Math Behind the Game** is an interactive Math 1A final project that applies differential calculus to baseball analytics. The project explains how calculus can be used to model baseball motion, pitching, hitting, spray charts, and decision-making.

Instead of presenting calculus only as classroom formulas, this website turns the math into an interactive baseball intelligence system. Users can adjust variables such as exit velocity, launch angle, pitch velocity, pitch type, batter hand, pitcher hand, swing timing, pitch location, and contact quality to see how the outcome changes.

The project connects baseball strategy with differential calculus by showing that every pitch, swing, and batted ball involves motion, change, rates, and optimization.

## Live Website

Add your GitHub Pages link here after publishing:

https://avanderveur.github.io/math-behind-the-game/

## Project Purpose

The purpose of this project is to answer the question:

> When am I going to use calculus?

This project shows that calculus is useful in baseball because the sport is full of motion and change. A pitch changes position over time. A batted ball changes height, distance, and direction over time. A hitter has only a small amount of time to react. Differential calculus helps explain these changes through position, velocity, acceleration, derivatives, critical points, and optimization.

## Main Idea

A baseball play can be studied as a chain of motion:

```text
pitch movement → hitter reaction → contact vector → ball flight → field result
```

Calculus helps describe each part of that chain.

The pitch moves toward the plate. The hitter reacts within a short time window. The ball leaves the bat with a velocity vector. The batted ball follows a projectile path. The final result lands in a field zone.

## Features

- Interactive baseball GameCast-style home page
- Calculus motion lab using projectile motion
- Pitching lab with pitch type, velocity, break, drop, and reaction time
- Hitting lab with batter hand, pitcher hand, pitch location, timing, and contact quality
- Spray chart simulator showing field direction and landing zone
- Analytics dashboard connecting the full baseball intelligence system
- Methodology page explaining the formulas, variables, model logic, implementation, and limitations
- SVG-based baseball visuals
- Interactive sliders, buttons, phase selectors, and dashboard bubbles
- Works Cited section with research sources

## Pages

### Home Page

The home page introduces the full project and includes a GameCast-style simulator. It connects pitch selection, swing timing, contact quality, batter hand, pitcher hand, and spray direction to a baseball outcome.

The home page acts as the main entry point into the baseball intelligence system.

### Calculus Engine

The Calculus Engine models a batted ball as projectile motion. It uses position, velocity, acceleration, and maximum height to explain how calculus describes baseball flight.

Key calculus ideas:

```text
r(t) = position
r′(t) = velocity
r″(t) = acceleration
y′(t) = 0 at maximum height
```

The user can adjust exit velocity and launch angle, then move through the flight phases:

```text
Contact → Rising → Apex → Falling → Landing
```

This shows how derivatives describe the motion of the ball at different moments in time.

### Pitching Lab

The Pitching Lab models a pitch before contact. It shows how pitch velocity affects the hitter’s reaction time and how pitch movement changes the path of the ball.

Key calculus and rate ideas:

```text
s(t) = pitch position
s′(t) = pitch velocity
t ≈ distance ÷ velocity
```

The user can choose different pitch types:

```text
4-Seam Fastball
Slider
Curveball
Changeup
Sinker
```

The lab shows how pitch speed, break, drop, and pitch phase affect the hitter’s decision window.

### Hitting Lab

The Hitting Lab simulates what happens after contact. It uses exit velocity, launch angle, spray direction, pitch type, pitch location, batter hand, pitcher hand, timing, and contact quality to create a spray chart result.

Key motion model:

```text
x(t) = v₀cos(θ)t
y(t) = y₀ + v₀sin(θ)t − 16t²
spray direction = φ
```

The lab connects baseball contact to a velocity vector. It shows that a hard-hit ball is most dangerous when speed, angle, and direction work together.

### Analytics Dashboard

The Analytics Dashboard connects the calculus, pitching, and hitting labs into one final baseball intelligence system. It uses clickable bubbles to explain each part of the model:

```text
Calculus
Pitching
Hitting
Spray Chart
Scouting Report
```

This final page explains how pitch movement, hitter reaction, contact quality, and field result can be combined into a scouting-style decision system.

### The Model

The Model page explains how the system works behind the scenes. It includes the main formulas, how to read each formula in plain English, a variable glossary, the website implementation process, and the limitations of the simplified model.

This page connects the math, baseball analytics, and website build into one clear methodology section.

## Calculus Concepts Used

This project uses several concepts from differential calculus:

- Position as a function of time
- Velocity as the derivative of position
- Acceleration as the derivative of velocity
- Projectile motion
- Maximum height as a critical point
- Reaction time as a rate and time problem
- Directional motion using vectors
- Optimization of launch angle and exit velocity
- Interpreting motion through graphs and visual models

## Baseball Concepts Used

This project also connects calculus to baseball analytics concepts, including:

- Exit velocity
- Launch angle
- Pitch velocity
- Pitch movement
- Horizontal break
- Vertical drop
- Reaction time
- Spray direction
- Pull side and opposite field
- Batted-ball distance
- Field zones
- Contact quality
- Scouting decisions

## Technologies Used

- HTML
- CSS
- JavaScript
- SVG graphics
- Interactive sliders
- Interactive buttons
- GitHub Pages

## File Structure

```text
.
├── index.html
├── calculus.html
├── pitching.html
├── hitting.html
├── analytics.html
├── model.html
├── style.css
├── script.js
└── README.md
```

## How to Use the Project

Open `index.html` in a browser or view the project through GitHub Pages.

Recommended viewing path:

1. Start on the Home page.
2. Explore the Calculus Engine to understand projectile motion.
3. Open the Pitching Lab to test pitch velocity, pitch type, movement, and reaction time.
4. Open the Hitting Lab to simulate matchup, timing, pitch location, and spray direction.
5. View the Analytics Dashboard to connect everything into one scouting-style system.
6. Finish with The Model page to understand the formulas, variables, implementation, and limitations.

## Example Calculus Explanation

A batted baseball can be modeled using horizontal and vertical position functions:

```text
x(t) = v₀cos(θ)t
y(t) = y₀ + v₀sin(θ)t − 16t²
```

The derivative of position gives velocity:

```text
x′(t) = v₀cos(θ)
y′(t) = v₀sin(θ) − 32t
```

The maximum height occurs when vertical velocity equals zero:

```text
y′(t) = 0
```

In baseball terms, this is the top of the ball flight. The ball stops rising for an instant before it begins falling.

## Formula Translation

The Model page includes formula translations so the calculus can be read in plain English.

Examples:

```text
r(t) = <x(t), y(t)>
Read as: r of t equals the ordered pair x of t and y of t.

x(t) = v₀cos(θ)t
Read as: x of t equals v naught cosine theta times t.

y(t) = y₀ + v₀sin(θ)t − 16t²
Read as: y of t equals y naught plus v naught sine theta times t minus sixteen t squared.

r′(t) = velocity
Read as: r prime of t equals velocity.

r″(t) = acceleration
Read as: r double prime of t equals acceleration.

y′(t) = 0
Read as: y prime of t equals zero.

t ≈ d ÷ v
Read as: t is approximately distance divided by velocity.

φ = spray direction
Read as: phi equals spray direction.
```

## Variable Glossary

| Variable | How to Say It | Meaning | Baseball Connection |
|---|---|---|---|
| `t` | time | Time in seconds | How long the ball has been moving |
| `v₀` | v naught | Initial velocity | Exit velocity after contact |
| `θ` | theta | Launch angle | Angle the ball leaves the bat |
| `φ` | phi | Spray angle | Direction across the field |
| `x(t)` | x of t | Horizontal position | Forward distance traveled |
| `y(t)` | y of t | Vertical position | Height of the ball |
| `y₀` | y naught | Starting height | Height of the ball at contact |
| `r(t)` | r of t | Total position | Where the batted ball is |
| `r′(t)` | r prime of t | Velocity | Speed and direction after contact |
| `r″(t)` | r double prime of t | Acceleration | Gravity changing vertical velocity |
| `s(t)` | s of t | Pitch position | Where the pitch is before contact |
| `s′(t)` | s prime of t | Pitch velocity | How fast the pitch approaches the plate |

## Why This Matters

This project shows that calculus is not only useful for abstract math problems. It can be used to explain real motion in sports.

In baseball:

- A pitch is position changing over time.
- Pitch velocity affects the hitter’s reaction time.
- A batted ball follows a motion path.
- Launch angle affects height and distance.
- Exit velocity affects how far the ball can travel.
- The derivative describes the direction and speed of motion.
- The maximum height of the ball can be found using a critical point.

Calculus gives a language for understanding how the game moves.

## Implementation

The website was built as a front-end interactive project.

### HTML

HTML creates the structure of the website. It organizes the pages, navigation, sections, cards, buttons, sliders, formulas, tables, and written explanations.

### CSS

CSS creates the visual design. It controls the dark green baseball theme, gold accents, broadcast-style panels, responsive grids, formula cards, SVG containers, and page layouts.

### JavaScript

JavaScript makes the website interactive. It reads user inputs, updates selected buttons, calculates motion values, updates the displayed results, and changes the SVG visuals.

### SVG

SVG graphics are used to draw baseball fields, pitch paths, spray charts, ball flight curves, velocity vectors, landing zones, and dashboard visuals.

## Model Scope and Limitations

This project uses a simplified educational model. It focuses on the calculus relationships between position, velocity, acceleration, launch angle, exit velocity, reaction time, and field direction.

A professional baseball model would also include:

- Air resistance
- Spin rate
- Wind
- Stadium dimensions
- Field conditions
- Ballpark effects
- Player-specific data
- Real tracking measurements

Those factors are outside the scope of this Math 1A project. However, the simplified model is still useful because it clearly shows how calculus describes motion.

## Research Base

This project is supported by baseball analytics and calculus concepts from:

- MLB Statcast Glossary
- Baseball Savant Statcast tools
- OpenStax Calculus Volume 1
- OpenStax Physics Projectile Motion

## Works Cited

Major League Baseball. “Statcast Glossary.” *MLB.com*.  
https://www.mlb.com/glossary/statcast

Major League Baseball. “Statcast Exit Velocity & Launch Angle Field Breakdown.” *Baseball Savant*.  
https://baseballsavant.mlb.com/statcast_field

Strang, Gilbert, and Edwin “Jed” Herman. *Calculus Volume 1*. OpenStax, Rice University, 2016.  
https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative

OpenStax. “Derivatives as Rates of Change.” *Calculus Volume 1*. OpenStax, Rice University, 2016.  
https://openstax.org/books/calculus-volume-1/pages/3-4-derivatives-as-rates-of-change

OpenStax. “Projectile Motion.” *Physics*. OpenStax, Rice University.  
https://openstax.org/books/physics/pages/5-3-projectile-motion

## Project Reflection

This project helped me understand that calculus is not only used in abstract classroom problems. It can be used to describe real movement in sports. Baseball is a strong example because every pitch, swing, and batted ball involves changing position over time.

By building this project, I connected derivatives to velocity, acceleration, maximum height, reaction time, and baseball strategy. I also practiced turning mathematical ideas into an interactive visual system that a viewer can explore.

The biggest thing I learned is that calculus can help explain why certain baseball outcomes happen. A hard-hit ball still needs the right angle and direction. A pitch becomes harder to hit when it moves quickly and gives the hitter less time to react. A spray chart is not just a picture of the field. It represents motion, direction, and the result of a velocity vector after contact.

## Future Improvements

Possible future improvements include:

- Adding more realistic air resistance
- Adding different ballpark dimensions
- Adding player comparison data
- Adding real MLB examples
- Creating a database of pitch and batted-ball outcomes
- Improving the model with more advanced physics
- Turning the project into a larger baseball analytics portfolio piece

## Author

Created by **Aundria VanderVeur**  
Math 1A Final Project  
Calculus Baseball Intelligence System

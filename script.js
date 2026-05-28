document.addEventListener("DOMContentLoaded", () => {
  setActiveNavLink();
  setupFadeInAnimations();
  setupGameCastSimulator();
  setupSprayChartSimulator();
  setupHomePreviewSimulator();
  setupCalculusEngine();
  setupPitchingLab();
  setupHittingLab();
  setupAnalyticsBubbleDashboard();
});
/* =========================
   NAV + ANIMATIONS
========================= */

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}

function setupFadeInAnimations() {
  const animatedElements = document.querySelectorAll(`
    .section-header,
    .broadcast-hero-card,
    .gamecast-control-panel,
    .gamecast-main-panel,
    .gamecast-analysis-panel,
    .spray-control-panel,
    .spray-map-panel,
    .spray-analysis-panel,
    .intelligence-card,
    .field-preview-card,
    .field-preview-copy,
    .module-card,
    .case-study-grid,
    .final-cta,
    .page-hero-content,
    .engine-control-panel,
    .engine-display,
    .engine-results-panel,
    .motion-status-card,
    .motion-readout-strip,
    .motion-visual-shell,
    .motion-timeline,
    .motion-summary-card,
    .pitch-status-card,
    .pitch-choice-card,
    .pitch-broadcast-shell,
    .pitch-pressure-card,
    .pitch-visual-legend,
    .hit-status-card,
    .barrel-score-card,
    .barrel-window-card,
    .launch-visual-shell,
    .hit-grade-card,
    .technical-card,
    .optimization-proof,
    .optimization-explanation,
    .analytics-panel,
    .analytics-main-panel,
    .flow-card,
    .source-card
  `);

  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.14 }
  );

  animatedElements.forEach((element) => {
    element.classList.add("fade-in");
    observer.observe(element);
  });
}

/* =========================
   SHARED HELPERS
========================= */

function mphToFeetPerSecond(mph) {
  return (mph * 5280) / 3600;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundNumber(value, decimals = 1) {
  return Number(value).toFixed(decimals);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setTextAll(id, value) {
  document.querySelectorAll(`#${id}`).forEach((element) => {
    element.textContent = value;
  });
}

function updateArrowHead(arrowElement, startX, startY, endX, endY, size) {
  if (!arrowElement) return;

  const angle = Math.atan2(endY - startY, endX - startX);

  const p1x = endX;
  const p1y = endY;

  const p2x = endX - size * Math.cos(angle - Math.PI / 6);
  const p2y = endY - size * Math.sin(angle - Math.PI / 6);

  const p3x = endX - size * Math.cos(angle + Math.PI / 6);
  const p3y = endY - size * Math.sin(angle + Math.PI / 6);

  arrowElement.setAttribute(
    "points",
    `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`
  );
}

function getPitcherLabel(hand) {
  return hand === "right" ? "RHP" : "LHP";
}

function getBatterLabel(hand) {
  return hand === "right" ? "RHB" : "LHB";
}

/* =========================
   BASEBALL FLIGHT MODEL
========================= */

function calculateBaseballFlight(exitVelocityMph, launchAngleDegrees, selectedTime = 0) {
  const gravity = 32;
  const y0 = 3;

  const v0 = mphToFeetPerSecond(exitVelocityMph);
  const theta = degreesToRadians(launchAngleDegrees);

  const idealVX = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);

  const realismFactor = getDistanceRealismFactor(
    exitVelocityMph,
    launchAngleDegrees
  );

  const vx = idealVX * realismFactor;

  const timeToApex = Math.max(0, vy0 / gravity);
  const maxHeight = y0 + (vy0 * vy0) / (2 * gravity);

  const flightTime =
    (vy0 + Math.sqrt(vy0 * vy0 + 2 * gravity * y0)) / gravity;

  const distance = vx * flightTime;
  const activeTime = clamp(selectedTime, 0, flightTime);

  const x = vx * activeTime;
  const rawY = y0 + vy0 * activeTime - 0.5 * gravity * activeTime * activeTime;
  const y = Math.max(0, rawY);

  const vy = vy0 - gravity * activeTime;
  const speed = Math.sqrt(vx * vx + vy * vy);

  const apexX = vx * timeToApex;

  return {
    gravity,
    y0,
    v0,
    theta,
    idealVX,
    vx,
    vy0,
    vy,
    speed,
    timeToApex,
    maxHeight,
    flightTime,
    distance,
    activeTime,
    selectedTime,
    x,
    y,
    apexX,
  };
}

function getDistanceRealismFactor(exitVelocityMph, launchAngleDegrees) {
  let factor = 0.72;

  if (launchAngleDegrees < 8) factor *= 0.45;
  if (launchAngleDegrees >= 18 && launchAngleDegrees <= 32) factor *= 1.02;
  if (launchAngleDegrees > 38) factor *= 0.86;
  if (launchAngleDegrees > 48) factor *= 0.7;
  if (exitVelocityMph >= 100) factor *= 1.04;
  if (exitVelocityMph < 85) factor *= 0.9;

  return factor;
}

function classifyContact(exitVelocityMph, launchAngleDegrees, distance) {
  const hardHit = exitVelocityMph >= 95;
  const sweetSpot = launchAngleDegrees >= 8 && launchAngleDegrees <= 32;

  const barrelLike =
    exitVelocityMph >= 98 &&
    launchAngleDegrees >= 19 &&
    launchAngleDegrees <= 32 &&
    distance >= 350;

  if (barrelLike) {
    return {
      label: "Barrel-like contact",
      className: "elite-contact",
      explanation:
        "Strong exit velocity and a productive launch angle create a high-value batted ball profile.",
    };
  }

  if (hardHit && sweetSpot) {
    return {
      label: "Hard-hit sweet spot",
      className: "elite-contact",
      explanation:
        "The ball is hit hard and launched in a useful angle range, giving it strong carry.",
    };
  }

  if (launchAngleDegrees < 8) {
    return {
      label: "Ground ball profile",
      className: "weak-contact",
      explanation:
        "The launch angle is too low, so the ball is more likely to stay near the ground.",
    };
  }

  if (launchAngleDegrees > 42) {
    return {
      label: "High fly ball profile",
      className: "warning-contact",
      explanation:
        "The ball climbs high, but too much height can reduce forward distance.",
    };
  }

  return {
    label: "Playable contact",
    className: "warning-contact",
    explanation:
      "The contact has useful traits, but either exit velocity or launch angle could improve.",
  };
}

/* =========================
   HOMEPAGE GAMECAST
========================= */

function setupGameCastSimulator() {
  const gamecast = document.querySelector(".gamecast-section");
  if (!gamecast) return;

  const state = {
    pitcherHand: "right",
    batterHand: "right",
    pitch: "fastball",
    timing: "perfect",
    contact: "barrel",
    spray: "pull",
  };

  const buttons = document.querySelectorAll(".choice-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".choice-buttons");

      if (group) {
        group.querySelectorAll(".choice-btn").forEach((btn) => {
          btn.classList.remove("active");
        });
      }

      button.classList.add("active");

      if (button.dataset.pitcherHand) state.pitcherHand = button.dataset.pitcherHand;
      if (button.dataset.batterHand) state.batterHand = button.dataset.batterHand;
      if (button.dataset.pitch) state.pitch = button.dataset.pitch;
      if (button.dataset.timing) state.timing = button.dataset.timing;
      if (button.dataset.contact) state.contact = button.dataset.contact;
      if (button.dataset.spray) state.spray = button.dataset.spray;

      updateGameCast(state);
    });
  });

  updateGameCast(state);
}

function updateGameCast(state) {
  const scenario = buildGameCastScenario(state);

  setText("gameMatchup", scenario.matchupLabel);
  setText("gamePitchSpeed", `${scenario.pitchSpeed} mph`);
  setText("gameReactionTime", `${scenario.reactionTime.toFixed(2)} sec`);
  setText("gameExitVelocity", `${scenario.exitVelocity} mph`);
  setText("gameLaunchAngle", `${scenario.launchAngle}°`);
  setText("gameSprayZone", scenario.sprayZoneLabel);
  setText("gameOutcome", scenario.outcome);

  setText(
    "gameVectorReadout",
    `r′(t): ${scenario.exitVelocity} mph | ${scenario.launchAngle}° launch | ${scenario.sprayAngleLabel} spray`
  );

  setText("gameVisualFocus", getVisualFocusText(scenario));

  setText("gameOptimizationScore", scenario.optimizationScore);
  setText("gameOptimizationLabel", scenario.scoreLabel);

  const scoreFill = document.getElementById("gameScoreFill");
  if (scoreFill) scoreFill.style.width = `${scenario.optimizationScore}%`;

  setText("gameContactGrade", scenario.contactGrade);
  setText("gameCarryGrade", scenario.carryGrade);
  setText("gameLaunchGrade", scenario.launchGrade);
  setText("gamePressureGrade", scenario.pressureGrade);
  setText("gameSprayGrade", scenario.sprayGrade);

  setText("gameCalculusHeadline", scenario.calculusHeadline);
  setText("gameCalculusExplanation", scenario.calculusExplanation);

  updateGameCastVisual(scenario);
  updateHeroFeed(scenario);
}

function buildGameCastScenario(state) {
  const pitchProfiles = {
    fastball: {
      name: "Fastball",
      speed: 98,
      breakX: 0,
      breakY: -8,
      pressureBoost: 10,
    },
    slider: {
      name: "Slider",
      speed: 86,
      breakX: -58,
      breakY: 28,
      pressureBoost: 5,
    },
    changeup: {
      name: "Changeup",
      speed: 82,
      breakX: 35,
      breakY: 34,
      pressureBoost: 0,
    },
  };

  const timingProfiles = {
    early: {
      name: "Early",
      evModifier: -6,
      angleModifier: 8,
    },
    perfect: {
      name: "Perfect",
      evModifier: 4,
      angleModifier: 0,
    },
    late: {
      name: "Late",
      evModifier: -4,
      angleModifier: -5,
    },
  };

  const contactProfiles = {
    jammed: {
      name: "Jammed",
      baseEV: 78,
      baseAngle: 11,
      quality: 38,
      contactGrade: 35,
    },
    solid: {
      name: "Solid",
      baseEV: 94,
      baseAngle: 19,
      quality: 65,
      contactGrade: 55,
    },
    barrel: {
      name: "Barrel",
      baseEV: 102,
      baseAngle: 28,
      quality: 88,
      contactGrade: 70,
    },
  };

  const pitch = pitchProfiles[state.pitch];
  const timing = timingProfiles[state.timing];
  const contact = contactProfiles[state.contact];

  const pitchSpeed = pitch.speed;
  const reactionTime = 60.5 / mphToFeetPerSecond(pitchSpeed);

  const handednessFactor = getHandednessFactor(
    state.pitcherHand,
    state.batterHand,
    state.pitch
  );

  const sprayFactor = getSprayFactor(state.spray);

  const exitVelocity = clamp(
    Math.round(
      contact.baseEV +
      timing.evModifier +
      pitch.pressureBoost * 0.15 +
      sprayFactor.evModifier
    ),
    55,
    116
  );

  const launchAngle = clamp(
    Math.round(contact.baseAngle + timing.angleModifier + sprayFactor.angleModifier),
    0,
    55
  );

  const flight = calculateBaseballFlight(exitVelocity, launchAngle);

  const pressureGrade = clamp(
    Math.round(45 + pitch.pressureBoost + pitchSpeed * 0.25 + handednessFactor.pressureModifier),
    40,
    85
  );

  const launchGrade = gradeLaunchAngle(launchAngle);
  const carryGrade = gradeCarry(flight.distance, launchAngle);
  const contactGrade = clamp(contact.contactGrade + Math.round(exitVelocity / 12), 30, 82);
  const sprayGrade = getSprayGrade(state.spray, state.timing);

  const optimizationScore = clamp(
    Math.round(
      contact.quality * 0.33 +
      launchGrade * 0.23 +
      carryGrade * 0.2 +
      pressureGrade * 0.1 +
      sprayGrade * 0.14
    ),
    25,
    98
  );

  const outcome = classifyGameCastOutcome({
    exitVelocity,
    launchAngle,
    distance: flight.distance,
    contactType: state.contact,
    spray: state.spray,
  });

  const sprayPosition = getSprayPosition({
    spray: state.spray,
    batterHand: state.batterHand,
    distance: flight.distance,
    launchAngle,
  });

  const scoreLabel = getOptimizationLabel(optimizationScore);

  const calculusRead = getGameCastCalculusRead({
    state,
    exitVelocity,
    launchAngle,
    flight,
    outcome,
    pitch,
    timing,
    contact,
  });

  const matchupLabel = `${getPitcherLabel(state.pitcherHand)} vs ${getBatterLabel(state.batterHand)}`;
  const sprayZoneLabel = getSprayZoneLabel(state.spray, state.batterHand);

  return {
    ...state,
    pitchName: pitch.name,
    timingName: timing.name,
    contactName: contact.name,
    matchupLabel,
    sprayZoneLabel,
    pitchSpeed,
    reactionTime,
    exitVelocity,
    launchAngle,
    distance: flight.distance,
    maxHeight: flight.maxHeight,
    flightTime: flight.flightTime,
    timeToApex: flight.timeToApex,
    outcome,
    optimizationScore,
    scoreLabel,
    contactGrade,
    carryGrade,
    launchGrade,
    pressureGrade,
    sprayGrade,
    landingX: sprayPosition.x,
    landingY: sprayPosition.y,
    heroLandingX: sprayPosition.heroX,
    heroLandingY: sprayPosition.heroY,
    pitchBreakX: pitch.breakX * handednessFactor.pitchBreakDirection,
    pitchBreakY: pitch.breakY,
    sprayAngleLabel: sprayPosition.angleLabel,
    calculusHeadline: calculusRead.headline,
    calculusExplanation: calculusRead.explanation,
  };
}

function getHandednessFactor(pitcherHand, batterHand, pitchType) {
  const sameSide = pitcherHand === batterHand;

  let pitchBreakDirection = pitcherHand === "right" ? 1 : -1;
  let pressureModifier = sameSide ? 5 : 1;

  if (pitchType === "changeup") pressureModifier -= 1;
  if (pitchType === "slider" && sameSide) pressureModifier += 4;

  return {
    sameSide,
    pitchBreakDirection,
    pressureModifier,
  };
}

function getSprayFactor(spray) {
  if (spray === "pull") return { evModifier: 2, angleModifier: 1 };
  if (spray === "center") return { evModifier: 1, angleModifier: 0 };
  return { evModifier: -2, angleModifier: -1 };
}

function getSprayGrade(spray, timing) {
  if (spray === "center" && timing === "perfect") return 72;
  if (spray === "pull" && timing === "early") return 66;
  if (spray === "opposite" && timing === "late") return 66;
  if (spray === "pull") return 68;
  if (spray === "center") return 70;
  return 62;
}

function getSprayZoneLabel(spray, batterHand) {
  if (spray === "center") return "Center Field";

  if (batterHand === "right") {
    return spray === "pull" ? "Left Field" : "Right Field";
  }

  return spray === "pull" ? "Right Field" : "Left Field";
}

function getSprayPosition(options) {
  const { spray, batterHand, distance, launchAngle } = options;

  const depthY = mapDistanceToFieldY(distance, launchAngle);
  const heroDepthY = mapHeroDistanceToFieldY(distance, launchAngle);

  let x = 490;
  let heroX = 350;
  let angleLabel = "Center 0°";

  if (spray === "pull") {
    if (batterHand === "right") {
      x = 300;
      heroX = 210;
      angleLabel = "Pull -22°";
    } else {
      x = 680;
      heroX = 505;
      angleLabel = "Pull +22°";
    }
  }

  if (spray === "opposite") {
    if (batterHand === "right") {
      x = 680;
      heroX = 505;
      angleLabel = "Opposite +22°";
    } else {
      x = 300;
      heroX = 210;
      angleLabel = "Opposite -22°";
    }
  }

  if (distance < 260) {
    x = 490 + (x - 490) * 0.55;
    heroX = 350 + (heroX - 350) * 0.55;
  }

  return {
    x: clamp(x, 210, 780),
    y: depthY,
    heroX: clamp(heroX, 150, 560),
    heroY: heroDepthY,
    angleLabel,
  };
}

function gradeLaunchAngle(angle) {
  if (angle >= 19 && angle <= 32) return 75;
  if (angle >= 10 && angle < 19) return 62;
  if (angle > 32 && angle <= 42) return 55;
  if (angle < 8) return 35;
  return 42;
}

function gradeCarry(distance, angle) {
  if (distance >= 400) return 75;
  if (distance >= 360) return 67;
  if (distance >= 300) return 56;
  if (angle < 8) return 34;
  return 45;
}

function classifyGameCastOutcome(options) {
  const { exitVelocity, launchAngle, distance, contactType, spray } = options;

  if (contactType === "jammed" && launchAngle < 15) return "Soft Contact";
  if (launchAngle < 8) return "Ground Ball";

  if (
    exitVelocity >= 100 &&
    launchAngle >= 20 &&
    launchAngle <= 32 &&
    distance >= 390
  ) {
    if (spray === "center") return "Dead Center Drive";
    return "Home Run Track";
  }

  if (
    exitVelocity >= 96 &&
    launchAngle >= 14 &&
    launchAngle <= 28 &&
    distance >= 320
  ) {
    return "Extra-Base Threat";
  }

  if (launchAngle > 42) return "High Flyout Risk";
  if (launchAngle >= 8 && launchAngle < 18) return "Line Drive";

  return "Playable Ball";
}

function getOptimizationLabel(score) {
  if (score >= 90) return "Elite speed-angle pairing";
  if (score >= 78) return "High-value contact profile";
  if (score >= 65) return "Productive baseball result";
  if (score >= 50) return "Useful but imperfect contact";
  return "Low efficiency contact";
}

function getVisualFocusText(scenario) {
  if (scenario.outcome === "Home Run Track" || scenario.outcome === "Dead Center Drive") {
    return "Deep carry, landing zone, and spray direction";
  }

  if (scenario.outcome === "Ground Ball") return "Low launch path and quick downward motion";
  if (scenario.outcome === "High Flyout Risk") return "High arc with reduced forward carry";
  if (scenario.outcome === "Extra-Base Threat") return "Gap direction, carry, and defensive pressure";
  if (scenario.outcome === "Line Drive") return "Flat trajectory with strong horizontal velocity";
  if (scenario.outcome === "Soft Contact") return "Weak contact point and shallow landing zone";

  return "Batted ball flight path + spray direction";
}

function getGameCastCalculusRead(options) {
  const {
    state,
    exitVelocity,
    launchAngle,
    flight,
    outcome,
    pitch,
    timing,
    contact,
  } = options;

  const handednessText = `${getPitcherLabel(state.pitcherHand)} vs ${getBatterLabel(state.batterHand)}`;
  const sprayText = getSprayZoneLabel(state.spray, state.batterHand);

  if (outcome === "Home Run Track" || outcome === "Dead Center Drive") {
    return {
      headline: "Optimized projectile motion",
      explanation:
        `In a ${handednessText} matchup, ${contact.name.toLowerCase()} contact creates ${exitVelocity} mph at ${launchAngle}° toward ${sprayText}. The ball reaches its apex at ${flight.timeToApex.toFixed(2)} seconds when y′(t) = 0, while the horizontal component preserves carry.`,
    };
  }

  if (outcome === "Ground Ball") {
    return {
      headline: "Vertical velocity is too small",
      explanation:
        `The launch angle is only ${launchAngle}°, so v₀sin(θ) is limited. The derivative y′(t) becomes negative quickly, which keeps the ball near the ground instead of creating carry.`,
    };
  }

  if (outcome === "High Flyout Risk") {
    return {
      headline: "Too much vertical motion",
      explanation:
        `The launch angle is ${launchAngle}°, which sends too much velocity upward. The ball gains height, but horizontal carry is reduced, making the contact less efficient.`,
    };
  }

  if (outcome === "Extra-Base Threat") {
    return {
      headline: "Strong directional velocity vector",
      explanation:
        `The velocity vector r′(t) points the ball toward ${sprayText}. Its vertical component creates lift, while its horizontal and spray components explain both distance and field location.`,
    };
  }

  return {
    headline: "Motion depends on the velocity vector",
    explanation:
      `The ${pitch.name.toLowerCase()} creates a ${reactionTimeFromPitch(pitch.speed)} second decision window. Because the swing was ${timing.name.toLowerCase()}, the resulting r′(t) sends the ball toward ${sprayText} as a ${outcome.toLowerCase()}.`,
  };
}

function reactionTimeFromPitch(mph) {
  return (60.5 / mphToFeetPerSecond(mph)).toFixed(2);
}

function mapDistanceToFieldY(distance, launchAngle) {
  if (launchAngle < 8) return 430;
  if (distance >= 410) return 135;
  if (distance >= 375) return 165;
  if (distance >= 330) return 215;
  if (distance >= 260) return 285;
  return 350;
}

function mapHeroDistanceToFieldY(distance, launchAngle) {
  if (launchAngle < 8) return 315;
  if (distance >= 410) return 105;
  if (distance >= 375) return 125;
  if (distance >= 330) return 160;
  if (distance >= 260) return 215;
  return 275;
}

function updateGameCastVisual(scenario) {
  const pitchPath = document.getElementById("gamePitchPath");
  const hitPath = document.getElementById("gameHitPath");
  const sprayLane = document.getElementById("gameSprayLane");
  const landingZone = document.getElementById("gameLandingZone");
  const pitchBall = document.getElementById("gamePitchBall");
  const hitBall = document.getElementById("gameHitBall");
  const contactFlash = document.getElementById("gameContactFlash");

  const contactX = 490;
  const contactY = 505;

  const pitchStartX = 490;
  const pitchStartY = 155;

  const pitchControl1X = 490 + scenario.pitchBreakX * 0.2;
  const pitchControl1Y = 260;

  const pitchControl2X = 490 + scenario.pitchBreakX * 0.7;
  const pitchControl2Y = 390 + scenario.pitchBreakY * 0.25;

  if (pitchPath) {
    pitchPath.setAttribute(
      "d",
      `M${pitchStartX} ${pitchStartY} C${pitchControl1X} ${pitchControl1Y}, ${pitchControl2X} ${pitchControl2Y}, ${contactX} ${contactY}`
    );
  }

  if (pitchBall) {
    pitchBall.setAttribute("cx", pitchControl2X);
    pitchBall.setAttribute("cy", pitchControl2Y);
  }

  const landingX = scenario.landingX;
  const landingY = scenario.landingY;

  const apexX = contactX + (landingX - contactX) * 0.48;
  const apexY = clamp(landingY - scenario.maxHeight * 1.55, 85, 260);

  const control1X = contactX + (apexX - contactX) * 0.65;
  const control1Y = apexY;

  const control2X = apexX + (landingX - apexX) * 0.7;
  const control2Y = apexY + 15;

  if (sprayLane) {
    sprayLane.setAttribute("d", `M${contactX} ${contactY} L${landingX} ${landingY}`);
  }

  if (hitPath) {
    hitPath.setAttribute(
      "d",
      `M${contactX} ${contactY} C${control1X} ${control1Y}, ${control2X} ${control2Y}, ${landingX} ${landingY}`
    );
  }

  if (landingZone) {
    const zoneSize = scenario.optimizationScore >= 80 ? 42 : 30;

    landingZone.setAttribute("cx", landingX);
    landingZone.setAttribute("cy", landingY);
    landingZone.setAttribute("rx", zoneSize);
    landingZone.setAttribute("ry", Math.max(16, zoneSize * 0.55));
  }

  if (hitBall) {
    hitBall.setAttribute("cx", landingX);
    hitBall.setAttribute("cy", landingY);
  }

  if (contactFlash) {
    const flashSize =
      scenario.contactName === "Barrel"
        ? 26
        : scenario.contactName === "Solid"
          ? 20
          : 14;

    contactFlash.setAttribute("r", flashSize);
  }
}

function updateHeroFeed(scenario) {
  setText("heroScenarioLabel", scenario.pitchName);
  setText("heroMatchupOutput", scenario.matchupLabel);
  setText("heroDirectionOutput", scenario.sprayZoneLabel);
  setText("heroEVOutput", `${scenario.exitVelocity} mph`);
  setText("heroLAOutput", `${scenario.launchAngle}°`);
  setText("heroOutcomeOutput", scenario.outcome);

  const arc = document.getElementById("heroBroadcastArc");
  const landingZone = document.getElementById("heroLandingZone");
  const ball = document.getElementById("heroBroadcastBall");
  const landingLabel = document.getElementById("heroLandingLabel");

  const startX = 350;
  const startY = 352;
  const landingX = scenario.heroLandingX;
  const landingY = scenario.heroLandingY;

  const apexX = startX + (landingX - startX) * 0.48;
  const apexY = clamp(landingY - scenario.maxHeight * 1.05, 60, 205);

  const c1x = startX + (apexX - startX) * 0.68;
  const c2x = apexX + (landingX - apexX) * 0.72;

  if (arc) {
    arc.setAttribute(
      "d",
      `M${startX} ${startY} C${c1x} ${apexY}, ${c2x} ${apexY}, ${landingX} ${landingY}`
    );
  }

  if (landingZone) {
    landingZone.setAttribute("cx", landingX);
    landingZone.setAttribute("cy", landingY);
    landingZone.setAttribute("rx", scenario.optimizationScore >= 80 ? 34 : 26);
    landingZone.setAttribute("ry", scenario.optimizationScore >= 80 ? 19 : 15);
  }

  if (ball) {
    ball.setAttribute("cx", landingX);
    ball.setAttribute("cy", landingY);
  }

  if (landingLabel) {
    landingLabel.textContent = scenario.sprayZoneLabel;
    landingLabel.setAttribute("x", clamp(landingX - 70, 120, 520));
    landingLabel.setAttribute("y", clamp(landingY - 25, 75, 315));
  }
}

/* =========================
   SPRAY CHART
========================= */

function setupSprayChartSimulator() {
  const buttons = document.querySelectorAll(".spray-btn");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const sprayType = button.dataset.sprayType;
      updateSprayChart(sprayType);
    });
  });

  updateSprayChart("barrel");
}

function updateSprayChart(type) {
  const data = getSprayChartData(type);

  setText("spraySelectedTitle", data.title);
  setText("spraySelectedDescription", data.description);
  setText("sprayDistanceOutput", `${data.distance} ft`);
  setText("sprayLaunchOutput", `${data.launchAngle}°`);
  setText("sprayAngleOutput", data.sprayAngle);

  const vectorLine = document.getElementById("sprayVectorLine");
  const flightArc = document.getElementById("sprayFlightArc");
  const landingZone = document.getElementById("sprayLandingZone");
  const landingDot = document.getElementById("sprayLandingDot");
  const zoneLabel = document.getElementById("sprayZoneLabel");
  const mathLabel = document.getElementById("sprayMathLabel");

  const startX = 380;
  const startY = 470;

  const landingX = data.x;
  const landingY = data.y;

  const apexX = startX + (landingX - startX) * 0.5;
  const apexY = clamp(landingY - data.arcHeight, 70, 390);

  const c1x = startX + (apexX - startX) * 0.7;
  const c2x = apexX + (landingX - apexX) * 0.72;

  if (vectorLine) {
    vectorLine.setAttribute("d", `M${startX} ${startY} L${landingX} ${landingY}`);
  }

  if (flightArc) {
    flightArc.setAttribute(
      "d",
      `M${startX} ${startY} C${c1x} ${apexY}, ${c2x} ${apexY}, ${landingX} ${landingY}`
    );
  }

  if (landingZone) {
    landingZone.setAttribute("cx", landingX);
    landingZone.setAttribute("cy", landingY);
    landingZone.setAttribute("rx", data.zoneRx);
    landingZone.setAttribute("ry", data.zoneRy);
  }

  if (landingDot) {
    landingDot.setAttribute("cx", landingX);
    landingDot.setAttribute("cy", landingY);
  }

  if (zoneLabel) {
    zoneLabel.textContent = data.zoneLabel;
    zoneLabel.setAttribute("x", clamp(landingX - 65, 110, 610));
    zoneLabel.setAttribute("y", clamp(landingY - 28, 80, 440));
  }

  if (mathLabel) {
    mathLabel.textContent = data.mathLabel;
  }

  setText("sprayPrimaryIdea", data.primaryIdea);
  setText("sprayPrimaryExplanation", data.primaryExplanation);
  setText("sprayFieldMeaning", data.fieldMeaning);
  setText("sprayFieldExplanation", data.fieldExplanation);
  setText("sprayTeamInsight", data.teamInsight);
  setText("sprayTeamExplanation", data.teamExplanation);
}

function getSprayChartData(type) {
  const profiles = {
    grounder: {
      title: "Ground Ball",
      description:
        "A low launch angle keeps the ball close to the field, creating limited carry but forcing quick defensive reaction.",
      distance: 115,
      launchAngle: 4,
      sprayAngle: "Center -2°",
      x: 375,
      y: 385,
      arcHeight: 40,
      zoneRx: 30,
      zoneRy: 15,
      zoneLabel: "ground ball zone",
      mathLabel: "small v₀sin(θ) keeps y(t) low",
      primaryIdea: "Low vertical component",
      primaryExplanation:
        "The launch angle is small, so the vertical component of velocity is limited and y′(t) turns negative quickly.",
      fieldMeaning: "Infield pressure",
      fieldExplanation:
        "The ball does not travel far, but it can force a quick defensive play if hit hard enough.",
      teamInsight: "Infield positioning",
      teamExplanation:
        "Teams can use ground ball tendencies to position infielders toward common lanes.",
    },
    lineDrive: {
      title: "Line Drive",
      description:
        "A flatter trajectory with strong forward velocity. This is dangerous because it reaches the outfield quickly.",
      distance: 285,
      launchAngle: 14,
      sprayAngle: "Opposite +12°",
      x: 500,
      y: 255,
      arcHeight: 95,
      zoneRx: 38,
      zoneRy: 19,
      zoneLabel: "line drive lane",
      mathLabel: "large horizontal velocity creates quick carry",
      primaryIdea: "Strong horizontal velocity",
      primaryExplanation:
        "The velocity vector has a strong horizontal component, so the ball travels forward quickly without needing extreme height.",
      fieldMeaning: "Gap pressure",
      fieldExplanation:
        "Line drives can split defenders because they combine speed and moderate depth.",
      teamInsight: "Outfielder reaction",
      teamExplanation:
        "Teams can study line-drive lanes to improve first-step positioning in the outfield.",
    },
    barrel: {
      title: "Barrel Contact",
      description:
        "A strong batted ball with high exit velocity, efficient launch angle, and deep carry into a power zone.",
      distance: 406,
      launchAngle: 27,
      sprayAngle: "Pull +18°",
      x: 455,
      y: 145,
      arcHeight: 190,
      zoneRx: 42,
      zoneRy: 22,
      zoneLabel: "barrel zone",
      mathLabel: "optimized r′(t): speed + angle + direction",
      primaryIdea: "Optimized velocity vector",
      primaryExplanation:
        "The velocity vector has enough upward motion to create lift while preserving enough horizontal motion to create deep carry.",
      fieldMeaning: "Power alley damage",
      fieldExplanation:
        "The ball reaches a dangerous outfield zone where distance and location combine to create extra-base value.",
      teamInsight: "Damage prevention",
      teamExplanation:
        "Teams can use barrel tendencies to identify where a hitter creates the most dangerous contact.",
    },
    deepFly: {
      title: "Deep Fly Ball",
      description:
        "The ball travels deep but may lose efficiency if too much velocity is sent upward instead of forward.",
      distance: 365,
      launchAngle: 38,
      sprayAngle: "Center 0°",
      x: 380,
      y: 175,
      arcHeight: 230,
      zoneRx: 44,
      zoneRy: 24,
      zoneLabel: "warning track zone",
      mathLabel: "high y(t), reduced horizontal carry",
      primaryIdea: "High vertical motion",
      primaryExplanation:
        "The ball gains height because the vertical component is large, but too much height can reduce carry efficiency.",
      fieldMeaning: "Deep outfield decision",
      fieldExplanation:
        "A deep fly forces outfielders to track the wall, but it may still become an out if distance is not enough.",
      teamInsight: "Wall and park factors",
      teamExplanation:
        "Teams can compare deep fly profiles with ballpark dimensions to estimate risk and value.",
    },
    popup: {
      title: "Pop Up",
      description:
        "A steep launch angle sends the ball upward, but the weak horizontal component limits distance and run value.",
      distance: 95,
      launchAngle: 55,
      sprayAngle: "Pull -8°",
      x: 335,
      y: 330,
      arcHeight: 260,
      zoneRx: 28,
      zoneRy: 16,
      zoneLabel: "pop up zone",
      mathLabel: "too much vertical direction reduces distance",
      primaryIdea: "Inefficient launch angle",
      primaryExplanation:
        "The velocity vector points too far upward, which increases height but weakens forward travel.",
      fieldMeaning: "Low run value contact",
      fieldExplanation:
        "The ball stays playable because it lacks enough horizontal velocity to threaten the outfield.",
      teamInsight: "Pitch execution clue",
      teamExplanation:
        "Pitchers can use pop-up tendencies to see which locations cause hitters to miss underneath the ball.",
    },
  };

  return profiles[type] || profiles.barrel;
}

/* =========================
   LEGACY HOME PREVIEW
========================= */

function setupHomePreviewSimulator() {
  const velocitySlider = document.getElementById("homeExitVelocity");
  const angleSlider = document.getElementById("homeLaunchAngle");

  if (!velocitySlider || !angleSlider) return;

  const velocityValue = document.getElementById("homeExitVelocityValue");
  const angleValue = document.getElementById("homeLaunchAngleValue");

  const distanceOutput = document.getElementById("homeDistanceOutput");
  const heightOutput = document.getElementById("homeHeightOutput");
  const contactOutput = document.getElementById("homeContactOutput");

  const arcPath = document.getElementById("homeArcPath");
  const ball = document.getElementById("homeBall");
  const apex = document.getElementById("homeApex");
  const label = document.getElementById("homePreviewLabel");

  function updatePreview() {
    const exitVelocity = Number(velocitySlider.value);
    const launchAngle = Number(angleSlider.value);

    const flight = calculateBaseballFlight(exitVelocity, launchAngle);
    const contact = classifyContact(exitVelocity, launchAngle, flight.distance);

    if (velocityValue) velocityValue.textContent = exitVelocity;
    if (angleValue) angleValue.textContent = launchAngle;

    if (distanceOutput) distanceOutput.textContent = `${flight.distance.toFixed(0)} ft`;
    if (heightOutput) heightOutput.textContent = `${flight.maxHeight.toFixed(0)} ft`;
    if (contactOutput) contactOutput.textContent = contact.label;

    updateHomeSvgVisual({
      flight,
      launchAngle,
      arcPath,
      ball,
      apex,
      label,
      contact,
    });
  }

  velocitySlider.addEventListener("input", updatePreview);
  angleSlider.addEventListener("input", updatePreview);

  updatePreview();
}

function updateHomeSvgVisual(options) {
  const { flight, launchAngle, arcPath, ball, apex, label, contact } = options;

  if (!arcPath || !ball || !apex) return;

  const graph = {
    left: 95,
    bottom: 335,
    width: 575,
    height: 265,
  };

  const maxDistanceForVisual = 450;
  const maxHeightForVisual = 130;

  const visualDistance = clamp(flight.distance, 40, maxDistanceForVisual);
  const visualHeight = clamp(flight.maxHeight, 8, maxHeightForVisual);

  const startX = graph.left;
  const startY = graph.bottom;

  const endX =
    graph.left + (visualDistance / maxDistanceForVisual) * graph.width;

  let endY = graph.bottom - clamp(launchAngle * 0.45, 0, 28);

  if (launchAngle < 8) endY = graph.bottom + 1;
  if (launchAngle > 45) endY = graph.bottom - 70;

  const apexX = startX + (endX - startX) * 0.52;
  const apexY =
    graph.bottom - (visualHeight / maxHeightForVisual) * graph.height;

  const control1X = startX + (apexX - startX) * 0.75;
  const control2X = apexX + (endX - apexX) * 0.75;

  arcPath.setAttribute(
    "d",
    `M${startX} ${startY} C${control1X} ${apexY}, ${control2X} ${apexY}, ${endX} ${endY}`
  );

  ball.setAttribute("cx", endX);
  ball.setAttribute("cy", endY);

  apex.setAttribute("cx", apexX);
  apex.setAttribute("cy", apexY);

  if (label) {
    label.textContent = contact.explanation;
  }
}

/* =========================
   CALCULUS MOTION LAB
========================= */

function setupCalculusEngine() {
  const velocitySlider = document.getElementById("engineVelocity");
  const angleSlider = document.getElementById("engineAngle");
  const timeInput = document.getElementById("engineTime");

  if (!velocitySlider || !angleSlider || !timeInput) return;

  const velocityValue = document.getElementById("engineVelocityValue");
  const angleValue = document.getElementById("engineAngleValue");
  const timeValue = document.getElementById("engineTimeValue");

  const phaseButtons = document.querySelectorAll(".engine-phase-btn");
  const runButton = document.getElementById("engineRunFlight");

  let selectedPhase = "contact";
  let isRunning = false;

  function updateEngine(options = {}) {
    const phaseOverride = options.phase || selectedPhase;
    selectedPhase = phaseOverride;

    const exitVelocity = Number(velocitySlider.value);
    const launchAngle = Number(angleSlider.value);

    const previewFlight = calculateBaseballFlight(exitVelocity, launchAngle, 0);
    const selectedTime = getTimeForEnginePhase(previewFlight, selectedPhase);

    timeInput.value = selectedTime;

    const flight = calculateBaseballFlight(
      exitVelocity,
      launchAngle,
      selectedTime
    );

    const contact = classifyContact(exitVelocity, launchAngle, flight.distance);
    const phase = getFlightPhaseFromKey(selectedPhase, flight);

    updateCalculusOutputs({
      exitVelocity,
      launchAngle,
      selectedTime,
      flight,
      contact,
      phase,
      velocityValue,
      angleValue,
      timeValue,
    });

    updateActiveEnginePhaseButton(selectedPhase);
    updateMotionPhaseUI(selectedPhase);

    updateEngineSvgVisual({
      flight,
      arcPath: document.getElementById("engineArcPath"),
      ball: document.getElementById("engineBall"),
      apexDot: document.getElementById("engineApexDot"),
      tangentLine: document.getElementById("engineTangentLine"),
      velocityVector: document.getElementById("engineVelocityVector"),
      velocityArrow: document.getElementById("engineVelocityArrow"),
      accelerationVector: document.getElementById("engineAccelerationVector"),
      accelerationArrow: document.getElementById("engineAccelerationArrow"),
      apexLabel: document.getElementById("engineApexLabel"),
      liveLabel: document.getElementById("engineLiveLabel"),
      activePhase: selectedPhase,
    });
  }

  velocitySlider.addEventListener("input", () => updateEngine());
  angleSlider.addEventListener("input", () => updateEngine());

  phaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (isRunning) return;

      const phase = button.dataset.enginePhase;
      updateEngine({ phase });
    });
  });

  if (runButton) {
    runButton.addEventListener("click", () => {
      if (isRunning) return;

      isRunning = true;
      runButton.textContent = "Running Simulation...";

      const sequence = ["contact", "rising", "apex", "falling", "landing"];
      let index = 0;

      updateEngine({ phase: sequence[index] });

      const interval = setInterval(() => {
        index += 1;

        if (index >= sequence.length) {
          clearInterval(interval);
          isRunning = false;
          runButton.textContent = "Run Flight Simulation";
          return;
        }

        updateEngine({ phase: sequence[index] });
      }, 700);
    });
  }

  updateEngine();
}

function updateCalculusOutputs(options) {
  const {
    exitVelocity,
    launchAngle,
    selectedTime,
    flight,
    contact,
    phase,
    velocityValue,
    angleValue,
    timeValue,
  } = options;

  if (velocityValue) velocityValue.textContent = exitVelocity;
  if (angleValue) angleValue.textContent = launchAngle;
  if (timeValue) timeValue.textContent = selectedTime.toFixed(2);

  setText("engineXOutput", `${roundNumber(flight.x, 1)} ft`);
  setText("engineYOutput", `${roundNumber(flight.y, 1)} ft`);
  setText("engineVXOutput", `${roundNumber(flight.vx, 1)} ft/s`);
  setText("engineVYOutput", `${roundNumber(flight.vy, 1)} ft/s`);
  setText("engineSpeedOutput", `${roundNumber(flight.speed, 1)} ft/s`);
  setText("engineAccelerationOutput", "<0, −32>");

  setText("engineDistanceOutput", `${flight.distance.toFixed(0)} ft`);
  setText("engineMaxHeightOutput", `${flight.maxHeight.toFixed(0)} ft`);
  setText("engineApexTimeOutput", `${flight.timeToApex.toFixed(2)} sec`);
  setText("engineFlightTimeOutput", `${flight.flightTime.toFixed(2)} sec`);

  setText("engineContactOutput", contact.label);
  setText("engineContactExplanation", contact.explanation);

  setText("enginePhaseOutput", phase.title);
  setText("enginePhaseExplanation", phase.explanation);

  const contactCard = document.querySelector(".contact-analysis-card");

  if (contactCard) {
    contactCard.classList.remove("elite-contact", "warning-contact", "weak-contact");
    contactCard.classList.add(contact.className);
  }
}

function getTimeForEnginePhase(flight, phase) {
  const apexTime = flight.timeToApex;
  const flightTime = flight.flightTime;

  if (phase === "contact") return 0;
  if (phase === "rising") return clamp(apexTime * 0.5, 0.2, flightTime);
  if (phase === "apex") return apexTime;
  if (phase === "falling") {
    return clamp(apexTime + (flightTime - apexTime) * 0.5, 0, flightTime);
  }
  if (phase === "landing") return flightTime;

  return 0;
}

function getFlightPhaseFromKey(phase, flight) {
  if (phase === "contact") {
    return {
      key: "contact",
      title: "Contact Point",
      explanation:
        "The ball has just left the bat. This is the starting position r(0), where the flight begins.",
    };
  }

  if (phase === "rising") {
    return {
      key: "rising",
      title: "Rising Phase",
      explanation:
        "The ball is climbing because vertical velocity is positive. In calculus language, y′(t) is greater than zero.",
    };
  }

  if (phase === "apex") {
    return {
      key: "apex",
      title: "Apex / Critical Point",
      explanation:
        `The ball is at maximum height. This happens at ${flight.timeToApex.toFixed(2)} seconds, where y′(t) = 0.`,
    };
  }

  if (phase === "falling") {
    return {
      key: "falling",
      title: "Falling Phase",
      explanation:
        "The ball is coming down because vertical velocity is negative. Gravity has changed the direction of vertical motion.",
    };
  }

  return {
    key: "landing",
    title: "Landing Phase",
    explanation:
      "The ball has completed its flight and returned to ground level.",
  };
}

function updateActiveEnginePhaseButton(activePhase) {
  const buttons = document.querySelectorAll(".engine-phase-btn");

  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.enginePhase === activePhase);
  });
}

function updateMotionPhaseUI(activePhase) {
  const timelineMap = {
    contact: document.getElementById("phaseContact"),
    rising: document.getElementById("phaseRising"),
    apex: document.getElementById("phaseApex"),
    falling: document.getElementById("phaseFalling"),
    landing: document.getElementById("phaseLanding"),
  };

  const dotMap = {
    contact: document.getElementById("engineContactDot") || document.querySelector(".phase-dot"),
    rising: document.getElementById("engineRiseDot"),
    apex: document.getElementById("engineApexDot"),
    falling: document.getElementById("engineFallDot"),
    landing: document.getElementById("engineLandDot"),
  };

  Object.values(timelineMap).forEach((step) => {
    if (step) step.classList.remove("active");
  });

  Object.values(dotMap).forEach((dot) => {
    if (dot) dot.classList.remove("active-phase-dot");
  });

  if (timelineMap[activePhase]) timelineMap[activePhase].classList.add("active");
  if (dotMap[activePhase]) dotMap[activePhase].classList.add("active-phase-dot");
}

function updateEngineSvgVisual(options) {
  const {
    flight,
    arcPath,
    ball,
    apexDot,
    tangentLine,
    velocityVector,
    velocityArrow,
    accelerationVector,
    accelerationArrow,
    apexLabel,
    liveLabel,
    activePhase,
  } = options;

  if (!arcPath || !ball) return;

  const graph = {
    left: 110,
    bottom: 425,
    width: 690,
    height: 345,
  };

  const maxX = Math.max(430, flight.distance * 1.08);
  const maxY = Math.max(135, flight.maxHeight * 1.18);

  function mapX(feet) {
    return graph.left + (feet / maxX) * graph.width;
  }

  function mapY(feet) {
    return graph.bottom - (feet / maxY) * graph.height;
  }

  const startX = mapX(0);
  const startY = mapY(flight.y0);

  const endX = mapX(flight.distance);
  const endY = mapY(0);

  const apexX = mapX(flight.apexX);
  const apexY = mapY(flight.maxHeight);

  const ballX = mapX(flight.x);
  const ballY = mapY(flight.y);

  const control1X = startX + (apexX - startX) * 0.78;
  const control2X = apexX + (endX - apexX) * 0.78;

  arcPath.setAttribute(
    "d",
    `M${startX} ${startY} C${control1X} ${apexY}, ${control2X} ${apexY}, ${endX} ${endY}`
  );

  ball.setAttribute("cx", ballX);
  ball.setAttribute("cy", ballY);

  if (apexDot) {
    apexDot.setAttribute("cx", apexX);
    apexDot.setAttribute("cy", apexY);
  }

  if (apexLabel) {
    apexLabel.setAttribute("x", clamp(apexX - 75, 130, 610));
    apexLabel.setAttribute("y", clamp(apexY - 25, 45, 190));
  }

  updateMotionStageDots({ flight, mapX, mapY });

  updateTangentLine({
    tangentLine,
    ballX,
    ballY,
    vx: flight.vx,
    vy: flight.vy,
    maxX,
    maxY,
    graph,
  });

  updateVelocityVector({
    velocityVector,
    velocityArrow,
    ballX,
    ballY,
    vx: flight.vx,
    vy: flight.vy,
  });

  updateAccelerationVector({
    accelerationVector,
    accelerationArrow,
    ballX,
    ballY,
  });

  if (liveLabel) {
    if (activePhase === "contact") {
      liveLabel.textContent = "contact: r(0) is the starting position of the ball";
    } else if (activePhase === "rising") {
      liveLabel.textContent = `r′(t) = <${flight.vx.toFixed(1)}, ${flight.vy.toFixed(1)}> rising`;
    } else if (activePhase === "apex") {
      liveLabel.textContent = "apex: y′(t) = 0, the ball changes from rising to falling";
    } else if (activePhase === "falling") {
      liveLabel.textContent = `r′(t) = <${flight.vx.toFixed(1)}, ${flight.vy.toFixed(1)}> falling`;
    } else {
      liveLabel.textContent = "landing: the ball has returned to ground level";
    }
  }
}

function updateMotionStageDots(options) {
  const { flight, mapX, mapY } = options;

  const contactDot = document.getElementById("engineContactDot");
  const riseDot = document.getElementById("engineRiseDot");
  const fallDot = document.getElementById("engineFallDot");
  const landDot = document.getElementById("engineLandDot");

  const riseTime = Math.max(0.25, flight.timeToApex * 0.5);
  const fallTime =
    flight.timeToApex + (flight.flightTime - flight.timeToApex) * 0.5;

  const riseX = flight.vx * riseTime;
  const riseY =
    flight.y0 +
    flight.vy0 * riseTime -
    0.5 * flight.gravity * riseTime * riseTime;

  const fallX = flight.vx * fallTime;
  const fallY =
    flight.y0 +
    flight.vy0 * fallTime -
    0.5 * flight.gravity * fallTime * fallTime;

  if (contactDot) {
    contactDot.setAttribute("cx", mapX(0));
    contactDot.setAttribute("cy", mapY(flight.y0));
  }

  if (riseDot) {
    riseDot.setAttribute("cx", mapX(riseX));
    riseDot.setAttribute("cy", mapY(Math.max(0, riseY)));
  }

  if (fallDot) {
    fallDot.setAttribute("cx", mapX(fallX));
    fallDot.setAttribute("cy", mapY(Math.max(0, fallY)));
  }

  if (landDot) {
    landDot.setAttribute("cx", mapX(flight.distance));
    landDot.setAttribute("cy", mapY(0));
  }
}

function updateTangentLine(options) {
  const { tangentLine, ballX, ballY, vx, vy, maxX, maxY, graph } = options;

  if (!tangentLine) return;

  const physicalDeltaX = maxX * 0.075;
  const slope = vx === 0 ? 0 : vy / vx;
  const physicalDeltaY = slope * physicalDeltaX;

  const screenDeltaX = (physicalDeltaX / maxX) * graph.width;
  const screenDeltaY = -(physicalDeltaY / maxY) * graph.height;

  tangentLine.setAttribute("x1", ballX - screenDeltaX);
  tangentLine.setAttribute("y1", ballY - screenDeltaY);
  tangentLine.setAttribute("x2", ballX + screenDeltaX);
  tangentLine.setAttribute("y2", ballY + screenDeltaY);
}

function updateVelocityVector(options) {
  const { velocityVector, velocityArrow, ballX, ballY, vx, vy } = options;

  if (!velocityVector || !velocityArrow) return;

  const angle = Math.atan2(-vy, vx);
  const vectorLength = 92;

  const endX = ballX + Math.cos(angle) * vectorLength;
  const endY = ballY + Math.sin(angle) * vectorLength;

  velocityVector.setAttribute("x1", ballX);
  velocityVector.setAttribute("y1", ballY);
  velocityVector.setAttribute("x2", endX);
  velocityVector.setAttribute("y2", endY);

  updateArrowHead(velocityArrow, ballX, ballY, endX, endY, 17);
}

function updateAccelerationVector(options) {
  const { accelerationVector, accelerationArrow, ballX, ballY } = options;

  if (!accelerationVector || !accelerationArrow) return;

  const endX = ballX;
  const endY = ballY + 88;

  accelerationVector.setAttribute("x1", ballX);
  accelerationVector.setAttribute("y1", ballY);
  accelerationVector.setAttribute("x2", endX);
  accelerationVector.setAttribute("y2", endY);

  updateArrowHead(accelerationArrow, ballX, ballY, endX, endY, 16);
}

/* =========================
   PITCH ARSENAL LAB
========================= */

function setupPitchingLab() {
  const velocitySlider = document.getElementById("pitchVelocity");
  const pitchTypeButtons = document.querySelectorAll(".pitch-type-btn");
  const pitchPhaseButtons = document.querySelectorAll(".pitch-phase-btn");

  if (!velocitySlider) return;

  const hasArsenalVersion =
    pitchTypeButtons.length > 0 && pitchPhaseButtons.length > 0;

  if (!hasArsenalVersion) {
    setupLegacyPitchingLab();
    return;
  }

  const state = {
    pitchType: "fastball",
    phase: "release",
  };

  pitchTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      pitchTypeButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      state.pitchType = button.dataset.pitchType;

      const profile = getPitchArsenalProfile(state.pitchType);
      velocitySlider.min = profile.minVelocity;
      velocitySlider.max = profile.maxVelocity;
      velocitySlider.value = profile.defaultVelocity;

      updatePitchArsenal(state);
    });
  });

  pitchPhaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      pitchPhaseButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      state.phase = button.dataset.pitchPhase;

      updatePitchArsenal(state);
    });
  });

  velocitySlider.addEventListener("input", () => {
    updatePitchArsenal(state);
  });

  const startingProfile = getPitchArsenalProfile(state.pitchType);
  velocitySlider.min = startingProfile.minVelocity;
  velocitySlider.max = startingProfile.maxVelocity;
  velocitySlider.value = startingProfile.defaultVelocity;

  updatePitchArsenal(state);
}

function getPitchArsenalProfile(type) {
  const profiles = {
    fastball: {
      name: "4-Seam Fastball",
      shortName: "4-Seam",
      defaultVelocity: 97,
      minVelocity: 90,
      maxVelocity: 102,
      break: 8,
      drop: 10,
      movementLabel: "Late ride",
      description:
        "A power pitch with high velocity, a strong tunnel look, and late ride.",
      plateBase: { x: 500, y: 232 },
      visualFocus: {
        release: "Initial velocity and tunnel entry.",
        tunnel: "The pitch stays close to the reference tunnel.",
        break: "Late ride keeps the pitch above expected drop.",
        plate: "The ball finishes high in the strike zone with a small reaction window.",
      },
    },
    slider: {
      name: "Slider",
      shortName: "SL",
      defaultVelocity: 86,
      minVelocity: 78,
      maxVelocity: 92,
      break: 20,
      drop: 24,
      movementLabel: "Glove-side sweep",
      description:
        "A breaking pitch that sweeps sideways and drops late, pulling the pitch away from the center tunnel.",
      plateBase: { x: 430, y: 315 },
      visualFocus: {
        release: "The slider can start from a fastball-like release window.",
        tunnel: "The hitter sees a similar early lane before separation.",
        break: "The pitch sweeps sideways and drops away from the reference path.",
        plate: "The final location is harder to square up because it moved off the expected tunnel.",
      },
    },
    curveball: {
      name: "Curveball",
      shortName: "CU",
      defaultVelocity: 79,
      minVelocity: 70,
      maxVelocity: 84,
      break: 12,
      drop: 38,
      movementLabel: "Heavy vertical break",
      description:
        "A slower breaking pitch with major downward movement that changes the hitter’s eye level.",
      plateBase: { x: 482, y: 360 },
      visualFocus: {
        release: "The pitch leaves the hand slower and starts higher in the visual lane.",
        tunnel: "The ball can stay readable early before the drop takes over.",
        break: "The curveball bends downward through the bottom of the zone.",
        plate: "The pitch finishes low because vertical movement dominates the path.",
      },
    },
    changeup: {
      name: "Changeup",
      shortName: "CH",
      defaultVelocity: 82,
      minVelocity: 74,
      maxVelocity: 88,
      break: 14,
      drop: 30,
      movementLabel: "Fade and drop",
      description:
        "An off-speed pitch designed to look like a fastball before arriving slower with fade and drop.",
      plateBase: { x: 535, y: 338 },
      visualFocus: {
        release: "The release can mimic a fastball.",
        tunnel: "The pitch sells speed before the hitter realizes it is slower.",
        break: "The ball fades arm-side and drops as it approaches the zone.",
        plate: "The hitter may swing early because the timing window changed.",
      },
    },
    sinker: {
      name: "Sinker",
      shortName: "SI",
      defaultVelocity: 94,
      minVelocity: 86,
      maxVelocity: 98,
      break: 16,
      drop: 28,
      movementLabel: "Arm-side sink",
      description:
        "A fast pitch with arm-side movement and downward action designed to miss barrels.",
      plateBase: { x: 540, y: 350 },
      visualFocus: {
        release: "The pitch starts with fastball-like speed.",
        tunnel: "The tunnel holds long enough to look firm.",
        break: "The ball sinks below the expected path.",
        plate: "The pitch finishes low with arm-side movement near the bottom of the zone.",
      },
    },
  };

  return profiles[type] || profiles.fastball;
}

function updatePitchArsenal(state) {
  const velocitySlider = document.getElementById("pitchVelocity");
  const velocity = Number(velocitySlider.value);
  const profile = getPitchArsenalProfile(state.pitchType);

  const fps = mphToFeetPerSecond(velocity);
  const timeToPlate = 60.5 / fps;

  const velocityModifier = velocity - profile.defaultVelocity;

  const adjustedBreak = Math.max(
    0,
    Math.round(profile.break + velocityModifier * 0.12)
  );

  const adjustedDrop = Math.max(
    0,
    Math.round(profile.drop - velocityModifier * 0.1)
  );

  const pressure = classifyPitchPressureAdvanced(velocity, timeToPlate);
  const phase = getPitchPhaseProfile(state.phase, profile, velocity, timeToPlate);
  const movement = classifyPitchMovementAdvanced(
    profile,
    adjustedBreak,
    adjustedDrop,
    velocity
  );

  setText("pitchVelocityValue", velocity);
  setText("pitchSpeedOutput", `${velocity} mph`);
  setText("pitchFpsOutput", `${fps.toFixed(1)} ft/s`);
  setText("pitchTimeOutput", `${timeToPlate.toFixed(2)} sec`);
  setText("pitchReactionOutput", pressure.reaction);
  setText("pitchReactionBigOutput", pressure.bigLabel);
  setText("pitchReactionDescription", pressure.description);

  setText("pitchTypeOutput", profile.name);
  setText("pitchTypeDescription", profile.description);

  setText("pitchPhaseReadout", phase.title);
  setText("pitchPhaseMeaningTitle", phase.title);
  setText("pitchPhaseMeaningText", phase.meaning);

  setTextAll("pitchMovementOutput", movement.label);
  setText("pitchMovementCardOutput", movement.label);
  setText("pitchMovementExplanation", movement.explanation);

  setText("pitchBreakOutput", `${adjustedBreak} in`);
  setText("pitchDropOutput", `${adjustedDrop} in`);

  setTextAll("pitchPressureOutput", pressure.label);
  setTextAll("pitchPressureExplanation", pressure.explanation);

  setText("pitchCalculusHeadline", phase.calculusHeadline);
  setText("pitchCalculusText", phase.calculusText);

  updatePitchPhaseButtons(state.phase);
  updatePitchTimeline(state.phase);

  updatePitchVisual({
    pitchType: state.pitchType,
    phase: state.phase,
    profile,
    velocity,
    breakAmount: adjustedBreak,
    dropAmount: adjustedDrop,
    fps,
    timeToPlate,
  });
}

function classifyPitchPressureAdvanced(velocity, timeToPlate) {
  if (velocity >= 98 || timeToPlate < 0.42) {
    return {
      label: "Extreme pressure",
      reaction: "Tiny window",
      bigLabel: "Tiny decision window",
      description:
        "This pitch reaches the zone extremely quickly, forcing recognition and swing decisions almost immediately.",
      explanation:
        "The hitter has a very small time interval because the pitch position changes rapidly.",
    };
  }

  if (velocity >= 93 || timeToPlate < 0.46) {
    return {
      label: "High pressure",
      reaction: "Very short",
      bigLabel: "Less than half a second",
      description:
        "The pitch reaches the plate in under half a second, shrinking the hitter’s reaction window.",
      explanation:
        "The velocity derivative is large, so the pitch covers 60.5 feet quickly.",
    };
  }

  if (velocity >= 84 || timeToPlate < 0.51) {
    return {
      label: "Moderate pressure",
      reaction: "Short",
      bigLabel: "Short reaction window",
      description:
        "The hitter has slightly more time, but the pitch still requires quick recognition.",
      explanation:
        "The pitch is slower than elite velocity, but still fast enough to pressure timing.",
    };
  }

  return {
    label: "Timing deception",
    reaction: "More readable",
    bigLabel: "More time, more deception",
    description:
      "The pitch is slower, but movement and speed difference can still disrupt the hitter.",
    explanation:
      "Lower speed increases time, but a deceptive movement path can still defeat timing.",
  };
}

function classifyPitchMovementAdvanced(profile, breakAmount, dropAmount, velocity) {
  const movementScore = breakAmount + dropAmount * 0.7;

  if (profile.name === "4-Seam Fastball" && velocity >= 96) {
    return {
      label: profile.movementLabel,
      explanation:
        "The pitch works through velocity and ride. It stays firm through the tunnel and finishes higher than expected.",
    };
  }

  if (movementScore >= 42) {
    return {
      label: "Heavy late movement",
      explanation:
        "The pitch has major break and drop, so the final path moves far away from the hitter’s early expectation.",
    };
  }

  if (movementScore >= 30) {
    return {
      label: profile.movementLabel,
      explanation:
        "The pitch has strong enough movement to change the expected path before reaching the zone.",
    };
  }

  if (movementScore >= 18) {
    return {
      label: "Moderate movement",
      explanation:
        "The pitch moves enough to matter, but velocity and location remain important.",
    };
  }

  return {
    label: "Straight tunnel",
    explanation:
      "The pitch stays closer to the reference path, so speed and location carry more of the value.",
  };
}

function getPitchPhaseProfile(phase, profile, velocity, timeToPlate) {
  const phaseNames = {
    release: "Release",
    tunnel: "Tunnel",
    break: "Break",
    plate: "Plate",
  };

  const focus = profile.visualFocus[phase];

  if (phase === "release") {
    return {
      title: phaseNames[phase],
      meaning:
        "At release, the main idea is initial velocity and direction. This is the start of s(t).",
      calculusHeadline: "Pitching starts with initial position",
      calculusText:
        `The ${profile.name.toLowerCase()} begins at s(0). Its initial speed is ${velocity} mph, which determines how quickly position begins changing.`,
      visualFocus: focus,
    };
  }

  if (phase === "tunnel") {
    return {
      title: phaseNames[phase],
      meaning:
        "In the tunnel phase, different pitches can look similar before their movement separates.",
      calculusHeadline: "The tunnel hides the future path",
      calculusText:
        "Early in the pitch, s(t) can stay close to the reference path. The hitter must decide before the full movement is obvious.",
      visualFocus: focus,
    };
  }

  if (phase === "break") {
    return {
      title: phaseNames[phase],
      meaning:
        "In the break phase, horizontal and vertical movement create separation from the expected path.",
      calculusHeadline: "Movement changes the expected position",
      calculusText:
        "Break and drop shift the pitch away from a straight tunnel. The path of s(t) bends before reaching the zone.",
      visualFocus: focus,
    };
  }

  return {
    title: phaseNames[phase],
    meaning:
      `At the plate, the hitter’s decision window is about ${timeToPlate.toFixed(2)} seconds.`,
    calculusHeadline: "The final pitch location arrives fast",
    calculusText:
      `The pitch reaches the plate in ${timeToPlate.toFixed(2)} seconds. Since t = distance ÷ velocity, more speed means less time to react.`,
    visualFocus: focus,
  };
}

function updatePitchPhaseButtons(activePhase) {
  const buttons = document.querySelectorAll(".pitch-phase-btn");

  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.pitchPhase === activePhase);
  });

  const phaseOrder = ["release", "tunnel", "break", "plate"];
  const phaseLabels = {
    release: "Release",
    tunnel: "Tunnel",
    break: "Break",
    plate: "Plate",
  };

  const activeIndex = phaseOrder.indexOf(activePhase);
  const topTabs = document.querySelectorAll(".pitch-arsenal-main .broadcast-tabs span");

  topTabs.forEach((tab, index) => {
    tab.classList.toggle("active", index === activeIndex);
  });

  const topTitle = document.querySelector(".pitch-arsenal-main .broadcast-topline p");

  if (topTitle && phaseLabels[activePhase]) {
    topTitle.textContent = `${phaseLabels[activePhase]} Tracker`;
  }
}

function updatePitchTimeline(activePhase) {
  const timelineMap = {
    release: document.getElementById("pitchTimelineRelease"),
    tunnel: document.getElementById("pitchTimelineTunnel"),
    break: document.getElementById("pitchTimelineBreak"),
    plate: document.getElementById("pitchTimelinePlate"),
  };

  Object.values(timelineMap).forEach((step) => {
    if (step) step.classList.remove("active");
  });

  if (timelineMap[activePhase]) {
    timelineMap[activePhase].classList.add("active");
  }
}

function updatePitchVisual(options) {
  const {
    pitchType,
    phase,
    profile,
    velocity,
    breakAmount,
    dropAmount,
    fps,
    timeToPlate,
  } = options;

  const pitchPath = document.getElementById("pitchPath");
  const referencePath = document.getElementById("pitchReferencePath");
  const pitchBall = document.getElementById("pitchBall");
  const velocityVector = document.getElementById("pitchVelocityVector");
  const velocityArrow = document.getElementById("pitchVelocityArrow");
  const liveLabel = document.getElementById("pitchLiveLabel");
  const focusLabel = document.getElementById("pitchVisualFocusLabel");

  const releaseDot = document.getElementById("pitchReleaseDot");
  const tunnelDot = document.getElementById("pitchTunnelDot");
  const breakDot = document.getElementById("pitchBreakDot");
  const plateDot = document.getElementById("pitchPlateDot");

  if (!pitchPath || !pitchBall) return;

  const points = getStrikeZonePitchPoints({
    pitchType,
    profile,
    breakAmount,
    dropAmount,
    velocity,
  });

  const path = `
    M${points.release.x} ${points.release.y}
    C${points.control1.x} ${points.control1.y},
     ${points.control2.x} ${points.control2.y},
     ${points.plate.x} ${points.plate.y}
  `;

  const reference = "M490 105 C490 185, 490 300, 490 470";

  pitchPath.setAttribute("d", path.trim());

  if (referencePath) {
    referencePath.setAttribute("d", reference);
  }

  const phasePoint = getPitchPhasePoint({
    phase,
    start: points.release,
    tunnel: points.tunnel,
    breakPoint: points.breakPoint,
    plate: points.plate,
  });

  pitchBall.setAttribute("cx", phasePoint.x);
  pitchBall.setAttribute("cy", phasePoint.y);

  if (releaseDot) {
    releaseDot.setAttribute("cx", points.release.x);
    releaseDot.setAttribute("cy", points.release.y);
  }

  if (tunnelDot) {
    tunnelDot.setAttribute("cx", points.tunnel.x);
    tunnelDot.setAttribute("cy", points.tunnel.y);
  }

  if (breakDot) {
    breakDot.setAttribute("cx", points.breakPoint.x);
    breakDot.setAttribute("cy", points.breakPoint.y);
  }

  if (plateDot) {
    plateDot.setAttribute("cx", points.plate.x);
    plateDot.setAttribute("cy", points.plate.y);
  }

  updatePitchPhaseDots(phase);

  const vectorEnd = getStrikeZonePitchVectorEnd({
    point: phasePoint,
    phase,
    points,
  });

  if (velocityVector) {
    velocityVector.setAttribute("x1", phasePoint.x);
    velocityVector.setAttribute("y1", phasePoint.y);
    velocityVector.setAttribute("x2", vectorEnd.x);
    velocityVector.setAttribute("y2", vectorEnd.y);
  }

  updateArrowHead(
    velocityArrow,
    phasePoint.x,
    phasePoint.y,
    vectorEnd.x,
    vectorEnd.y,
    17
  );

  if (liveLabel) {
    liveLabel.textContent = `${profile.name} | ${velocity} mph | ${fps.toFixed(1)} ft/s | ${phase.toUpperCase()}`;
  }

  if (focusLabel) {
    focusLabel.textContent = `Focus: ${profile.visualFocus[phase]} Reaction time ≈ ${timeToPlate.toFixed(2)} sec`;
  }
}

function getStrikeZonePitchPoints(options) {
  const { pitchType, profile, breakAmount, dropAmount, velocity } = options;

  const release = { x: 490, y: 105 };
  const tunnel = { x: 490, y: 205 };

  const velocityModifier = velocity - profile.defaultVelocity;

  const breakDirection = getPitchBreakDirection(pitchType);
  const dropDirection = getPitchDropDirection(pitchType);

  let plateX =
    profile.plateBase.x +
    breakDirection * breakAmount * 0.42 +
    velocityModifier * 0.08;

  let plateY =
    profile.plateBase.y +
    dropDirection * dropAmount * 0.38 -
    velocityModifier * 0.04;

  plateX = clamp(plateX, 410, 570);
  plateY = clamp(plateY, 190, 375);

  const breakPoint = {
    x: tunnel.x + (plateX - tunnel.x) * 0.56,
    y: tunnel.y + (plateY - tunnel.y) * 0.58,
  };

  const control1 = {
    x: release.x + (tunnel.x - release.x) * 0.75,
    y: release.y + 75,
  };

  const control2 = {
    x: breakPoint.x + (plateX - breakPoint.x) * 0.55,
    y: breakPoint.y + (plateY - breakPoint.y) * 0.45,
  };

  return {
    release,
    tunnel,
    breakPoint,
    plate: { x: plateX, y: plateY },
    control1,
    control2,
  };
}

function getPitchBreakDirection(pitchType) {
  if (pitchType === "slider" || pitchType === "curveball") return -1;
  if (pitchType === "changeup" || pitchType === "sinker") return 1;
  return 0.1;
}

function getPitchDropDirection(pitchType) {
  if (pitchType === "fastball") return -0.25;
  if (pitchType === "curveball") return 0.7;
  if (pitchType === "slider") return 0.45;
  if (pitchType === "changeup") return 0.5;
  if (pitchType === "sinker") return 0.58;
  return 0.5;
}

function getPitchPhasePoint(points) {
  const { phase, start, tunnel, breakPoint, plate } = points;

  if (phase === "release") return start;
  if (phase === "tunnel") return tunnel;
  if (phase === "break") return breakPoint;
  return plate;
}

function updatePitchPhaseDots(activePhase) {
  const dotMap = {
    release: document.getElementById("pitchReleaseDot"),
    tunnel: document.getElementById("pitchTunnelDot"),
    break: document.getElementById("pitchBreakDot"),
    plate: document.getElementById("pitchPlateDot"),
  };

  Object.values(dotMap).forEach((dot) => {
    if (dot) dot.classList.remove("active-phase-dot");
  });

  if (dotMap[activePhase]) {
    dotMap[activePhase].classList.add("active-phase-dot");
  }
}

function getStrikeZonePitchVectorEnd(options) {
  const { point, phase, points } = options;

  let target = points.tunnel;

  if (phase === "release") target = points.tunnel;
  if (phase === "tunnel") target = points.breakPoint;
  if (phase === "break") target = points.plate;
  if (phase === "plate") {
    target = {
      x: point.x + (point.x - points.breakPoint.x),
      y: point.y + (point.y - points.breakPoint.y),
    };
  }

  const dx = target.x - point.x;
  const dy = target.y - point.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const vectorLength = 82;

  return {
    x: point.x + (dx / length) * vectorLength,
    y: point.y + (dy / length) * vectorLength,
  };
}

/* =========================
   LEGACY PITCHING FALLBACK
========================= */

function setupLegacyPitchingLab() {
  const velocitySlider = document.getElementById("pitchVelocity");
  const breakSlider = document.getElementById("pitchBreak");
  const dropSlider = document.getElementById("pitchDrop");

  if (!velocitySlider || !breakSlider || !dropSlider) return;

  const velocityValue = document.getElementById("pitchVelocityValue");
  const breakValue = document.getElementById("pitchBreakValue");
  const dropValue = document.getElementById("pitchDropValue");

  function updatePitchingLab() {
    const mph = Number(velocitySlider.value);
    const horizontalBreak = Number(breakSlider.value);
    const verticalDrop = Number(dropSlider.value);

    const feetPerSecond = mphToFeetPerSecond(mph);
    const distanceToPlate = 60.5;
    const timeToPlate = distanceToPlate / feetPerSecond;

    const movementProfile = classifyPitchMovement(horizontalBreak, verticalDrop);
    const pressureProfile = classifyPitchPressure(mph, timeToPlate);
    const pitchProfile = classifyPitchProfile(mph, horizontalBreak, verticalDrop);

    if (velocityValue) velocityValue.textContent = mph;
    if (breakValue) breakValue.textContent = horizontalBreak;
    if (dropValue) dropValue.textContent = verticalDrop;

    setText("pitchFpsOutput", `${feetPerSecond.toFixed(1)} ft/s`);
    setText("pitchTimeOutput", `${timeToPlate.toFixed(2)} sec`);
    setText("pitchReactionOutput", pressureProfile.reaction);
    setText("pitchProfileOutput", pitchProfile);

    setText("pitchConversionOutput", `${feetPerSecond.toFixed(1)} ft/s`);
    setText("pitchMovementOutput", movementProfile.label);
    setText("pitchMovementExplanation", movementProfile.explanation);

    setText("pitchPressureOutput", pressureProfile.label);
    setText("pitchPressureExplanation", pressureProfile.explanation);

    const pressureCard = document.querySelector(".contact-analysis-card");

    if (pressureCard) {
      pressureCard.classList.remove("elite-contact", "warning-contact", "weak-contact");
      pressureCard.classList.add(pressureProfile.className);
    }

    updatePitchSvgVisual({
      mph,
      horizontalBreak,
      verticalDrop,
      feetPerSecond,
      timeToPlate,
      pitchPath: document.getElementById("pitchPath"),
      pitchBall: document.getElementById("pitchBall"),
      velocityVector: document.getElementById("pitchVelocityVector"),
      velocityArrow: document.getElementById("pitchVelocityArrow"),
      liveLabel: document.getElementById("pitchLiveLabel"),
    });
  }

  velocitySlider.addEventListener("input", updatePitchingLab);
  breakSlider.addEventListener("input", updatePitchingLab);
  dropSlider.addEventListener("input", updatePitchingLab);

  updatePitchingLab();
}

function classifyPitchMovement(horizontalBreak, verticalDrop) {
  const movementScore = horizontalBreak + verticalDrop * 0.55;

  if (movementScore >= 34) {
    return {
      label: "Heavy movement",
      explanation:
        "The pitch has strong combined break and drop, creating a difficult moving target.",
    };
  }

  if (movementScore >= 22) {
    return {
      label: "Sharp movement",
      explanation:
        "The pitch changes path enough to pressure the hitter’s timing and location prediction.",
    };
  }

  if (movementScore >= 12) {
    return {
      label: "Moderate movement",
      explanation:
        "The pitch has visible movement, but the path is still relatively readable.",
    };
  }

  return {
    label: "Mostly straight",
    explanation:
      "The pitch path stays closer to a straight line, making location easier to track.",
  };
}

function classifyPitchPressure(mph, timeToPlate) {
  if (mph >= 99 || timeToPlate < 0.42) {
    return {
      label: "Extreme pressure",
      reaction: "Tiny window",
      className: "elite-contact",
      explanation:
        "The hitter has a very short reaction window because the pitch reaches the plate extremely quickly.",
    };
  }

  if (mph >= 94 || timeToPlate < 0.45) {
    return {
      label: "High pressure",
      reaction: "Very short",
      className: "elite-contact",
      explanation:
        "The pitch gives the hitter less than half a second to recognize, decide, and swing.",
    };
  }

  if (mph >= 86 || timeToPlate < 0.49) {
    return {
      label: "Moderate pressure",
      reaction: "Short",
      className: "warning-contact",
      explanation:
        "The pitch is still quick, but the hitter has slightly more time to process the ball.",
    };
  }

  return {
    label: "Lower pressure",
    reaction: "More readable",
    className: "weak-contact",
    explanation:
      "The reaction window is longer compared with higher velocity pitches.",
  };
}

function classifyPitchProfile(mph, horizontalBreak, verticalDrop) {
  const movementTotal = horizontalBreak + verticalDrop;

  if (mph >= 97 && movementTotal >= 35) return "Power breaking pitch";
  if (mph >= 95 && movementTotal < 22) return "High-velocity fastball";
  if (horizontalBreak >= 16 && verticalDrop >= 20) return "Sweeping movement pitch";
  if (verticalDrop >= 30) return "Heavy drop profile";
  if (mph < 85 && movementTotal >= 30) return "Off-speed movement pitch";

  return "Balanced pitch profile";
}

function updatePitchSvgVisual(options) {
  const {
    mph,
    horizontalBreak,
    verticalDrop,
    feetPerSecond,
    timeToPlate,
    pitchPath,
    pitchBall,
    velocityVector,
    velocityArrow,
    liveLabel,
  } = options;

  if (!pitchPath || !pitchBall) return;

  const startX = 130;
  const startY = 265;

  const endX = 760;
  const endY = 265 + verticalDrop * 1.15 - 20;

  const breakDirection = horizontalBreak * 2.5;
  const speedLift = clamp((mph - 70) * 1.1, 0, 45);

  const control1X = 310;
  const control1Y = 230 - speedLift * 0.45;

  const control2X = 540;
  const control2Y = 230 + verticalDrop * 0.55 + breakDirection * 0.15;

  const ballX = 610;
  const progress = (ballX - startX) / (endX - startX);

  const ballY =
    startY +
    (endY - startY) * progress +
    Math.sin(progress * Math.PI) * (verticalDrop * 0.25 - speedLift * 0.3);

  pitchPath.setAttribute(
    "d",
    `M${startX} ${startY} C${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`
  );

  pitchBall.setAttribute("cx", ballX);
  pitchBall.setAttribute("cy", ballY);

  const vectorEndX = ballX + 105;
  const vectorEndY = ballY + (endY - startY) * 0.18;

  if (velocityVector) {
    velocityVector.setAttribute("x1", ballX);
    velocityVector.setAttribute("y1", ballY);
    velocityVector.setAttribute("x2", vectorEndX);
    velocityVector.setAttribute("y2", vectorEndY);
  }

  updateArrowHead(velocityArrow, ballX, ballY, vectorEndX, vectorEndY, 17);

  if (liveLabel) {
    liveLabel.textContent = `s′(t) ≈ ${feetPerSecond.toFixed(1)} ft/s, time ≈ ${timeToPlate.toFixed(2)} sec`;
  }
}
/* =========================
   HITTING LAB
========================= */

function setupHittingLab() {
  const velocitySlider = document.getElementById("hitExitVelocity");
  const angleSlider = document.getElementById("hitLaunchAngle");
  const timeSlider = document.getElementById("hitTime");
  const spraySlider = document.getElementById("hitSprayAngle");

  if (!velocitySlider || !angleSlider || !timeSlider) return;

  const state = {
    phase: "contact",
    pitcherHand: "right",
    batterHand: "right",
    pitchType: "fastball",
    pitchLocation: "middle",
    timing: "perfect",
    quality: "barrel",
  };

  document.querySelectorAll("[data-hit-pitcher-hand]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-hit-pitcher-hand]").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.pitcherHand = button.dataset.hitPitcherHand;

      applySimulationDefaults(state, velocitySlider, angleSlider);
      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  document.querySelectorAll("[data-hit-hand]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-hit-hand]").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.batterHand = button.dataset.hitHand;

      applySimulationDefaults(state, velocitySlider, angleSlider);
      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  document.querySelectorAll("[data-hit-pitch]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-hit-pitch]").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.pitchType = button.dataset.hitPitch;

      applySimulationDefaults(state, velocitySlider, angleSlider);
      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  document.querySelectorAll("[data-hit-location]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-hit-location]").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.pitchLocation = button.dataset.hitLocation;

      applySimulationDefaults(state, velocitySlider, angleSlider);
      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  document.querySelectorAll("[data-hit-timing]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-hit-timing]").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.timing = button.dataset.hitTiming;

      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  document.querySelectorAll("[data-hit-quality]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-hit-quality]").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.quality = button.dataset.hitQuality;

      applySimulationDefaults(state, velocitySlider, angleSlider);
      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  document.querySelectorAll(".hit-phase-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".hit-phase-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      state.phase = button.dataset.hitPhase;

      resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
      updateHittingLab(state);
    });
  });

  velocitySlider.addEventListener("input", () => {
    resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
    updateHittingLab(state);
  });

  angleSlider.addEventListener("input", () => {
    resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
    updateHittingLab(state);
  });

  timeSlider.addEventListener("input", () => {
    state.phase = getHitPhaseFromTime(
      Number(timeSlider.value),
      calculateBaseballFlight(
        Number(velocitySlider.value),
        Number(angleSlider.value),
        0
      )
    );

    updateHittingLab(state);
  });

  if (spraySlider) {
    spraySlider.addEventListener("input", () => {
      updateHittingLab(state);
    });
  }

  applySimulationDefaults(state, velocitySlider, angleSlider);
  resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state);
  updateHittingLab(state);
}

function applySimulationDefaults(state, velocitySlider, angleSlider) {
  const qualityDefaults = {
    jammed: {
      exitVelocity: 78,
      launchAngle: 9,
    },
    solid: {
      exitVelocity: 94,
      launchAngle: 18,
    },
    barrel: {
      exitVelocity: 101,
      launchAngle: 27,
    },
  };

  const pitchAdjustments = getPitchContactAdjustment(state.pitchType);
  const locationAdjustments = getLocationContactAdjustment(state.pitchLocation);
  const matchupAdjustments = getMatchupContactAdjustment(state);

  const base = qualityDefaults[state.quality] || qualityDefaults.barrel;

  const adjustedEV = clamp(
    base.exitVelocity +
      pitchAdjustments.ev +
      locationAdjustments.ev +
      matchupAdjustments.ev,
    55,
    116
  );

  const adjustedLA = clamp(
    base.launchAngle +
      pitchAdjustments.launch +
      locationAdjustments.launch +
      matchupAdjustments.launch,
    0,
    55
  );

  velocitySlider.value = Math.round(adjustedEV);
  angleSlider.value = Math.round(adjustedLA);
}

function getPitchContactAdjustment(pitchType) {
  const adjustments = {
    fastball: {
      ev: 3,
      launch: 0,
      spray: 0,
      label: "Fastball",
      description:
        "A fastball gives the hitter more speed to work with, but timing has to be precise.",
    },
    slider: {
      ev: -3,
      launch: -1,
      spray: 7,
      label: "Slider",
      description:
        "A slider can pull the bat off the ideal path and push contact away from the clean center lane.",
    },
    curveball: {
      ev: -4,
      launch: 4,
      spray: 3,
      label: "Curveball",
      description:
        "A curveball changes eye level and can create higher contact if the hitter gets under it.",
    },
    changeup: {
      ev: -5,
      launch: 2,
      spray: 9,
      label: "Changeup",
      description:
        "A changeup disrupts timing and can pull the hitter off the strongest contact point.",
    },
    sinker: {
      ev: -2,
      launch: -5,
      spray: -2,
      label: "Sinker",
      description:
        "A sinker creates downward contact and can turn solid contact into a ground-ball lane.",
    },
  };

  return adjustments[pitchType] || adjustments.fastball;
}

function getLocationContactAdjustment(location) {
  const adjustments = {
    inside: {
      ev: 1,
      launch: 1,
      spray: -12,
      label: "Inside",
      description:
        "Inside pitches are easier to pull but can jam the hitter if contact is not clean.",
    },
    middle: {
      ev: 2,
      launch: 0,
      spray: 0,
      label: "Middle",
      description:
        "Middle pitches give the hitter the cleanest path to center-field or barrel contact.",
    },
    outside: {
      ev: -1,
      launch: 0,
      spray: 14,
      label: "Outside",
      description:
        "Outside pitches naturally push contact toward the opposite field.",
    },
    high: {
      ev: 0,
      launch: 6,
      spray: 0,
      label: "High",
      description:
        "High pitches can create lifted contact, but too much height can become a flyout or pop-up.",
    },
    low: {
      ev: -1,
      launch: -7,
      spray: 0,
      label: "Low",
      description:
        "Low pitches create lower launch angles and more ground-ball or line-drive contact.",
    },
  };

  return adjustments[location] || adjustments.middle;
}

function getMatchupContactAdjustment(state) {
  const sameSide = state.pitcherHand === state.batterHand;
  const breakingPitch =
    state.pitchType === "slider" || state.pitchType === "curveball";

  const fadingPitch =
    state.pitchType === "changeup" || state.pitchType === "sinker";

  let ev = 0;
  let launch = 0;
  let spray = 0;
  let label = sameSide ? "Same-side matchup" : "Opposite-side matchup";
  let description = "";

  if (sameSide) {
    ev -= 2;
    spray += breakingPitch ? 8 : 2;
    description =
      "Same-side matchups make breaking balls more difficult because the pitch can move away from the barrel path.";
  } else {
    ev += state.pitchType === "fastball" ? 1 : 0;
    spray += fadingPitch ? 6 : -2;
    description =
      "Opposite-side matchups change the movement angle, especially on changeups and sinkers.";
  }

  if (state.pitchType === "slider" && sameSide) {
    launch -= 1;
  }

  if (state.pitchType === "changeup" && !sameSide) {
    launch += 1;
  }

  return {
    ev,
    launch,
    spray,
    label,
    description,
    sameSide,
  };
}

function resetHitTimeToPhase(velocitySlider, angleSlider, timeSlider, state) {
  const exitVelocity = Number(velocitySlider.value);
  const launchAngle = Number(angleSlider.value);
  const previewFlight = calculateBaseballFlight(exitVelocity, launchAngle, 0);

  timeSlider.value = getTimeForHitPhase(previewFlight, state.phase);
}

function updateHittingLab(state = {
  phase: "contact",
  pitcherHand: "right",
  batterHand: "right",
  pitchType: "fastball",
  pitchLocation: "middle",
  timing: "perfect",
  quality: "barrel",
}) {
  const velocitySlider = document.getElementById("hitExitVelocity");
  const angleSlider = document.getElementById("hitLaunchAngle");
  const timeSlider = document.getElementById("hitTime");
  const spraySlider = document.getElementById("hitSprayAngle");

  if (!velocitySlider || !angleSlider || !timeSlider) return;

  const pitchInfo = getPitchContactAdjustment(state.pitchType);
  const locationInfo = getLocationContactAdjustment(state.pitchLocation);
  const matchupInfo = getMatchupContactAdjustment(state);

  const exitVelocity = Number(velocitySlider.value);
  const launchAngle = Number(angleSlider.value);
  const selectedTime = Number(timeSlider.value);

  const sprayAngle = calculateSprayAngleFromSimulation(state);

  if (spraySlider) {
    spraySlider.value = sprayAngle;
  }

  const flight = calculateBaseballFlight(exitVelocity, launchAngle, selectedTime);
  const contact = classifyContact(exitVelocity, launchAngle, flight.distance);
  const optimization = classifyHitOptimization(
    exitVelocity,
    launchAngle,
    flight.distance,
    state
  );
  const phaseProfile = getHitPhaseProfile(state.phase, flight);
  const fieldZone = classifySprayFieldZone(
    sprayAngle,
    flight.distance,
    launchAngle,
    state
  );

  setText("hitExitVelocityValue", exitVelocity);
  setText("hitLaunchAngleValue", launchAngle);
  setText("hitTimeValue", selectedTime.toFixed(1));
  setText("hitSprayAngleValue", sprayAngle);

  setText("hitPitcherHandOutput", state.pitcherHand === "right" ? "RHP" : "LHP");
  setText("hitBatterHandOutput", state.batterHand === "right" ? "RHB" : "LHB");
  setText("hitPitchTypeOutput", pitchInfo.label);
  setText("hitPitchLocationOutput", locationInfo.label);
  setText("hitTimingOutput", getTimingLabel(state.timing));
  setText("hitQualityOutput", getQualityLabel(state.quality));

  setText(
    "hitMatchupInfluenceLabel",
    `${getPitcherLabelFromHand(state.pitcherHand)} vs ${getBatterLabelFromHand(state.batterHand)}`
  );

  setText(
    "hitPitchInfluenceLabel",
    `${pitchInfo.label} ${locationInfo.label.toLowerCase()}`
  );

  setText("hitDistanceOutput", `${flight.distance.toFixed(0)} ft`);
  setText("hitMaxHeightOutput", `${flight.maxHeight.toFixed(0)} ft`);
  setText("hitHangTimeOutput", `${flight.flightTime.toFixed(2)} sec`);

  setText(
    "hitContactProfileOutput",
    `${getPitcherLabelFromHand(state.pitcherHand)} vs ${getBatterLabelFromHand(state.batterHand)} | ${pitchInfo.label} ${locationInfo.label} | ${contact.label}`
  );

  setText("hitVXOutput", `${flight.vx.toFixed(1)} ft/s`);
  setText("hitVYOutput", `${flight.vy.toFixed(1)} ft/s`);
  setText("hitApexTimeOutput", `${flight.timeToApex.toFixed(2)} sec`);

  setText("hitLaunchWindowOutput", fieldZone.shortLabel);
  setText("hitLaunchWindowOutputLabel", fieldZone.label);
  setText("hitLaunchWindowExplanation", fieldZone.explanation);

  setText("hitOptimizationOutput", optimization.label);
  setText("hitOptimizationBigOutput", optimization.bigLabel);
  setText("hitContactExplanation", optimization.explanation);

  setText("hitSimulationSummary", buildHitSimulationSummary(state, fieldZone, matchupInfo));

  updateHitSideLabels(state);
  updateHitPhaseButtons(state.phase);
  updateHitTopTabs(state.phase);

  const contactCard = document.querySelector(".hitting-results-panel .contact-analysis-card");

  if (contactCard) {
    contactCard.classList.remove("elite-contact", "warning-contact", "weak-contact");
    contactCard.classList.add(optimization.className);
  }

  updateHitSprayChartVisual({
    flight,
    sprayAngle,
    phase: state.phase,
    phaseProfile,
    arcPath: document.getElementById("hitArcPath"),
    ball: document.getElementById("hitBall"),
    landingDot: document.getElementById("hitApexDot"),
    tangentLine: document.getElementById("hitTangentLine"),
    velocityVector: document.getElementById("hitVelocityVector"),
    velocityArrow: document.getElementById("hitVelocityArrow"),
    liveLabel: document.getElementById("hitLiveLabel"),
  });
}

function calculateSprayAngleFromSimulation(state) {
  const pitchInfo = getPitchContactAdjustment(state.pitchType);
  const locationInfo = getLocationContactAdjustment(state.pitchLocation);
  const matchupInfo = getMatchupContactAdjustment(state);

  let sprayAngle = 0;

  if (state.timing === "early") sprayAngle -= 20;
  if (state.timing === "perfect") sprayAngle += 0;
  if (state.timing === "late") sprayAngle += 20;

  sprayAngle += pitchInfo.spray;
  sprayAngle += locationInfo.spray;
  sprayAngle += matchupInfo.spray;

  if (state.quality === "jammed") sprayAngle *= 0.7;
  if (state.quality === "solid") sprayAngle *= 0.9;
  if (state.quality === "barrel") sprayAngle *= 1.05;

  if (state.batterHand === "left") {
    sprayAngle *= -1;
  }

  return Math.round(clamp(sprayAngle, -35, 35));
}

function getPitcherLabelFromHand(hand) {
  return hand === "right" ? "RHP" : "LHP";
}

function getBatterLabelFromHand(hand) {
  return hand === "right" ? "RHB" : "LHB";
}

function getTimingLabel(timing) {
  if (timing === "early") return "Early";
  if (timing === "late") return "Late";
  return "On Time";
}

function getQualityLabel(quality) {
  if (quality === "jammed") return "Jammed";
  if (quality === "solid") return "Solid";
  return "Barrel";
}

function buildHitSimulationSummary(state, fieldZone, matchupInfo) {
  const pitcher = getPitcherLabelFromHand(state.pitcherHand);
  const batter = getBatterLabelFromHand(state.batterHand);
  const pitch = getPitchContactAdjustment(state.pitchType).label;
  const location = getLocationContactAdjustment(state.pitchLocation).label;
  const timing = getTimingLabel(state.timing);
  const quality = getQualityLabel(state.quality);

  return `${pitcher} vs ${batter} | ${pitch} ${location} | ${timing} | ${quality}: ${fieldZone.label}. ${matchupInfo.label}.`;
}

function updateHitSideLabels(state) {
  const pullLabel = document.getElementById("hitPullSideLabel");
  const oppositeLabel = document.getElementById("hitOppositeSideLabel");

  if (!pullLabel || !oppositeLabel) return;

  if (state.batterHand === "right") {
    pullLabel.textContent = "RHB PULL SIDE";
    oppositeLabel.textContent = "RHB OPPOSITE";
    pullLabel.setAttribute("x", "178");
    oppositeLabel.setAttribute("x", "655");
  } else {
    pullLabel.textContent = "LHB OPPOSITE";
    oppositeLabel.textContent = "LHB PULL SIDE";
    pullLabel.setAttribute("x", "168");
    oppositeLabel.setAttribute("x", "665");
  }
}

function getTimeForHitPhase(flight, phase) {
  if (phase === "contact") return 0;
  if (phase === "lift") return clamp(flight.flightTime * 0.25, 0.2, flight.flightTime);
  if (phase === "apex") return flight.timeToApex;
  if (phase === "carry") return clamp(flight.flightTime * 0.72, 0, flight.flightTime);
  if (phase === "landing") return flight.flightTime;

  return 0;
}

function getHitPhaseFromTime(time, flight) {
  if (time <= 0.12) return "contact";
  if (time < flight.flightTime * 0.38) return "lift";
  if (Math.abs(time - flight.timeToApex) < 0.25) return "apex";
  if (time < flight.flightTime * 0.9) return "carry";
  return "landing";
}

function getHitPhaseProfile(phase, flight) {
  if (phase === "contact") {
    return {
      title: "Contact",
      label:
        "Contact: r(0) starts at home plate. Pitcher hand, batter hand, pitch type, and location influence the initial velocity vector.",
    };
  }

  if (phase === "lift") {
    return {
      title: "Early Flight",
      label:
        "Early flight: the ball begins traveling away from home plate along its spray path.",
    };
  }

  if (phase === "apex") {
    return {
      title: "Peak Carry",
      label:
        `Peak carry: y′(t) = 0 at ${flight.timeToApex.toFixed(2)} seconds. This is the highest part of the flight.`,
    };
  }

  if (phase === "carry") {
    return {
      title: "Field Zone",
      label:
        "Field zone: the ball is moving into left field, center field, or right field based on matchup, pitch, timing, and batter hand.",
    };
  }

  return {
    title: "Landing",
    label:
      "Landing: the final field location is measured by distance and spray direction.",
  };
}

function updateHitPhaseButtons(activePhase) {
  const buttons = document.querySelectorAll(".hit-phase-btn");

  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.hitPhase === activePhase);
  });
}

function updateHitTopTabs(activePhase) {
  const phaseOrder = ["contact", "lift", "apex", "carry", "landing"];
  const phaseLabels = {
    contact: "Contact",
    lift: "Flight",
    apex: "Carry",
    carry: "Zone",
    landing: "Landing",
  };

  const activeIndex = phaseOrder.indexOf(activePhase);
  const tabs = document.querySelectorAll(".hitting-main-panel .broadcast-tabs span");

  tabs.forEach((tab, index) => {
    tab.classList.toggle("active", index === activeIndex);
  });

  const topTitle = document.querySelector(".hitting-main-panel .broadcast-topline p");

  if (topTitle && phaseLabels[activePhase]) {
    topTitle.textContent = `${phaseLabels[activePhase]} Tracker`;
  }
}

function classifyHitOptimization(exitVelocity, launchAngle, distance, state) {
  const pitch = getPitchContactAdjustment(state.pitchType).label;
  const location = getLocationContactAdjustment(state.pitchLocation).label;
  const matchup = getMatchupContactAdjustment(state);

  const optimized =
    exitVelocity >= 98 &&
    launchAngle >= 19 &&
    launchAngle <= 32 &&
    distance >= 350;

  const timingText = getTimingLabel(state.timing).toLowerCase();
  const qualityText = getQualityLabel(state.quality).toLowerCase();

  if (optimized) {
    return {
      label: "Optimized contact",
      bigLabel: "Barrel-level launch",
      className: "elite-contact",
      explanation:
        `This is strong ${qualityText} contact in a ${matchup.label.toLowerCase()}. The ${pitch.toLowerCase()} ${location.toLowerCase()} plus ${timingText} timing creates a dangerous spray-chart path with deep carry.`,
    };
  }

  if (exitVelocity >= 95 && launchAngle >= 8 && launchAngle <= 32) {
    return {
      label: "Strong contact",
      bigLabel: "High-value contact",
      className: "elite-contact",
      explanation:
        `The ball is hit hard in a useful launch window. The matchup, pitch location, and ${timingText} timing control where it goes.`,
    };
  }

  if (launchAngle < 8) {
    return {
      label: "Too low",
      bigLabel: "Ground ball risk",
      className: "weak-contact",
      explanation:
        "The launch angle is low, which can happen when contact is driven downward by pitch shape, location, or a difficult matchup.",
    };
  }

  if (launchAngle > 42) {
    return {
      label: "Too steep",
      bigLabel: "Pop-up risk",
      className: "warning-contact",
      explanation:
        "The vertical component is too large, so the ball gains height but loses efficient forward distance.",
    };
  }

  return {
    label: "Needs adjustment",
    bigLabel: "Efficiency check",
    className: "warning-contact",
    explanation:
      "The contact has useful traits, but the matchup, pitch, timing, speed, angle, and direction balance could improve.",
  };
}

function classifySprayFieldZone(sprayAngle, distance, launchAngle, state) {
  let field = "Center Field";
  let sideMeaning = "center field";

  if (sprayAngle < -12) field = "Left Field";
  if (sprayAngle > 12) field = "Right Field";

  if (field === "Center Field") {
    sideMeaning = "center field";
  } else if (state.batterHand === "right") {
    sideMeaning = field === "Left Field" ? "pull side" : "opposite field";
  } else {
    sideMeaning = field === "Right Field" ? "pull side" : "opposite field";
  }

  let depth = "infield contact";

  if (launchAngle < 8) depth = "ground-ball lane";
  else if (distance >= 375) depth = "deep carry zone";
  else if (distance >= 285) depth = "gap or outfield lane";
  else if (distance >= 170) depth = "shallow outfield";
  else depth = "infield contact";

  const pitch = getPitchContactAdjustment(state.pitchType).label.toLowerCase();
  const location = getLocationContactAdjustment(state.pitchLocation).label.toLowerCase();
  const matchup = getMatchupContactAdjustment(state).label.toLowerCase();

  return {
    shortLabel: field,
    label: `${field} | ${sideMeaning} | ${depth}`,
    explanation:
      `For a ${getPitcherLabelFromHand(state.pitcherHand)} vs ${getBatterLabelFromHand(state.batterHand)} ${matchup}, the ${pitch} ${location} plus ${getTimingLabel(state.timing).toLowerCase()} timing sends the ball toward ${sideMeaning}. The projected distance places it in the ${depth}.`,
  };
}

function updateHitSprayChartVisual(options) {
  const {
    flight,
    sprayAngle,
    phase,
    phaseProfile,
    arcPath,
    ball,
    landingDot,
    tangentLine,
    velocityVector,
    velocityArrow,
    liveLabel,
  } = options;

  if (!arcPath || !ball) return;

  const home = { x: 490, y: 650 };

  const maxDistance = 430;
  const distanceRatio = clamp(flight.distance / maxDistance, 0.08, 1);

  const angleRadians = degreesToRadians(sprayAngle);

  const maxDepth = 455;
  const maxSide = 345;

  const landingX = home.x + Math.sin(angleRadians) * maxSide * distanceRatio;
  const landingY = home.y - maxDepth * distanceRatio;

  const controlledLandingX = clamp(landingX, 145, 835);
  const controlledLandingY = clamp(landingY, 185, 650);

  const control1 = {
    x: home.x + (controlledLandingX - home.x) * 0.25,
    y: home.y - 120 * distanceRatio,
  };

  const control2 = {
    x: home.x + (controlledLandingX - home.x) * 0.72,
    y: controlledLandingY + 80 * (1 - distanceRatio),
  };

  arcPath.setAttribute(
    "d",
    `M${home.x} ${home.y} C${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${controlledLandingX} ${controlledLandingY}`
  );

  if (landingDot) {
    landingDot.setAttribute("cx", controlledLandingX);
    landingDot.setAttribute("cy", controlledLandingY);
  }

  const landingRing = document.querySelector(".spray-landing-ring");

  if (landingRing) {
    landingRing.setAttribute("cx", controlledLandingX);
    landingRing.setAttribute("cy", controlledLandingY);
  }

  const progress = getHitPhaseProgress(phase);
  const current = cubicBezierPoint(
    home,
    control1,
    control2,
    {
      x: controlledLandingX,
      y: controlledLandingY,
    },
    progress
  );

  ball.setAttribute("cx", current.x);
  ball.setAttribute("cy", current.y);

  if (velocityVector) {
    const vectorTarget = cubicBezierPoint(
      home,
      control1,
      control2,
      {
        x: controlledLandingX,
        y: controlledLandingY,
      },
      clamp(progress + 0.08, 0, 1)
    );

    velocityVector.setAttribute("x1", current.x);
    velocityVector.setAttribute("y1", current.y);
    velocityVector.setAttribute("x2", vectorTarget.x);
    velocityVector.setAttribute("y2", vectorTarget.y);

    updateArrowHead(
      velocityArrow,
      current.x,
      current.y,
      vectorTarget.x,
      vectorTarget.y,
      17
    );
  }

  if (tangentLine) {
    const guideLength = 70;
    const dx = controlledLandingX - home.x;
    const dy = controlledLandingY - home.y;
    const lineLength = Math.sqrt(dx * dx + dy * dy) || 1;

    const ux = dx / lineLength;
    const uy = dy / lineLength;

    tangentLine.setAttribute("x1", current.x - ux * guideLength);
    tangentLine.setAttribute("y1", current.y - uy * guideLength);
    tangentLine.setAttribute("x2", current.x + ux * guideLength);
    tangentLine.setAttribute("y2", current.y + uy * guideLength);
  }

  if (liveLabel && phaseProfile) {
    liveLabel.textContent =
      `${phaseProfile.label} Projected distance: ${flight.distance.toFixed(0)} ft. Spray angle: ${sprayAngle}°.`;
  }
}

function getHitPhaseProgress(phase) {
  if (phase === "contact") return 0;
  if (phase === "lift") return 0.22;
  if (phase === "apex") return 0.48;
  if (phase === "carry") return 0.74;
  return 1;
}

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const oneMinusT = 1 - t;

  return {
    x:
      oneMinusT ** 3 * p0.x +
      3 * oneMinusT ** 2 * t * p1.x +
      3 * oneMinusT * t ** 2 * p2.x +
      t ** 3 * p3.x,

    y:
      oneMinusT ** 3 * p0.y +
      3 * oneMinusT ** 2 * t * p1.y +
      3 * oneMinusT * t ** 2 * p2.y +
      t ** 3 * p3.y,
  };
}
/* =========================
   ANALYTICS BUBBLE DASHBOARD
========================= */

function setupAnalyticsBubbleDashboard() {
  const bubbles = document.querySelectorAll("[data-analytics-topic]");
  const panel = document.getElementById("analyticsExpandPanel");

  if (!bubbles.length || !panel) return;

  const panelKicker = document.getElementById("analyticsPanelKicker");
  const panelTitle = document.getElementById("analyticsPanelTitle");
  const panelTag = document.getElementById("analyticsPanelTag");
  const panelDescription = document.getElementById("analyticsPanelDescription");
  const panelEquation = document.getElementById("analyticsPanelEquation");
  const panelMath = document.getElementById("analyticsPanelMath");
  const panelDecision = document.getElementById("analyticsPanelDecision");
  const panelUse = document.getElementById("analyticsPanelUse");

  let activeTopic = "overview";

  const topicData = {
    overview: {
      kicker: "Complete System",
      title: "Baseball Intelligence System",
      tag: "Overview",
      description:
        "A baseball play can be studied as a chain of motion. The pitch moves toward the plate, the hitter reacts, the ball leaves the bat, and the final result lands in a field zone.",
      equation: "position → velocity → decision",
      math:
        "Differential calculus matters because it studies how position changes over time. In this project, that idea connects pitch movement, reaction time, launch angle, and spray direction.",
      decision:
        "Build a complete scouting picture.",
      use:
        "Teams can use this kind of model to understand pitch design, hitter strengths, launch efficiency, and defensive positioning.",
    },

    calculus: {
      kicker: "Calculus Engine",
      title: "Motion Model",
      tag: "Position + Velocity",
      description:
        "The calculus engine explains how a baseball moves after contact. Position functions show where the ball is, while derivatives show how fast and in what direction the ball is moving.",
      equation: "x(t), y(t), x′(t), y′(t)",
      math:
        "The derivative of position is velocity. When vertical velocity becomes zero, the ball reaches its maximum height.",
      decision:
        "Use motion to understand the play.",
      use:
        "A team can use motion data to compare launch angles, carry distance, apex height, and landing results.",
    },

    pitching: {
      kicker: "Pitching Lab",
      title: "Reaction Time and Pitch Movement",
      tag: "Pitch Design",
      description:
        "The pitching lab shows how velocity, pitch type, break, drop, and location change the hitter’s decision window.",
      equation: "time = distance ÷ velocity",
      math:
        "A faster pitch reaches the plate sooner, which gives the hitter less time to react. Movement also changes the pitch path before contact.",
      decision:
        "Design pitches that create pressure.",
      use:
        "Pitchers and coaches can use this idea to study which pitch types create the hardest reaction windows for hitters.",
    },

    hitting: {
      kicker: "Hitting Lab",
      title: "Contact Vector",
      tag: "Exit Velocity + Launch Angle",
      description:
        "The hitting lab studies what happens when the ball leaves the bat. Exit velocity controls speed, launch angle controls height, and the velocity vector controls direction.",
      equation: "r′(t) = contact velocity",
      math:
        "The velocity vector after contact determines how quickly the ball travels and where it is initially headed.",
      decision:
        "Find the most valuable contact.",
      use:
        "Hitters can use this idea to understand why a hard-hit ball needs the right angle and direction to become dangerous.",
    },

    spray: {
      kicker: "Spray Chart",
      title: "Field Zone Result",
      tag: "Pull, Center, Opposite",
      description:
        "The spray chart connects batter hand, pitch location, timing, and contact quality to the final field zone.",
      equation: "spray direction = φ",
      math:
        "The spray angle describes whether the batted ball moves toward left field, center field, or right field.",
      decision:
        "Match contact to field value.",
      use:
        "Teams can use spray patterns to adjust defensive positioning and study hitter tendencies.",
    },

    scouting: {
      kicker: "Scouting Report",
      title: "Team Decision System",
      tag: "Final Output",
      description:
        "The scouting report combines the other labs into one baseball intelligence summary. It explains how pitch movement, hitter reaction, contact quality, and field result connect.",
      equation: "pitch → reaction → contact → result",
      math:
        "Each part of the play depends on change over time. Calculus gives the language for describing those changes.",
      decision:
        "Turn math into strategy.",
      use:
        "This model could support scouting reports, player development, defensive positioning, and matchup planning.",
    },
  };

  function updatePanel(topic) {
    const data = topicData[topic] || topicData.overview;

    if (panelKicker) panelKicker.textContent = data.kicker;
    if (panelTitle) panelTitle.textContent = data.title;
    if (panelTag) panelTag.textContent = data.tag;
    if (panelDescription) panelDescription.textContent = data.description;
    if (panelEquation) panelEquation.textContent = data.equation;
    if (panelMath) panelMath.textContent = data.math;
    if (panelDecision) panelDecision.textContent = data.decision;
    if (panelUse) panelUse.textContent = data.use;
  }

  bubbles.forEach((bubble) => {
    bubble.addEventListener("click", () => {
      const selectedTopic = bubble.dataset.analyticsTopic;

      const clickedSameOpenBubble =
        selectedTopic === activeTopic && panel.classList.contains("open");

      bubbles.forEach((btn) => btn.classList.remove("active"));

      if (clickedSameOpenBubble) {
        panel.classList.remove("open");
        activeTopic = "";
        return;
      }

      bubble.classList.add("active");
      activeTopic = selectedTopic;

      updatePanel(selectedTopic);
      panel.classList.add("open");
    });
  });

  updatePanel(activeTopic);
}
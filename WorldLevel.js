class WorldLevel {
  // Draw the sun at the end of the level and a sunbeam to the player
  drawSunAndBeam(player) {
    // Sun position at the center of the level, near the top
    const sunX = this.w / 2;
    const sunY = 80;
    // Draw sunbeam (yellow, semi-transparent triangle from sun to player)
    push();
    noStroke();
    fill(255, 255, 120, 80);
    // Beam width (wider to always cover the blob)
    const beamW = 300;
    // Player center in world coordinates
    const px = player.x;
    // Make the sun ray end at the bottom of the blob
    let blobBottom = player.y + player.r;
    beginShape();
    vertex(sunX, sunY);
    vertex(px - beamW / 2, blobBottom);
    vertex(px + beamW / 2, blobBottom);
    endShape(CLOSE);
    pop();
    // Draw sun (yellow circle with rays)
    push();
    fill(255, 255, 0);
    stroke(255, 220, 0);
    strokeWeight(3);
    ellipse(sunX, sunY, 70, 70);
    // Rays
    for (let a = 0; a < TWO_PI; a += PI / 8) {
      const r1 = 40;
      const r2 = 60;
      const x1 = sunX + cos(a) * r1;
      const y1 = sunY + sin(a) * r1;
      const x2 = sunX + cos(a) * r2;
      const y2 = sunY + sin(a) * r2;
      line(x1, y1, x2, y2);
    }
    pop();
  }
  constructor(levelJson) {
    this.name = levelJson.name ?? "Level";

    this.theme = Object.assign(
      { bg: "#F0F0F0", platform: "#C8C8C8", blob: "#1478FF" },
      levelJson.theme ?? {},
    );

    // Physics knobs
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Camera knob (data-driven view state)
    this.camLerp = levelJson.camera?.lerp ?? 0.12;

    // World size + death line
    this.w = levelJson.world?.w ?? 2400;
    this.h = levelJson.world?.h ?? 360;
    this.deathY = levelJson.world?.deathY ?? this.h + 200;

    // Start
    this.start = Object.assign({ x: 80, y: 220, r: 26 }, levelJson.start ?? {});

    // Platforms
    this.platforms = (levelJson.platforms ?? []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );

    // Mini sun collectibles (hardcoded positions for now)
    this.sunCollectibles = [
      { x: 400, y: 320, collected: false },
      { x: 1200, y: 200, collected: false },
      { x: 1700, y: 320, collected: false }, // moved left to be above the floor
    ];
  }

  drawWorld(player) {
    background(this.theme.bg);

    // Draw sun and sunbeam
    if (player) this.drawSunAndBeam(player);

    // Draw clouds at the top
    this.drawClouds();

    // Draw mini sun collectibles
    this.drawMiniSuns(player);

    push();
    rectMode(CORNER); // critical: undo any global rectMode(CENTER) [web:230]
    noStroke();
    fill(this.theme.platform);
    for (const p of this.platforms) rect(p.x, p.y, p.w, p.h); // x,y = top-left [web:234]
    pop();
  }

  drawMiniSuns(player) {
    for (const sun of this.sunCollectibles) {
      if (sun.collected) continue;
      // Draw mini sun
      push();
      fill(255, 220, 0);
      stroke(255, 180, 0);
      strokeWeight(2);
      ellipse(sun.x, sun.y, 32, 32);
      // Rays
      for (let a = 0; a < TWO_PI; a += PI / 6) {
        const r1 = 18;
        const r2 = 26;
        const x1 = sun.x + cos(a) * r1;
        const y1 = sun.y + sin(a) * r1;
        const x2 = sun.x + cos(a) * r2;
        const y2 = sun.y + sin(a) * r2;
        line(x1, y1, x2, y2);
      }
      pop();
      // Check for collection (disappear if blob touches any part, including rays)
      const dx = player.x - sun.x;
      const dy = player.y - sun.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Use a larger radius to include rays (sun radius + rays length)
      const sunRayRadius = 26; // rays extend to 26 px
      if (dist <= player.r + sunRayRadius) {
        sun.collected = true;
      }
    }
  }

  drawClouds() {
    // Draw clouds across the level with more ellipses for fullness
    noStroke();
    fill(255, 255, 255, 230);
    const cloudSpacing = 220;
    const cloudY = [50, 60, 70, 80];
    let i = 0;
    for (let x = 80; x < this.w; x += cloudSpacing, i++) {
      // Use a deterministic y position for each cloud
      let yBase = cloudY[i % cloudY.length];
      // Each cloud is a cluster of ellipses
      ellipse(x, yBase, 90, 50);
      ellipse(x + 35, yBase - 10, 70, 40);
      ellipse(x - 25, yBase + 10, 60, 35);
      ellipse(x + 15, yBase + 15, 50, 30);
      ellipse(x - 30, yBase - 5, 40, 25);
      ellipse(x + 50, yBase + 5, 55, 28);
    }
  }
}

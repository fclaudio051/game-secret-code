

let particles = [];
let animationFrameId = null;
const MAX_PARTICLES = 300; 
const MIN_PARTICLES_TO_REGENERATE = 100; 
const PARTICLE_REGENERATION_AMOUNT = 150; 


const colors = [
  '#FF007F', 
  '#00FFFF', 
  '#FFFF00', 
  '#FF4500', 
  '#39FF14', 
  '#FFD700', 
  '#8A2BE2'  
];

class ConfettiParticle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1; 
    this.gravity = 0.05; 
    this.friction = 0.97; 
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 8 - 4; 
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    ctx.shadowBlur = 8; 
    ctx.shadowColor = this.color; 

    const width = this.radius * 1.5; 
    const height = this.radius * 0.8; 
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    ctx.restore();
  }

  update(canvasHeight) {
    this.velocity.y += this.gravity;
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction; 
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.003; 
    this.rotation += this.rotationSpeed;
  }
}


function generateMoreParticles(canvas, amount) {
  for (let i = 0; i < amount; i++) {
    if (particles.length >= MAX_PARTICLES) break;

    const x = Math.random() * canvas.width;
    const y = -Math.random() * canvas.height * 0.15; 
    const radius = Math.random() * 5 + 7; 
    const color = colors[Math.floor(Math.random() * colors.length)];
    const velocity = { x: (Math.random() - 0.5) * 5, y: Math.random() * 5 + 5 }; 
    particles.push(new ConfettiParticle(x, y, radius, color, velocity));
  }
}

function animateConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    stopConfettiAnimation(); 
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height); 

 
  if (particles.length < MIN_PARTICLES_TO_REGENERATE) {
    generateMoreParticles(canvas, PARTICLE_REGENERATION_AMOUNT);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.update(canvas.height);
    particle.draw(ctx);

    
    if (particle.alpha <= 0.02 || particle.y > canvas.height + 60 || particle.x < -60 || particle.x > canvas.width + 60) {
      particles.splice(i, 1);
    }
  }

  animationFrameId = requestAnimationFrame(animateConfetti);
}

function startConfettiAnimation() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    console.warn("Confetti canvas not found!");
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  if (animationFrameId) return; 

  particles = []; 
  generateMoreParticles(canvas, MAX_PARTICLES); 

  animateConfetti();
}

function stopConfettiAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  particles = [];
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }
}

window.startConfettiAnimation = startConfettiAnimation;
window.stopConfettiAnimation = stopConfettiAnimation;

window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas && animationFrameId) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
    }
});
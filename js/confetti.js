
let particles = [];
let animationFrameId = null;
const MAX_PARTICLES = 200; 
const MIN_PARTICLES_TO_REGENERATE = 50; 
const PARTICLE_REGENERATION_AMOUNT = 100; 


const colors = ['#FFD700', '#FF4500', '#32CD32', '#1E90FF', '#FF69B4', '#ADFF2F', '#FF00FF'];

class ConfettiParticle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.gravity = 0.05;
    this.friction = 0.98;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 6 - 3;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
    ctx.restore();
  }

  update(canvasHeight) {
    this.velocity.y += this.gravity;
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.005; 
    this.rotation += this.rotationSpeed;
  }
}


function generateMoreParticles(canvas, amount) {
  for (let i = 0; i < amount; i++) {
    if (particles.length >= MAX_PARTICLES) break; 

    const x = Math.random() * canvas.width;

    const y = -Math.random() * canvas.height * 0.1; 
    const radius = Math.random() * 4 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const velocity = { x: (Math.random() - 0.5) * 4, y: Math.random() * 4 + 4 };
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

  
    if (particle.alpha <= 0.05 || particle.y > canvas.height + 50 || particle.x < -50 || particle.x > canvas.width + 50) {
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
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        
    }
});
// Show body immediately if JS fails
document.body.style.opacity = 1;

window.addEventListener('DOMContentLoaded', () => {
  // Fade in page
  document.body.style.opacity = 1;

  // ===== THEME TOGGLE =====
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  
  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    root.classList.add('dark');
  }

  function updateThemeButton() {
    themeBtn.textContent = root.classList.contains('dark') ? 'Toggle light' : 'Toggle dark';
  }

  themeBtn.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    updateThemeButton();
  });
  
  updateThemeButton();

  // ===== SCROLL PROGRESS =====
  const progressBar = document.getElementById('progress');
  let animationFrame;
  
  function updateProgress() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    
    animationFrame = requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = scrollTop / (scrollHeight - clientHeight) || 0;
      progressBar.style.transform = `scaleX(${progress})`;
    });
  }
  
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ===== REVEAL ANIMATIONS =====
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    // Initialize GSAP if available
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }

  // ===== TYPEWRITER EFFECT =====
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const words = ['Your Name', 'Creative Title'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const speeds = { type: 90, delete: 45, pause: 900 };

    function type() {
      const currentWord = words[wordIndex];
      
      if (!isDeleting) {
        charIndex++;
        typewriterEl.textContent = currentWord.slice(0, charIndex);
        
        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(type, speeds.pause);
          return;
        }
      } else {
        charIndex--;
        typewriterEl.textContent = currentWord.slice(0, charIndex);
        
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      
      setTimeout(type, isDeleting ? speeds.delete : speeds.type);
    }
    
    type();
  }

  // ===== GITHUB PROJECTS =====
  const projectsGrid = document.getElementById('grid');
  if (projectsGrid) {
    const GH_USER = 'yourusername'; // REPLACE WITH YOUR USERNAME
    const LIMIT = 6;

    function getBentoClass(index) {
      const patterns = [
        'span-8 row-2',
        'span-4',
        'span-6',
        'span-4',
        'span-6',
        'span-4'
      ];
      return patterns[index % patterns.length];
    }

    function createProjectCard(repo, index) {
      const card = document.createElement('article');
      card.className = `bento-item ${getBentoClass(index)} reveal hover:shadow-lg transition-transform will-change-transform hover:scale-[1.01]`;
      
      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-semibold tracking-tight">
            <a class="link" href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a>
          </h3>
          <a class="text-sm link opacity-70" href="${repo.html_url}" target="_blank" rel="noreferrer">Open</a>
        </div>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">${repo.description || 'No description provided'}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          ${repo.language ? `<span class="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">${repo.language}</span>` : ''}
          ${(repo.topics || []).slice(0, 3).map(topic => `
            <span class="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">${topic}</span>
          `).join('')}
        </div>
      `;
      
      return card;
    }

    async function loadProjects() {
      try {
        const response = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`, {
          headers: { 'Accept': 'application/vnd.github+json' }
        });
        
        if (!response.ok) throw new Error('GitHub API error');
        
        const repos = await response.json();
        
        if (!Array.isArray(repos)) throw new Error('Invalid response from GitHub');
        
        // Filter and sort repositories
        const filteredRepos = repos
          .filter(repo => !repo.fork && repo.description)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, LIMIT);
        
        // Clear existing content
        projectsGrid.innerHTML = '';
        
        if (filteredRepos.length === 0) {
          projectsGrid.innerHTML = `
            <div class="bento-item span-12">
              <p class="text-sm">No projects found. Add descriptions to your GitHub repositories to display them here.</p>
            </div>
          `;
          return;
        }
        
        // Add project cards
        filteredRepos.forEach((repo, index) => {
          projectsGrid.appendChild(createProjectCard(repo, index));
        });
        
        // Initialize animations for new elements
        if (!prefersReducedMotion) {
          document.querySelectorAll('#grid .reveal').forEach(el => {
            const io = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('revealed');
                }
              });
            }, { threshold: 0.12 });
            io.observe(el);
          });
        }
        
      } catch (error) {
        console.error('Failed to load projects:', error);
        projectsGrid.innerHTML = `
          <div class="bento-item span-12">
            <p class="text-sm">Couldn't load projects. Visit <a class="link" href="https://github.com/${GH_USER}">GitHub profile</a>.</p>
          </div>
        `;
      }
    }
    
    loadProjects();
  }

  // ===== FOOTER YEAR =====
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

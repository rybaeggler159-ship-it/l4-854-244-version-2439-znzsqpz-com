import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupMobileMenu() {
  const button = document.querySelector('[data-mobile-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
    button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5200);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

function setupImageFallbacks() {
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
      image.setAttribute('aria-hidden', 'true');
    }, { once: true });
  });
}

function setupFilters() {
  document.querySelectorAll('[data-filter-form]').forEach((form) => {
    const queryInput = form.querySelector('[data-filter-query]');
    const yearSelect = form.querySelector('[data-filter-year]');
    const regionSelect = form.querySelector('[data-filter-region]');
    const countNode = form.querySelector('[data-filter-count]');
    const list = form.parentElement.querySelector('[data-filter-list]');
    const cards = list ? Array.from(list.querySelectorAll('[data-movie-card]')) : [];

    function filterCards() {
      const query = (queryInput?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const region = regionSelect?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const searchText = card.dataset.search || '';
        const matchesQuery = !query || searchText.includes(query);
        const matchesYear = !year || card.dataset.year === year;
        const matchesRegion = !region || card.dataset.region === region;
        const shouldShow = matchesQuery && matchesYear && matchesRegion;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    }

    [queryInput, yearSelect, regionSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach((shell) => {
    const video = shell.querySelector('video[data-video-url]');
    const overlay = shell.querySelector('[data-player-toggle]');
    const playButton = shell.querySelector('[data-player-play]');
    const muteButton = shell.querySelector('[data-player-mute]');
    const fullButton = shell.querySelector('[data-player-fullscreen]');
    const message = shell.querySelector('[data-player-message]');

    if (!video) {
      return;
    }

    let initialized = false;
    let hls = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-visible');
    }

    function initialize() {
      if (initialized) {
        return;
      }

      const source = video.dataset.videoUrl;

      if (!source) {
        showMessage('没有找到播放源。');
        initialized = true;
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            showMessage('视频加载失败，请检查网络或播放源。');
          }
        });
      } else {
        video.src = source;
      }

      initialized = true;
    }

    async function togglePlay() {
      initialize();

      if (video.paused) {
        try {
          await video.play();
        } catch (error) {
          showMessage('浏览器阻止了自动播放，请再次点击播放。');
        }
      } else {
        video.pause();
      }
    }

    function updateState() {
      shell.classList.toggle('is-playing', !video.paused);
      if (playButton) {
        playButton.textContent = video.paused ? '播放' : '暂停';
      }
    }

    overlay?.addEventListener('click', togglePlay);
    playButton?.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('ended', updateState);

    muteButton?.addEventListener('click', () => {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    });

    fullButton?.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function setupSearchPage() {
  const dataNode = document.getElementById('movie-search-data');
  const resultsNode = document.querySelector('[data-search-results]');
  const summaryNode = document.querySelector('[data-search-summary]');
  const inputNode = document.querySelector('[data-search-input]');

  if (!dataNode || !resultsNode || !summaryNode) {
    return;
  }

  let movies = [];

  try {
    movies = JSON.parse(dataNode.textContent || '[]');
  } catch (error) {
    summaryNode.textContent = '搜索数据加载失败。';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  if (inputNode) {
    inputNode.value = query;
  }

  const normalizedQuery = query.toLowerCase();
  const matched = normalizedQuery
    ? movies.filter((movie) => {
      const text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        ...(movie.tags || [])
      ].join(' ').toLowerCase();
      return text.includes(normalizedQuery);
    })
    : movies;

  summaryNode.textContent = query
    ? `关键词“${query}”共找到 ${matched.length} 部作品。`
    : `当前显示全部 ${matched.length} 部作品，可在上方输入关键词筛选。`;

  const fragment = document.createDocumentFragment();

  matched.forEach((movie) => {
    const article = document.createElement('article');
    article.className = 'search-result-card';
    article.innerHTML = `
      <a class="poster-frame" href="${escapeAttribute(movie.url)}">
        <span class="image-fallback">${escapeHtml(movie.title.slice(0, 4))}</span>
        <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy" />
        <span class="poster-chip">${escapeHtml(movie.region)}</span>
        <span class="poster-play">▶</span>
      </a>
      <div>
        <h3><a href="${escapeAttribute(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <div class="pill-row">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <p>${escapeHtml(movie.oneLine)}</p>
      </div>
    `;
    fragment.appendChild(article);
  });

  resultsNode.replaceChildren(fragment);
  setupImageFallbacks();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

ready(() => {
  setupMobileMenu();
  setupHeroCarousel();
  setupImageFallbacks();
  setupFilters();
  setupPlayers();
  setupSearchPage();
});

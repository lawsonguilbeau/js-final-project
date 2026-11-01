// http://www.omdbapi.com/?apikey=99438daf&s=${}
// http://img.omdbapi.com/?apikey=99438daf&s=${}

const movieListElem = document.querySelector(".movies-grid");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const resultsInfo = document.querySelector("#resultsInfo"); // 1. Select the results info element

let currentMovies = [];

async function searchMovies(searchTerm) {
  try {
    // 2. Dynamically update the "Showing: [Search Term]" text
    if (resultsInfo) {
      resultsInfo.innerHTML = `<span>Showing: </span>${searchTerm}`;
    }

    // Show 6 skeleton loading cards with a slight delay for the shimmer effect
    movieListElem.innerHTML = Array(6)
      .fill(0)
      .map(() => skeletonHtml())
      .join("");
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=99438daf&s=${encodeURIComponent(searchTerm)}`,
    );
    const moviesData = await response.json();

    if (moviesData.Response === "True" && moviesData.Search) {
      currentMovies = moviesData.Search;
      renderMovies(currentMovies);
    } else {
      movieListElem.innerHTML = `<p style="color: white; text-align: center; grid-column: 1 / -1;">No movies found.</p>`;
    }
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    movieListElem.innerHTML = `<p style="color: white; text-align: center; grid-column: 1 / -1;">Failed to load movies. Please try again.</p>`;
  }
}

function renderMovies(moviesArray) {
  movieListElem.innerHTML = moviesArray
    .map((movie) => movieHtml(movie))
    .join("");
}

function sortMovies(filter) {
  let sortedMovies = [...currentMovies];

  if (filter === "a-z") {
    sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  } else if (filter === "z-a") {
    sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
  } else if (filter === "newest") {
    sortedMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  } else if (filter === "oldest") {
    sortedMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  }

  renderMovies(sortedMovies);
}

if (sortSelect) {
  sortSelect.addEventListener("change", (event) => {
    sortMovies(event.target.value);
  });
}

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    if (searchTerm.trim() !== "") {
      searchMovies(searchTerm);
      if (sortSelect) sortSelect.value = "default";
    }
  });
}

// Initial load
searchMovies("marvel");

function skeletonHtml() {
  return `<div class="movie-card movie-card--skeleton">
            <div class="movie-card__img--skeleton"></div>
            <div class="movie-card__title--skeleton"></div>
            <div class="movie-card__year--skeleton"></div>
          </div>`;
}

function movieHtml(movie) {
  if (movie.Poster === "N/A") {
    return `<div class="movie-card">
            <div class="movie-card__poster-placeholder">Movie Poster<br />Not Available</div>
            <h2 class="movie-card__title">${movie.Title}</h2>
            <p class="movie-card__year">${movie.Year}</p>
          </div>`;
  }

  return `<div class="movie-card">
          <img
            class="movie-card__img"
            src="${movie.Poster}"
            alt="${movie.Title}"
            onerror="handleImageError(this)"
          />
          <h2 class="movie-card__title">${movie.Title}</h2>
          <p class="movie-card__year">${movie.Year}</p>
        </div>`;
}

function handleImageError(imgElement) {
  const placeholder = document.createElement("div");
  placeholder.className = "movie-card__poster-placeholder";
  placeholder.innerHTML = "Movie Poster<br />Not Available";
  imgElement.replaceWith(placeholder);
}

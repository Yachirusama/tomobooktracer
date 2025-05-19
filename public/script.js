const recommendationContainer = document.getElementById("recommendations");
const bestsellersContainer = document.getElementById("bestsellers");
const refreshButton = document.getElementById("refresh-btn");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const backButton = document.getElementById("back-btn");
const themeToggle = document.getElementById("theme-toggle");

// No need for complex back button handling since we're using onclick in HTML

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  const isDark = document.body.classList.contains("dark-mode");
  updateThemeIcon(isDark);
  themeToggle.classList.add("toggle-animation");
  setTimeout(() => themeToggle.classList.remove("toggle-animation"), 500);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

function updateThemeIcon(isDark) {
  const themeIcon = themeToggle.querySelector("i");
  if (isDark) {
    themeIcon.className = "fas fa-sun";
  } else {
    themeIcon.className = "fas fa-moon";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    updateThemeIcon(false);
  } else {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    updateThemeIcon(true);
  }
  fetchRecommendedBooks();
  fetchAllBestsellers();
});

async function fetchRecommendedBooks() {
  const maxResults = 20;
  const startIndex = Math.floor(Math.random() * 50);
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=${maxResults}&startIndex=${startIndex}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items?.filter(book => book.volumeInfo.imageLinks?.thumbnail) || [];
    recommendationContainer.innerHTML = books.length
      ? ""
      : "<p>No recommended books available.</p>";
    displayBooks(books, recommendationContainer, "book-card");
  } catch (error) {
    console.error("Failed to fetch recommended books:", error);
    recommendationContainer.innerHTML = "<p>Error loading recommendations.</p>";
  }
}

async function fetchAllBestsellers() {
  const genres = ["fiction", "fantasy", "science", "history", "romance", "mystery", "biography", "self-help", "technology"];
  bestsellersContainer.innerHTML = "";
  for (const genre of genres) {
    await fetchBestsellersByGenre(genre);
  }
}

async function fetchBestsellersByGenre(genre) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&orderBy=relevance&maxResults=10`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items?.filter(book => book.volumeInfo.imageLinks?.thumbnail) || [];
    const genreSection = document.createElement("div");
    genreSection.classList.add("genre-section");
    genreSection.innerHTML = `<h4>${capitalizeGenre(genre)}</h4><div class="book-slider" id="${genre}-slider"></div>`;
    bestsellersContainer.appendChild(genreSection);
    const slider = genreSection.querySelector(".book-slider");
    displayBooks(books, slider, "bestseller-card");
  } catch (error) {
    console.error(`Failed to fetch bestsellers for ${genre}:`, error);
  }
}

function displayBooks(books, container, cardClass) {
  books.forEach((book) => {
    const { title, averageRating, imageLinks, infoLink } = book.volumeInfo;
    const rating = averageRating ? "⭐".repeat(Math.round(averageRating)) : "No rating";
    const card = document.createElement("div");
    card.className = cardClass;
    card.onclick = () => window.open(infoLink, "_blank");
    const img = document.createElement("img");
    img.src = imageLinks.thumbnail;
    img.alt = title;
    img.onerror = () => (img.src = "default-placeholder.png");
    const info = document.createElement("div");
    info.className = "book-info";
    const displayTitle = title.length > 20 ? title.substring(0, 20) + "..." : title;
    info.innerHTML = `<h3>${displayTitle}</h3><p>Rating: ${rating}</p>`;
    card.appendChild(img);
    card.appendChild(info);
    container.appendChild(card);
  });
}

function capitalizeGenre(genre) {
  return genre.charAt(0).toUpperCase() + genre.slice(1);
}

async function performSearch(query) {
  if (!query.trim()) return;
  const sanitizedQuery = encodeURIComponent(query.trim());
  const url = `https://www.googleapis.com/books/v1/volumes?q=${sanitizedQuery}&maxResults=30`;
  try {
    showLoadingState(true);
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items?.filter(book => book.volumeInfo.imageLinks?.thumbnail) || [];
    document.querySelector(".recommended-books-container").style.display = "none";
    document.querySelector(".bestsellers-section").style.display = "none";
    searchResults.style.display = "grid";
    backButton.style.display = "block";
    searchResults.innerHTML = books.length 
      ? "" 
      : "<p>No books found matching your search.</p>";
    displayBooks(books, searchResults, "book-card");
    showLoadingState(false);
  } catch (error) {
    console.error("Search failed:", error);
    searchResults.innerHTML = "<p>Error occurred during search. Please try again.</p>";
    searchResults.style.display = "block";
    showLoadingState(false);
  }
}

function showLoadingState(isLoading) {
  if (isLoading) {
    searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    searchButton.disabled = true;
  } else {
    searchButton.innerHTML = '<i class="fas fa-search"></i>';
    searchButton.disabled = false;
  }
}

// Note: resetView function is now defined in the HTML head section
// to make it available globally for the onclick handler

refreshButton.addEventListener("click", fetchRecommendedBooks);

searchButton.addEventListener("click", () => {
  performSearch(searchInput.value);
});

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    performSearch(searchInput.value);
  }
});

// Make currentSearchQuery available globally so resetView can access it
window.currentSearchQuery = "";
let debounceTimer;

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = searchInput.value.trim();
    if (query.length >= 3 && query !== window.currentSearchQuery) {
      window.currentSearchQuery = query;
      performSearch(query);
    }
  }, 1000);
});
// Select containers
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const recipeContainer = document.getElementById('recipe');

// Timeout helper
const timeout = s =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request took too long! Timeout after ${s} second`)), s * 1000)
  );

// Search recipes by query
searchForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return alert('Please enter a recipe name!');

  resultsContainer.innerHTML = '<li>Loading...</li>';
  recipeContainer.innerHTML = '<p>Searching for recipes...</p>';

  try {
    const res = await Promise.race([
      fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${query}`),
      timeout(10),
    ]);
    const data = await res.json();
    const recipes = data.data.recipes;

    if (!recipes || recipes.length === 0) {
      resultsContainer.innerHTML = '<li>No recipes found.</li>';
      recipeContainer.innerHTML = '';
      return;
    }

    // Display search results
    resultsContainer.innerHTML = '';
    recipes.forEach((rec) => {
      const li = document.createElement('li');
      li.textContent = rec.title;
      li.addEventListener('click', () => showRecipe(rec.id));
      resultsContainer.appendChild(li);
    });

    recipeContainer.innerHTML = '<p>Click a recipe to see details!</p>';
  } catch (err) {
    resultsContainer.innerHTML = '<li>Error fetching recipes.</li>';
    recipeContainer.innerHTML = `<p>${err.message}</p>`;
    console.error(err);
  }
});

// Fetch and display a single recipe
async function showRecipe(id) {
  recipeContainer.innerHTML = '<p>Loading recipe...</p>';
  try {
    const res = await Promise.race([
      fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`),
      timeout(10),
    ]);
    const data = await res.json();
    const rec = data.data.recipe;

    recipeContainer.innerHTML = `
      <h2>${rec.title}</h2>
      <p><strong>Publisher:</strong> ${rec.publisher}</p>
      <p><strong>Servings:</strong> ${rec.servings}</p>
      <p><strong>Cooking time:</strong> ${rec.cookingTime} min</p>
      <img src="${rec.imageUrl}" alt="${rec.title}" style="width:100%; max-width:400px; border-radius:8px;" />
      <p><a href="${rec.sourceUrl}" target="_blank">View full directions</a></p>
    `;
  } catch (err) {
    recipeContainer.innerHTML = `<p>Error: ${err.message}</p>`;
    console.error(err);
  }
}

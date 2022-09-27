const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch(
        "http://localhost:3001/recipes"
    );
    const respData = await resp.json();
    const randomMeal = respData[Math.floor(Math.random()*5)];
    console.log(respData);

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch(
        "http://localhost:3001/recipes"
    );

    const respData = await resp.json();
    const meal = respData[Math.floor(Math.random()*5)];


    return meal;
}

async function getMealsBySearch(e) {
    const resp = await fetch(
        "http://localhost:3001/recipes"
    );

    let term = e.target.value;
    const respData = await resp.json();
    const meals = respData[term];

    return meals;
}

function addMeal(mealData, random = false) {
    console.log(mealData);

    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${
                random
                    ? `
            <span class="random"> Random Recipe </span>`
                    : ""
            }
            <img
                src="${mealData.images.medium}"
                alt="${mealData.description}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.title}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealLS(mealData.uuid);
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.uuid);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img
            src="${mealData.images.small}"
            alt="${mealData.description}"
        /><span>${mealData.title}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealLS(mealData.uuid);

        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
    // clean container
    mealsEl.innerHTML = "";

    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});


function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the Meal info
    const mealEl = document.createElement("div");

    const ingredients = [];
    const instructions = [];

    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData.ingredients["name" + i]} - ${
                    mealData.ingredients["amount" + i] 
                } ${
                    mealData.ingredients["measurement" + i]}`
            );
        } else {
            break;
        }
    }

    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData.ingredients[i].name} - ${
                    mealData.ingredients[i].amount 
                } ${
                    mealData.ingredients[i].measurement}`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.title}</h1>
        <img
            src="${mealData.images.medium}"
            alt="${mealData.description}"
        />
        <p>
        ${mealData.description}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
}

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});
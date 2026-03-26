const sideNav = document.querySelector(".side-nav");

const itemsGroup = document.querySelector("#items_group");
const dropdown = document.querySelector(".drop-items");

document.addEventListener("click", (e) => {
  const closestItemsGroupParent = e.target.closest("#items_group");

  if (e.target === itemsGroup) dropdown.classList.toggle("hidden");

  if (closestItemsGroupParent) return;

  dropdown.classList.add("hidden");
});

sideNav.addEventListener("click", (e) => {
  const href = e.target.getAttribute("href");

  if (href) location.href = href;
});
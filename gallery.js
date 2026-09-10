/*
  MovIn Focus - automatic categorized gallery

  EDIT ONLY THESE VALUES:
*/
const GITHUB_OWNER = "YOUR_GITHUB_USERNAME";
const GITHUB_REPO = "YOUR_REPOSITORY_NAME";
const GITHUB_BRANCH = "main";

/* These folder names must match GitHub exactly. */
const CATEGORIES = [
    { folder: "1. Portraits", title: "Portraits" },
    { folder: "2. Action", title: "Action" },
    { folder: "3. Animals", title: "Animals" },
    { folder: "4. Landscapes", title: "Landscapes" },
    { folder: "5. Other", title: "Other" }
];

const PHOTO_ROOT = "photos";
const SUPPORTED_IMAGE_TYPES = /\.(avif|gif|jpe?g|png|webp)$/i;

function githubContentsUrl(folder) {
    const path = `${PHOTO_ROOT}/${folder}`
        .split("/")
        .map(part => encodeURIComponent(part))
        .join("/");

    return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
}

function rawImageUrl(folder, filename) {
    const path = `${PHOTO_ROOT}/${folder}/${filename}`
        .split("/")
        .map(part => encodeURIComponent(part))
        .join("/");

    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
}

async function getCategoryImages(category) {
    const response = await fetch(githubContentsUrl(category.folder), {
        headers: {
            Accept: "application/vnd.github+json"
        }
    });

    if (response.status === 404) {
        return [];
    }

    if (!response.ok) {
        throw new Error(`${category.title}: GitHub API returned ${response.status}`);
    }

    const files = await response.json();

    return files
        .filter(file => file.type === "file" && SUPPORTED_IMAGE_TYPES.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: "base"
        }));
}

function createCategorySection(category, images) {
    const section = document.createElement("section");
    section.className = "portfolio-category";
    section.id = `category-${category.title.toLowerCase()}`;

    const heading = document.createElement("h3");
    heading.className = "category-title";
    heading.textContent = category.title;

    const grid = document.createElement("div");
    grid.className = "category-gallery";
    grid.setAttribute("aria-label", `${category.title} photography`);

    images.forEach((file, index) => {
        const figure = document.createElement("figure");
        figure.className = "gallery-item";

        const image = document.createElement("img");
        image.src = rawImageUrl(category.folder, file.name);
        image.alt = `${category.title} portfolio photograph ${index + 1}`;
        image.loading = "lazy";
        image.decoding = "async";

        figure.appendChild(image);
        grid.appendChild(figure);
    });

    section.append(heading, grid);
    return section;
}

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const status = document.getElementById("gallery-status");

    if (!gallery || !status) {
        console.error("Gallery container or status element is missing from index.html.");
        return;
    }

    if (
        GITHUB_OWNER === "YOUR_GITHUB_USERNAME" ||
        GITHUB_REPO === "YOUR_REPOSITORY_NAME"
    ) {
        status.textContent = "Gallery configuration is not complete yet.";
        return;
    }

    status.textContent = "Loading photographs...";

    try {
        const results = await Promise.all(
            CATEGORIES.map(async category => ({
                category,
                images: await getCategoryImages(category)
            }))
        );

        gallery.replaceChildren();

        let totalImages = 0;

        results.forEach(({ category, images }) => {
            if (images.length === 0) return;

            totalImages += images.length;
            gallery.appendChild(createCategorySection(category, images));
        });

        status.textContent = totalImages === 0
            ? "Photographs will be added soon."
            : "";
    } catch (error) {
        console.error("Could not load the photography gallery:", error);
        status.textContent = "The photography gallery could not be loaded right now.";
    }
}

document.addEventListener("DOMContentLoaded", loadGallery);

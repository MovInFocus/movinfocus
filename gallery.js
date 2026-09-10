const GITHUB_OWNER = "MovInFocus";
const GITHUB_REPO = "movinfocus";
const GITHUB_BRANCH = "main";
const PHOTO_FOLDER = "photos";

const SUPPORTED_IMAGE_TYPES = /\.(avif|gif|jpe?g|png|webp)$/i;

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const status = document.getElementById("gallery-status");

    if (!gallery || !status) return;

    if (
        GITHUB_OWNER === "YOUR_GITHUB_USERNAME" ||
        GITHUB_REPO === "YOUR_REPOSITORY_NAME"
    ) {
        status.textContent = "Gallery configuration is not complete yet.";
        return;
    }

    const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PHOTO_FOLDER}?ref=${GITHUB_BRANCH}`;

    try {
        const response = await fetch(endpoint, {
            headers: { Accept: "application/vnd.github+json" }
        });

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const files = await response.json();

        const images = files
            .filter(file => file.type === "file" && SUPPORTED_IMAGE_TYPES.test(file.name))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: "base"
            }));

        if (images.length === 0) {
            status.textContent = "Photographs will be added soon.";
            return;
        }

        const fragment = document.createDocumentFragment();

        images.forEach((file, index) => {
            const figure = document.createElement("figure");
            figure.className = "gallery-item";

            const image = document.createElement("img");
            image.src = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${PHOTO_FOLDER}/${encodeURIComponent(file.name)}`;
            image.alt = `MovIn Focus portfolio photograph ${index + 1}`;
            image.loading = index < 2 ? "eager" : "lazy";
            image.decoding = "async";

            figure.appendChild(image);
            fragment.appendChild(figure);
        });

        gallery.replaceChildren(fragment);
        status.textContent = "";
    } catch (error) {
        console.error("Could not load the photography gallery:", error);
        status.textContent = "The photography gallery could not be loaded right now.";
    }
}

document.addEventListener("DOMContentLoaded", loadGallery);

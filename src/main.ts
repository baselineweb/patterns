/**
 * this file and the functionality it holds is for demo purposes only and not part of the actual pattern library
 */
function main() {
    const modules = import.meta.glob('./components/**/index.html');
    const nav = document.getElementById('pattern-nav');
    const iframe = document.getElementById('pattern-viewer') as HTMLIFrameElement;

    if (!nav || !iframe) return;

    // Extract folder names and original paths
    const components = Object.keys(modules).map((path) => {
        // Transform "./components/accordion/index.html" -> "accordion"
        const name = path.split('/')[2];
        return { name, path };
    });

    const updateURL = (name: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('pattern', name);
        window.history.pushState({}, '', url);
    };

    const loadPattern = (path: string, button: HTMLButtonElement) => {
        // Remove active class from all buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        // Set iframe src. Remove leading ./ for correct path resolution relative to base
        const cleanPath = path.startsWith('./') ? path.substring(2) : path;
        iframe.src = import.meta.env.BASE_URL + 'src/' + cleanPath;
    };

    // Get current pattern from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialPattern = urlParams.get('pattern');

    components.forEach((component) => {
        const button = document.createElement('button');
        button.textContent = component.name;
        button.classList.add('pattern-btn');
        button.addEventListener('click', () => {
            loadPattern(component.path, button);
            updateURL(component.name);
        });
        nav.appendChild(button);

        // Load initial pattern if it matches
        if (initialPattern === component.name) {
            loadPattern(component.path, button);
        }
    });

    // If no initial pattern or invalid, load the first one by default if desired
    if (!initialPattern && components.length > 0) {
        const firstBtn = nav.querySelector('.pattern-btn') as HTMLButtonElement;
        if (firstBtn) {
            loadPattern(components[0].path, firstBtn);
        }
    }

    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const pattern = urlParams.get('pattern');
        if (pattern) {
            const component = components.find(c => c.name === pattern);
            if (component) {
                const button = Array.from(document.querySelectorAll('.pattern-btn'))
                    .find(btn => btn.textContent === pattern) as HTMLButtonElement;
                if (button) {
                    loadPattern(component.path, button);
                }
            }
        }
    });
}

main();
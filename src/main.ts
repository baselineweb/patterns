/**
 * this file and the functionality it holds is for demo purposes only and not part of the actual pattern library
 */
function main() {
    const modules = import.meta.glob('./components/**/index.html');
    const nav = document.getElementById('pattern-nav');
    const iframe = document.getElementById('pattern-viewer') as HTMLIFrameElement;

    if (!nav || !iframe) return;

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

    // Create buttons first
    components.forEach((component) => {
        const button = document.createElement('button');
        button.textContent = component.name;
        button.classList.add('pattern-btn');
        button.addEventListener('click', () => {
            loadPattern(component.path, button);
            updateURL(component.name);
        });
        nav.appendChild(button);
    });

    // Handle initial state
    const urlParams = new URLSearchParams(window.location.search);
    const initialPattern = urlParams.get('pattern');

    if (initialPattern) {
        const component = components.find(c => c.name === initialPattern);
        const button = Array.from(document.querySelectorAll('.pattern-btn'))
            .find(btn => btn.textContent === initialPattern) as HTMLButtonElement;
        
        if (component && button) {
            loadPattern(component.path, button);
        } else if (components.length > 0) {
            // Fallback if URL pattern is invalid
            loadPattern(components[0].path, document.querySelector('.pattern-btn') as HTMLButtonElement);
        }
    } else if (components.length > 0) {
        // Default to first pattern if none in URL
        loadPattern(components[0].path, document.querySelector('.pattern-btn') as HTMLButtonElement);
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
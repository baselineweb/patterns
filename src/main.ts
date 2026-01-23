/**
 * this file and the functionality it holds is for demo purposes only and not part of the actual pattern library
 */
function main() {
    const modules = import.meta.glob('./components/**/*/index.html');
    const readmeModules = import.meta.glob('./components/**/README.md', {
        query: '?raw',
        import: 'default'
    });
    const rootReadmeLoader = () => import('../README.md?raw');
    const rootReadmeGithubUrl = 'https://github.com/baselineweb/patterns/blob/main/README.md';
    const nav = document.getElementById('pattern-nav');
    const iframe = document.getElementById('pattern-viewer') as HTMLIFrameElement;
    const mainContent = document.querySelector('main.content') as HTMLElement | null;

    if (!nav || !iframe || !mainContent) return;

    interface Variant {
        name: string;
        path: string;
    }

    interface Component {
        id: string;
        name: string;
        variants: Variant[];
    }

    interface ComponentGroup {
        name: string;
        components: Component[];
    }

    const viewerPane = document.createElement('section');
    viewerPane.classList.add('viewer-pane');
    viewerPane.setAttribute('aria-label', 'Pattern preview');

    const iframeParent = iframe.parentElement;
    if (iframeParent) {
        iframeParent.insertBefore(viewerPane, iframe);
        viewerPane.appendChild(iframe);
    } else {
        viewerPane.appendChild(iframe);
        mainContent.appendChild(viewerPane);
    }

    const splitter = document.createElement('div');
    splitter.classList.add('content-splitter');
    splitter.setAttribute('role', 'separator');
    splitter.setAttribute('aria-orientation', 'horizontal');

    const readmePane = document.createElement('section');
    readmePane.classList.add('readme-pane');
    readmePane.setAttribute('aria-label', 'Documentation');

    const readmeToolbar = document.createElement('header');
    readmeToolbar.classList.add('readme-toolbar');

    const themeWrapper = document.createElement('div');
    themeWrapper.classList.add('readme-theme');

    const themeLabel = document.createElement('label');
    themeLabel.textContent = 'Theme';
    themeLabel.htmlFor = 'theme-select';

    const themeSelect = document.createElement('select');
    themeSelect.id = 'theme-select';

    const themes = [
        { value: '', name: 'Browser Default' },
        { value: 'simpledotcss', name: 'Simple.css', loader: () => import('simpledotcss/simple.css?raw') },
        { value: 'almondcss', name: 'Almond.css', loader: () => import('almond.css/dist/almond.css?raw') },
        { value: 'tuftecss', name: 'Tufte CSS', loader: () => import('tufte-css/tufte.css?raw') },
        { value: 'marxcss', name: 'Marx.css', loader: () => import('marx-css/css/marx.css?raw') },
        { value: 'mvpcss', name: 'MVP.css', loader: () => import('mvp.css/mvp.css?raw') },
        { value: 'picocss', name: 'Pico.css', loader: () => import('@picocss/pico/css/pico.css?raw') }
    ];

    themes.forEach((theme) => {
        const option = document.createElement('option');
        option.value = theme.value;
        option.textContent = theme.name;
        themeSelect.appendChild(option);
    });

    themeWrapper.appendChild(themeLabel);
    themeWrapper.appendChild(themeSelect);

    const readmeLink = document.createElement('a');
    readmeLink.classList.add('readme-link');
    readmeLink.href = rootReadmeGithubUrl;
    readmeLink.target = '_blank';
    readmeLink.rel = 'noreferrer';
    readmeLink.textContent = 'README on GitHub';

    readmeToolbar.appendChild(themeWrapper);

    const readmeContent = document.createElement('article');
    readmeContent.classList.add('readme-content');

    readmePane.appendChild(readmeToolbar);
    readmePane.appendChild(readmeContent);

    mainContent.appendChild(splitter);
    mainContent.appendChild(readmePane);

    const getThemeCss = async (themeValue: string) => {
        const theme = themes.find(option => option.value === themeValue);
        if (!theme?.loader) return null;
        const themeModule = await theme.loader();
        return themeModule.default;
    };

    const removeIframeStyles = (doc: Document) => {
        doc.querySelectorAll('style[data-demo-styles]').forEach(style => style.remove());
    };

    const reloadIframe = () => {
        const currentSrc = iframe.getAttribute('src');
        if (currentSrc) {
            iframe.src = currentSrc;
        }
    };

    const applyThemeToIframe = async () => {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const existingTheme = doc.getElementById('pattern-theme');
        if (existingTheme) {
            existingTheme.remove();
        }

        const themeValue = themeSelect.value;
        if (!themeValue) return;

        const cssText = await getThemeCss(themeValue);
        if (!cssText) return;

        removeIframeStyles(doc);
        const style = doc.createElement('style');
        style.id = 'pattern-theme';
        style.textContent = cssText;
        const mountPoint = doc.head || doc.body || doc.documentElement;
        mountPoint?.appendChild(style);
    };

    themeSelect.addEventListener('change', () => {
        if (!themeSelect.value) {
            reloadIframe();
            return;
        }
        void applyThemeToIframe();
    });

    iframe.addEventListener('load', () => {
        void applyThemeToIframe();
    });

    const escapeHtml = (value: string) => {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    const renderInline = (value: string) => {
        let result = value;
        result = result.replace(/`([^`]+)`/g, (_match, code) => `<code>${escapeHtml(code)}</code>`);
        result = result.replace(/\[([^\]]+)\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
        result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        return result;
    };

    const renderMarkdown = (markdown: string) => {
        const lines = markdown.replace(/\r\n/g, '\n').split('\n');
        let html = '';
        let inList: 'ul' | 'ol' | null = null;
        let inBlockquote = false;
        let inCodeBlock = false;

        const closeList = () => {
            if (inList) {
                html += `</${inList}>`;
                inList = null;
            }
        };

        const closeBlockquote = () => {
            if (inBlockquote) {
                html += '</blockquote>';
                inBlockquote = false;
            }
        };

        lines.forEach((rawLine) => {
            const line = rawLine.trimEnd();

            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    html += '</code></pre>';
                    inCodeBlock = false;
                } else {
                    closeList();
                    closeBlockquote();
                    html += '<pre><code>';
                    inCodeBlock = true;
                }
                return;
            }

            if (inCodeBlock) {
                html += `${escapeHtml(rawLine)}\n`;
                return;
            }

            const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headingMatch) {
                closeList();
                closeBlockquote();
                const level = headingMatch[1].length;
                html += `<h${level}>${renderInline(headingMatch[2])}</h${level}>`;
                return;
            }

            const blockquoteMatch = line.match(/^\s*>\s?(.*)$/);
            if (blockquoteMatch) {
                closeList();
                if (!inBlockquote) {
                    html += '<blockquote>';
                    inBlockquote = true;
                }
                html += `<p>${renderInline(blockquoteMatch[1])}</p>`;
                return;
            }

            if (inBlockquote && line.trim() === '') {
                closeBlockquote();
                return;
            } else if (inBlockquote) {
                closeBlockquote();
            }

            const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);
            if (orderedMatch) {
                if (inList !== 'ol') {
                    closeList();
                    html += '<ol>';
                    inList = 'ol';
                }
                html += `<li>${renderInline(orderedMatch[1])}</li>`;
                return;
            }

            const unorderedMatch = line.match(/^\s*[*+-]\s+(.*)$/);
            if (unorderedMatch) {
                if (inList !== 'ul') {
                    closeList();
                    html += '<ul>';
                    inList = 'ul';
                }
                html += `<li>${renderInline(unorderedMatch[1])}</li>`;
                return;
            }

            if (line.trim() === '') {
                closeList();
                closeBlockquote();
                return;
            }

            closeList();
            closeBlockquote();
            html += `<p>${renderInline(line.trim())}</p>`;
        });

        closeList();
        closeBlockquote();

        if (inCodeBlock) {
            html += '</code></pre>';
        }

        return html;
    };

    const setReadmeEmpty = (message: string) => {
        readmeContent.classList.add('readme-empty');
        readmeContent.innerHTML = `<p>${message}</p>`;
        if (readmeLink.parentElement) {
            readmeLink.remove();
        }
    };

    const setReadmeHtml = (html: string) => {
        readmeContent.classList.remove('readme-empty');
        readmeContent.innerHTML = html;
        if (!readmeLink.parentElement) {
            readmeToolbar.appendChild(readmeLink);
        }
    };

    const detachNode = (node: HTMLElement) => {
        if (node.parentElement) {
            node.parentElement.removeChild(node);
        }
    };

    const clearActivePatterns = () => {
        document.querySelectorAll('.pattern-btn').forEach(btn => btn.classList.remove('active'));
    };

    let savedGridTemplateRows: string | null = null;
    let currentLayoutMode: 'pattern' | 'readme-only' = 'pattern';

    const setLayoutMode = (mode: 'pattern' | 'readme-only') => {
        if (mode === currentLayoutMode) return;
        if (mode === 'readme-only') {
            if (savedGridTemplateRows === null) {
                savedGridTemplateRows = mainContent.style.gridTemplateRows;
            }
            mainContent.classList.add('readme-only');
            mainContent.style.gridTemplateRows = '1fr';
            detachNode(viewerPane);
            detachNode(splitter);
            detachNode(readmePane);
            if (readmeContent.parentElement !== mainContent) {
                detachNode(readmeContent);
                mainContent.appendChild(readmeContent);
            }
        } else {
            mainContent.classList.remove('readme-only');
            if (savedGridTemplateRows !== null) {
                mainContent.style.gridTemplateRows = savedGridTemplateRows;
                savedGridTemplateRows = null;
            } else {
                mainContent.style.gridTemplateRows = '';
            }
            if (readmeContent.parentElement !== readmePane) {
                detachNode(readmeContent);
                readmePane.appendChild(readmeContent);
            }
            mainContent.appendChild(viewerPane);
            mainContent.appendChild(splitter);
            mainContent.appendChild(readmePane);
        }
        currentLayoutMode = mode;
    };

    const getReadmeInfo = (componentPath: string) => {
        const normalized = componentPath.startsWith('./') ? componentPath.slice(2) : componentPath;
        const directory = normalized.split('/').slice(0, -1).join('/');
        if (!directory) return null;
        const key = `./${directory}/README.md`;
        const githubUrl = `https://github.com/baselineweb/patterns/blob/main/src/${directory}/README.md`;
        return { key, githubUrl };
    };

    const loadReadmeForPath = async (componentPath: string) => {
        const readmeInfo = getReadmeInfo(componentPath);
        if (!readmeInfo) {
            setReadmeEmpty('no documentation available');
            return;
        }

        readmeLink.href = readmeInfo.githubUrl;
        readmeContent.classList.remove('readme-empty');
        readmeContent.innerHTML = '';
        if (readmeLink.parentElement) {
            readmeLink.remove();
        }

        const loader = readmeModules[readmeInfo.key];
        if (!loader) {
            setReadmeEmpty('no documentation available');
            return;
        }

        try {
            const markdown = await loader();
            setReadmeHtml(renderMarkdown(markdown));
        } catch {
            setReadmeEmpty('no documentation available');
        }
    };

    const normalizeRootReadme = (markdown: string) => {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const iconUrl = `${normalizedBase}icon.svg`;
        let result = markdown.replace(/public\/icon\.svg/g, iconUrl);
        result = result.replace(/^\s*<a\s+[^>]*>View the Pattern Library<\/a>\s*$/gm, '');
        return result;
    };

    const loadRootReadme = async () => {
        readmeLink.href = rootReadmeGithubUrl;
        readmeContent.classList.remove('readme-empty');
        readmeContent.innerHTML = '';
        if (readmeLink.parentElement) {
            readmeLink.remove();
        }

        try {
            const markdown = await rootReadmeLoader();
            setReadmeHtml(renderMarkdown(normalizeRootReadme(markdown.default)));
        } catch {
            setReadmeEmpty('no documentation available');
        }
    };

    const minPaneHeight = 160;

    splitter.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        splitter.setPointerCapture(event.pointerId);
        const startY = event.clientY;
        const containerRect = mainContent.getBoundingClientRect();
        const splitterHeight = splitter.getBoundingClientRect().height || 8;
        const startTopHeight = viewerPane.getBoundingClientRect().height;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientY - startY;
            const maxTopHeight = containerRect.height - splitterHeight - minPaneHeight;
            const nextTopHeight = Math.min(Math.max(startTopHeight + delta, minPaneHeight), maxTopHeight);
            const nextBottomHeight = containerRect.height - splitterHeight - nextTopHeight;
            mainContent.style.gridTemplateRows = `${nextTopHeight}px ${splitterHeight}px ${nextBottomHeight}px`;
        };

        const onPointerUp = (upEvent: PointerEvent) => {
            splitter.removeEventListener('pointermove', onPointerMove);
            splitter.removeEventListener('pointerup', onPointerUp);
            splitter.removeEventListener('pointercancel', onPointerUp);
            if (splitter.hasPointerCapture(upEvent.pointerId)) {
                splitter.releasePointerCapture(upEvent.pointerId);
            }
        };

        splitter.addEventListener('pointermove', onPointerMove);
        splitter.addEventListener('pointerup', onPointerUp);
        splitter.addEventListener('pointercancel', onPointerUp);
    });

    const componentMap: Record<string, Component> = {};
    const groupMap: Record<string, ComponentGroup> = {};

    Object.keys(modules).forEach((path) => {
        // path is like "./components/accordion/base/index.html" or "./components/forms/radio/base/index.html"
        const parts = path.split('/');
        const hasGroup = parts.length > 5;
        const groupName = hasGroup ? parts[2] : null;
        const componentName = hasGroup ? parts[3] : parts[2];
        const variantName = hasGroup ? parts[4] : parts[3];
        const componentId = groupName ? `${groupName}/${componentName}` : componentName;

        if (!componentMap[componentId]) {
            componentMap[componentId] = { id: componentId, name: componentName, variants: [] };
        }
        componentMap[componentId].variants.push({ name: variantName, path });

        if (groupName) {
            if (!groupMap[groupName]) {
                groupMap[groupName] = { name: groupName, components: [] };
            }
            if (!groupMap[groupName].components.find(c => c.id === componentId)) {
                groupMap[groupName].components.push(componentMap[componentId]);
            }
        }
    });

    const components = Object.values(componentMap);
    const groups = Object.values(groupMap);

    const updateURL = (componentName: string, variantName: string) => {
        const url = new URL(window.location.href);
        const patternValue = variantName === 'base' ? componentName : `${componentName}:${variantName}`;
        url.searchParams.set('pattern', patternValue);
        window.history.pushState({}, '', url);
    };

    const loadPattern = (path: string, button: HTMLButtonElement) => {
        // Remove active class from all buttons
        setLayoutMode('pattern');
        clearActivePatterns();
        // Add active class to clicked button
        button.classList.add('active');
        // Set iframe src. Remove leading ./ for correct path resolution relative to base
        const cleanPath = path.startsWith('./') ? path.substring(2) : path;
        iframe.src = import.meta.env.BASE_URL + 'src/' + cleanPath;
        void loadReadmeForPath(cleanPath);
    };

    const showRootReadme = () => {
        setLayoutMode('readme-only');
        clearActivePatterns();
        void loadRootReadme();
    };

    const createButton = (componentId: string, variant: Variant, label?: string) => {
        const button = document.createElement('button');
        button.textContent = label || componentId;
        button.classList.add('pattern-btn');
        button.dataset.pattern = variant.name === 'base' ? componentId : `${componentId}:${variant.name}`;
        button.addEventListener('click', () => {
            loadPattern(variant.path, button);
            updateURL(componentId, variant.name);
        });
        return button;
    };

    // Create navigation
    const renderComponent = (component: Component, container: HTMLElement) => {
        if (component.variants.length > 1) {
            // Collapsible using details and summary
            const details = document.createElement('details');
            details.classList.add('pattern-details');

            const summary = document.createElement('summary');
            summary.textContent = component.name;
            summary.classList.add('pattern-summary');

            const content = document.createElement('div');
            content.classList.add('pattern-details-content');

            component.variants.forEach(variant => {
                const btn = createButton(component.id, variant, variant.name);
                content.appendChild(btn);
            });

            details.appendChild(summary);
            details.appendChild(content);
            container.appendChild(details);
        } else {
            // Single variant (base)
            const button = createButton(component.id, component.variants[0], component.name);
            container.appendChild(button);
        }
    };

    groups.forEach((group) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('pattern-group');

        const title = document.createElement('div');
        title.textContent = group.name;
        title.classList.add('pattern-group-title');

        const content = document.createElement('div');
        content.classList.add('pattern-group-content');

        group.components.forEach(component => {
            renderComponent(component, content);
        });

        wrapper.appendChild(title);
        wrapper.appendChild(content);
        nav.appendChild(wrapper);
    });

    const groupedComponentIds = new Set(groups.flatMap(group => group.components.map(component => component.id)));
    components
        .filter(component => !groupedComponentIds.has(component.id))
        .forEach(component => renderComponent(component, nav));

    const findButtonByPattern = (pattern: string) => {
        return document.querySelector(`.pattern-btn[data-pattern="${pattern}"]`) as HTMLButtonElement;
    };

    const findPathByPattern = (pattern: string) => {
        const [compId, varName = 'base'] = pattern.split(':');
        const component = componentMap[compId];
        if (component) {
            const variant = component.variants.find(v => v.name === varName);
            return variant?.path;
        }
        return null;
    };

    // Handle initial state
    const urlParams = new URLSearchParams(window.location.search);
    const initialPattern = urlParams.get('pattern');

    if (initialPattern) {
        const path = findPathByPattern(initialPattern);
        const button = findButtonByPattern(initialPattern);
        
        if (path && button) {
            loadPattern(path, button);
            // Open the parent <details> if the button is inside one
            const details = button.closest('details');
            if (details) details.open = true;
        } else if (components.length > 0) {
            const firstComp = components[0];
            const firstVar = firstComp.variants[0];
            const firstPattern = firstVar.name === 'base' ? firstComp.name : `${firstComp.name}:${firstVar.name}`;
            const firstButton = findButtonByPattern(firstPattern);
            loadPattern(firstVar.path, firstButton);
            const details = firstButton.closest('details');
            if (details) details.open = true;
        }
    } else {
        showRootReadme();
    }

    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const pattern = urlParams.get('pattern');
        if (pattern) {
            const path = findPathByPattern(pattern);
            const button = findButtonByPattern(pattern);
            if (path && button) {
                loadPattern(path, button);
                const details = button.closest('details');
                if (details) details.open = true;
            }
        } else {
            showRootReadme();
        }
    });
}

main();

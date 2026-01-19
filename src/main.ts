function main() {
    const modules = import.meta.glob('./components/**/index.html');

    // Extract folder names from the keys
    const componentFolders = Object.keys(modules).map((path) => {
        // Transform "./components/accordion/index.html" -> "accordion"
        return path.split('/')[2];
    });

    console.log('Available components:', componentFolders);
}


main();
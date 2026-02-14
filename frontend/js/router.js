async function navigateTo(viewName) {
    try {
        const response = await fetch(`./views/${viewName}.html`);
        const html = await response.text();
        document.getElementById('content-area').innerHTML = html;
        if (viewName === 'overall' || viewName === 'advanced') {
            updateDataFromPython();
        }
    } catch (error) {
        console.error("Error loading the view:", error);
    }
}
window.onload = () => {
    navigateTo('overall');
};
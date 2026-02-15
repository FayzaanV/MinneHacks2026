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
async function getOverallData(){
    const data = eel.get_overall_data()();
    const appList = document.querySelector('.app-list-section');
    if(appList) {
        let html = '<h2>App curr. open using the most</h2>';
        Object.entries(data.apps).forEach(([name, mem], index) => {
            html += `
                <div class="app-item">
                    ${index + 1}) ${name} 
                    <span class="badge">${Math.round(mem)} MB</span>
                </div>`;
        });
        appList.innerHTML = html;
    }
}
window.onload = () => {
    navigateTo('overall');
};
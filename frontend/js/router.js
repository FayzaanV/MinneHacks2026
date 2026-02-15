async function navigateTo(viewName) {
    try {
        const response = await fetch(`./views/${viewName}.html`);
        const html = await response.text();
        const container = document.getElementById('content-area') || document.getElementById('view-container');
        container.innerHTML = html;
        if (viewName === 'overall') {
            await getOverallData(); 
        }
    } catch (error) {
        console.error("Error loading the view:", error);
    }
}
async function getOverallData(){
    const data = await eel.get_overall_data()();
    const appListContainer = document.querySelector('#list-of-apps');
    if(appListContainer && data.apps) {
        let html = '';
        Object.entries(data.apps).forEach(([name, mem], index) => {
            let colorClass = '';
            if (mem > 750) {
                colorClass = "bg-red-500/20 text-red-400 border-red-500/50";
            } else if (mem > 250) {
                colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
            } else {
                colorClass = "bg-green-500/20 text-green-400 border-green-500/50";
            }
            html += `
            <div class="app-item flex justify-between items-center bg-mend-card p-5 rounded-xl border border-mend-border shadow-md hover:scale-[1.02] transition-transform">
                <span class="text-xl text-gray-200 font-medium">${name}</span>
                <span class="badge ${colorClass} border px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                    ${Math.round(mem)} MB
                </span>
            </div>`;
        });
        appListContainer.innerHTML = html;
    }
}
window.onload = () => {
    navigateTo('overall');
};
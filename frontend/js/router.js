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
async function getOverallData() {
    const data = await eel.get_overall_data()();
    console.log("Received Data:", data);
    if (data.battery !== undefined) {
        const battText = document.getElementById('battery-percent-text');
        if (battText) {
            battText.innerText = Math.round(data.battery) + "%";
        }
        const battBar = document.getElementById('battery-bar');
        if (battBar) {
            battBar.style.width = data.battery + "%";
            if (data.battery < 20) {
                battBar.classList.remove('bg-diagnOS-light');
                battBar.classList.add('bg-red-500');
            } else {
                battBar.classList.add('bg-diagnOS-light');
                battBar.classList.remove('bg-red-500');
            }
        }
        const battStatus = document.getElementById('battery-status-text');
        if (battStatus) {
            if (data.isCharging === true) {
                battStatus.innerText = "Battery Status: Charging";
            } else {
                battStatus.innerText = "Battery Status: On Battery";
            }
        }
        const appListContainer = document.querySelector('#list-of-apps');
        if (appListContainer && data.apps) {
            let html = '';
            Object.entries(data.apps).forEach(([name, mem], index) => {
                let colorClass = mem > 500 ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-green-500/20 text-green-400 border-green-500/50";

                html += `
            <div class="app-item flex justify-between items-center bg-diagnOS-card p-5 rounded-xl border border-diagnOS-border shadow-md">
                <span class="text-xl text-diagnOS-text font-medium">${index + 1}. ${name}</span>
                <span class="badge ${colorClass} border px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                    ${Math.round(mem)} MB
                </span>
            </div>`;
            });
            appListContainer.innerHTML = html;
        }
    }
}
window.onload = () => {
    navigateTo('overall');
};
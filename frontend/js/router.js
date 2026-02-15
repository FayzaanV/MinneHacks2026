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

    if (data.disk !== undefined) {
        const storageText = document.getElementById('storage-percent-text');
        if (storageText) {
            storageText.innerText = Math.round(data.disk) + "% Used";
        }
        const storageBar = document.getElementById('storage-bar');
        if (storageBar) {
            storageBar.style.width = data.disk + "%";
            
            // Optional: Turn Red if drive is full (> 90%)
            if (data.disk > 90) {
                storageBar.classList.remove('bg-diagnOS-light');
                storageBar.classList.add('bg-red-500');
            }
        }
    }

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
            } else {
                battBar.classList.add('bg-diagnOS-light');
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
    }
    const appListContainer = document.querySelector('#list-of-apps');
    if (appListContainer && data.apps) {
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
            <div class="app-item flex justify-between items-center bg-diagnOS-card p-5 rounded-xl border border-diagnOS-border shadow-md">
                <span class="text-xl text-diagnOS-text font-medium">${name}</span>
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
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

    if (data.ram !== undefined) {
        const ramText = document.getElementById('ram-text');
        const ramNeedle = document.getElementById('ram-needle');
        if (ramNeedle && ramText) {
            ramText.innerText = Math.round(data.ram) + "%";
            const degrees = (data.ram * 1.8) - 90;
            ramNeedle.style.transform = `rotate(${degrees}deg)`;
            ramNeedle.classList.remove('bg-diagnOS-light', 'bg-red-500', 'bg-yellow-500');
            ramText.classList.remove('text-white', 'text-red-500', 'text-yellow-500');
            if (data.ram > 90) {
                ramNeedle.classList.add('bg-red-500');
                ramText.classList.add('text-red-500');
            } else {
                ramNeedle.classList.add('bg-diagnOS-light');
                ramText.classList.add('text-white');
            }
        }
    }

    if (data.cpu !== undefined) {
        const cpuText = document.getElementById('cpu-text');
        if (cpuText) {
            cpuText.innerText = Math.round(data.cpu) + "%";
        }
        const cpuNeedle = document.getElementById('cpu-needle');
        if (cpuNeedle) {
            const degrees = (data.cpu * 1.8) - 90;
            cpuNeedle.style.transform = `rotate(${degrees}deg)`;
            cpuNeedle.classList.remove('bg-diagnOS-light', 'bg-red-500', 'bg-yellow-500');
            cpuText.classList.remove('text-white', 'text-red-500', 'text-yellow-500');
            if (data.cpu > 90) {
                cpuNeedle.classList.add('bg-red-500');
                cpuNeedle.classList.add('txt-red-500');
            } else if (data.cpu > 70) {
                cpuNeedle.classList.add('bg-yellow-500');
                cpuNeedle.classList.add('txt-yellow-500');
            } else {
                cpuNeedle.classList.add('bg-diagnOS-light');
                cpuNeedle.classList.add('txt-white');
            }
        }
    }

    if (data.disk !== undefined) {
        const storageText = document.getElementById('storage-percent-text');
        if (storageText) {
            storageText.innerText = Math.round(data.disk) + "% Used";
        }
        const storageBar = document.getElementById('storage-bar');
        if (storageBar) {
            storageBar.style.width = data.disk + "%";
            if (data.disk > 90) {
                storageBar.classList.remove('bg-diagnOS-light');
                storageBar.classList.add('bg-red-500');
            }
        }
    }

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

    const alerts = await eel.get_alerts()();
    updateRecommendations(alerts);
}

function updateRecommendations(alerts) {
    const container = document.getElementById('list-of-recs');
    if (!container) return;

    // If no alerts, show a "Healthy" message
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-32 bg-green-500/10 rounded-xl border border-green-500/30">
                <div class="text-center">
                    <div class="text-4xl mb-2">✅</div>
                    <span class="text-green-400 font-bold">System Healthy</span>
                    <p class="text-sm text-green-500/70">No actions needed</p>
                </div>
            </div>`;
        return;
    }

    // If alerts exist, build the HTML
    let html = '';
    alerts.forEach(alert => {
        // Choose colors: Red for Danger, Yellow for Warning
        const isDanger = alert.type === 'danger';
        const borderClass = isDanger ? 'border-red-500/50' : 'border-yellow-500/50';
        const bgClass = isDanger ? 'bg-red-500/10' : 'bg-yellow-500/10';
        const textClass = isDanger ? 'text-red-400' : 'text-yellow-400';
        const icon = isDanger ? '🔥' : '⚠️';

        html += `
        <div class="rec-item flex justify-between items-center p-5 rounded-xl border shadow-md ${bgClass} ${borderClass}">
            <div class="flex flex-col">
                <span class="text-xl font-bold ${textClass} flex items-center gap-2">
                    ${icon} ${alert.title}
                </span>
                <span class="text-sm text-gray-400 mt-1">${alert.message}</span>
            </div>
            
            <button class="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white border border-gray-600 transition-colors">
                Fix
            </button>
        </div>`;
    });

    container.innerHTML = html;
}

window.onload = () => {
    navigateTo('overall');
};
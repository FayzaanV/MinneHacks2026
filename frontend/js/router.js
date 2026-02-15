let dashboardInterval = null;

async function navigateTo(viewName) {
    try {
        // 1. Stop any running timer from the previous page
        if (dashboardInterval) {
            clearInterval(dashboardInterval);
            dashboardInterval = null;
        }

        const response = await fetch(`./views/${viewName}.html`);
        const html = await response.text();
        const container = document.getElementById('content-area') || document.getElementById('view-container');
        container.innerHTML = html;

        // 2. If we are on the 'overall' page, start the loop
        if (viewName === 'overall') {
            // Run immediately once
            await getOverallData();
            
            // Then run every 5 seconds (5000 ms)
            dashboardInterval = setInterval(getOverallData, 5000);
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

    // 1. CLEAR STATE (If no alerts)
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-48 bg-green-500/10 rounded-xl border border-green-500/30 p-6 text-center">
                <div class="text-4xl mb-3">✅</div>
                <h3 class="text-green-400 font-bold text-lg">System is Healthy</h3>
                <p class="text-sm text-green-500/70 max-w-xs">Your hardware is operating within optimal parameters. No actions required.</p>
            </div>`;
        return;
    }

    // 2. BUILD ALERTS HTML
    let html = '';
    alerts.forEach(alert => {
        const isDanger = alert.type === 'danger';
        
        // Dynamic Styling
        const borderClass = isDanger ? 'border-red-500/50' : 'border-yellow-500/50';
        const bgClass = isDanger ? 'bg-red-500/5' : 'bg-yellow-500/5'; // Lower opacity for background
        const titleColor = isDanger ? 'text-red-400' : 'text-yellow-400';
        const icon = isDanger ? '🔥' : '⚡';

        // Generate the List Items (<li>)
        const stepsHtml = alert.steps.map(step => 
            `<li class="text-gray-400 text-sm mb-1 list-disc list-inside">${step}</li>`
        ).join('');

        html += `
        <div class="rec-item flex flex-col p-5 rounded-xl border shadow-lg ${bgClass} ${borderClass} mb-4">
            
            <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">${icon}</span>
                <h3 class="text-xl font-bold ${titleColor} uppercase tracking-wide">${alert.title}</h3>
            </div>

            <p class="text-sm text-gray-300 italic mb-4 border-l-2 ${isDanger ? 'border-red-500/30' : 'border-yellow-500/30'} pl-3">
                "${alert.why}"
            </p>

            <div class="bg-black/20 rounded-lg p-3">
                <span class="text-xs font-bold text-gray-500 uppercase block mb-2">Recommended Actions:</span>
                <ul class="space-y-1">
                    ${stepsHtml}
                </ul>
            </div>
            
        </div>`;
    });

    container.innerHTML = html;
}

window.onload = () => {
    navigateTo('overall');
};
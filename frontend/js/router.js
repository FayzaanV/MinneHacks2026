let updateInterval = null; 
let activeAlerts = []; 

async function navigateTo(viewName) {
    try {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        const response = await fetch(`./views/${viewName}.html`);
        const html = await response.text();
        const container = document.getElementById('content-area') || document.getElementById('view-container');
        container.innerHTML = html;
        if (viewName === 'overall') {
            await getOverallData();
            updateInterval = setInterval(getOverallData, 3000);
        } 
        else if (viewName === 'advanced') {
            await getAdvancedData();
            updateInterval = setInterval(getAdvancedData, 30000);
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

    const incomingAlerts = await eel.get_alerts()();
    incomingAlerts.forEach(incoming => {
        const exists = activeAlerts.some(a => a.title === incoming.title);
        if (!exists) {
            activeAlerts.push(incoming);
        }
    });

    updateRecommendations();
}

function updateRecommendations() {
    const container = document.getElementById('list-of-recs');
    if (!container) return;
    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center flex-col justify-center h-32 bg-green-500/10 rounded-xl border border-green-500/30">
                <span class="text-green-400 font-bold tracking-wide">System Healthy</span>
                <span class="text-green-700 font-light txt-sm">No action needed</span>
            </div>`;
        return;
    }
    
    let html = '';
    activeAlerts.forEach((alert, index) => {
        const isDanger = alert.type === 'danger';
        const colorClass = isDanger ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10';
        const titleColor = isDanger ? 'text-red-400' : 'text-yellow-400';
        const accentBar = isDanger ? 'border-red-500/30' : 'border-yellow-500/30';
        
        const stepsHtml = alert.steps.map(step => 
            `<li class="text-gray-400 text-sm list-disc list-inside">${step}</li>`
        ).join('');

        html += `
        <div class="rec-item relative flex flex-col p-5 rounded-xl border shadow-lg ${colorClass} mb-4">
            <button onclick="dismissAlert(${index})" class="absolute top-2 right-4 text-gray-500 hover:text-white text-2xl font-light transition-colors">&times;</button>
            
            <div class="flex items-center mb-2">
                <h3 class="text-xl font-bold ${titleColor} uppercase tracking-wide">${alert.title}</h3>
            </div>

            <p class="text-sm text-gray-300 italic mb-4 border-l-2 ${accentBar} pl-3">
                "${alert.why}"
            </p>

            <div class="bg-black/20 rounded-lg p-3">
                <span class="text-[10px] font-bold text-gray-500 uppercase block mb-2 tracking-widest">Resolution Steps</span>
                <ul class="space-y-1">
                    ${stepsHtml}
                </ul>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

async function getAdvancedData() {
    // Pull the dataLog array from advanced.py
    const history = await eel.get_history_data()();
    const listContainer = document.getElementById('history-list');
    
    if (!listContainer) return;

    if (!history || history.length === 0) {
        listContainer.innerHTML = `<div class="text-gray-500 italic p-4">Waiting for data collection thread...</div>`;
        return;
    }

    let html = '';
    // reverse() so the newest data appears at the top
    [...history].reverse().forEach(entry => {
        const temp = entry.Temperature ? `${entry.Temperature}°C` : "N/A";
        const tempColor = entry.Temperature > 85 ? 'text-red-400' : 'text-green-400';

        html += `
        <div class="flex justify-between items-center bg-diagnOS-card p-4 rounded-xl border border-diagnOS-border mb-3 shadow-sm">
            <div class="flex flex-col">
                <span class="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Timestamp</span>
                <span class="text-white font-medium">${entry.Time}</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-[10px] text-gray-400 uppercase">Battery</span>
                <span class="text-diagnOS-light font-bold">${entry.Percent}%</span>
            </div>
            <div class="flex flex-col items-end">
                <span class="text-[10px] text-gray-400 uppercase">Temp</span>
                <span class="${tempColor} font-bold">${temp}</span>
            </div>
        </div>`;
    });

    listContainer.innerHTML = html;
}

// Attach to window so the HTML 'onclick' can find it
window.dismissAlert = function(index) {
    activeAlerts.splice(index, 1);
    updateRecommendations();
};

// This fires as soon as the browser window finishes loading
window.addEventListener('DOMContentLoaded', () => {
    // Force the app to load the dashboard immediately
    navigateTo('overall');
});
let updateInterval = null; 
let activeAlerts = []; 

// This function connects each sidebar button to it's respective page and enables navigation
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

// This function populates the overall.html page with a summary of the most important computer data
async function getOverallData() {
    const data = await eel.get_overall_data()();

    // Get RAM data
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

    // Get CPU data
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

    // Get HD data
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

    // Get battery data
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

    // Get top three apps
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

    // Each time we update the data look if the criteria are met for an alert and add it to the list
    const incomingAlerts = await eel.get_alerts()();
    incomingAlerts.forEach(incoming => {
        const exists = activeAlerts.some(a => a.title === incoming.title);
        if (!exists) {
            activeAlerts.push(incoming);
        }
    });

    updateRecommendations();
}

// Check if there is any alert and display the appropriate cause and responses
function updateRecommendations() {
    const container = document.getElementById('list-of-recs');
    if (!container) return;
    // If no alerts, show that everything is good
    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center flex-col justify-center h-32 bg-green-500/10 rounded-xl border border-green-500/30">
                <span class="text-green-400 font-bold tracking-wide">System Healthy</span>
                <span class="text-green-700 font-light txt-sm">No action needed</span>
            </div>`;
        return;
    }

    // Style depending onf class of the alert
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

// Gets advanced data from the separate python file and displays it in the advanced section of the application
async function getAdvancedData() {
    const data = await eel.get_advanced_data()();
    const historyContainer = document.getElementById('history-list');
    if (historyContainer && data.history) {
        let historyHtml = '';
        [...data.history].reverse().forEach(entry => {
            historyHtml += `
            <div class="flex justify-between items-center bg-diagnOS-card p-4 rounded-xl border border-diagnOS-border shadow-sm">
                <span class="text-xs text-gray-500 font-mono">${entry.Time}</span>
                <span class="text-white font-bold">${entry.Percent}%</span>
                <span class="text-red-400 text-sm">${entry.Temperature || '--'}°C</span>
            </div>`;
        });
        historyContainer.innerHTML = historyHtml;
    }

    // Show top ten apps
    const appContainer = document.getElementById('top-ten-list');
    if (appContainer && data.top_apps) {
        let appHtml = '';
        data.top_apps.forEach((app, index) => {
            appHtml += `
            <div class="flex justify-between items-center bg-black/20 p-3 rounded-lg border-l-4 border-diagnOS-light">
                <div class="flex items-center gap-3">
                    <span class="text-gray-500 font-bold text-xs w-4">${index + 1}</span>
                    <span class="text-white text-sm truncate max-w-[150px]">${app.name}</span>
                </div>
                <span class="text-diagnOS-light font-mono text-xs font-bold">${app.mem} MB</span>
            </div>`;
        });
        appContainer.innerHTML = appHtml;
    }
}

// Code for the manual refresh button to add a new timestamp for the battery and temperature tracker
window.manualRefresh = async function() {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = "LOGGING...";
    btn.disabled = true;

    try {
        await eel.force_log_entry()();
        await getAdvancedData(); 

    } catch (error) {
        console.error("Manual refresh failed:", error);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// Enables user to dismiss alerts once they have been resolved
window.dismissAlert = function(index) {
    activeAlerts.splice(index, 1);
    updateRecommendations();
};

// Automatically loads overall.html on launch
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('overall');
});
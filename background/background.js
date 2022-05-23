try {
    const url = 'https://tab-sync-backend.vercel.app'
    chrome.alarms.create("sync_tabs", { periodInMinutes: 5 })

    async function updateLocalBrowserTabs(auth_token) {
        const device = {
            name: (await chrome.storage.local.get(['device_name'])).device_name, chromeSession: {
                tabGroups: await chrome.tabGroups.query({}), windows: await chrome.windows.getAll({ populate: true })
            }
        }

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded")

        const urlencoded = new URLSearchParams();
        urlencoded.append("device", JSON.stringify(device))

        const requestOptions = {
            method: 'POST', headers: myHeaders, body: urlencoded, redirect: 'follow'
        }

        fetch(`${url}/${auth_token}`, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }

    async function updateRemoteBrowserTabs(auth_token) {
        fetch(`${url}/${auth_token}`, { method: 'GET' })
            .then(response => response.json())
            .then(async result => {
                const devices = result.devices

                devices.map(device => {
                    device.chromeSession.windows.map(window => {
                        window.tabs = window.tabs.filter(tab => !devices.find(device => device.name === device.name).closedTabs.includes(tab.id))
                    })
                })
                chrome.storage.local.set({ devices })

                const device_name = (await chrome.storage.local.get(['device_name'])).device_name
                devices.find(device => device.name === device_name).closedTabs.map(tab => {
                    chrome.tabs.remove(tab)
                })

                fetch(`${url}/${auth_token}/${device_name}/closedTabs`, { method: 'DELETE' })
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
            })
            .catch(error => console.log('error', error));
    }

    async function update() {
        const auth_token = (await chrome.storage.local.get(['auth_token'])).auth_token
        if (!auth_token) return
        updateLocalBrowserTabs(auth_token)
        updateRemoteBrowserTabs(auth_token)
    }

    chrome.alarms.onAlarm.addListener(e => {
        if (e.name === "sync_tabs") update()
    })

    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if (msg === 'sync_tabs') {
            update()
            sendResponse('OK')
        }
    })

} catch (e) {
    console.log(e)
}
try {
    const url = 'https://tab-sync-backend.vercel.app'
    chrome.alarms.create('sync_tabs', { periodInMinutes: 5 })

    async function getYoutubeTimestamp(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId)
            if (tab.status !== 'complete') {
                return null
            }

            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        const videoElement = document.querySelector('video')
                        if (videoElement && !isNaN(videoElement.currentTime)) {
                            const time = Math.floor(videoElement.currentTime)
                            return time
                        } else {
                            return null
                        }
                    } catch (err) {
                        return null
                    }
                }
            })

            return results?.[0]?.result || null
        } catch (err) {
            return null
        }
    }

    async function processYoutubeTabs(windows) {
        let youtubeTabsCount = 0
        let updatedTabsCount = 0

        for (const window of windows) {
            for (const tab of window.tabs) {
                if (tab.url && tab.url.includes('youtube.com/watch')) {
                    youtubeTabsCount++
                    try {
                        const timestamp = await getYoutubeTimestamp(tab.id)

                        if (timestamp && timestamp > 0) {
                            const tabUrl = new URL(tab.url)
                            tabUrl.searchParams.delete('t')
                            tabUrl.searchParams.set('t', timestamp)
                            tab.url = tabUrl.toString()
                            updatedTabsCount++
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        }

        return windows
    }

    async function updateLocalBrowserTabs(auth_token) {
        let windows = await chrome.windows.getAll({ populate: true })
        windows = await processYoutubeTabs(windows)

        const device = {
            name: (await chrome.storage.local.get(['device_name'])).device_name,
            chromeSession: {
                tabGroups: await chrome.tabGroups.query({}),
                windows: windows
            }
        }

        const myHeaders = new Headers()
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

        const urlencoded = new URLSearchParams()
        urlencoded.append('device', JSON.stringify(device))

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        }

        fetch(`${url}/${auth_token}`, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error))
    }

    async function updateRemoteBrowserTabs(auth_token) {
        fetch(`${url}/${auth_token}`, { method: 'GET' })
            .then(response => response.json())
            .then(async result => {
                const devices = result.devices

                devices.map(device => {
                    device.chromeSession.windows.map(window => {
                        window.tabs = window.tabs.filter(
                            tab =>
                                !devices
                                    .find(
                                        currentDevice =>
                                            currentDevice.name === device.name
                                    )
                                    .closedTabs.includes(tab.id)
                        )
                    })
                })
                chrome.storage.local.set({ devices })

                const device_name = (
                    await chrome.storage.local.get(['device_name'])
                ).device_name
                devices
                    .find(device => device.name === device_name)
                    .closedTabs.map(tab => {
                        chrome.tabs.remove(tab)
                    })

                fetch(`${url}/${auth_token}/${device_name}/closedTabs`, {
                    method: 'DELETE'
                })
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error))
            })
            .catch(error => console.log('error', error))
    }

    async function update() {
        const auth_token = (await chrome.storage.local.get(['auth_token']))
            .auth_token
        if (!auth_token) return
        updateLocalBrowserTabs(auth_token)
        updateRemoteBrowserTabs(auth_token)
    }

    chrome.alarms.onAlarm.addListener(e => {
        if (e.name === 'sync_tabs') update()
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

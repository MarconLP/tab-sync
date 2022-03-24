/*global chrome*/
import './App.css';
import * as React from 'react';
import {useEffect, useState} from "react";
import TabList from "./components/TabList";
import DeviceList from "./components/DeviceList";

function App() {
    const [view, setView] = useState(0)
    const [devices, setDevices] = useState(null)

    const syncTabs = async () => {
        let data = {
            name: (await chrome.storage.local.get(['device_name'])).device_name,
            chromeSession: {
                tabGroups: await chrome.tabGroups.query({}),
                windows: await chrome.windows.getAll({ populate: true })
            }
        }
        let devices = []

        await chrome.storage.local.get(['devices']).then(x => {
            if (!x.devices) return
            devices = x.devices.filter(x => x.name !== data.name)
        })

        setDevices([data, ...devices])
    }

    chrome.storage.onChanged.addListener(changes => {
        if (changes.devices) {
            console.log(changes.devices)
            syncTabs()
        }
    })

    chrome.tabGroups.onUpdated.addListener(change => {
        let localDevices = devices
        if (!localDevices) return

        localDevices[0].chromeSession.tabGroups.find(x => x.id === change.id).collapsed = change.collapsed
        setDevices([...localDevices])
    })

    useEffect(() => {
        syncTabs()
    }, [])

    if (!devices) return <div className="App">loading</div>
    return (
        <div className="App">
            <DeviceList devices={devices} setView={setView} view={view} />
            <div className="windowList">
                {devices.map(device => {
                    return (
                        <div className="windows" key={device.name} style={{transform: `translateX(-${view * 368}px)`}}>
                            {device.chromeSession.windows.map(window => {
                                return <TabList
                                    window={window}
                                    tabGroups={device.chromeSession.tabGroups}
                                    key={window.id} />
                            })}
                            <TabList />
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default App;

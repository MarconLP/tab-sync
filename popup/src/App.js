/*global chrome*/
import './App.css';
import * as React from 'react';
import {useEffect, useState} from "react";
import TabList from "./components/TabList";

function App() {
    const [view, setView] = useState(0)
    const [devices, setDevices] = useState(null)

    useEffect(async () => {
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

        devices = [data, ...devices]
        setDevices({devices: devices})
    }, [])

    if (!devices) return <div className="App">loading</div>
    return (
        <div className="App">
            <div className="devices">
                {devices.devices.map((device, i) => {
                    return (
                        <div
                            key={device.name}
                            onClick={() => setView(i)}
                            className={`${i === view ? 'active-device' : ''}`}>
                            <span>{device.name}</span>
                        </div>
                    )
                })}
            </div>
            <div className="deviceList">
                {devices.devices.map(device => {
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

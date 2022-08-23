/*global chrome*/
import axios from 'axios'
import { ReactComponent as RotateIcon } from '../assets/rotate.svg'
import { useState } from 'react'

function DeviceList(props) {
    const [rotating, setRotating] = useState(false)

    const handleDelete = async (e, device) => {
        if (!(e.shiftKey && e.altKey)) return

        const token = (await chrome.storage.local.get(['auth_token']))
            .auth_token

        await axios({
            url: `${process.env.REACT_APP_BACKEND_HOST}/${token}`,
            method: 'DELETE',
            data: {
                name: device.name
            }
        })
    }

    const handleSync = () => {
        if (rotating) return
        setRotating(true)
        setTimeout(() => setRotating(false), 1000)

        chrome.runtime.sendMessage('sync_tabs')
    }

    return (
        <div className="deviceList">
            <div className="devices">
                {props.devices.map((device, i) => {
                    return (
                        <div
                            onContextMenu={e => handleDelete(e, device)}
                            key={device.name}
                            onClick={() => props.setView(i)}
                            className={`${
                                i === props.view ? 'active-device' : ''
                            }`}
                        >
                            <span>{device.name}</span>
                        </div>
                    )
                })}
            </div>
            <div className={`sync`} onClick={handleSync}>
                <RotateIcon className={`icon ${rotating ? 'rotate' : ''}`} />
            </div>
        </div>
    )
}

export default DeviceList

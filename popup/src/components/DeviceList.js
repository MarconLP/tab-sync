/*global chrome*/
import axios from "axios";

function DeviceList(props) {
    const handleDelete = async (e, device) => {
        if (!(e.shiftKey && e.altKey)) return

        const token = (await chrome.storage.local.get(['auth_token'])).auth_token

        await axios({
            url: `http://localhost:3000/${token}`,
            method: 'DELETE',
            data: {
                name: device.name
            }
        })
    }

    return (
        <div className="devices">
            {props.devices.devices.map((device, i) => {
                return (
                    <div
                        onContextMenu={(e) => handleDelete(e, device)}
                        key={device.name}
                        onClick={() => props.setView(i)}
                        className={`${i === props.view ? 'active-device' : ''}`}>
                        <span>{device.name}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default DeviceList
function DeviceList(props) {
    return (
        <div className="devices">
            {props.devices.devices.map((device, i) => {
                return (
                    <div
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
import Tab from './Tab'

function TabList(props) {
    if (!props.window) return null

    let lastGroupId = ''

    return (
        <div className="tabs">
            {props.window.tabs.map(tab => {
                const isParent = tab.groupId !== lastGroupId
                lastGroupId = tab.groupId
                return (
                    <Tab
                        deviceName={props.deviceName}
                        devices={props.devices}
                        setDevices={props.setDevices}
                        isParent={isParent}
                        tab={tab}
                        tabGroups={props.tabGroups}
                        view={props.view}
                        key={tab.id}
                    />
                )
            })}
        </div>
    )
}

export default TabList

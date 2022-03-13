import Tab from "./Tab";

function TabList(props) {
    if (!props.window) return null
    return (
        <div className="tabs">
            {props.window.tabs.map(tab => (
                <Tab tab={tab} tabGroups={props.tabGroups} key={tab.id} />
            ))}
        </div>
    )
}

export default TabList
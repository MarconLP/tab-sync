/* global chrome */
import {ReactComponent as CloseIcon} from "../assets/xmark.svg";
import * as React from "react";

function Tab(props) {
    const {title, url, groupId, favIconUrl} = props.tab
    let tabGroup = props.tabGroups.find(x => x.id === props.tab.groupId)
    if (!tabGroup) tabGroup = {}

    const handleClick = () => {
        chrome.tabs.create({
            url: url
        })
    }

    const toggleTabGroup = e => {
        e.stopPropagation()
        chrome.tabGroups.update(tabGroup.id, { collapsed: !tabGroup.collapsed})
    }

    const colorMap = {
        grey: '#606468',
        blue: '#1b72e8',
        red: '#db3025',
        yellow: '#faab00',
        green: '#168138',
        pink: '#cf1783',
        purple: '#a142f3',
        cyan: '#037b83',
        orange: '#f9903e'
    }

    let color = ''
    if (props.tab.groupId > 0 && props.isParent) {
        color = colorMap[tabGroup.color]
    }

    const childrenDisplay = tabGroup.collapsed && !props.isParent ? 'none' : ''
    const parentDisplay = tabGroup.collapsed && props.isParent ? 'none' : ''
    return (
        <div key={props.tab.id} onClick={handleClick} className="tab" style={{display: childrenDisplay}}>
            <div>
                <div className={`${groupId > 0 ? 'tab-group' : ''}`}>
                    <div
                        className={props.isParent ? 'parent' : ''}
                        onClick={toggleTabGroup}
                        style={{ background: color }}> </div>
                </div>
                <img
                    src={favIconUrl ? favIconUrl : 'https://www.google.com/chrome/static/images/favicons/favicon-32x32.png'}
                    className="favicon"
                    loading="lazy"
                    alt="test"
                    style={{display: parentDisplay}} />
                <span className="title">{tabGroup.collapsed && props.isParent ? '< ... >' : title}</span>
            </div>
            <div>
                <CloseIcon />
            </div>
        </div>
    )
}

export default Tab
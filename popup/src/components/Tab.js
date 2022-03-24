/* global chrome */
import {ReactComponent as CloseIcon} from "../assets/xmark.svg";
import * as React from "react";

function Tab(props) {
    const {title, url, groupId, favIconUrl} = props.tab

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
        color = colorMap[props.tabGroups.find(x => x.id === props.tab.groupId).color]
    }

    return (
        <div key={props.tab.id} className="tab">
            <div>
                <div className={`${groupId > 0 ? 'tab-group' : ''}`}>
                    <div className={props.isParent ? 'parent' : ''} style={{background: color}}> </div>
                </div>
                <img
                    src={favIconUrl ? favIconUrl : 'https://www.google.com/chrome/static/images/favicons/favicon-32x32.png'}
                    className="favicon"
                    loading="lazy"
                    alt="test"/>
                <span className="title">{title}</span>
            </div>
            <div>
                <CloseIcon />
            </div>
        </div>
    )
}

export default Tab
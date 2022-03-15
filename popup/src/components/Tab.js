/*global chrome*/
import {ReactComponent as CloseIcon} from "../assets/xmark.svg";
import * as React from "react";

function Tab(props) {
    const {title, url, groupId, favIconUrl} = props.tab

    const handleClick = () => {
        chrome.tabs.create({
            url: url
        })
    }

    return (
        <div key={props.tab.id} onClick={handleClick}>
            <div>
                {/*<span>group</span>*/}
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
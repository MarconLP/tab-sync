/* global chrome */
import { ReactComponent as CloseIcon } from '../assets/xmark.svg'
import * as React from 'react'
import axios from 'axios'

function Tab(props) {
    const { title, url, id, groupId, favIconUrl } = props.tab
    let tabGroup = props.tabGroups.find(x => x.id === props.tab.groupId)
    if (!tabGroup) tabGroup = {}

    const handleClick = async () => {
        // check if tab is in closed tabGroup
        if (groupId && tabGroup.collapsed) {
            const urls = props.tabs
                .filter(tab => tab.groupId === tabGroup.id)
                .map(tab => tab.url)

            const tabIds = []
            for (const url of urls) {
                const tab = await chrome.tabs.create({ url })
                tabIds.push(tab.id)
            }

            const groupId = await chrome.tabs.group({ tabIds: tabIds })
            await chrome.tabGroups.update(groupId, {
                collapsed: false,
                title: tabGroup.title,
                color: tabGroup.color
            })
            return
        }

        chrome.tabs.create({
            url: url
        })
    }

    const toggleTabGroup = async e => {
        e.stopPropagation()

        // check if tab is local or remote
        if (props.view === 0) {
            chrome.tabGroups.update(tabGroup.id, {
                collapsed: !tabGroup.collapsed
            })
        } else {
            let devices = props.devices
            devices[props.view].chromeSession.tabGroups.find(
                x => x.id === tabGroup.id
            ).collapsed = !devices[props.view].chromeSession.tabGroups.find(
                x => x.id === tabGroup.id
            ).collapsed
            props.setDevices([...devices])
        }
    }

    const closeTab = async e => {
        e.stopPropagation()

        // check if tab is local or remote
        if (props.view === 0) {
            chrome.tabs.remove(id)
        } else {
            const auth_token = (await chrome.storage.local.get(['auth_token']))
                .auth_token
            const response = axios({
                url: `${process.env.REACT_APP_BACKEND_HOST}/${auth_token}/${props.deviceName}`,
                method: 'DELETE',
                data: { tabIds: [id] }
            })

            const devices = props.devices
            let closedTabs = devices.find(
                device => device.name === props.deviceName
            ).closedTabs
            closedTabs.push(id)
            devices.map(device => {
                device.chromeSession.windows.map(window => {
                    window.tabs = window.tabs.filter(
                        tab => !closedTabs.includes(tab.id)
                    )
                })
            })
            chrome.storage.local.set({ devices })
        }
    }

    const closeTabGroup = async e => {
        e.stopPropagation()

        // check if tab is local or remote
        if (props.view === 0) {
            const groupTabs = await chrome.tabs.query({ groupId })
            await chrome.tabs.remove(groupTabs.map(t => t.id))
        } else {
            const auth_token = (await chrome.storage.local.get(['auth_token']))
                .auth_token
            let groupTabs = []
            props.devices
                .find(device => device.name === props.deviceName)
                .chromeSession.windows.map(window =>
                    window.tabs.map(tab => {
                        if (tab.groupId === groupId) {
                            groupTabs.push(tab.id)
                        }
                    })
                )

            const response = axios({
                url: `${process.env.REACT_APP_BACKEND_HOST}/${auth_token}/${props.deviceName}`,
                method: 'DELETE',
                data: { tabIds: groupTabs }
            })

            const devices = props.devices
            let closedTabs = devices.find(
                device => device.name === props.deviceName
            ).closedTabs
            closedTabs = [...closedTabs, ...groupTabs]
            devices.map(device => {
                device.chromeSession.windows.map(window => {
                    window.tabs = window.tabs.filter(
                        tab => !closedTabs.includes(tab.id)
                    )
                })
            })
            chrome.storage.local.set({ devices })
        }
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

    let tabTitle = '< ... >'
    if (tabGroup.title) tabTitle = tabGroup.title

    const childrenDisplay = tabGroup.collapsed && !props.isParent ? 'none' : ''
    const parentDisplay = tabGroup.collapsed && props.isParent ? 'none' : ''
    return (
        <div
            key={props.tab.id}
            onClick={handleClick}
            className="tab"
            style={{ display: childrenDisplay }}
        >
            <div>
                <div className={`${groupId > 0 ? 'tab-group' : ''}`}>
                    <div
                        className={props.isParent ? 'parent' : ''}
                        onClick={toggleTabGroup}
                        style={{ background: color }}
                    ></div>
                </div>
                <img
                    src={
                        favIconUrl
                            ? favIconUrl
                            : 'https://www.google.com/chrome/static/images/favicons/favicon-32x32.png'
                    }
                    className="favicon"
                    loading="lazy"
                    alt="test"
                    style={{ display: parentDisplay }}
                />
                <span className="title">
                    {tabGroup.collapsed && props.isParent ? tabTitle : title}
                </span>
            </div>
            <div onClick={tabGroup.collapsed ? closeTabGroup : closeTab}>
                <CloseIcon />
            </div>
        </div>
    )
}

export default Tab

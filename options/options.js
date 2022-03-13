document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('options_form')

    form.addEventListener('submit', e => {
        e.preventDefault();
        chrome.storage.local.set({auth_token: e.target[0].value}, () => {});
        chrome.storage.local.set({device_name: e.target[1].value}, () => {});
    })

    chrome.storage.local.get(['auth_token'], x => form[0].value = x.auth_token)
    chrome.storage.local.get(['device_name'], x => form[1].value = x.device_name)
})

export async function fetchWithAuth(url, options) {
    let res = await fetch(url, options);
    if (res.status === 401) 
    {
        await fetch('/Auth/Refresh', 
        {
            credentials: "same-origin"
        });
        res = await fetch(url, options);
    }
    return res
}
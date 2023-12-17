<script>
    import { onMount } from 'svelte';
    import { fetchWithAuth } from '$lib/fetch-refresh.js'

    let promise = GetChats();
    let userId;
    let selectedChat;
    let messages = []
    let inputField;
    let modalInputField;
    let modalInputField2;
    let mode = 0;
    let modal1Visible = false;
    let modal2Visible = false;

    onMount(async () => {
        const res = await fetchWithAuth('/User.Get', {
            credentials: "same-origin"
        })
        
		if (res.ok) {
            const obj = await res.json()
            userId = obj.userId
            startWs();
        } else {
            window.location.href = '/login';
        }
	});

    function startWs() {
        let socket = new WebSocket("/ws");

        socket.onmessage = function(event) {
            let obj = JSON.parse(event.data)
            console.log(obj)
            console.log('Selected: ')
            console.log(selectedChat.id);
            if (obj.chatId === selectedChat.id) {
                console.log("push")
                messages = [obj, ...messages]
                console.log(messages)
            }
        };

        socket.onclose = function(e) {
            console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
            setTimeout(function() {
                connect();
            }, 1000);
        };

        socket.onerror = function(err) {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            socket.close();
        };
    }

    async function AddUser() {
        let formData = new FormData();
        let text = modalInputField2.value
        modalInputField2.value = ''
        modal2Visible = false;
        
        formData.append('chatId', selectedChat.id);
        formData.append('name', text);

        const res = await fetchWithAuth('/Chat.AddUserToChatByName', {
            credentials: "same-origin",
            method: "POST",
            body: formData
        })    
    }

    async function GetChats() {
        const res = await fetchWithAuth('/Chat.GetUserChats', {
            credentials: "same-origin"
        })
        const obj = await res.json()
        console.log(obj)
        return obj;
    }

    async function GetMessages() {
        const res = await fetchWithAuth(`/Chat.GetChatMessages?chatId=${selectedChat.id}`, {
            credentials: "same-origin"
        })
        let msgs = await res.json()     
        msgs.reverse()
        messages = msgs
        console.log(messages)
    }

    async function SendMessage(){
        let formData = new FormData();
        let text = inputField.value
        inputField.value = ''

        formData.append('chatId', selectedChat.id);
        formData.append('text', text);

        const res = await fetchWithAuth('/Chat.SendChatMessage', {
            credentials: "same-origin",
            method: "POST",
            body: formData
        })    

    }

    async function Logout() {
        const res = await fetchWithAuth('/Auth/Logout', {
            credentials: "same-origin"
        })
        window.location.href = '/login';
    }

    async function CreateChat() {
        modal1Visible = false;
        let value = modalInputField.value;
        modalInputField.value = '';
        const response = await fetchWithAuth('/Chat.CreateChat', {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: value,
            })
        });
        promise = GetChats();
    }

</script>

<div class="create-chat-modal" style="{modal1Visible ? "display: flex;" : "display: none;"}">
    <div class="create-chat-modal__container">
        <form on:submit={CreateChat}>
            <h2>Создание чата</h2>
            <input type="text" class="create-chat-modal__text" placeholder="Название чата..." bind:this={modalInputField}>
            <button type="submit" class="btn" style="width: 100%;">Создать</button>
        </form>
    </div>
</div>

<div class="create-chat-modal" style="{modal2Visible ? "display: flex;" : "display: none;"}">
    <div class="create-chat-modal__container">
        <form on:submit={AddUser}>
            <h2>Добавление кого нибудь</h2>
            <input type="text" class="create-chat-modal__text" placeholder="Имя..." bind:this={modalInputField2}>
            <button type="submit" class="btn" style="width: 100%;">Добавить</button>
        </form>
    </div>
</div>

<div class="app">
    <div class="left-panel" style="{mode == 1 ? 'display: flex;' : ''}">
        <div class="chat-list">
            <h2>Чаты</h2>
            {#await promise}
                <p>Loading...</p>
            {:then chats} 
                {#each chats as chat}            
                    <button 
                        class="chat-list__item" 
                        on:click={() => { selectedChat = chat; GetMessages(); mode = 0; } } 
                        aria-current="{selectedChat === chat}">
                        <div class="chat-list__icon">
                            {chat.name[0]}
                        </div>
                        <div class="chat-list__name">
                            {chat.name}
                        </div>
                    </button>
                {/each}
            {:catch error}
                <p style="color: red">Error: {error.message}</p>
            {/await}
        </div>
        <button class="btn create-chat-btn" on:click={() => modal1Visible = true}>Создать чат</button>
        <button class="btn logout-btn" on:click={Logout}>Выйти</button>
    </div>
    <div class="chat">
        <div class="chat-title">
            <button class="btn chat-drop" on:click={() => mode = 1}>≡</button>
            <h2>Чат</h2>
            <button class="btn" on:click={() => modal2Visible = true}>+</button>
        </div>
        <div class="messages">
            {#each messages as msg}
                <div class="message {msg.user.id === userId ? 'message-self' : '' }">
                    <div class="message-text">
                        {msg.text}
                    </div>
                    <div class="message-info">
                        {msg.user.name}, {new Date( Date.parse(msg.dateTime)).toLocaleString()}
                    </div>
                </div>
            {/each}
        </div>
        {#if selectedChat }
            <form class="chat-input" on:submit={SendMessage}>
                <input  class="chat-input__input" type="text" size="1" placeholder="Введите сообщение..." bind:this={inputField}> 
                <button class="chat-input__btn" type="submit">
                    <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.3938 2.20468C3.70395 1.96828 4.12324 1.93374 4.4679 2.1162L21.4679 11.1162C21.7953 11.2895 22 11.6296 22 12C22 12.3704 21.7953 12.7105 21.4679 12.8838L4.4679 21.8838C4.12324 22.0662 3.70395 22.0317 3.3938 21.7953C3.08365 21.5589 2.93922 21.1637 3.02382 20.7831L4.97561 12L3.02382 3.21692C2.93922 2.83623 3.08365 2.44109 3.3938 2.20468ZM6.80218 13L5.44596 19.103L16.9739 13H6.80218ZM16.9739 11H6.80218L5.44596 4.89699L16.9739 11Z" fill="#000000"/>
                    </svg>
                </button>
            </form>
        {/if}
    </div>
</div>

<style>
    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }

    .app {
        display: flex;
        height: 98vh;
        width: 100%;
        border: 1px solid black;
        border-radius: 12px;
    }

    .left-panel {
        display: flex;
        flex-basis: 30%;
        flex-direction: column;
        padding: 16px;
        border-right: 1px dashed black;
    }

    .chat-list {
        flex-grow: 1;
        background-color: white;
        z-index: 1;
        overflow-y: auto;
    }

    .chat-list__item {
        display: flex;
        margin-top: 10px;
        align-items: center;
        width: 100%;
        border: 1px dashed black;
        background-color: white;
        padding: 10px;
        border-radius: 8px;
        transition: background-color .3s;
    }

    .chat-list__item[aria-current=true] {
        background-color: rgb(230, 229, 229);
        border-style: solid;
    }

    .chat-list__icon {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        width: 50px;
        height: 50px;
        font-size: 24px;
        border: 1px solid black;
        background-color: rgb(226, 223, 223);
        border-radius: 50%;
    }

    .chat-list__name {
        margin-left: 10px;
        font-size: 18px;
    }

    .chat {
        display: flex;
        flex-basis: 70%;
        flex-direction: column;
        padding: 16px;
    }

    .chat-title {
        display: flex;
        align-items: center;
        text-align: center;
        padding-bottom: 16px;
        border-bottom: 1px dashed black;
    }

    .chat-title h2 {
        flex-grow: 1;
        margin-right: 30px;
    }

    .messages {
        display: flex;
        flex: 1;
        flex-direction: column-reverse;
        overflow-y: auto;
        padding-right: 16px;
    }

    .message {
        display: flex;
        flex-direction: column;
        max-width: 80%;
        width: fit-content;
    }

    .message-info {
        display: block;
        margin-bottom: 8px;
    }
    
    .message-text {
        display: inline-block;
        text-wrap: wrap;
        word-break: break-word;
        overflow-wrap: break-word;
        word-wrap: break-word;
        padding: 8px 16px;
        border: 1px solid black;
        border-radius: 12px 12px 12px 0px;
        font-size: 18px;
        margin-bottom: 2px;
        align-self: flex-start;
    }

    .message-self {
        align-self: flex-end;
    }

    .message-self .message-text {
        border-radius: 12px 12px 0px 12px;
        align-self: flex-end;
    }

    .message-self .message-info {
        text-align: right;
    }

    .chat-input {
        display: flex;
        justify-content: space-between; 
        padding: 8px;
        border: 1px dashed black;
        border-radius: 8px;
    }

    .chat-input__btn {
        width: 50px;
        height: 50px;
    }

    .chat-input__input {
        padding: 12px 16px;
        flex: 1;
        margin-right: 10px;
        font-size: 20px;
    }

    .btn {
        border: 1px dashed black;
        border-radius: 8px;
        background-color: white;
        font-size: 20px;
        padding: 8px 16px;
        transition: all .3s;
    }

    .btn:hover {
        background-color: rgb(233, 232, 232);
    }

    .btn:active {
        background-color: rgb(216, 216, 216);
        border-style: solid;
    }

    .btn:focus {
        outline: 1px dotted black;
        outline-offset: 2px;
    }

    .chat-drop {
        display: none;
        padding: 8px;
    }

    .create-chat-modal {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        left: 0;
        right: 0;
        height: 98vh;
        width: 100%;
        display: none;
        z-index: 2;
    } 

    .create-chat-modal__container {
        width: fit-content;
        align-items: center;
        text-align: center;
        padding: 16px;
        box-shadow: 0px 0px 4px;
    }

    .create-chat-modal__text {
        display: block;
        padding: 12px 16px;
        font-size: 20px;
        margin: 20px 0;
    }

    .logout-btn {
        margin-top: 16px;
    }

    @media screen and (max-width: 750px) {
        .left-panel {
            position: absolute;
            left: 0;
            right: 0;
            display: none;
            height: 98%;
        }
        .chat {
            flex-basis: 100%;
        }
        .chat-drop {
            display: inline-block;
            width: fit-content;
        }
    }
</style>
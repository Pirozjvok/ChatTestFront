<script>
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { fetchWithAuth } from '$lib/fetch-refresh.js'

    let email;
    let password;
    let alert = null

    onMount(async () => {
        const res = await fetchWithAuth('/User.Get', {
            credentials: "same-origin"
        });
		if (res.ok) {
            window.location.href = '/chat';
        }
	});

    async function login() {
        const response = await fetchWithAuth('/Auth/Login', {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (response.ok) {
            window.location.href = '/chat';
            
        } else if (response.status === 401) {
            alert = "Неверный логин или пароль"
            await new Promise(r => setTimeout(r, 3000));
            alert = null
        } else {
            alert = "Неизвестная ошибка"
            await new Promise(r => setTimeout(r, 3000));
            alert = null
        }
    }
</script>

<div class="container">
    <form class="login" on:submit={login}>
        <div class="login__header">
            <h1>Вход</h1>
        </div>
        {#if alert}
            <div class="alert" in:fly={{ y: -50, duration: 500 }} out:fade>
                {alert}
            </div>            
        {/if}

        <label for="email" class="login__label">Почта: </label>
        <input id="email" class="login__input" type="email" bind:value={email}> 
        <label for="passw" class="login__label">Пароль: </label>
        <input id="passw" class="login__input" type="password" bind:value={password}> 
        <input class="btn" type="submit" value="Войти">
        <div class="login__register-link">
            <a href="/register">Нет аккаунта? Зарегаться.</a>
        </div>
    </form>
</div>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .container 
    {
        display: flex;
        align-items: center;
        margin: 0px auto;
        width: fit-content;
        height: 90vh;
    }

    .login {
       box-shadow: 1px 1px 6px;
       padding: 20px;
       border-radius: 8px;
       height: fit-content;
    }

    .alert {
        width: 100%;
        margin-bottom: 10px;
        border: 1px solid red;
        background: rgb(255, 132, 132);
        border-radius: 4px;
        text-align: center;
        padding: 10px;
    }

    .login__header {
        text-align: center;
        width: 100%;
        margin-bottom: 10px;
    }

    .login__label {
        display: block;
    }

    .login__input {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
        padding: 4px 8px;
    }

    .login__register-link {
        width: 100%;
        text-align: center;
    }
    
    .btn {
        display: block;
        margin-bottom: 10px;
        padding: 10px 20px;
        width: 100%;
        border: none;
        font-size: 18px;
        border-radius: 4px;
        background-color: rgb(66, 223, 66);
    }

    .btn:hover {
        background-color: rgb(114, 238, 114);
    }

    .btn:active {
        background-color: rgb(164, 250, 164);
    }

    .btn:focus {
        outline: 1px solid rgb(66, 223, 66);
        outline-offset: 1px;
    }
</style>
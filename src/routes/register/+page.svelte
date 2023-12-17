<script>
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { fetchWithAuth } from '$lib/fetch-refresh.js'

    let email;
    let name;
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

    async function register() {
        const response = await fetchWithAuth('/Auth/Register', {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                Name: name,
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
    <form class="register" on:submit={register}>
        <div class="register__header">
            <h1>Регистрация</h1>
        </div>
        {#if alert}
            <div class="alert" in:fly={{ y: -50, duration: 500 }} out:fade>
                {alert}
            </div>            
        {/if}

        <label for="email" class="register__label">Почта: </label>
        <input id="email" class="register__input" type="email" bind:value={email}> 
        <label for="name" class="register__label">Имя: </label>
        <input id="name" class="register__input" type="text" bind:value={name}> 
        <label for="passw" class="register__label">Пароль: </label>
        <input id="passw" class="register__input" type="password" bind:value={password}> 
        <input class="btn" type="submit" value="Зарегестрироваться">
        <div class="register__login-link">
            <a href="/login">Есть аккаунт? Войти.</a>
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

    .register {
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

    .register__header {
        text-align: center;
        width: 100%;
        margin-bottom: 10px;
    }

    .register__label {
        display: block;
    }

    .register__input {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
        padding: 4px 8px;
    }

    .register__login-link {
        width: 100%;
        text-align: center;
    }
    
    .btn {
        display: block;
        margin-bottom: 10px;
        padding: 10px 20px;
        font-size: 18px;
        width: 100%;
        border: none;
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
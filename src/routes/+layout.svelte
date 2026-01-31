<script>
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { userStore, themeStore, saveUser } from '$lib/stores';
    import '../app.css';

    let currentUser;
    let activeTab = 'dashboard'; // 'dashboard', 'students', 'library', 'analytics', 'profile'

    // Modals
    let showModalAdd = false;
    let showModalSettings = false;
    let showModalProfile = false;
    let viewingStudentIndex = -1;
    
    // Install Banner
    let deferredPrompt;
    let showInstallBanner = false;

    onMount(async () => {
        // Check Session
        const savedUser = sessionStorage.getItem('lumina_session');
        if(savedUser) {
            // Load user from DB logic would go here, simplified for example:
            // userStore.set(foundUser);
        }
        
        // Theme
        themeStore.subscribe(val => {
            document.body.setAttribute('data-theme', val);
        });

        // Install Prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallBanner = true;
        });
    });

    function handleInstall() {
        showInstallBanner = false;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            deferredPrompt = null;
        });
    }

    $: currentUser = $userStore;
    $: activeTab = $page.url.pathname.replace('/', '') || 'dashboard';
    if(activeTab === '') activeTab = 'dashboard';
</script>

<!-- INSTALL BANNER -->
{#if showInstallBanner}
<div id="install-banner" class="visible">
    <div>Install Joly's Tutor Companion</div>
    <div>
        <button on:click={handleInstall}>Install</button>
        <button on:click={() => showInstallBanner = false} style="background:none;border:none;color:white;margin-left:10px;"><i class="fa-solid fa-xmark"></i></button>
    </div>
</div>
{/if}

<!-- LAYOUT STRUCTURE -->
{#if currentUser}
    <header>
        <div class="header-title" id="dynamic-header-title">Joly's Companion</div>
        <div class="avatar-wrapper" style="width:40px; height:40px;">
            <img src={currentUser.avatar} style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
        </div>
    </header>

    <div class="app-content">
        <slot /> <!-- PAGE CONTENT GOES HERE -->
    </div>

    <button class="fab" class:hidden={activeTab !== 'students'} on:click={() => showModalAdd = true}><i class="fa-solid fa-plus"></i></button>

    <nav class="nav-bar">
        <button class:active={activeTab === 'dashboard'} class="nav-btn" on:click={() => activeTab = 'dashboard'}>
            <i class="fa-solid fa-house"></i> <span>Home</span>
        </button>
        <button class:active={activeTab === 'students'} class="nav-btn" on:click={() => activeTab = 'students'}>
            <i class="fa-solid fa-users"></i> <span>Students</span>
        </button>
        <button class:active={activeTab === 'library'} class="nav-btn" on:click={() => activeTab = 'library'}>
            <i class="fa-solid fa-book-open"></i> <span>Library</span>
        </button>
        <button class:active={activeTab === 'analytics'} class="nav-btn" on:click={() => activeTab = 'analytics'}>
            <i class="fa-solid fa-chart-pie"></i> <span>Stats</span>
        </button>
        <button class:active={activeTab === 'profile'} class="nav-btn" on:click={() => activeTab = 'profile'}>
            <i class="fa-solid fa-user"></i> <span>Profile</span>
        </button>
    </nav>
{:else}
    <!-- AUTH SCREEN GOES HERE (Simplifed for brevity, or create /auth route) -->
    <div class="auth-card slide-up">
        <h1>Joly's Tutor</h1>
        <input class="auth-input" placeholder="Username" id="login-user">
        <input class="auth-input" placeholder="Password" id="login-pass">
        <button class="auth-btn">Sign In</button>
    </div>
{/if}

<!-- MODAL: ADD STUDENT (Simplified logic) -->
{#if showModalAdd}
    <div class="modal-overlay open">
        <div class="modal-content">
            <h3>Add New Student</h3>
            <input class="form-input" placeholder="Full Name">
            <input class="form-input" placeholder="Roll Number">
            <button class="auth-btn" on:click={() => showModalAdd = false}>Cancel</button>
            <button class="auth-btn">Save</button>
        </div>
    </div>
{/if}

<style>
    /* Additional Layout specific styles if needed */
</style>

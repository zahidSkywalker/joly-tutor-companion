<script>
    import { userStore, modalStore } from '$lib/stores';

    $: currentUser = $userStore;
    
    // Local state for edit forms (optional, but cleaner)
    let showEdit = false;
    let newName = '';
    let newBio = '';

    function openSettings() {
        // Trigger the Settings Modal in the Layout
        modalStore.update(m => ({ ...m, settings: true }));
    }

    function generateQR() {
        // Trigger the QR Modal in the Layout
        modalStore.update(m => ({ ...m, qr: true }));
    }

    function handleLogout() {
        sessionStorage.removeItem('lumina_session');
        location.reload();
    }
</script>

<div class="glass-card" style="text-align: center; padding: 3rem 2rem;">
    <div class="profile-header">
        <div class="avatar-wrapper" style="width: 120px; height: 120px; margin: 0 auto;">
            <img src={currentUser?.avatar} class="avatar">
            <!-- Label just opens settings for now -->
            <label class="avatar-edit" on:click={openSettings}><i class="fa-solid fa-camera"></i></label>
        </div>
        <h2 style="margin: 0 0 1.5rem 0; color: var(--text-main);">{currentUser?.name}</h2>
        <p id="profile-user" style="color: var(--text-muted); margin-top: 5px; font-weight: 600;">@{currentUser?.username}</p>
    </div>

    {#if currentUser?.bio && currentUser.bio !== ""}
        <div id="profile-bio-display" class="profile-bio-box">
            "{currentUser.bio}"
        </div>
    {/if}
    
    <div class="glass-card" style="padding: 0;">
        <div class="menu-item" on:click={generateQR}>
            <div class="menu-icon" style="background: #0ea5e9; color: white; border-color: #0ea5e9;"><i class="fa-solid fa-qrcode"></i></div>
            <div class="s-info">
                <div class="s-name">Generate Parent Card</div>
                <div class="s-meta">QR Code for Parents</div>
            </div>
        </div>

        <div class="menu-item" on:click={openSettings}>
            <div class="menu-icon"><i class="fa-solid fa-sliders"></i></div>
            <div class="s-info">
                <div class="s-name">Settings</div>
                <div class="s-meta">Theme & Info</div>
            </div>
        </div>
        
        <div class="menu-item" on:click={() => alert("Export feature available in Layout Settings")}>
            <div class="menu-icon"><i class="fa-solid fa-download"></i></div>
            <div class="s-info">
                <div class="s-name">Backup Data</div>
                <div class="s-meta">Export to JSON</div>
            </div>
        </div>

        <div class="menu-item" on:click={handleLogout}>
            <div class="menu-icon" style="background: #ef4444; color: white; border-color: #ef4444;"><i class="fa-solid fa-arrow-right-from-bracket"></i></div>
            <div class="s-info">
                <div class="s-name" style="color: #ef4444;">Log Out</div>
                <div class="s-meta">Sign out of device</div>
            </div>
        </div>
    </div>
</div>

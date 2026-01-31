<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { userStore, usersStore, initDB, saveUser, checkDue, compressImage, modalStore, viewingStudentStore } from '$lib/stores';
    import '../app.css';

    // NOTE: I cannot provide the CSS here. You MUST paste your original CSS.

    
    let deferredPrompt;
    let showInstallBanner = false;
    
    // Modal States (Now coming from Store)
    let showSignup = false;

    // Smart Note State
    let canvas, ctx;
    let isDrawing = false;
    let brushColor = '#ef4444';
    let noteMode = 'image'; 
    let smartNoteImgData = null;
    let noteTitle, noteSubject, noteDate, textNoteTitle, textNoteSubject, textNoteBody, textNoteDate;

    // Add Student Form State
    let mName, mRoll, mGpa, mFee, mDate, mPhone, mAddress, mImage;
    
    // Settings Form State
    let setBio, setName, setTheme, setAvatar;
    
    // Login State
    let loginUsername, loginPass, regUsername, regName, regPass;

    // Subscriptions
    $: currentUser = $userStore;
    $: users = $usersStore;
    $: activeTab = $page.url.pathname.replace('/', '') || 'dashboard';
    if(activeTab === '') activeTab = 'dashboard';

    $: m = $modalStore;

    onMount(async () => {
        await initDB();
        const savedSession = sessionStorage.getItem('lumina_session');
        if(savedSession) {
            const found = users.find(u => u.username === savedSession);
            if(found) {
                userStore.set(found);
                applyTheme(found.theme);
            }
        }
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallBanner = true;
        });
    });

    /* --- AUTH --- */
            // Make functions async
    async function handleRegister() {
        if(!regUsername || !regName || !regPass) return alert('Fill all fields');
        
        // Use store directly, not local variable
        const exists = $usersStore.find(u => u.username === regUsername);
        if(exists) return alert('Username taken');
        
        const newUser = {
            username: regUsername,
            name: regName,
            bio: "", theme: "light",
            password: btoa(regPass),
            avatar: `https://ui-avatars.com/api/?name=${regName}&background=random`,
            students: [], pdfs: [],
            lastOpenDate: new Date().toISOString().split('T')[0]
        };
        
        // AWAIT save to prevent freeze
        try {
            await saveUser(newUser);
            sessionStorage.setItem('lumina_session', newUser.username);
            applyTheme(newUser.theme);
        } catch(e) {
            alert("Error creating account: " + e.message);
        }
    }

    async function handleLogin() {
        // Use store directly
        const found = $usersStore.find(u => u.username === loginUsername && u.password === btoa(loginPass));
        if(found) {
            sessionStorage.setItem('lumina_session', found.username);
            userStore.set(found);
            applyTheme(found.theme);
        } else {
            alert("Invalid Username or Password");
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('lumina_session');
        userStore.set(null);
    }

    /* --- ACTIONS --- */
    async function saveStudent() {
        if(!mName || !mRoll) return alert('Fill Name/Roll');
        const process = async (imgBlob) => {
            const s = { 
                name: mName, roll: mRoll, gpa: mGpa, fee: mFee, 
                lastPay: mDate, phone: mPhone, address: mAddress, 
                image: imgBlob, attendanceHistory: {} 
            };
            const newStudents = [...(currentUser.students || []), s];
            currentUser.students = newStudents;
            await saveUser(currentUser);
            modalStore.update(val => ({ ...val, add: false }));
        };

        if(mImage && mImage.files[0]) {
            compressImage(mImage.files[0], blob => process(blob));
        } else {
            process(null);
        }
    }

    async function saveSettings() {
        currentUser.name = setName;
        currentUser.bio = setBio;
        currentUser.theme = setTheme;
        if(setAvatar && setAvatar.files[0]) {
            compressImage(setAvatar.files[0], async (blob) => {
                currentUser.avatar = URL.createObjectURL(blob);
                await saveUser(currentUser);
            });
        } else {
            await saveUser(currentUser);
        }
        applyTheme(setTheme);
        modalStore.update(val => ({ ...val, settings: false }));
    }

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    /* --- CANVAS --- */
    function resizeCanvas() {
        if(canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
    }
    
    // Trigger resize when modal opens
    $: if(m.note) { setTimeout(resizeCanvas, 100); }

    function startDraw(e) { isDrawing = true; draw(e); }
    function stopDraw() { isDrawing = false; ctx.beginPath(); }
    function draw(e) {
        if(!isDrawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = brushColor;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    async function saveSmartNote() {
        const title = noteMode === 'image' ? noteTitle : textNoteTitle;
        const subject = noteMode === 'image' ? noteSubject : textNoteSubject;
        
        let content = {};
        if(noteMode === 'image') {
             content = { type: 'image', data: smartNoteImgData };
        } else {
             content = { type: 'text', data: textNoteBody };
        }
        currentUser.pdfs = currentUser.pdfs || [];
        currentUser.pdfs.push({ name: title, subject, content, date: new Date().toISOString().split('T')[0], id: Date.now() });
        await saveUser(currentUser);
        modalStore.update(val => ({ ...val, note: false }));
    }
</script>

{#if !currentUser}
<!-- AUTH SCREEN -->
<div id="auth-container">
    <div class="auth-card slide-up">
        <h1>Joly's Tutor</h1>
        {#if !showSignup}
            <input class="auth-input" bind:value={loginUsername} placeholder="Username">
            <input class="auth-input" type="password" bind:value={loginPass} placeholder="Password">
            <button class="auth-btn" on:click={handleLogin}>Sign In</button>
            <div class="auth-toggle">New? <span on:click={() => showSignup = true}>Create Account</span></div>
        {:else}
            <input class="auth-input" bind:value={regUsername} placeholder="Username">
            <input class="auth-input" bind:value={regName} placeholder="Name">
            <input class="auth-input" type="password" bind:value={regPass} placeholder="Password">
            <button class="auth-btn" on:click={handleRegister}>Create</button>
            <div class="auth-toggle">Have account? <span on:click={() => showSignup = false}>Sign In</span></div>
        {/if}
    </div>
</div>
{:else}
<!-- MAIN APP -->
    {#if showInstallBanner}
        <div id="install-banner" class="visible">
            <div>Install App</div>
            <button on:click={() => {
                showInstallBanner = false;
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => deferredPrompt = null);
            }}>Install</button>
        </div>
    {/if}

    <header>
        <div class="header-title">Joly's Companion</div>
        <div class="avatar-wrapper" style="width:40px;height:40px;">
            <img src={currentUser.avatar} style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        </div>
    </header>

    <div class="app-content">
        <slot />
    </div>

    <button class="fab" class:hidden={activeTab !== 'students'} on:click={() => modalStore.update(x => ({...x, add: true}))}><i class="fa-solid fa-plus"></i></button>

    <nav class="nav-bar">
        <button class:active={activeTab === 'dashboard'} class="nav-btn" href="/"><i class="fa-solid fa-house"></i> Home</button>
        <button class:active={activeTab === 'students'} class="nav-btn" href="/students"><i class="fa-solid fa-users"></i> Students</button>
        <button class:active={activeTab === 'library'} class="nav-btn" href="/library"><i class="fa-solid fa-book-open"></i> Library</button>
        <button class:active={activeTab === 'analytics'} class="nav-btn" href="/analytics"><i class="fa-solid fa-chart-pie"></i> Stats</button>
        <button class:active={activeTab === 'profile'} class="nav-btn" href="/profile"><i class="fa-solid fa-user"></i> Profile</button>
    </nav>

    <!-- MODAL: ADD STUDENT -->
    {#if m.add}
        <div class="modal-overlay open" on:click={() => modalStore.update(x => ({...x, add: false}))}>
            <div class="modal-content" on:click|stopPropagation>
                <h3>Add New Student</h3>
                <input class="form-input" bind:value={mName} placeholder="Full Name">
                <input class="form-input" bind:value={mRoll} placeholder="Roll Number">
                <input class="form-input" bind:value={mGpa} type="number" placeholder="GPA">
                <input class="form-input" bind:value={mFee} type="number" placeholder="Fee">
                <input class="form-input" bind:value={mPhone} placeholder="Phone">
                <input class="form-input" bind:value={mAddress} placeholder="Address">
                <input class="form-input" bind:value={mDate} type="date">
                <label class="form-label">Photo</label>
                <input class="form-input" type="file" bind:files={mImage.files}>
                <button class="auth-btn" on:click={saveStudent}>Save</button>
            </div>
        </div>
    {/if}

    <!-- MODAL: SETTINGS -->
    {#if m.settings}
        <div class="modal-overlay open" on:click={() => modalStore.update(x => ({...x, settings: false}))}>
            <div class="modal-content" on:click|stopPropagation>
                <h3>Settings</h3>
                <input class="form-input" bind:value={setName} placeholder="Full Name">
                <input class="form-input" bind:value={setBio} placeholder="Bio">
                <select class="form-select" bind:value={setTheme}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="midnight">Midnight</option>
                </select>
                <label class="form-label">Avatar</label>
                <input class="form-input" type="file" bind:files={setAvatar.files}>
                <button class="auth-btn" on:click={saveSettings}>Save</button>
            </div>
        </div>
    {/if}
<!-- MODAL: PARENT QR CODE -->
{#if m.qr}
    <div class="modal-overlay open" on:click={() => modalStore.update(x => ({...x, qr: false}))}>
        <div class="modal-content" style="text-align: center;" on:click|stopPropagation>
            <h3>Parent Report Card</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Scan or Share</p>
            
            <div class="qr-card-content">
                <div id="qrcode"></div>
                <h2 style="margin:0; font-size:1.4rem;">{currentUser?.name}</h2>
                <div style="font-size:0.9rem; color:#64748b; margin-top:5px;">Tutor: {currentUser?.username}</div>
            </div>
            
            <button class="auth-btn" style="background: #10b981; margin-top:1.5rem;" onclick="window.print()">Print Card</button>
        </div>
    </div>
{/if}
    <!-- MODAL: SMART NOTE -->
    {#if m.note}
        <div class="modal-overlay open" on:click={() => modalStore.update(x => ({...x, note: false}))}>
            <div class="modal-content" on:click|stopPropagation use:resizeCanvas>
                <h3>Smart Note</h3>
                <div class="note-mode-tabs">
                    <button class:active={noteMode === 'image'} on:click={() => noteMode='image'}>Photo</button>
                    <button class:active={noteMode === 'text'} on:click={() => noteMode='text'}>Text</button>
                </div>
                {#if noteMode === 'image'}
                    <input class="form-input" type="file" on:change={(e) => {
                        compressImage(e.target.files[0], blob => { smartNoteImgData = blob; });
                    }} accept="image/*">
                    <div class="canvas-wrapper">
                        <img src={smartNoteImgData ? URL.createObjectURL(smartNoteImgData) : ''} class="hidden">
                        <canvas bind:this={canvas} on:mousedown={startDraw} on:mouseup={stopDraw} on:mousemove={draw} 
                            on:touchstart={startDraw} on:touchend={stopDraw} on:touchmove={draw}></canvas>
                    </div>
                    <input class="form-input" bind:value={noteTitle} placeholder="Title">
                    <input class="form-input" bind:value={noteDate} type="date">
                    <button class="auth-btn" on:click={saveSmartNote}>Save Note</button>
                {:else}
                    <input class="form-input" bind:value={textNoteTitle} placeholder="Title">
                    <textarea class="form-textarea" bind:value={textNoteBody}></textarea>
                    <button class="auth-btn" on:click={saveSmartNote}>Save Text Note</button>
                {/if}
            </div>
        </div>
    {/if}
{/if}

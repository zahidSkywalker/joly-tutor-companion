<script>
    import { onMount } from 'svelte';
    import { userStore } from '$lib/stores';

    let activeTab = 'textbooks'; // 'textbooks' or 'notes'
    let allBooks = [];
    
    // Smart Note State
    let canvas, ctx;
    let isDrawing = false;
    let smartNoteImgData = null;
    let brushColor = '#ef4444';

    $: currentUser = $userStore;
    $: notes = currentUser?.pdfs || [];

    onMount(async () => {
        fetchBooks();
        // Init Canvas
        canvas = document.getElementById('note-canvas');
        ctx = canvas.getContext('2d');
        // ... Add canvas event listeners (mousedown, touchstart, etc) ...
    });

    async function fetchBooks() {
        const res = await fetch('/books.json');
        allBooks = await res.json();
    }
</script>

<!-- TABS -->
<div class="lib-tabs">
    <button class:active={activeTab === 'textbooks'} class="lib-tab" on:click={() => activeTab = 'textbooks'}>Textbooks</button>
    <button class:active={activeTab === 'notes'} class="lib-tab" on:click={() => activeTab = 'notes'}>My Notes</button>
</div>

<!-- TEXTBOOKS VIEW -->
{#if activeTab === 'textbooks'}
    <div class="pdf-grid">
        {#each allBooks as book}
            <div class="pdf-item">
                <div class="pdf-cover" style="background: #4f46e5;">
                    <i class="fa-solid fa-book-open"></i>
                </div>
                <div class="pdf-name">{book.title}</div>
            </div>
        {/each}
    </div>
{/if}

<!-- SMART NOTES VIEW -->
{#if activeTab === 'notes'}
    <button class="auth-btn" style="margin-bottom:1rem;">+ Create Smart Note</button>
    
    <!-- CANVAS SECTION (From your Modal logic) -->
    <div class="canvas-wrapper">
        <img src={smartNoteImgData} id="note-bg-img" class="hidden">
        <canvas id="note-canvas"></canvas>
    </div>
    
    <div class="notes-grid">
        {#each notes as note}
            <div class="note-card">
                <img src={note.preview} class="note-preview">
                <div class="note-overlay">
                    <span class="note-title">{note.name}</span>
                </div>
            </div>
        {/each}
    </div>
{/if}

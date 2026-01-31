<script>
    import { userStore } from '$lib/stores';
    $: currentUser = $userStore;
</script>
<div class="glass-card" style="text-align:center;">
    <img src={currentUser.avatar} style="width:100px; height:100px; border-radius:50%;">
    <h2>{currentUser.name}</h2>
    <p>{currentUser.bio}</p>
    <button class="btn-outline" on:click={() => {
        const btn = document.querySelector('[aria-label="Settings"]'); // Trigger modal from layout logic if needed
        // Or just reload
        }}>Settings</button>
</div>

<script>
    import { userStore, saveUser, modalStore } from '$lib/stores';

    let searchTerm = '';
    let sortMode = 'newest';

    $: currentUser = $userStore;
    $: students = currentUser?.students || [];

    $: filtered = students
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a,b) => {
            if(sortMode === 'name') return a.name.localeCompare(b.name);
            return 0; 
        });

    async function toggleAttendance(index) {
        const s = students[index];
        if(!s.attendanceHistory) s.attendanceHistory = {};
        const today = new Date().toISOString().split('T')[0];
        const current = s.attendanceHistory[today] || 'none';
        const states = ['none', 'present', 'absent', 'late'];
        const next = (states.indexOf(current) + 1) % 4;
        
        if(next === 0) delete s.attendanceHistory[today];
        else s.attendanceHistory[today] = states[next];
        
        // SAVE THE DATA!
        await saveUser(currentUser);
    }
</script>

<h3>My Students</h3>

<div class="student-controls">
    <input class="search-input" bind:value={searchTerm} placeholder="Search...">
    <select class="sort-select" bind:value={sortMode}>
        <option value="newest">Newest</option>
        <option value="name">Name</option>
    </select>
</div>

<div class="glass-card" style="padding: 1rem;">
    {#each filtered as s, i}
        <div class="student-item">
            <div class="s-avatar">{s.name.charAt(0)}</div>
            <div class="s-info">
                <div class="s-name">{s.name}</div>
                <div class="s-meta">{s.roll} | GPA: {s.gpa}</div>
            </div>
            <div class="att-status-circle" on:click={() => toggleAttendance(i)}>
                <i class="fa-solid fa-check-circle"></i>
            </div>
        </div>
    {/each}
</div>

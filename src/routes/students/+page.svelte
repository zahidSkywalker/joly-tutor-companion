<script>
    import { userStore } from '$lib/stores';
    
    let searchTerm = '';
    let sortMode = 'newest';
    let filteredStudents = [];

    $: currentUser = $userStore;
    $: students = currentUser?.students || [];

    $: {
        if (searchTerm) {
            filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        } else {
            filteredStudents = students;
        }
        
        // Sort logic
        if(sortMode === 'name') filteredStudents.sort((a,b) => a.name.localeCompare(b.name));
        // ... other sorts ...
        if(sortMode === 'newest') filteredStudents = filteredStudents.reverse();
    }

    function toggleAttendance(index) {
        // ... Logic from toggleAttendance ...
    }
</script>

<div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
    <h3>My Students</h3>
</div>

<div class="student-controls">
    <input type="text" bind:value={searchTerm} class="search-input" placeholder="Search name...">
    <select bind:value={sortMode} class="sort-select">
        <option value="newest">Newest</option>
        <option value="name">Name (A-Z)</option>
    </select>
</div>

<div class="glass-card" style="padding: 1rem;">
    {#each filteredStudents as s, i}
        <div class="student-item">
            <div class="s-avatar">{s.name.charAt(0)}</div>
            <div class="s-info">
                <div class="s-name">{s.name}</div>
                <div class="s-meta">{s.roll} | GPA: {s.gpa}</div>
            </div>
            <div class="attendance-actions">
                <!-- Attendance Toggle -->
                <div class="att-status-circle" on:click={() => toggleAttendance(i)}>
                    <i class="fa-solid fa-check-circle"></i>
                </div>
            </div>
        </div>
    {/each}
</div>

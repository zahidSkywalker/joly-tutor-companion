<script>
    import { onMount } from 'svelte';
    import { userStore } from '$lib/stores';

    $: currentUser = $userStore;
    let chartInstance;

    onMount(() => {
        renderChart();
    });

    function renderChart() {
        if(!currentUser?.students) return;
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        
        if(chartInstance) chartInstance.destroy();
        
        // Mock data logic from original code
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const presentData = [5, 4, 6, 4, 0]; // Replace with real history lookup

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Present', data: presentData, backgroundColor: '#10b981' }]
            }
        });
    }
</script>

<div class="glass-card">
    <div class="chart-container">
        <canvas id="attendanceChart"></canvas>
    </div>
</div>
<div class="revenue-box">
    ৳ 2,500 Revenue
</div>

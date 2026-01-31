<script>
    import { onMount } from 'svelte';
    import { userStore } from '$lib/stores';
    import { Chart, registerables } from 'chart.js';

    Chart.register(...registerables);

    $: currentUser = $userStore;
    let chartInstance;

    // Reactive: Whenever students change, re-render chart
    $: if (currentUser?.students) {
        renderChart();
    }

    onMount(() => {
        renderChart();
    });

    function renderChart() {
        if (!currentUser || !currentUser.students || currentUser.students.length === 0) return;

        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;

        // --- REAL DATA CALCULATION ---
        const students = currentUser.students;
        const labels = [];
        const presentData = [];
        const absentData = [];

        // Calculate stats for the LAST 7 DAYS
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            // Add Label (e.g., Mon, Tue...)
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            
            let p = 0;
            let a = 0;
            
            students.forEach(s => {
                const status = s.attendanceHistory && s.attendanceHistory[dateStr];
                if (status === 'present' || status === 'late') p++;
                if (status === 'absent') a++;
            });
            
            presentData.push(p);
            absentData.push(a);
        }

        // --- REAL REVENUE CALCULATION ---
        let totalRevenue = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        students.forEach(student => {
            if (student.fee) {
                const monthlyFee = parseFloat(student.fee);
                // Calculate Daily Rate (approx 26 working days)
                const workingDaysInMonth = 26; 
                const dailyRate = monthlyFee / workingDaysInMonth;

                for(let d = 1; d <= daysInMonth; d++) {
                    const dayString = `${currentYear}-${String(currentMonth+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const dayDate = new Date(dayString);
                    const dayOfWeek = dayDate.getDay(); // 0=Sun, 5=Fri

                    if (dayOfWeek !== 5) { // Skip Friday
                        const status = student.attendanceHistory && student.attendanceHistory[dayString];
                        if (status === 'present' || status === 'late') {
                            totalRevenue += dailyRate;
                        }
                    }
                }
            }
        });

        // Destroy previous chart instance to avoid overlay issues
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { 
                        label: 'Present', 
                        data: presentData, 
                        backgroundColor: '#10b981',
                        borderRadius: 5 
                    },
                    { 
                        label: 'Absent', 
                        data: absentData, 
                        backgroundColor: '#ef4444',
                        borderRadius: 5 
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'bottom' } 
                },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        ticks: { stepSize: 1 } 
                    } 
                }
            }
        });

        // Update Revenue DOM
        const revenueEl = document.getElementById('revenue-display');
        if(revenueEl) {
            revenueEl.innerText = '৳ ' + totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
        }
    }
</script>

<div class="glass-card" style="padding: 2rem;">
    <div style="text-align:center; margin-bottom:1.5rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Attendance Trend (Last 7 Days)</div>
    <div class="chart-container">
        <canvas id="attendanceChart"></canvas>
    </div>
</div>

<div class="revenue-box">
    <div style="font-size:0.9rem; opacity:0.9; margin-bottom:5px;">Estimated Monthly Revenue</div>
    <div id="revenue-display" style="font-size: 2.5rem; font-weight:800;">৳ 0</div>
    <div style="font-size:0.8rem; opacity:0.8; margin-top:10px;">Based on attendance & daily rate</div>
</div>

$(function () {
    const $tbody = $('#transports-table tbody');

    async function loadData() {

        try {
            const response = await fetch('https://haymnoqetihmdnykhrdo.supabase.co/functions/v1/get-transports');
            const data = await response.json();
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            $tbody.empty();
            d3.select("#d3container").selectAll("*").remove();
            
            data.forEach(item => {
                let onloading = item.onloading_details;
                let offloading = item.offloading_details;
                try { onloading = JSON.parse(onloading); } catch { onloading = {}; }
                try { offloading = JSON.parse(offloading); } catch { offloading = {}; }

                // Build routes query string: onloading.lat,lon,offloading.lat,lon
                let routes = '';
                if (onloading.latitude && onloading.longitude && offloading.latitude && offloading.longitude) {
                    routes = `${onloading.latitude},${onloading.longitude},${offloading.latitude},${offloading.longitude}`;
                }

                // Build URL
                let url = `?view=map`;
                if (routes) {
                    url += `&routes=${routes}`;
                }

                $tbody.append(`<tr class="transport-row">
                                <td>${item.transport_id}</td> 
                                <td>${new Date(item.created_at).toLocaleDateString('de-DE')}</td>
                                <td>Mock Spot Market</td>
                                <td>${item.external_transport_id}</td>
                                <td>${item.partner_id}</td>
                                <td>${onloading.name || ''} (${onloading.day || ''})</td>
                                <td>${offloading.name || ''} (${offloading.day || ''})</td>
                                <td>
                                    <a href="${url}" class="btn btn-sm btn-primary" onclick="event.stopPropagation();">Show on Map</a>
                                </td>
                            </tr>`);
            });

            // Group data by date
            const groupedData = d3.rollups(
                data,
                v => v.length,
                d => new Date(d.created_at).toLocaleDateString('de-DE')
            );

            // Sort grouped data by date
            groupedData.sort((a, b) => new Date(a[0].split('.').reverse().join('-')) - new Date(b[0].split('.').reverse().join('-')));

            // Chart dimensions
            const width = 600;
            const height = 150;
            const margin = { top: 10, right: 15, bottom: 40, left: 25 };

            // Scales
            const x = d3.scaleBand()
                .domain(groupedData.map(d => d[0]))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(groupedData, d => d[1])])
                .nice()
                .range([height - margin.bottom, margin.top]);

            // Create SVG container
            const svg = d3.select("#d3container")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            // Add caption
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top + 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "bold")
                .text("Transports per Day");

            // Add x-axis
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickFormat(d => d.split('.').slice(0, 2).join('.') + '.'))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            // Add y-axis
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(d3.max(groupedData, d => d[1])).tickFormat(d => d));

            // Add bars
            svg.append("g")
                .selectAll("rect")
                .data(groupedData)
                .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(0) - y(d[1]))
                .attr("width", x.bandwidth())
                .attr("fill", "#888");

        } catch (error) {
            $tbody.empty();
            d3.select("#d3container").selectAll("*").remove();
            $tbody.append('<tr><td colspan="8">Failed to load data</td></tr>');
        }
    }

    // Initial load
    loadData();

    // Refresh every 5 seconds
    setInterval(loadData, 5000);
});
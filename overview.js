$(async function () {
    const $tbody = $('#transports-table tbody');
    $tbody.empty();

    try {
        const response = await fetch('https://haymnoqetihmdnykhrdo.supabase.co/functions/v1/get-transports');
        const data = await response.json();
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

    } catch (error) {
        $tbody.append('<tr><td colspan="8">Failed to load data</td></tr>');
    }
});
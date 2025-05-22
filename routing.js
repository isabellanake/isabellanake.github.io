$(function() {
    // read path parameters
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view === 'map') {
        $('#overview-view').hide();
        $('#map-view').show();

        // call map-vis.js
        const script = document.createElement('script');
        script.src = 'map-vis.js';

        document.head.appendChild(script);

    } else {
        $('#map-view').hide();
        $('#overview-view').show();

        // call overview.js
        const script = document.createElement('script');
        script.src = 'overview.js';

        document.head.appendChild(script);
    }

});
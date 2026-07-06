document.addEventListener('DOMContentLoaded', () => {
    const sidebarList = document.getElementById('sidebar-list');
    const paginationContainer = document.getElementById('sidebar-pagination');
    
    // If the sidebar doesn't exist on this page, do nothing
    if (!sidebarList) return;

    // ==========================================
    // YOUR CENTRALIZED DATA
    // Update this array when you post new content!
    // ==========================================
    const updates = [       
        { date: '2025.11.03', text: 'Site Launched!', link: '/library/site-launch.html' }

    ];

    // ==========================================
    // PAGINATION LOGIC
    // ==========================================
    const itemsPerPage = 5;
    let currentPage = 1;

    function renderSidebar() {
        // Clear the current list
        sidebarList.innerHTML = '';
        paginationContainer.innerHTML = '';

        // Calculate which items to show
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = updates.slice(startIndex, endIndex);

        // Build the HTML for the list items
        currentItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="date">(${item.date})</span> <a href="${item.link}">${item.text}</a>`;
            sidebarList.appendChild(li);
        });

        // Build Pagination Controls (Only if needed)
        const totalPages = Math.ceil(updates.length / itemsPerPage);
        
        if (totalPages > 1) {
            // Previous Button
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '<<';
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => { 
                currentPage--; 
                renderSidebar(); 
            };

            // Page Indicator
            const pageText = document.createElement('span');
            pageText.textContent = `${currentPage} / ${totalPages}`;

            // Next Button
            const nextBtn = document.createElement('button');
            nextBtn.textContent = '>>';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => { 
                currentPage++; 
                renderSidebar(); 
            };

            // Add them to the container
            paginationContainer.appendChild(prevBtn);
            paginationContainer.appendChild(pageText);
            paginationContainer.appendChild(nextBtn);
        }
    }

    // Initial render on page load
    renderSidebar();
});
document.addEventListener('DOMContentLoaded', () => {
    // --- Lấy các đối tượng ---
        const createButton = document.getElementById('create-btn');
        const createMenu = document.getElementById('create-menu');
        
        const helpButton = document.getElementById('help-btn');
        const helpPanel = document.getElementById('help-panel');
        const helpCloseButton = document.getElementById('help-close-btn');

        const appsButton = document.getElementById('google-apps-btn');
        const appsPanel = document.getElementById('google-apps-panel');

        // --- Hàm đóng tất cả các panel (trừ panel được chỉ định) ---
        function closeAllPanels(exceptPanel = null) {
            if (createMenu && createMenu !== exceptPanel) {
                createMenu.classList.remove('show');
            }
            if (helpPanel && helpPanel !== exceptPanel) {
                helpPanel.classList.remove('show');
            }
            if (appsPanel && appsPanel !== exceptPanel) {
                appsPanel.classList.remove('show');
            }
        }

        // --- Xử lý Menu "Tạo" (Dropdown) ---
        if (createButton && createMenu) {
            createButton.addEventListener('click', (event) => {
                event.stopPropagation();
                closeAllPanels(createMenu); // Đóng panel khác
                createMenu.classList.toggle('show');
            });
        }

        // --- Xử lý Panel "Trợ giúp" (Sidebar) ---
        if (helpButton && helpPanel && helpCloseButton) {
            // Khi bấm nút Trợ giúp (?)
            helpButton.addEventListener('click', (event) => {
                event.stopPropagation();
                closeAllPanels(helpPanel); // Đóng panel khác
                helpPanel.classList.toggle('show'); // Dùng toggle để bấm lại sẽ đóng
            });

            // Khi bấm nút X để đóng panel
            helpCloseButton.addEventListener('click', () => {
                helpPanel.classList.remove('show');
            });
        }

        // --- Xử lý Panel "Ứng dụng Google" ---
        if (appsButton && appsPanel) {
            appsButton.addEventListener('click', (event) => {
                event.stopPropagation();
                closeAllPanels(appsPanel); // Đóng panel khác
                appsPanel.classList.toggle('show');
            });
        }


        // --- Xử lý bấm ra ngoài ---
        document.addEventListener('click', (event) => {
            // Bấm ra ngoài sẽ đóng các panel kiểu pop-over (Tạo, Ứng dụng)
            // Panel Trợ giúp (sidebar) chỉ đóng bằng nút X
            
            // Nếu bấm ra ngoài menu "Tạo"
            if (createMenu && createMenu.classList.contains('show') && !createMenu.contains(event.target)) {
                createMenu.classList.remove('show');
            }
            
            // Nếu bấm ra ngoài menu "Ứng dụng"
            if (appsPanel && appsPanel.classList.contains('show') && !appsPanel.contains(event.target)) {
                appsPanel.classList.remove('show');
            }
        });
     });
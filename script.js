// Wait for the entire HTML document to be loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- CHECKPOINT 1 ---
    console.log('Checkpoint 1: DOM is loaded. Script is running.');

    // --- 1. Get References to Our Elements ---
    const loginScreen = document.getElementById('login-screen');
    const siteWrapper = document.getElementById('site-wrapper');
    const profileButtons = document.querySelectorAll('.user-profile-button');

    // ======== ADD THIS NEW BLOCK ========
    // Get a reference to the new log out button
    const logoutButton = document.getElementById('logout-button');

    // Add a click listener to it
    logoutButton.addEventListener('click', () => {
        console.log('Log Out button clicked.');
        // 1. Remove the saved profile from memory
        localStorage.removeItem('userProfile');
        
        // 2. Reload the page. This will automatically
        //    run our startup check, find no profile,
        //    and show the login screen.
        location.reload();
    });
    // ====================================
    

    // ======== NEW SHUTDOWN LOGIC ========
    const turnOffButton = document.getElementById('turn-off-button');

    if (turnOffButton) {
        turnOffButton.addEventListener('click', () => {
            // This triggers the CSS fade-to-black effect
            document.body.classList.add('shut-down');
        });
    }
    // ====================================

    // --- 2. The Main "Login" Function ---
    // (rest of your script.js code...)

    // --- CHECKPOINT 2 ---
    // This is the most important test!
    console.log('Checkpoint 2: Searching for buttons... Found:', profileButtons.length);

    // --- 2. The Main "Login" Function ---
    function loginAs(profile) {
        console.log('Checkpoint 4: loginAs() function called with profile:', profile);
        localStorage.setItem('userProfile', profile);
        loginScreen.classList.add('hidden');
        siteWrapper.classList.remove('hidden');
        updateSiteForProfile(profile);

        if (window.startTSP) { 
            window.startTSP(); 
        }
    }

    // --- 3. The "Update" Function ---
    function updateSiteForProfile(profile) {
        console.log('Checkpoint 5: Setting data-profile attribute to:', profile);
        document.body.setAttribute('data-profile', profile);
    }

    // --- 4. Check for a Saved Profile on Page Load ---
    const savedProfile = localStorage.getItem('userProfile');

    if (savedProfile) {
        console.log('Found saved profile. Logging in as:', savedProfile);
        loginAs(savedProfile);
    } else {
        console.log('No saved profile found. Showing login screen.');
        loginScreen.classList.remove('hidden');
    }

    // --- 5. Add Click Listeners to the Buttons ---
    profileButtons.forEach(button => {
        button.addEventListener('click', () => {
            const profile = button.dataset.profile;
            // --- CHECKPOINT 3 ---
            console.log('Checkpoint 3: Button clicked! Profile is:', profile);
            loginAs(profile);
        });
    });

    

});
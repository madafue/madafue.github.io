document.addEventListener('DOMContentLoaded', () => {

    console.log('Checkpoint 1: DOM is loaded. Script is running.');

    const loginScreen = document.getElementById('login-screen');
    const siteWrapper = document.getElementById('site-wrapper');
    const profileButtons = document.querySelectorAll('.user-profile-button');

    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener('click', () => {
        console.log('Log Out button clicked.');
        localStorage.removeItem('userProfile');
        location.reload();
    });
    

    const turnOffButton = document.getElementById('turn-off-button');

    if (turnOffButton) {
        turnOffButton.addEventListener('click', () => {
            document.body.classList.add('shut-down');
        });
    }

    console.log('Checkpoint 2: Searching for buttons... Found:', profileButtons.length);

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

    function updateSiteForProfile(profile) {
        console.log('Checkpoint 5: Setting data-profile attribute to:', profile);
        document.body.setAttribute('data-profile', profile);
    }

    const savedProfile = localStorage.getItem('userProfile');

    if (savedProfile) {
        console.log('Found saved profile. Logging in as:', savedProfile);
        loginAs(savedProfile);
    } else {
        console.log('No saved profile found. Showing login screen.');
        loginScreen.classList.remove('hidden');
    }

    profileButtons.forEach(button => {
        button.addEventListener('click', () => {
            const profile = button.dataset.profile;
            console.log('Checkpoint 3: Button clicked! Profile is:', profile);
            loginAs(profile);
        });
    });

    

});
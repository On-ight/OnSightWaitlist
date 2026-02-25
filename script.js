// Track form views
window.addEventListener('load', () => {
    console.log('Waitlist page loaded');
    // Send to analytics: pageview
    updateCounterDisplays();

    // Trigger initial visibility check
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
});

// Intersection Observer for fade-in animations on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Constants
// 🛑 IMPORTANT: Add your Google Sheets Web App URL here after setup
// Follow instructions in SETUP.md to create your Google Sheet
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzDsyTseIe49J_5mdXwuuY3LcIEnb73OlW6F5IDE0nJcCdwuct-qTMoY9frk-GjdGLt2Q/exec";

// Email receiver for FormSubmit.co (backup notification)
const EMAIL_RECEIVER = "onsight565@gmail.com";
const STARTING_COUNT = 10; // Will display as 523 initially

// Counter Logic
function getWaitlistCount() {
    const list = JSON.parse(localStorage.getItem('waitlist') || '[]');
    return STARTING_COUNT + list.length;
}

function updateCounterDisplays() {
    const count = getWaitlistCount();
    document.querySelectorAll('.counter-display').forEach(el => {
        el.innerText = count;
    });
}

// Smooth scroll to form
function scrollToForm() {
    const section = document.getElementById('waitlist-section');
    section.scrollIntoView({ behavior: 'smooth' });

    // Focus email input slightly after scroll completes
    setTimeout(() => {
        document.getElementById('email').focus();
    }, 600);
}

// Track form field focus (shows interest)
document.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('focus', () => {
        console.log(`User focused: ${field.name}`);
        // Send to analytics: form_field_focus
    });
});

// Form submission handling
const form = document.getElementById('waitlist-form');
const submitBtn = document.getElementById('submit-btn');
const formContainer = document.getElementById('form-container');
const successContainer = document.getElementById('success-container');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log('Form submitted');
    // Send to analytics: form_submission

    const emailVal = emailInput.value.trim().toLowerCase();
    const emailError = document.getElementById('email-error');
    const apiError = document.getElementById('api-error');

    emailError.style.display = 'none';
    apiError.style.display = 'none';

    // Basic validation
    if (!emailVal.includes('@') || !emailVal.includes('.')) {
        emailError.style.display = 'block';
        return;
    }

    // Check for duplicate email in localStorage
    let waitlist;
    try {
        waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    } catch (e) {
        waitlist = [];
    }

    const alreadyExists = waitlist.some(entry => entry.email === emailVal);
    if (alreadyExists) {
        apiError.textContent = 'This email is already on the waitlist!';
        apiError.style.display = 'block';
        return;
    }

    // Change button text
    submitBtn.textContent = 'Joining...';
    submitBtn.disabled = true;

    const formData = {
        name: nameInput.value.trim(),
        email: emailVal,
        travelDate: document.getElementById('travelDate').value.trim(),
        interest: document.getElementById('interest').value,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };

    // 1. Save to localStorage (immediate backup)
    waitlist.push(formData);
    localStorage.setItem('waitlist', JSON.stringify(waitlist));

    try {
        // 2. Send to Google Sheets (primary storage)
        if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "https://script.google.com/macros/s/AKfycbzDsyTseIe49J_5mdXwuuY3LcIEnb73OlW6F5IDE0nJcCdwuct-qTMoY9frk-GjdGLt2Q/exec") {
            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        }

        // 3. Send via FormSubmit.co (email notification)
        const response = await fetch(`https://formsubmit.co/ajax/${EMAIL_RECEIVER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name || 'Not provided',
                email: formData.email,
                "Travel Date": formData.travelDate || 'Not specified',
                "Primary Interest": formData.interest || 'Not specified',
                _subject: 'New Waitlist Signup!',
                _template: 'table',
                _honey: form.querySelector('[name="_honey"]').value
            })
        });

        // Show success regardless of email status (as long as saved to localStorage and Sheets)
        onSignupSuccess();
    } catch (error) {
        console.error("Submission failed", error);

        // If it fails but we saved locally, we can still show success
        submitBtn.textContent = 'Try Again';
        submitBtn.disabled = false;
        apiError.style.display = 'block';
    }
});

function onSignupSuccess() {
    console.log('Signup successful');
    // Send to analytics: waitlist_signup_success

    updateCounterDisplays();

    const position = getWaitlistCount();
    document.getElementById('success-number').textContent = `You're traveler #${position}`;

    formContainer.style.display = 'none';
    successContainer.style.display = 'block';
    successContainer.classList.add('visible'); // Trigger fade in

    // Optional: trigger Facebook Pixel, Google Ads conversion here
}

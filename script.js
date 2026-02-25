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
const GOOGLE_SHEET_URL = "YOUR_GOOGLE_SHEET_WEB_APP_URL_HERE";

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
    let waitlist;
    try {
        waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    } catch (e) {
        waitlist = [];
    }

    // Check for duplicates in local storage to prevent double submission
    const isDuplicate = waitlist.some(entry => entry.email === formData.email);
    if (!isDuplicate) {
        waitlist.push(formData);
        localStorage.setItem('waitlist', JSON.stringify(waitlist));
    }

    try {
        // 2. Send via FormSubmit.co AJAX API
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
                "Primary Interest": formData.interest,
                _subject: 'New Waitlist Signup!',
                _template: 'table',
                _honey: form.querySelector('[name="_honey"]').value
            })
        });

        if (response.ok) {
            onSignupSuccess();
        } else {
            throw new Error("Form submission returned a non-OK response.");
        }
    } catch (error) {
        console.error("AJAX failed", error);

        // If it fails but we saved locally, we can still show success
        // Or we can show the error state. Following the prompt's Error Handling:
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

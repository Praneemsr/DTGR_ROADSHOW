// Form handling and submission logic
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const formMessage = document.getElementById('formMessage');
    const registerButton = document.getElementById('registerButton');

    // Form submission handler
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous messages
        formMessage.className = 'form-message';
        formMessage.textContent = '';
        formMessage.style.display = 'none';

        // Disable submit button to prevent double submission
        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';

        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneCountry: document.getElementById('phoneCountry').value,
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            jobRole: document.getElementById('jobRole').value.trim(),
            company: document.getElementById('company').value.trim(),
            country: document.getElementById('country').value,
            acceptTerms: document.getElementById('acceptTerms').checked
        };

        // Validate form data
        if (!formData.acceptTerms) {
            showMessage('Please accept the Privacy Statement to continue.', 'error');
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            return;
        }

        // Combine phone country code and number
        const fullPhoneNumber = `${formData.phoneCountry} ${formData.phoneNumber}`;

        // Prepare data for submission (matching expected field names)
        const submissionData = {
            me_firstname: formData.firstName,
            me_lastname: formData.lastName,
            me_email: formData.email,
            me_phonenumber: fullPhoneNumber,
            me_companyname: formData.company,
            me_country: formData.country,
            jobRole: formData.jobRole
        };

        try {
            // Get API base URL - works for both localhost and deployed sites
            const getApiUrl = () => {
                // Check if we have a configured backend URL
                const backendUrl = localStorage.getItem('backendApiUrl');
                if (backendUrl) {
                    return backendUrl;
                }
                
                // For localhost development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    return 'http://localhost:3000';
                }
                
                // For GitHub Pages or deployed sites, try to detect backend
                // You can set this in localStorage or update this default
                const defaultBackend = 'https://event-registration-backend-omega.vercel.app';
                return defaultBackend;
            };
            
            const API_BASE_URL = getApiUrl();
            
            // Send registration data to backend API
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed. Please try again.');
            }

            console.log('Registration successful:', result);
            
            showMessage('Thank you! Your registration has been received. You will receive a confirmation email shortly.', 'success');
            
            // Reset form after successful submission
            registerForm.reset();
            
            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('Registration error:', error);
            showMessage('An error occurred during registration. Please try again later.', 'error');
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
        }
    });

    // Helper function to show messages
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
    }

    // Phone number formatting (optional enhancement)
    const phoneNumberInput = document.getElementById('phoneNumber');
    phoneNumberInput.addEventListener('input', function(e) {
        // Remove any non-digit characters except spaces and dashes
        let value = e.target.value.replace(/[^\d\s\-]/g, '');
        e.target.value = value;
    });

    // Auto-format phone number based on country selection (optional)
    const phoneCountrySelect = document.getElementById('phoneCountry');
    phoneCountrySelect.addEventListener('change', function() {
        // You could add country-specific formatting here
        // For example, US numbers: (XXX) XXX-XXXX
    });

    // Email validation enhancement
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function(e) {
        const email = e.target.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            e.target.setCustomValidity('Please enter a valid email address');
        } else {
            e.target.setCustomValidity('');
        }
    });

    // Real-time form validation feedback
    const requiredInputs = registerForm.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            input.classList.add('invalid');
            
            // Show custom validation message
            if (!input.validity.valid) {
                if (input.validity.valueMissing) {
                    showMessage(`Please fill in the ${input.previousElementSibling?.textContent || 'required field'}.`, 'error');
                } else if (input.validity.typeMismatch && input.type === 'email') {
                    showMessage('Please enter a valid email address.', 'error');
                }
            }
        });

        input.addEventListener('input', function() {
            input.classList.remove('invalid');
            if (formMessage.classList.contains('error')) {
                formMessage.style.display = 'none';
            }
        });
    });
});


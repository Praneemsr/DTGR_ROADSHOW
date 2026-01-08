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
        registerButton.classList.add('loading');

        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            jobTitle: document.getElementById('jobTitle')?.value.trim() || '',
            organization: document.getElementById('organization')?.value.trim() || '',
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone')?.value.trim() || '',
            country: document.getElementById('country').value,
            industry: document.getElementById('industry')?.value || '',
            keyPriorities: Array.from(document.querySelectorAll('input[name="keyPriorities"]:checked')).map(cb => cb.value),
            dietaryRestrictions: document.getElementById('dietaryRestrictions')?.value.trim() || '',
            accessibilityRequirements: document.getElementById('accessibilityRequirements')?.value.trim() || '',
            additionalComments: document.getElementById('additionalComments')?.value.trim() || '',
            acceptTerms: document.getElementById('acceptTerms').checked
        };

        // Validate Key Priorities
        const keyPrioritiesError = document.getElementById('keyPrioritiesError');
        if (formData.keyPriorities.length === 0) {
            keyPrioritiesError.style.display = 'block';
            showMessage('Please select at least one Key Priority.', 'error');
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            registerButton.classList.remove('loading');
            return;
        } else {
            keyPrioritiesError.style.display = 'none';
        }

        // Validate form data
        if (!formData.acceptTerms) {
            showMessage('Please accept the Privacy Statement to continue.', 'error');
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            registerButton.classList.remove('loading');
            return;
        }

        // Prepare data for submission (matching expected field names)
        const submissionData = {
            me_firstname: formData.firstName,
            me_lastname: formData.lastName,
            me_email: formData.email,
            me_phonenumber: formData.phone,
            me_companyname: formData.organization,
            me_country: formData.country,
            jobTitle: formData.jobTitle,
            industry: formData.industry,
            keyPriorities: formData.keyPriorities.join(', '),
            dietaryRestrictions: formData.dietaryRestrictions,
            accessibilityRequirements: formData.accessibilityRequirements,
            additionalComments: formData.additionalComments
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

            // Handle different response types
            let result;
            try {
                result = await response.json();
            } catch (e) {
                // If response is not JSON, create a result object
                result = {
                    message: response.statusText || 'Registration failed. Please try again.'
                };
            }

            if (!response.ok) {
                // Handle specific error codes
                if (response.status === 409) {
                    throw new Error('This email is already registered. Please use a different email address.');
                } else if (response.status === 400) {
                    throw new Error(result.message || 'Please check your form and try again.');
                } else if (response.status === 503) {
                    throw new Error('Service temporarily unavailable. Please try again in a moment.');
                } else {
                    throw new Error(result.message || 'Registration failed. Please try again.');
                }
            }

            console.log('Registration successful:', result);
            
            showMessage('Thank you! Your registration has been received. You will receive a confirmation email shortly.', 'success');
            
            // Reset form after successful submission
            registerForm.reset();
            
            // Remove validation classes
            requiredInputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
            
            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Optional: Scroll to top of form after a delay
            setTimeout(() => {
                registerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            
            // More specific error messages
            let errorMessage = 'An error occurred during registration. Please try again later.';
            
            if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error: Please check your internet connection and try again.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            registerButton.classList.remove('loading');
        }
    });

    // Helper function to show messages
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
    }

    // Phone number formatting (optional enhancement)
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove any non-digit characters except spaces and dashes
            let value = e.target.value.replace(/[^\d\s\-]/g, '');
            e.target.value = value;
        });
    }

    // Key Priorities checkbox validation
    const keyPrioritiesCheckboxes = document.querySelectorAll('input[name="keyPriorities"]');
    const keyPrioritiesError = document.getElementById('keyPrioritiesError');
    
    keyPrioritiesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedCount = document.querySelectorAll('input[name="keyPriorities"]:checked').length;
            if (checkedCount > 0) {
                keyPrioritiesError.style.display = 'none';
            }
        });
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
            input.classList.remove('valid');
            
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
            // Remove invalid class
            input.classList.remove('invalid');
            
            // Add valid class if field is valid and has value
            if (input.validity.valid && input.value.trim() !== '') {
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
            }
            
            // Hide error message if user is typing
            if (formMessage.classList.contains('error') && input.value.trim() !== '') {
                formMessage.style.display = 'none';
            }
        });
        
        // For select elements
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', function() {
                input.classList.remove('invalid');
                if (input.validity.valid && input.value !== '') {
                    input.classList.add('valid');
                } else {
                    input.classList.remove('valid');
                }
            });
        }
    });
});


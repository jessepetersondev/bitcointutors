// JavaScript for Bitcoin Newbie website
document.addEventListener('DOMContentLoaded', function() {
    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! This is a demo site, so no message was actually sent.');
            contactForm.reset();
        });
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to current navigation item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                this.classList.toggle('active');
                const answer = this.nextElementSibling;
                answer.classList.toggle('active');
            });
        });
    }

    // Quiz functionality
    const quizOptions = document.querySelectorAll('.quiz-option');
    if (quizOptions) {
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options in this question
                const questionOptions = this.parentElement.querySelectorAll('.quiz-option');
                questionOptions.forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                this.classList.add('selected');
            });
        });
    }

    // Quiz submission
    const submitQuizBtn = document.getElementById('submitQuiz');
    if (submitQuizBtn) {
        submitQuizBtn.addEventListener('click', function() {
            const quizQuestions = document.querySelectorAll('.quiz-question');
            let score = 0;
            let totalQuestions = quizQuestions.length;
            
            quizQuestions.forEach(question => {
                const selectedOption = question.querySelector('.quiz-option.selected');
                const correctOption = question.querySelector('.quiz-option[data-correct="true"]');
                
                if (selectedOption) {
                    if (selectedOption === correctOption) {
                        selectedOption.classList.add('correct');
                        score++;
                    } else {
                        selectedOption.classList.add('incorrect');
                        correctOption.classList.add('correct');
                    }
                } else {
                    correctOption.classList.add('correct');
                }
            });
            
            const quizResult = document.querySelector('.quiz-result');
            const scoreDisplay = document.getElementById('quizScore');
            const totalDisplay = document.getElementById('quizTotal');
            
            if (quizResult && scoreDisplay && totalDisplay) {
                scoreDisplay.textContent = score;
                totalDisplay.textContent = totalQuestions;
                quizResult.style.display = 'block';
                
                if (score / totalQuestions >= 0.7) {
                    quizResult.classList.add('success');
                    quizResult.classList.remove('failure');
                } else {
                    quizResult.classList.add('failure');
                    quizResult.classList.remove('success');
                }
            }
            
            // Disable options after submission
            quizOptions.forEach(option => {
                option.style.pointerEvents = 'none';
            });
            
            // Hide submit button
            this.style.display = 'none';
            
            // Show retry button
            const retryBtn = document.getElementById('retryQuiz');
            if (retryBtn) {
                retryBtn.style.display = 'block';
            }
        });
    }
    
    // Quiz retry
    const retryQuizBtn = document.getElementById('retryQuiz');
    if (retryQuizBtn) {
        retryQuizBtn.addEventListener('click', function() {
            // Reset all options
            const quizOptions = document.querySelectorAll('.quiz-option');
            quizOptions.forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect');
                option.style.pointerEvents = 'auto';
            });
            
            // Hide result
            const quizResult = document.querySelector('.quiz-result');
            if (quizResult) {
                quizResult.style.display = 'none';
            }
            
            // Show submit button
            const submitBtn = document.getElementById('submitQuiz');
            if (submitBtn) {
                submitBtn.style.display = 'block';
            }
            
            // Hide retry button
            this.style.display = 'none';
        });
    }
});

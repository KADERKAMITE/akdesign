document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // FORMULAIRE DE CONTACT
    // ============================================
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Vérifier que les champs obligatoires sont remplis
            if (!name || !email || !message) {
                statusDiv.innerHTML = '<div style="background: #ff9800; color: white; padding: 1rem; border-radius: 10px;">⚠️ Veuillez remplir tous les champs obligatoires.</div>';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
                return;
            }
            
            try {
                // Vérifier Firebase
                if (!window.db) {
                    throw new Error('Firebase non initialisé');
                }
                
                // Créer l'objet message
                const messageData = {
                    nom: name,
                    email: email,
                    sujet: subject || 'Sans sujet',
                    message: message,
                    date: new Date().toISOString(),
                    lu: false,
                    ip: await getIP()
                };
                
                console.log('Envoi du message:', messageData);
                
                // Envoyer à Firebase
                const messagesRef = window.collection(window.db, 'messages');
                const docRef = await window.addDoc(messagesRef, messageData);
                
                console.log('Message envoyé avec ID:', docRef.id);
                
                statusDiv.innerHTML = '<div style="background: #4caf50; color: white; padding: 1rem; border-radius: 10px;">✓ Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.</div>';
                form.reset();
                
                setTimeout(() => {
                    statusDiv.innerHTML = '';
                }, 5000);
                
            } catch (error) {
                console.error('Erreur détaillée:', error);
                let errorMessage = '❌ Erreur technique. ';
                
                if (error.code === 'permission-denied') {
                    errorMessage += 'Problème de permissions Firebase. Vérifie les règles Firestore.';
                } else if (error.code === 'unavailable') {
                    errorMessage += 'Service indisponible. Vérifie ta connexion Internet.';
                } else {
                    errorMessage += 'Merci de réessayer ou de nous contacter directement sur WhatsApp.';
                }
                
                statusDiv.innerHTML = `<div style="background: #f44336; color: white; padding: 1rem; border-radius: 10px;">${errorMessage}</div>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // ============================================
    // NEWSLETTER - STOCKAGE DANS FIREBASE
    // ============================================
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('.newsletter-input');
            const email = emailInput.value;
            const btn = newsletterForm.querySelector('.newsletter-btn');
            const originalText = btn.innerHTML;
            
            if (!email) {
                alert('📧 Veuillez entrer votre email');
                return;
            }
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            
            try {
                if (!window.db) {
                    throw new Error('Firebase non initialisé');
                }
                
                // Sauvegarder l'email dans la collection newsletter
                const newsletterRef = window.collection(window.db, 'newsletter');
                await window.addDoc(newsletterRef, {
                    email: email,
                    date: new Date().toISOString(),
                    ip: await getIP()
                });
                
                alert('✅ Merci pour votre inscription à la newsletter !');
                emailInput.value = '';
                
            } catch (error) {
                console.error('Erreur newsletter:', error);
                alert('❌ Erreur technique. Veuillez réessayer plus tard.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
    
    // ============================================
    // MENU MOBILE
    // ============================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // ============================================
    // THEME SWITCHER (MODE SOMBRE/CLAIR)
    // ============================================
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeSwitch.checked = true;
        }
        
        themeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });
    }
    
    // ============================================
    // SMOOTH SCROLL POUR LES LIENS ANCRES
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Fermer le menu mobile si ouvert
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (mobileMenu) mobileMenu.classList.remove('active');
                }
            }
        });
    });
});

// ============================================
// RÉCUPÉRATION DE L'IP (pour anti-spam)
// ============================================
async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Erreur IP:', error);
        return 'Non disponible';
    }
}
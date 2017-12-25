(function(window, document, undefined) {
	const form = document.querySelector('.login-form');
	const usernameField = document.querySelector('input[name="username"]');
	const passwordField = document.querySelector('input[name="password"]');
	const usernameErrorField = document.querySelector('.invalid-user');
	const passwordErrorField = document.querySelector('.invalid-pw');

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		if(!usernameField.checkValidity()) {
			usernameErrorField.innerHTML = usernameField.validationMessage;
			usernameField.classList.add('invalid');
		}

		if(!passwordField.checkValidity()) {
			passwordErrorField.innerHTML = passwordField.validationMessage;
			passwordField.classList.add('invalid');
		}

		logIn();
		
	})


	function logIn() {
		usernameErrorField.innerHTML = '';
		usernameField.classList.remove('invalid');
		passwordErrorField.innerHTML = '';
		passwordField.classList.remove('invalid');
		window.sessionStorage.setItem('bar', usernameField.value);
		window.location.replace('barlist.html');
	}





})(window, document);

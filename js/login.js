window.onload = function() {
	const button = document.querySelector('.button-submit');
	const usernameField = document.querySelector('input[name="username"]');
	const passwordField = document.querySelector('input[name="password"]');
	const usernameErrorField = document.querySelector('.username-invalid');
	const passwordErrorField = document.querySelector('.password-invalid');
	let username;
	let password;

	button.addEventListener('click', (e) => {
		e.preventDefault();
		console.log("click");
		

		if(usernameField.checkValidity()) {
			username = usernameField.value;
			usernameErrorField.innerHTML = '';
			usernameField.classList.remove('invalid');
		} else {
			usernameErrorField.innerHTML = usernameField.validationMessage;
			usernameField.classList.add('invalid');
		}

		if(passwordField.checkValidity()) {
			password = passwordField.value;
			passwordErrorField.innerHTML = '';
			passowrdField.classList.remove('invalid');
		} else {
			passwordErrorField.innerHTML = passwordField.validationMessage;
			passwordField.classList.add('invalid');
		}

		console.log({username, password});
	})
} 
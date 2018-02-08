(function(window, document, undefined) {
	const form = document.querySelector('.login-form');
	const usernameField = document.querySelector('input[name="username"]');
	const passwordField = document.querySelector('input[name="password"]');
	const usernameErrorField = document.querySelector('.invalid-user');
	const passwordErrorField = document.querySelector('.invalid-pw');

	form.addEventListener('submit', e => {
		e.preventDefault();

		if (!usernameField.checkValidity()) {
			usernameErrorField.innerHTML = usernameField.validationMessage;
			usernameField.classList.add('invalid');
		}

		if (!passwordField.checkValidity()) {
			passwordErrorField.innerHTML = passwordField.validationMessage;
			passwordField.classList.add('invalid');
		}

		const credentials = {
			username: usernameField.value,
			password: passwordField.value
		};
		logIn(credentials);
	});

	function logIn(credentials) {
		fetch('http://localhost:3000/api/v1/users/login', {
			method: 'post',
			headers: new Headers({
				'Content-Type': 'application/json'
			}),
			body: JSON.stringify(credentials)
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					window.localStorage.setItem('token', data.token);
					console.log(window.localStorage.getItem('token'));
				} else {
					alert(data.message);
				}
				console.log(data);
			})
			.catch(error => alert(error));
		/*
		usernameErrorField.innerHTML = '';
		usernameField.classList.remove('invalid');
		passwordErrorField.innerHTML = '';
		passwordField.classList.remove('invalid');
		window.sessionStorage.setItem('bar', usernameField.value);
		//window.location.replace('barlist.html');
		*/
	}
})(window, document);

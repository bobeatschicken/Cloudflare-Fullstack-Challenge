//API token = V0BNoMqYUljw-qC1vTl1q9Vl2jgSisDLTeYLwKTT
var variant;
addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

class ElementHandler {
	element (element) {
		// An incoming element, such as `div`

		switch (element.tagName) {
			case 'div':
				console.log(`Incoming element: ${element.tagName}`);
				break;
			case 'title':
				element.prepend('Wow This Is ');
				break;
			case 'p':
				if (element.getAttribute('id') == 'description') {
					element.append(
						variant == 1 ? 'It has a purple button!' : variant == 2 ? 'It has a green button!' : ''
					);
				}
				break;
			case 'a':
				if (element.getAttribute('id') == 'url') {
					element.setAttribute('href', variant == 1 ? 'https://www.youtube.com' : 'https://www.google.com');
				}
		}
	}

	comments (comment) {
		// An incoming comment
	}

	text (text) {
		// An incoming piece of text
		if (text.text.includes('Return to cloudflare.com')) {
			text.replace(variant == 1 ? 'Go to YouTube' : 'Go to Google');
		}
	}
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest (request) {
	let url;
	await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			let cookie = request.headers.get('Cookie');
			if (cookie.includes('variant=1')) {
				variant = 1;
			} else if (cookie.includes('variant=2')) {
				variant = 2;
			} else {
				variant = Math.ceil(Math.random() * 2);
			}
			url = data.variants[variant - 1]; //array indexing begins at 0, but variant is either 1 or 2
			console.log(`URL: ${url}`);
		});

	let r;
	await fetch(url).then((response) => {
		r = new HTMLRewriter().on('*', new ElementHandler()).transform(response);
	});

	r.headers.set('Set-Cookie', `variant=${variant}`);
	return r;
}

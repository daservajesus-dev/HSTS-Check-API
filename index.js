
import { response } from 'cfw-easy-utils'

// -------------------------------------------------------------------------------------------

/* HSTS Checker Settings */
const HSTS_PRELOAD_API_URL_BASE			= "https://hstspreload.org/api/v2";
const HSTS_PRELOAD_API_CACHE_TTL 		= 600;
const HSTS_PRELOAD_API_CACHE_EVERYTHING = true;

// -------------------------------------------------------------------------------------------

async function handleRequest(request) {	
	try {
		const params 	= new URL(request.url).searchParams;
		const domain 	= params.get("domain");
		let init 	 	= {};
		let data 	 	= {};
		let json_url 	= {};
				
		if (domain) {
			const url = new URL(HSTS_PRELOAD_API_URL_BASE + "/status" + "?domain=" + domain)

			var serverResponse = await fetch(url, {
				cf: {
					cacheTtl: HSTS_PRELOAD_API_CACHE_TTL,
					cacheEverything: HSTS_PRELOAD_API_CACHE_EVERYTHING,
				},
			})
			
			// Reconstruct the Response object to make its headers mutable.
			serverResponse = new Response(serverResponse.body, serverResponse)
			
			// Return response via CFW-Easy-Utils
			let data = response.fromResponse(serverResponse, { 
				headers: {'Cache-Control': 'max-age=' + HSTS_PRELOAD_API_CACHE_TTL } 
			})
			
			return data;
		} else {
			// Return error for no domain
			return response.json({ "error": "Please specify a domain" })
		}
	} catch (error) {
		return response.json({ "message": error.message, "stack": error.stack });
	}	
}

addEventListener('fetch', (event) => {
    if (event.request.method == 'OPTIONS') {
        return event.respondWith(response.cors())
    }

    return event.respondWith(handleRequest(event.request));
})

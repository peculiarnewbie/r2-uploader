export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		console.log(`${request.method} ${key} ${await request.body}`);

		switch (request.method) {
			case "PUT":
				await env.BUCKET.put(key, request.body);
				return new Response(`Put ${key} successfully!`);
			case "GET":
				const object = await env.BUCKET.get(key);

				if (object === null) {
					return new Response("Object Not Found", { status: 404 });
				}

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set("etag", object.httpEtag);

				return new Response(object.body, {
					headers,
				});
			case "DELETE":
				await env.BUCKET.delete(key);
				return new Response("Deleted!");

			default:
				return new Response("Method Not Allowed", {
					status: 405,
					headers: {
						Allow: "PUT, GET, DELETE",
					},
				});
		}
	},
};
